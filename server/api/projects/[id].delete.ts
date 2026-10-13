import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin 可删除项目
    await authorize(event, 'project', 'delete');

    const id = getRouterParam(event, 'id');

    const existing = await query('SELECT id FROM projects WHERE id = ?', [id]) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '项目不存在'
      });
    }

    const [reqCount] = await query(
      'SELECT COUNT(*) as count FROM requirements WHERE project_id = ?',
      [id]
    ) as any[];
    if ((reqCount?.count || 0) > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: '该项目下还有需求，请先删除需求后再删除项目'
      });
    }

    await query('DELETE FROM projects WHERE id = ?', [id]);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除项目失败'
    });
  }
});
