import { query } from '~/server/utils/mysql';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：admin 可删除所有周报，其他角色只能删除自己的
    const currentUser = await getCurrentUser(event);
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: '未登录' });
    }

    const id = getRouterParam(event, 'id');

    const existing = await query(
      'SELECT id, user_id FROM weekly_reports WHERE id = ?',
      [id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '周报不存在'
      });
    }

    // 管理员和项目经理可删除任意周报；其他用户只能删除自己的周报。
    if (!['admin', 'project_manager'].includes(currentUser.role) && existing[0].user_id !== currentUser.id) {
      throw createError({
        statusCode: 403,
        statusMessage: '无权删除他人的周报'
      });
    }

    await query('DELETE FROM weekly_reports WHERE id = ?', [existing[0].id]);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除周报失败'
    });
  }
});
