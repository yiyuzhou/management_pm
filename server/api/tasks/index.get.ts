import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { attachAssigneesToTasks } from '~/server/utils/taskAssignees';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'task', 'read');
    const queryParams = getQuery(event);
    const { projectId, requirementId, requirement_id, iterationId, assigneeId, status } = queryParams;
    // requirement_id is retained as a compatibility alias for existing clients.
    const effectiveRequirementId = requirementId || requirement_id;

    let sql = `
      SELECT t.*,
             p.name as project_name,
             req.title as requirement_title,
             req.req_no as requirement_no,
             i.name as iteration_name,
             creator.nickname as creator_name,
             assignee.nickname as assignee_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN requirements req ON t.requirement_id = req.id
      LEFT JOIN iterations i ON t.iteration_id = i.id
      LEFT JOIN users creator ON t.creator_id = creator.id
      LEFT JOIN users assignee ON t.assignee_id = assignee.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (projectId) {
      sql += ' AND t.project_id = ?';
      params.push(projectId);
    }

    if (effectiveRequirementId) {
      sql += ' AND t.requirement_id = ?';
      params.push(effectiveRequirementId);
    }

    if (iterationId) {
      sql += ' AND t.iteration_id = ?';
      params.push(iterationId);
    }

    if (assigneeId) {
      sql += ' AND (t.assignee_id = ? OR t.id IN (SELECT task_id FROM task_assignees WHERE user_id = ?))';
      params.push(assigneeId, assigneeId);
    }

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.created_at DESC';

    const tasks = await query(sql, params) as any[];

    return await attachAssigneesToTasks(tasks.map(t => ({
      id: t.task_no,
      task_id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      type: t.type,
      estimated_hours: t.estimated_hours,
      actual_hours: t.actual_hours,
      start_date: t.start_date,
      due_date: t.due_date,
      created_at: t.created_at,
      updated_at: t.updated_at,
      assignee: t.assignee_name ? { id: t.assignee_id, name: t.assignee_name } : null,
      creator: t.creator_name ? { id: t.creator_id, name: t.creator_name } : null,
      requirement: t.requirement_title ? { id: t.requirement_no, title: t.requirement_title } : null,
      project: t.project_name ? { id: t.project_id, name: t.project_name } : null
    })));
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取任务列表失败'
    });
  }
});
