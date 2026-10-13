import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { notifyBugAssigned } from '~/server/utils/notifications';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');

    // 查找 Bug（支持 bug_no 或 id）
    const existing = await query(
      'SELECT id, bug_no, title, assignee_id FROM bugs WHERE bug_no = ? OR id = ?',
      [id, id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bug不存在'
      });
    }

    const bugId = existing[0].id;

    // 鉴权：admin/pm/tester 可更新所有 Bug，developer 可更新自己的 Bug
    const currentUser = await authorize(event, 'bug', 'update', bugId);

    const {
      title, description, steps, expected_result, actual_result,
      severity, priority, status,
      project_id, requirement_id, task_id, assignee_id, screenshots,
      iteration_id, module, tags
    } = await readBody(event);

    // 动态构建 UPDATE
    const fields: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (steps !== undefined) { fields.push('steps = ?'); values.push(steps); }
    if (expected_result !== undefined) { fields.push('expected_result = ?'); values.push(expected_result); }
    if (actual_result !== undefined) { fields.push('actual_result = ?'); values.push(actual_result); }
    if (severity !== undefined) { fields.push('severity = ?'); values.push(severity); }
    if (priority !== undefined) { fields.push('priority = ?'); values.push(priority); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (project_id !== undefined) { fields.push('project_id = ?'); values.push(project_id || null); }
    if (requirement_id !== undefined) { fields.push('requirement_id = ?'); values.push(requirement_id || null); }
    if (task_id !== undefined) { fields.push('task_id = ?'); values.push(task_id || null); }
    if (assignee_id !== undefined) { fields.push('assignee_id = ?'); values.push(assignee_id || null); }
    if (iteration_id !== undefined) { fields.push('iteration_id = ?'); values.push(iteration_id || null); }
    if (module !== undefined) { fields.push('module = ?'); values.push(module || null); }
    if (tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(tags || [])); }
    if (screenshots !== undefined) { fields.push('screenshots = ?'); values.push(JSON.stringify(screenshots || [])); }

    if (fields.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有需要更新的字段'
      });
    }

    values.push(bugId);
    await query(`UPDATE bugs SET ${fields.join(', ')} WHERE id = ?`, values);

    if (assignee_id !== undefined && String(existing[0].assignee_id || '') !== String(assignee_id || '') && assignee_id) {
      await notifyBugAssigned({
        assigneeId: assignee_id,
        actorId: currentUser.id,
        title: title || existing[0].title,
        bugNo: existing[0].bug_no
      })
    }

    const rows = await query(
      `SELECT b.*,
              p.name as project_name,
              p.status as project_status,
              p.color as project_color,
              req.title as requirement_title,
              req.req_no as requirement_no,
              reporter.nickname as reporter_name,
              assignee.nickname as assignee_name,
              iter.name as iteration_name,
              iter.id as iteration_id
       FROM bugs b
       LEFT JOIN projects p ON b.project_id = p.id
       LEFT JOIN requirements req ON b.requirement_id = req.id
       LEFT JOIN users reporter ON b.reporter_id = reporter.id
       LEFT JOIN users assignee ON b.assignee_id = assignee.id
       LEFT JOIN iterations iter ON b.iteration_id = iter.id
       WHERE b.id = ?`,
      [bugId]
    ) as any[];

    const b = rows[0];
    let tagsResult: string[] = [];
    try {
      tagsResult = b.tags ? (typeof b.tags === 'string' ? JSON.parse(b.tags) : b.tags) : [];
    } catch { tagsResult = []; }
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
      screenshots: b.screenshots ? (typeof b.screenshots === 'string' ? JSON.parse(b.screenshots) : b.screenshots) : [],
      tags: tagsResult,
      module: b.module || null,
      iteration: b.iteration_id ? { id: b.iteration_id, name: b.iteration_name } : null,
      created_at: b.created_at,
      updated_at: b.updated_at,
      assignee: b.assignee_name ? { id: b.assignee_id, name: b.assignee_name } : null,
      reporter: b.reporter_name ? { id: b.reporter_id, name: b.reporter_name } : null,
      requirement: b.requirement_title ? { id: b.requirement_no, title: b.requirement_title } : null,
      project: b.project_name ? { id: b.project_id, name: b.project_name, description: '', status: b.project_status, color: b.project_color } : null
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新Bug失败'
    });
  }
});
