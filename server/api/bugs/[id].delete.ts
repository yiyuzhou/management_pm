import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin 可删除 Bug
    await authorize(event, 'bug', 'delete');

    const id = getRouterParam(event, 'id');

    // 查找 Bug（支持 bug_no 或 id）
    const existing = await query(
      'SELECT id FROM bugs WHERE bug_no = ? OR id = ?',
      [id, id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bug不存在'
      });
    }

    await query('DELETE FROM bugs WHERE id = ?', [existing[0].id]);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除Bug失败'
    });
  }
});
