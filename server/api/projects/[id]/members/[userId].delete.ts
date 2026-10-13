import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'project', 'update');
    const projectId = getRouterParam(event, 'id');
    const userId = getRouterParam(event, 'userId');

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

    // 不允许移除所有者
    if (existing[0].role === 'owner') {
      throw createError({
        statusCode: 400,
        statusMessage: '不能移除项目所有者'
      });
    }

    await query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '移除成员失败'
    });
  }
});
