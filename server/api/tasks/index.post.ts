import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { normalizeDate } from '~/server/utils/date';
import { attachAssigneesToTasks, normalizeAssigneeIds, replaceTaskAssignees } from '~/server/utils/taskAssignees';
import { insertRequirementHistory } from '~/server/utils/requirementHistory';

function generateTaskNo() {
  const date = new Date();
  const prefix = 'TASK';
  const timestamp = date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}-${random}`;
}

function mapTask(t: any) {
  return {
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
    requirement: t.requirement_title ? { id: t.requirement_id, title: t.requirement_title } : null,
    project: t.project_name ? { id: t.project_id, name: t.project_name } : null
  };
}

async function insertTask(currentUserId: number, item: any) {
  const title = (item.title || '').trim();
  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: '任务标题不能为空'
    });
  }

  const assigneeIds = normalizeAssigneeIds(item);

  const result = await query(
    `INSERT INTO tasks (task_no, title, description, status, priority, type,
                       project_id, requirement_id, iteration_id,
                       creator_id, assignee_id, estimated_hours, start_date, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      generateTaskNo(),
      title,
      item.description || null,
      item.status || 'todo',
      item.priority || 'medium',
      item.type || 'development',
      item.project_id || null,
      item.requirement_id || null,
      item.iteration_id || null,
      currentUserId,
      assigneeIds[0] || null,
      item.estimated_hours || null,
      item.start_date ? normalizeDate(item.start_date) : null,
      item.due_date ? normalizeDate(item.due_date) : null
    ]
  ) as any;

  const rows = await query(
    `SELECT t.*,
            p.name as project_name,
            req.title as requirement_title,
            creator.nickname as creator_name,
            assignee.nickname as assignee_name
     FROM tasks t
     LEFT JOIN projects p ON t.project_id = p.id
     LEFT JOIN requirements req ON t.requirement_id = req.id
     LEFT JOIN users creator ON t.creator_id = creator.id
     LEFT JOIN users assignee ON t.assignee_id = assignee.id
     WHERE t.id = ?`,
    [result.insertId]
  );

  await replaceTaskAssignees(result.insertId, assigneeIds);
  const [mapped] = await attachAssigneesToTasks([mapTask((rows as any[])[0])]);

  const requirementId = Number(item.requirement_id);
  if (Number.isFinite(requirementId) && requirementId > 0) {
    await insertRequirementHistory(requirementId, '新建任务', null, title, currentUserId);
  }

  return mapped;
}

async function authorizeTaskCreate(event: any, items: any[]) {
  try {
    return await authorize(event, 'task', 'create');
  } catch (error: any) {
    if (error.statusCode !== 403) throw error;
    const requirementIds = [...new Set(
      items.map((item: any) => item?.requirement_id).filter((id: any) => id != null && id !== '')
    )];
    if (requirementIds.length !== 1) throw error;
    return await authorize(event, 'requirement', 'update');
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const isBatch = Array.isArray(body?.tasks);
    const items = isBatch
      ? body.tasks.filter((item: any) => (item?.title || '').trim())
      : [body];

    if (!items.length || !(items[0]?.title || '').trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: isBatch ? '请至少填写一个任务标题' : '任务标题不能为空'
      });
    }

    const currentUser = await authorizeTaskCreate(event, items);

    if (isBatch) {
      const created = [];
      for (const item of items) {
        created.push(await insertTask(currentUser.id, item));
      }
      return { items: created };
    }

    return await insertTask(currentUser.id, items[0]);
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '创建任务失败'
    });
  }
});
