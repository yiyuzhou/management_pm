import { query } from '~/server/utils/mysql'
import { getCurrentUser } from '~/server/utils/auth'
import { loadAllRolePermissions } from '~/server/utils/roles'
import { scopesFromStaticMatrix } from '~/utils/permission-matrix'

export default defineEventHandler(async (event) => {
  try {
    if (!await getCurrentUser(event)) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }

    const roles = await query(
      `SELECT r.id, r.slug, r.name, r.description, r.inherit_role, r.is_system, r.created_at,
              (SELECT COUNT(*) FROM users u WHERE u.role = r.slug) AS user_count
       FROM roles r
       ORDER BY r.is_system DESC, r.id ASC`
    ) as any[]

    const menuRows = await query(
      'SELECT role_id, menu_key FROM role_menus'
    ) as any[]

    const menusByRole = new Map<number, string[]>()
    for (const row of menuRows) {
      const list = menusByRole.get(row.role_id) || []
      list.push(row.menu_key)
      menusByRole.set(row.role_id, list)
    }

    let permissionsByRole = new Map<number, Record<string, 'all' | 'own'>>()
    try {
      permissionsByRole = await loadAllRolePermissions()
    } catch {
      permissionsByRole = new Map()
    }

    return roles.map(role => {
      const stored = permissionsByRole.get(role.id)
      const permissions = stored && Object.keys(stored).length
        ? stored
        : scopesFromStaticMatrix(role.inherit_role || role.slug)
      return {
        id: role.id,
        slug: role.slug,
        name: role.name,
        description: role.description,
        inherit_role: role.inherit_role || role.slug,
        is_system: Number(role.is_system) === 1,
        user_count: Number(role.user_count) || 0,
        menus: menusByRole.get(role.id) || [],
        permissions,
        created_at: role.created_at,
      }
    })
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取角色列表失败',
    })
  }
})
