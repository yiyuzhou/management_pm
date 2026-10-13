import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { normalizeDate } from '~/server/utils/date';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin 可创建项目
    const currentUser = await authorize(event, 'project', 'create');

    const body = await readBody(event);
    const { name, description, status, color, start_date, end_date, owner_id } = body;

    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: '项目名称不能为空'
      });
    }

    const ownerId = owner_id ?? currentUser.id;
    const result = await query(
      `INSERT INTO projects (name, description, status, color, start_date, end_date, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description ?? null, status || 'planning', color || '#3B82F6', normalizeDate(start_date), normalizeDate(end_date), ownerId]
    ) as any;

    await query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [result.insertId, ownerId, 'owner']
    );

    const newProject = await query(
      `SELECT p.*, u.nickname as owner_name, u.avatar as owner_avatar
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    return newProject[0];
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '创建项目失败'
    });
  }
});
