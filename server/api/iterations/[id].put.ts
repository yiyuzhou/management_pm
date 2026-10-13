import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { normalizeDate } from '~/server/utils/date';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin/pm 可更新迭代
    await authorize(event, 'iteration', 'update');

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

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

    const {
      name, status, start_date, end_date, project_id, description
    } = body;

    // 如果要改为 active，检查同项目下是否已有 active 迭代
    if (status === 'active') {
      // 先获取当前迭代的 project_id
      const currentIter = await query(
        'SELECT project_id FROM iterations WHERE id = ?',
        [id]
      ) as any[];
      const effectiveProjectId = project_id !== undefined ? project_id : currentIter[0]?.project_id;

      if (effectiveProjectId) {
        const activeIter = await query(
          'SELECT id, name FROM iterations WHERE project_id = ? AND status = ? AND id != ?',
          [effectiveProjectId, 'active', id]
        ) as any[];
        if (activeIter.length > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: `该项目下已有进行中的迭代「${activeIter[0].name}」，同一项目仅允许一个进行中迭代`
          });
        }
      }
    }

    // 动态构建 UPDATE
    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (start_date !== undefined) { fields.push('start_date = ?'); values.push(normalizeDate(start_date)); }
    if (end_date !== undefined) { fields.push('end_date = ?'); values.push(normalizeDate(end_date)); }
    if (project_id !== undefined && project_id !== null) { fields.push('project_id = ?'); values.push(project_id); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }

    if (fields.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有需要更新的字段'
      });
    }

    values.push(id);
    await query(`UPDATE iterations SET ${fields.join(', ')} WHERE id = ?`, values);

    const rows = await query(
      `SELECT i.*,
              p.name as project_name,
              u.nickname as creator_name,
              (SELECT COUNT(*) FROM requirements WHERE iteration_id = i.id) as requirement_count
       FROM iterations i
       LEFT JOIN projects p ON i.project_id = p.id
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.id = ?`,
      [id]
    ) as any[];

    const i = rows[0];
    return {
      id: i.id,
      name: i.name,
      status: i.status,
      project_id: i.project_id,
      start_date: i.start_date,
      end_date: i.end_date,
      project_name: i.project_name,
      creator_name: i.creator_name,
      requirement_count: i.requirement_count
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新迭代失败'
    });
  }
});
