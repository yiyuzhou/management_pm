import { query } from '~/server/utils/mysql'
import { getCurrentUser } from '~/server/utils/auth'
import {
  loadRolePermissions,
  replaceRoleMenus,
  replaceRolePermissions,
  sanitizeMenus,
} from '~/server/utils/roles'
import { sanitizePermissionMap } from '~/utils/permission-matrix'

export default defineEventHandler(async (event) => {
  try {
    const current = await getCurrentUser(event)
    if (!current) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }
    if (current.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: '仅管理员可编辑角色' })
    }

    const id = parseInt(getRouterParam(event, 'id') || '')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: '角色ID不能为空' })
    }

    const rows = await query(
      'SELECT id, slug, is_system FROM roles WHERE id = ?',
      [id]
    ) as any[]
    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '角色不存在' })
    }
    const role = rows[0]
    const body = await readBody(event)
    const name = body?.name !== undefined ? String(body.name).trim() : undefined
    const description = body?.description !== undefined
      ? (body.description ? String(body.description).trim() : null)
      : undefined
    if (name !== undefined && !name) {
      throw createError({ statusCode: 400, statusMessage: '角色名称不能为空' })
    }

    const updates: string[] = []
    const values: any[] = []
    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      values.push(description)
    }

    if (updates.length > 0) {
      values.push(id)
      await query(`UPDATE roles SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    if (body?.menus !== undefined) {
      const menus = sanitizeMenus(body.menus, role.slug)
      await replaceRoleMenus(id, menus)
    }

    if (body?.permissions !== undefined) {
      await replaceRolePermissions(id, sanitizePermissionMap(body.permissions))
    }

    const updated = await query(
      'SELECT id, slug, name, description, inherit_role, is_system FROM roles WHERE id = ?',
      [id]
    ) as any[]
    const menuRows = await query(
      'SELECT menu_key FROM role_menus WHERE role_id = ?',
      [id]
    ) as any[]
    const u = updated[0]
    return {
      id: u.id,
      slug: u.slug,
      name: u.name,
      description: u.description,
      inherit_role: u.inherit_role || u.slug,
      is_system: Number(u.is_system) === 1,
      menus: menuRows.map(row => row.menu_key),
      permissions: await loadRolePermissions(id),
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新角色失败',
    })
  }
})
