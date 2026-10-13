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
