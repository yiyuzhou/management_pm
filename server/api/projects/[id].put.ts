import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { normalizeDate } from '~/server/utils/date';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin/pm 可更新项目
    await authorize(event, 'project', 'update');

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    const existing = await query('SELECT id FROM projects WHERE id = ?', [id]) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '项目不存在'
      });
    }

    // 动态构建 UPDATE
    const fields: string[] = [];
    const values: any[] = [];

    const { name, description, status, color, start_date, end_date, owner_id } = body;

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (color !== undefined) { fields.push('color = ?'); values.push(color); }
    if (start_date !== undefined) { fields.push('start_date = ?'); values.push(normalizeDate(start_date)); }
    if (end_date !== undefined) { fields.push('end_date = ?'); values.push(normalizeDate(end_date)); }
    if (owner_id !== undefined) { fields.push('owner_id = ?'); values.push(owner_id || null); }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    // 返回更新后的完整详情
    const projects = await query(
      `SELECT p.*, u.nickname as owner_name, u.avatar as owner_avatar
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = ?`,
      [id]
    ) as any[];

    const p = projects[0];

    // 获取成员
    const memberRows = await query(
      `SELECT pm.id, pm.user_id, pm.role, pm.joined_at,
              u.nickname, u.email, u.avatar, u.role as user_role
       FROM project_members pm
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.joined_at ASC`,
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
        avatar: p.owner_avatar
      } : null,
      members: memberRows.map(m => ({
        id: m.id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        nickname: m.nickname || '未知',
        email: m.email || '',
        avatar: m.avatar,
        user_role: m.user_role || ''
      }))
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新项目失败'
    });
  }
});
