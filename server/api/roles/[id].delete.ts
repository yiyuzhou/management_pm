import { query } from '~/server/utils/mysql'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const current = await getCurrentUser(event)
    if (!current) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }
    if (current.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: '仅管理员可删除角色' })
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
    if (Number(role.is_system) === 1) {
      throw createError({ statusCode: 403, statusMessage: '系统角色不可删除' })
    }

    const [countRow] = await query(
      'SELECT COUNT(*) AS cnt FROM users WHERE role = ?',
      [role.slug]
    ) as any[]
    if (Number(countRow?.cnt) > 0) {
      throw createError({ statusCode: 409, statusMessage: '仍有成员使用该角色，无法删除' })
    }

    await query('DELETE FROM roles WHERE id = ?', [id])
    return { id, deleted: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除角色失败',
    })
  }
})
