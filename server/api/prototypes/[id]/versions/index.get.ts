import { query } from '~/server/utils/mysql'
import { authorize } from '~/server/utils/permissions'

export default defineEventHandler(async (event) => {
  await authorize(event, 'prototype', 'read')
  const prototypeId = getRouterParam(event, 'id')

  const rows = await query(
    `SELECT pv.id, pv.prototype_id, pv.revision, pv.version_label, pv.change_summary, pv.created_at,
            u.nickname AS author_name, u.avatar AS author_avatar
       FROM prototype_versions pv
       LEFT JOIN users u ON u.id = pv.created_by
      WHERE pv.prototype_id = ?
      ORDER BY pv.revision DESC`,
    [prototypeId]
  ) as any[]

  return {
    items: rows.map((row) => ({
      id: row.id,
      revision: row.revision,
      version: row.version_label,
      description: row.change_summary,
      createdAt: row.created_at,
      author: { name: row.author_name || '未知', avatar: row.author_avatar || null },
    })),
  }
})
