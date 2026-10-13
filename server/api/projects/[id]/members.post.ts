import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'project', 'update');
    const projectId = getRouterParam(event, 'id');
    const body = await readBody(event);
    const { user_id, role } = body;

    if (!user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: '请选择成员'
      });
    }

    // 检查项目是否存在
    const projects = await query('SELECT id FROM projects WHERE id = ?', [projectId]) as any[];
    if (projects.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '项目不存在' });
    }

    // 检查用户是否存在
    const users = await query('SELECT id FROM users WHERE id = ?', [user_id]) as any[];
    if (users.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '用户不存在' });
    }

    // 检查是否已是成员
    const existing = await query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, user_id]
    ) as any[];

    if (existing.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: '该用户已是项目成员'
      });
    }

    // 添加成员
    const result = await query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, user_id, role || 'member']
    ) as any;

    // 返回新成员信息
    const rows = await query(
      `SELECT pm.id, pm.user_id, pm.role, pm.joined_at,
              u.nickname, u.email, u.avatar, u.role as user_role
       FROM project_members pm
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE pm.id = ?`,
      [result.insertId]
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
      statusMessage: error.message || '添加成员失败'
    });
  }
});
