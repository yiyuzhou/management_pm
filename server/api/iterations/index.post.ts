import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { normalizeDate } from '~/server/utils/date';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin/pm 可创建迭代
    const currentUser = await authorize(event, 'iteration', 'create');

    const body = await readBody(event);
    const { project_id, name, description, status, start_date, end_date } = body;

    if (!name || !start_date || !end_date) {
      throw createError({
        statusCode: 400,
        statusMessage: '迭代名称、开始日期和结束日期不能为空'
      });
    }

    // 如果状态为 active，检查同项目下是否已有 active 迭代
    const effectiveStatus = status || 'planning';
    if (effectiveStatus === 'active') {
      const effectiveProjectId = project_id || 1;
      const activeIter = await query(
        'SELECT id, name FROM iterations WHERE project_id = ? AND status = ?',
        [effectiveProjectId, 'active']
      ) as any[];
      if (activeIter.length > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: `该项目下已有进行中的迭代「${activeIter[0].name}」，同一项目仅允许一个进行中迭代`
        });
      }
    }

    const result = await query(
      `INSERT INTO iterations (project_id, name, description, status, start_date, end_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [project_id || 1, name, description || '', status || 'planning', normalizeDate(start_date), normalizeDate(end_date), currentUser.id]
    ) as any;

    const rows = await query(
      `SELECT i.*, p.name as project_name, u.nickname as creator_name,
              (SELECT COUNT(*) FROM requirements WHERE iteration_id = i.id) as requirement_count
       FROM iterations i
       LEFT JOIN projects p ON i.project_id = p.id
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.id = ?`,
      [result.insertId]
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
      statusMessage: error.message || '创建迭代失败'
    });
  }
});
