import { getCurrentUser } from '~/server/utils/auth'
import { query } from '~/server/utils/mysql'
import { ensureNotificationsTable } from '~/server/utils/notifications'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  await ensureNotificationsTable()
  const body = await readBody(event).catch(() => ({}))
  if (body?.all) {
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [currentUser.id])
  } else if (body?.id) {
    await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [body.id, currentUser.id])
  }
  return { success: true }
})
