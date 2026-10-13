import { query } from '~/server/utils/mysql'

/** A user is online if they authenticated within the TTL. */
export const PRESENCE_TTL_MS = 2 * 60 * 1000
const FLUSH_INTERVAL_MS = 10 * 1000

const lastSeen = new Map<number, number>()
const lastFlush = new Map<number, number>()

export function touchPresence(userId: number, at = Date.now()) {
  if (!userId) return
  lastSeen.set(userId, at)
  const prev = lastFlush.get(userId) || 0
  if (at - prev < FLUSH_INTERVAL_MS) return
  lastFlush.set(userId, at)
  query('UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]).catch(() => {})
}

export function clearPresence(userId: number) {
  lastSeen.delete(userId)
  lastFlush.delete(userId)
  query('UPDATE users SET last_seen_at = NULL WHERE id = ?', [userId]).catch(() => {})
}

export function isOnline(userId: number, at = Date.now(), ttlMs = PRESENCE_TTL_MS) {
  const seen = lastSeen.get(userId)
  if (seen == null) return false
  if (at - seen >= ttlMs) {
    lastSeen.delete(userId)
    return false
  }
  return true
}

export async function hydratePresenceFromDb(ttlMs = PRESENCE_TTL_MS) {
  try {
    const rows = await query(
      `SELECT id, last_seen_at FROM users
        WHERE last_seen_at IS NOT NULL
          AND last_seen_at >= DATE_SUB(NOW(), INTERVAL ? SECOND)`,
      [Math.ceil(ttlMs / 1000)]
    ) as { id: number; last_seen_at: string | Date }[]
    for (const row of rows) {
      const seen = new Date(row.last_seen_at).getTime()
      if (!Number.isNaN(seen)) lastSeen.set(row.id, seen)
    }
  } catch {
    // column may not exist yet during first boot
  }
}

export function resetPresence() {
  lastSeen.clear()
  lastFlush.clear()
}
