import { query } from '~/server/utils/mysql'

export const REQUIREMENT_STATUSES = [
  'draft',
  'pending',
  'approved',
  'rejected',
  'in_progress',
  'completed',
  'closed',
] as const

export type RequirementStatusValue = typeof REQUIREMENT_STATUSES[number]

export function isRequirementStatus(value: any): value is RequirementStatusValue {
  return REQUIREMENT_STATUSES.includes(value)
}

export async function completeAssociatedTasks(reqIds: number[]) {
  if (!reqIds.length) return
  const placeholders = reqIds.map(() => '?').join(',')
  await query(
    `UPDATE tasks
        SET status = 'done', completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
      WHERE requirement_id IN (${placeholders}) AND status != 'done'`,
    reqIds
  )
}

export async function listIncompleteAssociatedTasks(reqId: number) {
  return await query(
    `SELECT id, task_no, title, status
       FROM tasks
      WHERE requirement_id = ?
        AND status NOT IN ('done', 'cancelled')
      ORDER BY id ASC`,
    [reqId]
  ) as { id: number; task_no: string; title: string; status: string }[]
}

export async function assertRequirementTasksCompleted(reqId: number) {
  const incomplete = await listIncompleteAssociatedTasks(reqId)
  if (!incomplete.length) return
  throw createError({
    statusCode: 409,
    statusMessage: `还有 ${incomplete.length} 个关联任务未完成，无法将需求标记为已完成`
  })
}
