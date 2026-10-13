import { query } from '~/server/utils/mysql'
import { authorize } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await authorize(event, 'weekly_report', 'update', id)
  const body = await readBody(event)

  const fields: Array<[string, unknown]> = []
  const add = (column: string, value: unknown) => fields.push([column, value])
  if (body.completed_work !== undefined) add('completed_work', JSON.stringify(body.completed_work))
  if (body.next_week_plan !== undefined) add('next_week_plan', JSON.stringify(body.next_week_plan))
  if (body.summary !== undefined) add('summary', body.summary)
  if (body.hours !== undefined) add('hours', body.hours)

  if (fields.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '没有可更新的周报内容' })
  }

  await query(
    `UPDATE weekly_reports SET ${fields.map(([column]) => `${column} = ?`).join(', ')},
       status = 'submitted', submitted_at = NOW()
     WHERE id = ?`,
    [...fields.map(([, value]) => value), id]
  )

  const rows = await query(
    `SELECT id, user_id, week_start, week_end, completed_work, next_week_plan,
            summary, hours, status, submitted_at, created_at, updated_at
       FROM weekly_reports WHERE id = ?`,
    [id]
  ) as any[]
  if (rows.length === 0) throw createError({ statusCode: 404, statusMessage: '周报不存在' })

  const report = rows[0]
  return {
    id: report.id,
    userId: report.user_id,
    weekStart: report.week_start,
    weekEnd: report.week_end,
    completedWork: report.completed_work,
    nextWeekPlan: report.next_week_plan,
    summary: report.summary,
    hours: report.hours,
    status: report.status,
    submittedAt: report.submitted_at,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
  }
})
