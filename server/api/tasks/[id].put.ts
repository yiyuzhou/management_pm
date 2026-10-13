import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { assertTaskDateRange, normalizeDate } from '~/server/utils/date';
import { attachAssigneesToTasks, normalizeAssigneeIds, replaceTaskAssignees } from '~/server/utils/taskAssignees';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');

    // 查找任务（支持 task_no 或 id）
    const existing = await query(
      'SELECT id, start_date, due_date FROM tasks WHERE task_no = ? OR id = ?',
      [id, id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '任务不存在'
      });
    }

    const taskId = existing[0].id;

    // 鉴权：admin/pm 可更新所有任务，developer/tester 可更新自己的任务
    await authorize(event, 'task', 'update', taskId);

    const body = await readBody(event);
    const {
      title, description, status, priority, type,
      project_id, requirement_id, iteration_id,
      assignee_id, estimated_hours, actual_hours, start_date, due_date
    } = body;

    // 动态构建 UPDATE，只更新传入的字段
    const fields: string[] = [];
    const values: any[] = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (priority !== undefined) { fields.push('priority = ?'); values.push(priority); }
    if (type !== undefined) { fields.push('type = ?'); values.push(type); }
    if (project_id !== undefined) { fields.push('project_id = ?'); values.push(project_id || null); }
    if (requirement_id !== undefined) { fields.push('requirement_id = ?'); values.push(requirement_id || null); }
    if (iteration_id !== undefined) { fields.push('iteration_id = ?'); values.push(iteration_id || null); }
    assertTaskDateRange(
      start_date !== undefined ? start_date : existing[0].start_date,
      due_date !== undefined ? due_date : existing[0].due_date
    )

    const hasAssignees = body.assignee_ids !== undefined || assignee_id !== undefined
    const assigneeIds = hasAssignees ? normalizeAssigneeIds(body) : null
    if (assigneeIds) { fields.push('assignee_id = ?'); values.push(assigneeIds[0] || null); }
    if (estimated_hours !== undefined) { fields.push('estimated_hours = ?'); values.push(estimated_hours || null); }
    if (actual_hours !== undefined) { fields.push('actual_hours = ?'); values.push(actual_hours || null); }
    if (start_date !== undefined) { fields.push('start_date = ?'); values.push(normalizeDate(start_date)); }
    if (due_date !== undefined) { fields.push('due_date = ?'); values.push(normalizeDate(due_date)); }

    if (fields.length === 0 && !assigneeIds) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有需要更新的字段'
      });
    }

    if (fields.length) {
      values.push(taskId);
      await query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    if (assigneeIds) await replaceTaskAssignees(taskId, assigneeIds);

    const rows = await query(
      `SELECT t.*,
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
       WHERE t.id = ?`,
      [taskId]
    ) as any[];

    const t = rows[0];
    const [mapped] = await attachAssigneesToTasks([{
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
    }]);
    return mapped;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新任务失败'
    });
  }
});
