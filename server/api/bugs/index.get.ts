import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'bug', 'read');
    const queryParams = getQuery(event);
    const { projectId, requirementId, status, severity } = queryParams;

    let sql = `
      SELECT b.*,
             p.name as project_name,
             p.status as project_status,
             p.color as project_color,
             req.title as requirement_title,
             req.req_no as requirement_no,
             reporter.nickname as reporter_name,
             assignee.nickname as assignee_name
      FROM bugs b
      LEFT JOIN projects p ON b.project_id = p.id
      LEFT JOIN requirements req ON b.requirement_id = req.id
      LEFT JOIN users reporter ON b.reporter_id = reporter.id
      LEFT JOIN users assignee ON b.assignee_id = assignee.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (projectId) {
      sql += ' AND b.project_id = ?';
      params.push(projectId);
    }

    if (requirementId) {
      sql += ' AND b.requirement_id = ?';
      params.push(requirementId);
    }

    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    if (severity) {
      sql += ' AND b.severity = ?';
      params.push(severity);
    }

    sql += ' ORDER BY b.created_at DESC';

    const bugs = await query(sql, params) as any[];

    return bugs.map(b => {
      let screenshots: any[] = [];
      try {
        screenshots = b.screenshots ? (typeof b.screenshots === 'string' ? JSON.parse(b.screenshots) : b.screenshots) : [];
      } catch { screenshots = []; }
      return {
        id: b.bug_no,
        bug_id: b.id,
        title: b.title,
        description: b.description,
        steps: b.steps,
        expected_result: b.expected_result,
        actual_result: b.actual_result,
        severity: b.severity,
        priority: b.priority,
        status: b.status,
        screenshots,
        created_at: b.created_at,
        updated_at: b.updated_at,
        assignee: b.assignee_name ? { id: b.assignee_id, name: b.assignee_name } : null,
        reporter: b.reporter_name ? { id: b.reporter_id, name: b.reporter_name } : null,
        requirement: b.requirement_title ? { id: b.requirement_no, title: b.requirement_title } : null,
        project: b.project_name ? { id: b.project_id, name: b.project_name, description: '', status: b.project_status, color: b.project_color } : null
      };
    });
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取Bug列表失败'
    });
  }
});
