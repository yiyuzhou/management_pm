import { query } from '~/server/utils/mysql'
import { getCurrentUser } from '~/server/utils/auth'
import {
  assertValidSlug,
  getRoleBySlug,
  isSystemRoleSlug,
  loadRolePermissions,
  replaceRoleMenus,
  replaceRolePermissions,
  sanitizeMenus,
} from '~/server/utils/roles'
import { sanitizePermissionMap, scopesFromStaticMatrix } from '~/utils/permission-matrix'

export default defineEventHandler(async (event) => {
  try {
    const current = await getCurrentUser(event)
    if (!current) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }
    if (current.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: '仅管理员可创建角色' })
    }

    const body = await readBody(event)
    const name = String(body?.name || '').trim()
    const slug = String(body?.slug || '').trim()
    const description = body?.description ? String(body.description).trim() : null
    const inheritRole = String(body?.inherit_role || 'developer').trim()

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: '角色名称不能为空' })
    }
    assertValidSlug(slug)
    if (inheritRole && !isSystemRoleSlug(inheritRole) && !(await getRoleBySlug(inheritRole))) {
      throw createError({ statusCode: 400, statusMessage: '复制权限的来源角色不存在' })
    }

    const existing = await getRoleBySlug(slug)
    if (existing) {
      throw createError({ statusCode: 409, statusMessage: '角色标识已存在' })
    }

    const menus = sanitizeMenus(body?.menus, slug)
    const result = await query(
      `INSERT INTO roles (slug, name, description, inherit_role, is_system)
       VALUES (?, ?, ?, ?, 0)`,
      [slug, name, description, inheritRole]
    ) as any

    await replaceRoleMenus(result.insertId, menus)

    let permissions = sanitizePermissionMap(body?.permissions)
    if (!Object.keys(permissions).length) {
      const source = inheritRole ? await getRoleBySlug(inheritRole) : null
      permissions = source
        ? await loadRolePermissions(source.id)
        : scopesFromStaticMatrix(inheritRole || 'developer')
      if (!Object.keys(permissions).length) {
        permissions = scopesFromStaticMatrix(inheritRole || 'developer')
      }
    }
    await replaceRolePermissions(result.insertId, permissions)

    return {
      id: result.insertId,
      slug,
      name,
      description,
      inherit_role: inheritRole || 'developer',
      is_system: false,
      menus,
      permissions,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '创建角色失败',
    })
  }
})
