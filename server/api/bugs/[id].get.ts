import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'bug', 'read');
    const id = getRouterParam(event, 'id');

    // 支持 bug_no 或 id 查询
    const rows = await query(
      `SELECT b.*,
              p.name as project_name,
              p.status as project_status,
              p.color as project_color,
              req.title as requirement_title,
              req.req_no as requirement_no,
              reporter.nickname as reporter_name,
              reporter.avatar as reporter_avatar,
              assignee.nickname as assignee_name,
              assignee.avatar as assignee_avatar,
              iter.name as iteration_name,
              iter.id as iteration_id
       FROM bugs b
       LEFT JOIN projects p ON b.project_id = p.id
       LEFT JOIN requirements req ON b.requirement_id = req.id
       LEFT JOIN users reporter ON b.reporter_id = reporter.id
       LEFT JOIN users assignee ON b.assignee_id = assignee.id
       LEFT JOIN iterations iter ON b.iteration_id = iter.id
       WHERE b.bug_no = ? OR b.id = ?`,
      [id, id]
    ) as any[];

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bug不存在'
      });
    }

    const b = rows[0];

    // 解析 screenshots JSON
    let screenshots: any[] = [];
    try {
      screenshots = b.screenshots ? (typeof b.screenshots === 'string' ? JSON.parse(b.screenshots) : b.screenshots) : [];
    } catch { screenshots = []; }

    // 解析 tags JSON
    let tags: string[] = [];
    try {
      tags = b.tags ? (typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags) : [];
    } catch { tags = []; }

    return {
      id: b.bug_no,
      bug_id: b.id,
      title: b.title,
      description: b.description || '',
      steps: b.steps || '',
      expected_result: b.expected_result || '',
      actual_result: b.actual_result || '',
      severity: b.severity,
      priority: b.priority,
      status: b.status,
      screenshots,
      tags,
      module: b.module || null,
      iteration: b.iteration_id ? { id: b.iteration_id, name: b.iteration_name } : null,
      created_at: b.created_at,
      updated_at: b.updated_at,
      assignee: b.assignee_name ? { id: b.assignee_id, name: b.assignee_name, avatar: b.assignee_avatar } : null,
      reporter: b.reporter_name ? { id: b.reporter_id, name: b.reporter_name, avatar: b.reporter_avatar } : null,
      requirement: b.requirement_title ? { id: b.requirement_no, title: b.requirement_title } : null,
      project: b.project_name ? { id: b.project_id, name: b.project_name, description: '', status: b.project_status, color: b.project_color } : null
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取Bug详情失败'
    });
  }
});
