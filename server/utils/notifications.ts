import { query } from '~/server/utils/mysql'

let tableReady: Promise<void> | null = null

export async function ensureNotificationsTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content VARCHAR(500) DEFAULT NULL,
        link VARCHAR(255) DEFAULT NULL,
        ref_type VARCHAR(50) DEFAULT NULL,
        ref_id VARCHAR(50) DEFAULT NULL,
        dedupe_key VARCHAR(100) DEFAULT NULL,
        is_read TINYINT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_user_read (user_id, is_read, created_at),
        UNIQUE KEY uk_dedupe (user_id, type, ref_type, ref_id, dedupe_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `).then(() => undefined).catch((err) => {
      tableReady = null
      throw err
    })
  }
  await tableReady
}

export async function createNotification(opts: {
  userId: number | string | null | undefined
  actorId?: number | string | null
  type: 'requirement_assigned' | 'bug_assigned' | 'requirement_due'
  title: string
  content?: string
  link?: string
  refType?: string
  refId?: string | number
  dedupeKey?: string | null
}) {
  const userId = Number(opts.userId)
  if (!userId) return
  if (opts.actorId != null && Number(opts.actorId) === userId) return
  await ensureNotificationsTable()
  const sql = opts.dedupeKey
    ? `INSERT IGNORE INTO notifications
        (user_id, type, title, content, link, ref_type, ref_id, dedupe_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    : `INSERT INTO notifications
        (user_id, type, title, content, link, ref_type, ref_id, dedupe_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  try {
    await query(sql, [
      userId,
      opts.type,
      opts.title,
      opts.content || null,
      opts.link || null,
      opts.refType || null,
      opts.refId != null ? String(opts.refId) : null,
      opts.dedupeKey || null
    ])
  } catch {
    // 通知失败不影响主流程
  }
}

export async function notifyRequirementAssigned(opts: {
  assigneeId: number | string | null | undefined
  actorId: number | string
  title: string
  reqNo: string
}) {
  await createNotification({
    userId: opts.assigneeId,
    actorId: opts.actorId,
    type: 'requirement_assigned',
    title: '需求指派',
    content: `你被指派了需求「${opts.title}」`,
    link: `/requirements/${opts.reqNo}`,
    refType: 'requirement',
    refId: opts.reqNo
  })
}

export async function notifyBugAssigned(opts: {
  assigneeId: number | string | null | undefined
  actorId: number | string
  title: string
  bugNo: string
}) {
  await createNotification({
    userId: opts.assigneeId,
    actorId: opts.actorId,
    type: 'bug_assigned',
    title: 'Bug 指派',
    content: `你被指派了 Bug「${opts.title}」`,
    link: `/bugs/${opts.bugNo}`,
    refType: 'bug',
    refId: opts.bugNo
  })
}

export async function ensureDueReminders() {
  await ensureNotificationsTable()
  const rows = await query(
    `SELECT r.id, r.req_no, r.title, r.assignee_id, r.expected_date
     FROM requirements r
     WHERE r.assignee_id IS NOT NULL
       AND r.expected_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
       AND r.status NOT IN ('completed', 'closed')`
  ) as any[]
  for (const row of rows) {
    const dateKey = String(row.expected_date).slice(0, 10)
    await createNotification({
      userId: row.assignee_id,
      type: 'requirement_due',
      title: '需求即将到期',
      content: `需求「${row.title}」还有 1 天到期`,
      link: `/requirements/${row.req_no}`,
      refType: 'requirement',
      refId: row.req_no,
      dedupeKey: `due:${dateKey}`
    })
  }
}
