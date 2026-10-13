import { query } from '~/server/utils/mysql'
import { authorize } from '~/server/utils/permissions'
import { DEFAULT_RESET_PASSWORD, verifyPassword } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'user', 'update')

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: '用户ID不能为空' })
    }

    const users = await query(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [parseInt(id)]
    ) as any[]

    if (!users.length) {
      throw createError({ statusCode: 404, statusMessage: '用户不存在' })
    }

    const matchesDefault = verifyPassword(DEFAULT_RESET_PASSWORD, users[0].password_hash)
    return {
      password: matchesDefault ? DEFAULT_RESET_PASSWORD : null
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '查看密码失败'
    })
  }
})
