import { query } from '~/server/utils/mysql'
import { getCurrentUser, hashPassword, verifyPassword } from '~/server/utils/auth'
import { permissionRoleOf } from '~/server/utils/roles'

export default defineEventHandler(async (event) => {
  try {
    const current = await getCurrentUser(event)
    if (!current) {
      throw createError({ statusCode: 401, statusMessage: '未登录' })
    }

    const id = parseInt(String(getRouterParam(event, 'id') || ''), 10)
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: '用户ID不能为空' })
    }

    const isSelf = Number(current.id) === id
    const isAdmin = permissionRoleOf(current) === 'admin'
    if (!isSelf && !isAdmin) {
      throw createError({ statusCode: 403, statusMessage: '只能修改本人密码' })
    }

    const body = await readBody(event)
    const currentPassword = String(body?.current_password || '')
    const newPassword = String(body?.new_password || '')

    if (newPassword.length < 6) {
      throw createError({ statusCode: 400, statusMessage: '新密码至少 6 位' })
    }

    const users = await query(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [id]
    ) as any[]

    if (!users.length) {
      throw createError({ statusCode: 404, statusMessage: '用户不存在' })
    }

    if (isSelf) {
      if (!currentPassword) {
        throw createError({ statusCode: 400, statusMessage: '请输入当前密码' })
      }
      if (!verifyPassword(currentPassword, users[0].password_hash)) {
        throw createError({ statusCode: 400, statusMessage: '当前密码不正确' })
      }
    }

    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashPassword(newPassword), id]
    )

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '修改密码失败'
    })
  }
})
