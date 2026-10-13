import { query } from '~/server/utils/mysql'
import { authorize } from '~/server/utils/permissions'
import { assertRequirementTasksCompleted, isRequirementStatus } from '~/server/utils/requirementStatus'
import { insertRequirementHistory, REQUIREMENT_HISTORY_STATUS_LABELS } from '~/server/utils/requirementHistory'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authorize(event, 'requirement', 'update')
    const body = await readBody(event)
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean).map(String) : []
    const status = body?.status

    if (!ids.length) {
      throw createError({ statusCode: 400, statusMessage: '请选择要修改的需求' })
    }
    if (!isRequirementStatus(status)) {
      throw createError({ statusCode: 400, statusMessage: '无效的需求状态' })
    }

    const placeholders = ids.map(() => '?').join(',')
    const rows = await query(
      `SELECT id, req_no, status FROM requirements WHERE req_no IN (${placeholders}) OR id IN (${placeholders})`,
      [...ids, ...ids]
    ) as { id: number; req_no: string; status: string }[]

    if (!rows.length) {
      throw createError({ statusCode: 404, statusMessage: '需求不存在' })
    }

    const reqIds = rows.map(r => r.id)
    if (status === 'completed') {
      for (const row of rows.filter(r => r.status !== 'completed')) {
        await assertRequirementTasksCompleted(row.id)
      }
    }
    const idPlaceholders = reqIds.map(() => '?').join(',')
    await query(
      `UPDATE requirements SET status = ? WHERE id IN (${idPlaceholders})`,
      [status, ...reqIds]
    )

    for (const row of rows) {
      if (row.status === status) continue
      await insertRequirementHistory(
        row.id,
        '状态',
        REQUIREMENT_HISTORY_STATUS_LABELS[row.status] || row.status,
        REQUIREMENT_HISTORY_STATUS_LABELS[status] || status,
        currentUser.id
      )
    }

    return { success: true, updated: reqIds.length, status }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '批量修改状态失败'
    })
  }
})
