import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin 可删除原型
    await authorize(event, 'prototype', 'delete');

    const id = getRouterParam(event, 'id');

    const existing = await query(
      'SELECT id FROM prototypes WHERE id = ?',
      [id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '原型不存在'
      });
    }

    await query('DELETE FROM prototypes WHERE id = ?', [existing[0].id]);

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '删除原型失败'
    });
  }
});
