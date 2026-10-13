import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'project', 'update');
    const projectId = getRouterParam(event, 'id');
    const userId = getRouterParam(event, 'userId');
    const body = await readBody(event);
    const { role } = body;

    if (!role || !['owner', 'admin', 'member'].includes(role)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的角色'
      });
    }

    const existing = await query(
      'SELECT id, role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '成员不存在'
      });
    }

    if (existing[0].role === 'owner' && role !== 'owner') {
      const owners = await query(
        'SELECT COUNT(*) as count FROM project_members WHERE project_id = ? AND role = ?',
        [projectId, 'owner']
      ) as any[];
      if (owners[0].count <= 1) {
        throw createError({ statusCode: 400, statusMessage: '项目至少需要一名所有者' });
      }
    }

    await query(
      'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
      [role, projectId, userId]
    );

    // 返回更新后的成员信息
    const rows = await query(
      `SELECT pm.id, pm.user_id, pm.role, pm.joined_at,
              u.nickname, u.email, u.avatar, u.role as user_role
       FROM project_members pm
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ? AND pm.user_id = ?`,
      [projectId, userId]
    ) as any[];

    const m = rows[0];
    return {
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      nickname: m.nickname || '未知',
      email: m.email || '',
      avatar: m.avatar,
      user_role: m.user_role || ''
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新成员角色失败'
    });
  }
});
