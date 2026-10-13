import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'iteration', 'read');
    const queryParams = getQuery(event);
    const { projectId, status } = queryParams;

    const params: any[] = [];

    // 构建 requirement_count 子查询的条件（按项目过滤）
    let reqCountClause = 'SELECT COUNT(*) FROM requirements WHERE iteration_id = i.id';
    if (projectId) {
      reqCountClause += ' AND project_id = ?';
    }

    let sql = `
      SELECT i.*,
             p.name as project_name,
             u.nickname as creator_name,
             (${reqCountClause}) as requirement_count
      FROM iterations i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE 1=1
    `;

    if (projectId) {
      // 子查询中的 ? 在 SQL 中先出现，外层 WHERE 的 ? 后出现
      params.push(projectId, projectId);
      sql += ' AND i.project_id = ?';
    }

    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY i.start_date DESC';

    const iterations = await query(sql, params);

    return (iterations as any[]).map(i => ({
      id: i.id,
      name: i.name,
      status: i.status,
      project_id: i.project_id,
      start_date: i.start_date,
      end_date: i.end_date,
      project_name: i.project_name,
      creator_name: i.creator_name,
      requirement_count: i.requirement_count
    }));
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取迭代列表失败'
    });
  }
});
