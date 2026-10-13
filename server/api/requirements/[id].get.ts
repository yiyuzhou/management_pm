import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { splitStoredAttachments } from '~/server/utils/requirementAttachments';
import { attachAssigneesToTasks } from '~/server/utils/taskAssignees';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'requirement', 'read');
    const id = getRouterParam(event, 'id');

    const requirements = await query(
      `SELECT r.*,
              p.name as project_name,
              p.status as project_status,
              p.color as project_color,
              i.name as iteration_name,
              i.status as iteration_status,
              i.start_date as iteration_start_date,
              i.end_date as iteration_end_date,
              creator.nickname as creator_name,
              assignee.nickname as assignee_name,
              assignee.avatar as assignee_avatar
       FROM requirements r
       LEFT JOIN projects p ON r.project_id = p.id
       LEFT JOIN iterations i ON r.iteration_id = i.id
       LEFT JOIN users creator ON r.creator_id = creator.id
       LEFT JOIN users assignee ON r.assignee_id = assignee.id
       WHERE r.req_no = ? OR r.id = ?`,
      [id, id]
    ) as any[];

    if (requirements.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '需求不存在'
      });
    }

    const r = requirements[0];

    // 获取关联任务
    const tasks = await query(
      `SELECT t.*,
              assignee.nickname as assignee_name,
              creator.nickname as creator_name
       FROM tasks t
       LEFT JOIN users assignee ON t.assignee_id = assignee.id
       LEFT JOIN users creator ON t.creator_id = creator.id
       WHERE t.requirement_id = ?`,
      [r.id]
    ) as any[];

    // 获取关联Bug
    const bugs = await query(
      `SELECT b.*,
              reporter.nickname as reporter_name,
              assignee.nickname as assignee_name
       FROM bugs b
       LEFT JOIN users reporter ON b.reporter_id = reporter.id
       LEFT JOIN users assignee ON b.assignee_id = assignee.id
       WHERE b.requirement_id = ?`,
      [r.id]
    ) as any[];

    // 获取关联原型
    const prototypes = await query(
      `SELECT pt.*,
              creator.nickname as creator_name
       FROM prototypes pt
       LEFT JOIN users creator ON pt.creator_id = creator.id
       WHERE pt.requirement_id = ?`,
      [r.id]
    ) as any[];

    const formatted = {
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
      ...splitStoredAttachments(r.attachments),
      task_count: tasks.length,
      has_prototype: prototypes.length > 0,
      created_at: r.created_at,
      updated_at: r.updated_at,
      project: r.project_name ? { id: r.project_id, name: r.project_name, description: '', status: r.project_status, color: r.project_color } : null,
      iteration: r.iteration_name ? { id: r.iteration_id, name: r.iteration_name, status: r.iteration_status, start_date: r.iteration_start_date, end_date: r.iteration_end_date } : null,
      assignee: r.assignee_name ? {
        id: r.assignee_id,
        name: r.assignee_name,
        avatar: r.assignee_avatar
      } : null,
      creator: r.creator_name ? { id: r.creator_id, name: r.creator_name } : null,
      tasks: await attachAssigneesToTasks(tasks.map(t => ({
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
        creator: t.creator_name ? { id: t.creator_id, name: t.creator_name } : null
      }))),
      bugs: bugs.map(b => ({
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
        reporter: b.reporter_name ? { id: b.reporter_id, name: b.reporter_name } : null
      })),
      prototypes: prototypes.map(pt => ({
        id: pt.id,
        name: pt.name,
        description: pt.description,
        status: pt.status,
        thumbnail: pt.thumbnail,
        pages: pt.pages ? (typeof pt.pages === 'string' ? JSON.parse(pt.pages) : pt.pages) : [],
        created_at: pt.created_at,
        creator: pt.creator_name ? { id: pt.creator_id, name: pt.creator_name } : null
      }))
    };

    return formatted;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取需求详情失败'
    });
  }
});
