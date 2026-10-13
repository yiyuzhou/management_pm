import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'requirement', 'read');
    const queryParams = getQuery(event);
    const page = parseInt(queryParams.page as string) || 1;
    const pageSize = parseInt(queryParams.pageSize as string) || 10;
    const status = queryParams.status as string;
    const priority = queryParams.priority as string;
    const assigneeId = queryParams.assigneeId as string;
    const search = queryParams.search as string;
    const projectId = queryParams.projectId as string;
    const iterationId = queryParams.iterationId as string;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'all') {
      whereClause += ' AND r.priority = ?';
      params.push(priority);
    }

    if (assigneeId && assigneeId !== 'all') {
      whereClause += ' AND r.assignee_id = ?';
      params.push(parseInt(assigneeId));
    }

    if (projectId) {
      whereClause += ' AND r.project_id = ?';
      params.push(parseInt(projectId));
    }

    if (iterationId) {
      whereClause += ' AND r.iteration_id = ?';
      params.push(parseInt(iterationId));
    }

    if (search) {
      whereClause += ' AND (r.title LIKE ? OR r.req_no LIKE ?)';
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch);
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM requirements r ${whereClause}`;
    const [countResult] = await query(countSql, [...params]) as any[];
    const total = countResult.total;

    // 查询数据（带子查询派生字段）
    const dataSql = `
      SELECT r.*,
             p.name as project_name,
             i.name as iteration_name,
             creator.nickname as creator_name,
             assignee.nickname as assignee_name,
             assignee.avatar as assignee_avatar,
             (SELECT COUNT(*) FROM tasks t WHERE t.requirement_id = r.id) as task_count,
             EXISTS(SELECT 1 FROM prototypes pt WHERE pt.requirement_id = r.id) as has_prototype
      FROM requirements r
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN iterations i ON r.iteration_id = i.id
      LEFT JOIN users creator ON r.creator_id = creator.id
      LEFT JOIN users assignee ON r.assignee_id = assignee.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ${parseInt(pageSize as any)} OFFSET ${(page - 1) * pageSize}
    `;

    const requirements = await query(dataSql, [...params]);

    // 格式化数据
    const items = (requirements as any[]).map(r => ({
      id: r.req_no,
      req_id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      type: r.type,
      module: r.module,
      expected_date: r.expected_date,
      tags: Array.isArray(r.tags) ? r.tags : (r.tags && r.tags !== 'null' ? JSON.parse(r.tags) : []),
      task_count: r.task_count || 0,
      has_prototype: !!r.has_prototype,
      created_at: r.created_at,
      updated_at: r.updated_at,
      project: r.project_name ? { id: r.project_id, name: r.project_name, description: '', status: 'active', color: '' } : null,
      iteration: r.iteration_name ? { id: r.iteration_id, name: r.iteration_name } : null,
      assignee: r.assignee_name ? {
        id: r.assignee_id,
        name: r.assignee_name,
        avatar: r.assignee_avatar
      } : null,
      creator: r.creator_name ? { id: r.creator_id, name: r.creator_name } : null
    }));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取需求列表失败'
    });
  }
});
