export interface MenuDefinition {
  key: string
  label: string
  adminOnly?: boolean
}

/** Sidebar menus that can be granted to a role. */
export const MENU_CATALOG: MenuDefinition[] = [
  { key: 'dashboard', label: '仪表盘' },
  { key: 'projects', label: '项目管理' },
  { key: 'requirements', label: '需求池' },
  { key: 'prototype', label: '原型中心' },
  { key: 'tasks', label: '任务看板' },
  { key: 'bugs', label: 'Bug追踪' },
  { key: 'weekly', label: '周报' },
  { key: 'iteration', label: '迭代管理' },
  { key: 'team', label: '团队' },
  { key: 'permissions', label: '权限管理', adminOnly: true },
]

export const SYSTEM_ROLE_SLUGS = ['admin', 'pm', 'project_manager', 'developer', 'tester'] as const
export type SystemRoleSlug = typeof SYSTEM_ROLE_SLUGS[number]

export const SYSTEM_ROLE_LABELS: Record<SystemRoleSlug, string> = {
  admin: '管理员',
  pm: '产品经理',
  project_manager: '项目经理',
  developer: '开发工程师',
  tester: '测试工程师',
}

export function isSystemRoleSlug(slug: string): slug is SystemRoleSlug {
  return (SYSTEM_ROLE_SLUGS as readonly string[]).includes(slug)
}

export function permissionRoleOf(user: { role?: string; inherit_role?: string | null }): SystemRoleSlug {
  const candidate = user.inherit_role || user.role || 'developer'
  return isSystemRoleSlug(candidate) ? candidate : 'developer'
}

export function defaultMenuKeys(roleSlug: string): string[] {
  return MENU_CATALOG
    .filter(item => !item.adminOnly || roleSlug === 'admin')
    .map(item => item.key)
}

export function sanitizeMenus(menus: unknown, roleSlug: string): string[] {
  const allowed = new Set(MENU_CATALOG.map(item => item.key))
  const incoming = Array.isArray(menus) ? menus : []
  const keys = incoming
    .filter((key): key is string => typeof key === 'string' && allowed.has(key))
    .filter((key) => {
      const item = MENU_CATALOG.find(m => m.key === key)
      return item && (!item.adminOnly || roleSlug === 'admin')
    })
  const unique = [...new Set(keys)]
  if (roleSlug === 'admin' && !unique.includes('permissions')) {
    unique.push('permissions')
  }
  return unique
}
