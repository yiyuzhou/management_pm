export type SystemRole = 'admin' | 'pm' | 'project_manager' | 'developer' | 'tester'
export type Resource = 'project' | 'requirement' | 'task' | 'bug' | 'iteration' | 'prototype' | 'weekly_report' | 'user'
export type Action = 'create' | 'read' | 'update' | 'delete'
export type PermissionScope = 'all' | 'own'

export const PERMISSION_RESOURCES: { key: Resource; label: string }[] = [
  { key: 'project', label: '项目' },
  { key: 'requirement', label: '需求' },
  { key: 'task', label: '任务' },
  { key: 'bug', label: 'Bug' },
  { key: 'iteration', label: '迭代' },
  { key: 'prototype', label: '原型' },
  { key: 'weekly_report', label: '周报' },
  { key: 'user', label: '用户' },
]

export const PERMISSION_ACTIONS: { key: Action; label: string }[] = [
  { key: 'read', label: '查看' },
  { key: 'create', label: '新建' },
  { key: 'update', label: '编辑' },
  { key: 'delete', label: '删除' },
]

/** Resources that support “only own records” on update. */
export const OWN_UPDATE_RESOURCES: Resource[] = ['task', 'bug', 'weekly_report']

export const PERMISSION_MATRIX: Record<string, { roles: SystemRole[]; ownRoles?: SystemRole[] }> = {
  'project:create':   { roles: ['admin', 'project_manager'] },
  'project:read':     { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'project:update':   { roles: ['admin', 'pm', 'project_manager'] },
  'project:delete':   { roles: ['admin', 'project_manager'] },
  'requirement:create':  { roles: ['admin', 'pm', 'project_manager'] },
  'requirement:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'requirement:update':  { roles: ['admin', 'pm', 'project_manager'] },
  'requirement:delete':  { roles: ['admin', 'pm', 'project_manager'] },
  'task:create':  { roles: ['admin', 'pm', 'project_manager'] },
  'task:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'task:update':  { roles: ['admin', 'pm', 'project_manager'], ownRoles: ['developer', 'tester'] },
  'task:delete':  { roles: ['admin', 'pm', 'project_manager'] },
  'bug:create':  { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'bug:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'bug:update':  { roles: ['admin', 'pm', 'project_manager', 'tester'], ownRoles: ['developer'] },
  'bug:delete':  { roles: ['admin', 'project_manager'] },
  'iteration:create':  { roles: ['admin', 'pm', 'project_manager'] },
  'iteration:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'iteration:update':  { roles: ['admin', 'pm', 'project_manager'] },
  'iteration:delete':  { roles: ['admin', 'pm', 'project_manager'] },
  'prototype:create':  { roles: ['admin', 'pm', 'project_manager'] },
  'prototype:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'prototype:update':  { roles: ['admin', 'pm', 'project_manager'] },
  'prototype:delete':  { roles: ['admin', 'project_manager'] },
  'weekly_report:create':  { roles: ['admin', 'project_manager', 'developer', 'tester'] },
  'weekly_report:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'weekly_report:update':  { roles: ['admin'], ownRoles: ['project_manager', 'developer', 'tester'] },
  'weekly_report:delete':  { roles: ['admin', 'project_manager'] },
  'user:create':  { roles: ['admin'] },
  'user:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'user:update':  { roles: ['admin'] },
  'user:delete':  { roles: ['admin'] },
}

export type PermissionMap = Record<string, PermissionScope>

export function scopesFromStaticMatrix(role: string): PermissionMap {
  const out: PermissionMap = {}
  for (const [key, entry] of Object.entries(PERMISSION_MATRIX)) {
    if (entry.roles.includes(role as SystemRole)) out[key] = 'all'
    else if (entry.ownRoles?.includes(role as SystemRole)) out[key] = 'own'
  }
  return out
}

export function permissionSummary(perms: PermissionMap | undefined) {
  const counts = { read: 0, create: 0, update: 0, delete: 0 }
  for (const key of Object.keys(perms || {})) {
    const action = key.split(':')[1] as Action
    if (action in counts) counts[action] += 1
  }
  return `查看 ${counts.read} · 新建 ${counts.create} · 编辑 ${counts.update} · 删除 ${counts.delete}`
}

export function sanitizePermissionMap(input: unknown): PermissionMap {
  const out: PermissionMap = {}
  if (!input || typeof input !== 'object') return out
  const resources = new Set(PERMISSION_RESOURCES.map(item => item.key))
  const actions = new Set(PERMISSION_ACTIONS.map(item => item.key))
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const [resource, action] = key.split(':')
    if (!resources.has(resource as Resource) || !actions.has(action as Action)) continue
    if (value !== 'all' && value !== 'own') continue
    if (value === 'own' && !(action === 'update' && OWN_UPDATE_RESOURCES.includes(resource as Resource))) {
      out[key] = 'all'
      continue
    }
    out[key] = value
  }
  return out
}
