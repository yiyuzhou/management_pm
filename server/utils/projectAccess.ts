import { query } from '~/server/utils/mysql'

export function canViewAllProjects(user: { role?: string } | null | undefined) {
  return user?.role === 'admin'
}

export async function userCanAccessProject(userId: number, projectId: number | string) {
  const rows = await query(
    `SELECT 1 AS ok FROM project_members WHERE project_id = ? AND user_id = ?
     UNION
     SELECT 1 AS ok FROM projects WHERE id = ? AND owner_id = ?
     LIMIT 1`,
    [projectId, userId, projectId, userId]
  ) as any[]
  return rows.length > 0
}

export async function assertProjectVisible(user: any, projectId: number | string) {
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未登录' })
  }
  if (canViewAllProjects(user)) return
  const ok = await userCanAccessProject(user.id, projectId)
  if (!ok) {
    throw createError({ statusCode: 403, statusMessage: '无权访问该项目' })
  }
}
