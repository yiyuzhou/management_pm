import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin/pm 可删除迭代
    await authorize(event, 'iteration', 'delete');

    const id = getRouterParam(event, 'id');

    const existing = await query(
      'SELECT id FROM iterations WHERE id = ?',
      [id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '迭代不存在'
      });
    }

    // 检查是否有关联需求或任务
    const [reqCount] = await query(
      'SELECT COUNT(*) as count FROM requirements WHERE iteration_id = ?',
      [existing[0].id]
    ) as any[];

    if (reqCount.count > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `该迭代下还有 ${reqCount.count} 个关联需求，请先删除关联需求后再删除迭代`
      });
    }

    await query('DELETE FROM iterations WHERE id = ?', [existing[0].id]);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除迭代失败'
    });
  }
});
