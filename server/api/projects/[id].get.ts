import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { assertProjectVisible } from '~/server/utils/projectAccess';

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authorize(event, 'project', 'read');
    const id = getRouterParam(event, 'id');
    await assertProjectVisible(currentUser, id || '');

    const projects = await query(
      `SELECT p.*, u.nickname as owner_name, u.avatar as owner_avatar, u.role as owner_role
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = ?`,
      [id]
    ) as any[];

    if (projects.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '项目不存在'
      });
    }

    const p = projects[0];

    // 获取项目成员（带用户信息）
    const memberRows = await query(
      `SELECT pm.id, pm.user_id, pm.role, pm.joined_at,
              u.nickname, u.email, u.avatar, u.role as user_role
       FROM project_members pm
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.joined_at ASC`,
      [id]
    ) as any[];

    const members = memberRows.map(m => ({
      id: m.id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      nickname: m.nickname || '未知',
      email: m.email || '',
      avatar: m.avatar,
      user_role: m.user_role || ''
    }));

    // 获取统计数据
    const [reqStats] = await query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM requirements WHERE project_id = ?`,
      [id]
    ) as any[];

    const [taskStats] = await query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
       FROM tasks WHERE project_id = ?`,
      [id]
    ) as any[];

    const [bugStats] = await query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status IN ('fixed','verified','closed') THEN 1 ELSE 0 END) as fixed
       FROM bugs WHERE project_id = ?`,
      [id]
    ) as any[];

    const [iterStats] = await query(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
       FROM iterations WHERE project_id = ?`,
      [id]
    ) as any[];

    // 获取迭代列表
    const iterations = await query(
      `SELECT id, name, description, status, start_date, end_date, created_at, updated_at
       FROM iterations
       WHERE project_id = ?
       ORDER BY created_at DESC`,
      [id]
    ) as any[];

    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      status: p.status,
      color: p.color,
      start_date: p.start_date,
      end_date: p.end_date,
      owner_id: p.owner_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
      owner: p.owner_name ? {
        id: p.owner_id,
        name: p.owner_name,
        avatar: p.owner_avatar,
        role: p.owner_role
      } : null,
      members,
      stats: {
        requirement_total: reqStats?.total || 0,
        requirement_completed: reqStats?.completed || 0,
        task_total: taskStats?.total || 0,
        task_done: taskStats?.done || 0,
        bug_total: bugStats?.total || 0,
        bug_fixed: bugStats?.fixed || 0,
        iteration_total: iterStats?.total || 0,
        iteration_active: iterStats?.active || 0
      },
      iterations: iterations.map(it => ({
        id: it.id,
        name: it.name,
        description: it.description || '',
        status: it.status,
        start_date: it.start_date,
        end_date: it.end_date,
        created_at: it.created_at,
        updated_at: it.updated_at
      }))
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取项目详情失败'
    });
  }
});
