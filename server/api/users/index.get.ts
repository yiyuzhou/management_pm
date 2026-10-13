import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { hydratePresenceFromDb, isOnline } from '~/server/utils/presence';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'user', 'read');
    const queryParams = getQuery(event);
    const { projectId } = queryParams;

    let sql: string;
    let params: any[] = [];

    if (projectId) {
      // 按项目成员过滤
      sql = `SELECT DISTINCT u.id, u.username, u.nickname, u.email, u.role, u.avatar, u.status, u.created_at
             FROM users u
             INNER JOIN project_members pm ON u.id = pm.user_id
             WHERE u.status = 1 AND pm.project_id = ?
             ORDER BY u.id`;
      params = [parseInt(projectId as string)];
    } else {
      sql = `SELECT id, username, nickname, email, role, avatar, status, created_at
             FROM users
             WHERE status = 1
             ORDER BY id`;
    }

    const users = await query(sql, params);
    await hydratePresenceFromDb();

    return (users as any[]).map(u => ({
      id: u.id,
      name: u.nickname || u.username,
      nickname: u.nickname,
      username: u.username,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      status: u.status,
      online: isOnline(u.id),
      created_at: u.created_at
    }));
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取用户列表失败'
    });
  }
});
