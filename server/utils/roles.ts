import { query } from '~/server/utils/mysql'
import {
  defaultMenuKeys,
  isSystemRoleSlug,
  MENU_CATALOG,
  permissionRoleOf,
  sanitizeMenus,
  SYSTEM_ROLE_SLUGS,
  type SystemRoleSlug,
} from '~/utils/menus'
import { sanitizePermissionMap, scopesFromStaticMatrix, type PermissionMap } from '~/utils/permission-matrix'

export { isSystemRoleSlug, MENU_CATALOG, permissionRoleOf, sanitizeMenus, SYSTEM_ROLE_SLUGS }
export type { SystemRoleSlug }

const SLUG_RE = /^[a-z][a-z0-9_]{1,31}$/

export function assertValidSlug(slug: string) {
  if (!slug || !SLUG_RE.test(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: '角色标识须为小写字母开头、字母数字下划线，最长 32 位',
    })
  }
}

export async function getRoleBySlug(slug: string) {
  const rows = await query(
    'SELECT id, slug, name, description, inherit_role, is_system FROM roles WHERE slug = ?',
    [slug]
  ) as any[]
  return rows[0] || null
}

export async function assertRoleExists(slug: string) {
  const role = await getRoleBySlug(slug)
  if (!role) {
    throw createError({ statusCode: 400, statusMessage: '角色不存在' })
  }
  return role
}

export async function attachRoleContext(user: any) {
  if (!user) return user
  try {
    const role = await getRoleBySlug(user.role)
    if (role) {
      user.role_name = role.name
      user.inherit_role = role.inherit_role || role.slug
      const menuRows = await query(
        'SELECT menu_key FROM role_menus WHERE role_id = ?',
        [role.id]
      ) as any[]
      user.menus = menuRows.map(row => row.menu_key)
      user.permissions = await loadRolePermissions(role.id)
      if (!Object.keys(user.permissions).length && isSystemRoleSlug(role.slug)) {
        user.permissions = scopesFromStaticMatrix(role.slug)
      }
    } else {
      user.role_name = user.role
      user.inherit_role = isSystemRoleSlug(user.role) ? user.role : 'developer'
      user.menus = defaultMenuKeys(user.role)
      user.permissions = scopesFromStaticMatrix(permissionRoleOf(user))
    }
  } catch {
    user.inherit_role = isSystemRoleSlug(user.role) ? user.role : 'developer'
    user.menus = defaultMenuKeys(user.role)
    user.permissions = scopesFromStaticMatrix(permissionRoleOf(user))
  }
  if (user.role === 'admin') {
    if (!Array.isArray(user.menus)) user.menus = []
    if (!user.menus.includes('permissions')) user.menus.push('permissions')
  }
  return user
}

export async function replaceRoleMenus(roleId: number, menus: string[]) {
  await query('DELETE FROM role_menus WHERE role_id = ?', [roleId])
  for (const key of menus) {
    await query('INSERT INTO role_menus (role_id, menu_key) VALUES (?, ?)', [roleId, key])
  }
}

export async function loadRolePermissions(roleId: number): Promise<PermissionMap> {
  const rows = await query(
    'SELECT resource, action, scope FROM role_permissions WHERE role_id = ?',
    [roleId]
  ) as any[]
  const map: PermissionMap = {}
  for (const row of rows) {
    map[`${row.resource}:${row.action}`] = row.scope
  }
  return map
}

export async function loadAllRolePermissions() {
  const rows = await query(
    'SELECT role_id, resource, action, scope FROM role_permissions'
  ) as any[]
  const byRole = new Map<number, PermissionMap>()
  for (const row of rows) {
    const map = byRole.get(row.role_id) || {}
    map[`${row.resource}:${row.action}`] = row.scope
    byRole.set(row.role_id, map)
  }
  return byRole
}

export async function replaceRolePermissions(roleId: number, permissions: PermissionMap) {
  const map = sanitizePermissionMap(permissions)
  await query('DELETE FROM role_permissions WHERE role_id = ?', [roleId])
  for (const [key, scope] of Object.entries(map)) {
    const [resource, action] = key.split(':')
    await query(
      'INSERT INTO role_permissions (role_id, resource, action, scope) VALUES (?, ?, ?, ?)',
      [roleId, resource, action, scope]
    )
  }
  return map
}
