import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin/pm 可删除需求
    await authorize(event, 'requirement', 'delete');

    const id = getRouterParam(event, 'id');

    // 查找需求
    const existing = await query(
      'SELECT id FROM requirements WHERE req_no = ? OR id = ?',
      [id, id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '需求不存在'
      });
    }

    const [taskCount] = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE requirement_id = ?',
      [existing[0].id]
    ) as any[];
    if ((taskCount?.count || 0) > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: '该需求下还有关联任务，请先手动删除关联任务后再删除需求'
      });
    }

    await query('DELETE FROM requirements WHERE id = ?', [existing[0].id]);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除需求失败'
    });
  }
});
