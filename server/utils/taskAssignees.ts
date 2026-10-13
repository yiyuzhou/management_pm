import { query } from '~/server/utils/mysql'

export type TaskAssignee = { id: number; name: string }

export function normalizeAssigneeIds(body: any): number[] {
  const raw = Array.isArray(body?.assignee_ids)
    ? body.assignee_ids
    : (body?.assignee_id != null && body.assignee_id !== '' ? [body.assignee_id] : [])
  return [...new Set(
    raw.map((id: any) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0)
  )]
}

export async function replaceTaskAssignees(taskId: number, userIds: number[]) {
  await query('DELETE FROM task_assignees WHERE task_id = ?', [taskId])
  for (const userId of userIds) {
    await query(
      'INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)',
      [taskId, userId]
    )
  }
}

export async function loadAssigneesByTaskIds(taskIds: number[]): Promise<Map<number, TaskAssignee[]>> {
  const map = new Map<number, TaskAssignee[]>()
  if (!taskIds.length) return map
  try {
    const placeholders = taskIds.map(() => '?').join(',')
    const rows = await query(
      `SELECT ta.task_id, u.id, u.nickname as name
         FROM task_assignees ta
         JOIN users u ON u.id = ta.user_id
        WHERE ta.task_id IN (${placeholders})
        ORDER BY ta.user_id`,
      taskIds
    ) as { task_id: number; id: number; name: string }[]
    for (const row of rows) {
      const list = map.get(row.task_id) || []
      list.push({ id: row.id, name: row.name })
      map.set(row.task_id, list)
    }
  } catch {
    // table may not exist yet
  }
  return map
}

export async function attachAssigneesToTasks<T extends { task_id: number; assignee?: TaskAssignee | null }>(
  tasks: T[]
): Promise<(T & { assignees: TaskAssignee[] })[]> {
  const map = await loadAssigneesByTaskIds(tasks.map(t => t.task_id).filter(Boolean))
  return tasks.map((t) => {
    const assignees = map.get(t.task_id) || (t.assignee ? [t.assignee] : [])
    return {
      ...t,
      assignees,
      assignee: assignees[0] || null
    }
  })
}

export async function isTaskAssignee(taskId: number, userId: number): Promise<boolean> {
  try {
    const rows = await query(
      'SELECT 1 FROM task_assignees WHERE task_id = ? AND user_id = ? LIMIT 1',
      [taskId, userId]
    ) as any[]
    return rows.length > 0
  } catch {
    return false
  }
}
