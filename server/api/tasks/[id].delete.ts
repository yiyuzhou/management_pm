import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin/pm 可删除任务
    await authorize(event, 'task', 'delete');

    const id = getRouterParam(event, 'id');

    // 查找任务（支持 task_no 或 id）
    const existing = await query(
      'SELECT id FROM tasks WHERE task_no = ? OR id = ?',
      [id, id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '任务不存在'
      });
    }

    await query('DELETE FROM tasks WHERE id = ?', [existing[0].id]);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除任务失败'
    });
  }
});
