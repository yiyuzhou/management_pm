import { getCurrentUser } from '~/server/utils/auth'
import { query } from '~/server/utils/mysql'
import { ensureDueReminders, ensureNotificationsTable } from '~/server/utils/notifications'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  await ensureNotificationsTable()
  await ensureDueReminders()

  const items = await query(
    `SELECT id, type, title, content, link, ref_type, ref_id, is_read, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [currentUser.id]
  ) as any[]

  const [unread] = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [currentUser.id]
  ) as any[]

  return {
    unreadCount: unread?.count || 0,
    items: items.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      content: n.content || '',
      link: n.link || '',
      refType: n.ref_type,
      refId: n.ref_id,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at
    }))
  }
})
