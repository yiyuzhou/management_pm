import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'requirement', 'read');
    const id = getRouterParam(event, 'id');

    // 查找需求
    const requirements = await query(
      `SELECT r.id, r.title, r.created_at, u.nickname as creator_name
       FROM requirements r
       LEFT JOIN users u ON r.creator_id = u.id
       WHERE r.req_no = ? OR r.id = ?`,
      [id, id]
    ) as any[];

    if (requirements.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '需求不存在'
      });
    }

    const req = requirements[0];
    const reqId = req.id;

    const history = await query(
      `SELECT h.*, u.nickname as user_name
       FROM requirement_history h
       LEFT JOIN users u ON h.changed_by = u.id
       WHERE h.requirement_id = ?
       ORDER BY h.changed_at DESC, h.id DESC`,
      [reqId]
    ) as any[];

    const items = history.map(h => ({
      id: h.id,
      field: h.field,
      old_value: h.old_value,
      new_value: h.new_value,
      user_name: h.user_name || '系统',
      changed_at: h.changed_at
    }));

    // 兼容历史数据：没有「创建」记录时，用需求创建信息补一条
    if (!items.some(item => item.field === '创建')) {
      items.push({
        id: `create-${reqId}`,
        field: '创建',
        old_value: null,
        new_value: req.title,
        user_name: req.creator_name || '系统',
        changed_at: req.created_at
      });
    }

    return items;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取需求历史失败'
    });
  }
});
