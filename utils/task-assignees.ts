export function taskAssigneeList(task: any): { id: number; name: string }[] {
  if (Array.isArray(task?.assignees) && task.assignees.length) return task.assignees
  if (task?.assignee) return [task.assignee]
  return []
}

export function taskAssigneeNames(task: any) {
  const names = taskAssigneeList(task).map(u => u.name).filter(Boolean)
  return names.length ? names.join('、') : '未指派'
}

export function assignableUsers<T extends { role?: string }>(users: T[] | null | undefined): T[] {
  return (users || []).filter(user => user.role !== 'admin')
}
