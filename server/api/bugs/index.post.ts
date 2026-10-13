import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { notifyBugAssigned } from '~/server/utils/notifications';

function generateBugNo() {
  const date = new Date();
  const prefix = 'BUG';
  const timestamp = date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：admin/pm/developer/tester 可提交 Bug
    const currentUser = await authorize(event, 'bug', 'create');

    const body = await readBody(event);
    const {
      title, description, steps, expected_result, actual_result,
      severity, priority, project_id, requirement_id, task_id,
      assignee_id, screenshots, iteration_id, module, tags
    } = body;

    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bug标题不能为空'
      });
    }

    const bugNo = generateBugNo();

    const result = await query(
      `INSERT INTO bugs (bug_no, title, description, steps, expected_result, actual_result,
                        severity, priority, status, project_id, requirement_id, task_id,
                        reporter_id, assignee_id, iteration_id, module, tags, screenshots)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bugNo, title, description || null, steps || null, expected_result || null, actual_result || null,
       severity || 'minor', priority || 'p2', 'new', project_id || null, requirement_id || null, task_id || null,
       currentUser.id, assignee_id || null, iteration_id || null, module || null, JSON.stringify(tags || []), JSON.stringify(screenshots || [])]
    ) as any;

    const rows = await query(
      `SELECT b.*,
              p.name as project_name,
              req.title as requirement_title,
              req.req_no as requirement_no,
              reporter.nickname as reporter_name,
              assignee.nickname as assignee_name
       FROM bugs b
       LEFT JOIN projects p ON b.project_id = p.id
       LEFT JOIN requirements req ON b.requirement_id = req.id
       LEFT JOIN users reporter ON b.reporter_id = reporter.id
       LEFT JOIN users assignee ON b.assignee_id = assignee.id
       WHERE b.id = ?`,
      [result.insertId]
    ) as any[];

    const b = rows[0];
    if (assignee_id) {
      await notifyBugAssigned({
        assigneeId: assignee_id,
        actorId: currentUser.id,
        title: b.title,
        bugNo: b.bug_no
      })
    }
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
      created_at: b.created_at,
      updated_at: b.updated_at,
      assignee: b.assignee_name ? { id: b.assignee_id, name: b.assignee_name } : null,
      reporter: b.reporter_name ? { id: b.reporter_id, name: b.reporter_name } : null,
      requirement: b.requirement_title ? { id: b.requirement_no, title: b.requirement_title } : null
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '创建Bug失败'
    });
  }
});
