import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { canViewAllProjects } from '~/server/utils/projectAccess';

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authorize(event, 'project', 'read');
    const queryParams = getQuery(event);
    const { status, keyword } = queryParams;

    let sql = `
      SELECT p.*,
             u.nickname as owner_name,
             u.avatar as owner_avatar,
             (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
             (SELECT COUNT(*) FROM requirements WHERE project_id = p.id) as requirement_count
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (!canViewAllProjects(currentUser)) {
      sql += ` AND (p.owner_id = ? OR EXISTS (
        SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = ?
      ))`;
      params.push(currentUser.id, currentUser.id);
    }

    if (status && status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (keyword) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const likeKeyword = `%${keyword}%`;
      params.push(likeKeyword, likeKeyword);
    }

    sql += ' ORDER BY p.created_at DESC';

    const projects = await query(sql, params);

    return (projects as any[]).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      color: p.color,
      start_date: p.start_date,
      end_date: p.end_date,
      member_count: p.member_count,
      requirement_count: p.requirement_count,
      owner: p.owner_name ? {
        id: p.owner_id,
        name: p.owner_name,
        avatar: p.owner_avatar
      } : null,
      created_at: p.created_at
    }));
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取项目列表失败'
    });
  }
});
