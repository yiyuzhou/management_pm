import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { mergeStoredAttachments, splitStoredAttachments } from '~/server/utils/requirementAttachments';
import { completeAssociatedTasks } from '~/server/utils/requirementStatus';
import { notifyRequirementAssigned } from '~/server/utils/notifications';
import { collectRequirementChanges, insertRequirementHistoryEntries } from '~/server/utils/requirementHistory';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin/pm 可更新需求
    const currentUser = await authorize(event, 'requirement', 'update');

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    // 查找需求
    const existing = await query(
      'SELECT id FROM requirements WHERE req_no = ? OR id = ?',
      [id, id]
    ) as any[];

    if (existing.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '需求不存在'
      });
    }

    const reqId = existing[0].id;

    // 获取更新前的数据（用于记录历史）
    const oldData = await query(
      `SELECT req_no, title, description, priority, status, type, project_id, iteration_id,
              assignee_id, module, tags, attachments, expected_date
       FROM requirements WHERE id = ?`,
      [reqId]
    ) as any[];
    const old = oldData[0] || {};

    const {
      title, description, priority, status, type,
      project_id, iteration_id, assignee_id,
      module, tags, attachments, links, expected_date
    } = body;

    // Omitted fields must retain their persisted value. This makes partial API
    // updates safe and prevents ordinary edits from resetting the requirement status.
    const valueOrExisting = (value: any, existing: any) => value === undefined ? existing : value;
    const formattedDate = expected_date === undefined
      ? old.expected_date
      : (expected_date ? new Date(expected_date).toISOString().slice(0, 10) : null);
    const persistedTags = tags === undefined
      ? old.tags
      : JSON.stringify(tags || []);
    const currentStored = splitStoredAttachments(old.attachments)
    const persistedAttachments = (attachments === undefined && links === undefined)
      ? old.attachments
      : JSON.stringify(mergeStoredAttachments(
          attachments === undefined ? currentStored.attachments : attachments,
          links === undefined ? currentStored.links : links
        ));

    await query(
      `UPDATE requirements
       SET title = ?, description = ?, priority = ?, status = ?, type = ?,
           project_id = ?, iteration_id = ?, assignee_id = ?,
           module = ?, tags = ?, attachments = ?, expected_date = ?
       WHERE id = ?`,
      [valueOrExisting(title, old.title), valueOrExisting(description, old.description),
       valueOrExisting(priority, old.priority), valueOrExisting(status, old.status),
       valueOrExisting(type, old.type), valueOrExisting(project_id, old.project_id),
       valueOrExisting(iteration_id, old.iteration_id), valueOrExisting(assignee_id, old.assignee_id),
       valueOrExisting(module, old.module), persistedTags, persistedAttachments, formattedDate, reqId]
    );

    const nextStatus = valueOrExisting(status, old.status)
    if (nextStatus === 'completed' && old.status !== 'completed') {
      await completeAssociatedTasks([reqId])
    }

    const historyEntries = await collectRequirementChanges(old, body);
    await insertRequirementHistoryEntries(reqId, historyEntries, currentUser.id);

    if (assignee_id !== undefined && String(old.assignee_id || '') !== String(assignee_id || '') && assignee_id) {
      await notifyRequirementAssigned({
        assigneeId: assignee_id,
        actorId: currentUser.id,
        title: title || old.title,
        reqNo: old.req_no
      })
    }

    const rows = await query(
      `SELECT r.*,
              p.name as project_name,
              p.status as project_status,
              p.color as project_color,
              i.name as iteration_name,
              i.status as iteration_status,
              creator.nickname as creator_name,
              assignee.nickname as assignee_name,
              assignee.avatar as assignee_avatar
       FROM requirements r
       LEFT JOIN projects p ON r.project_id = p.id
       LEFT JOIN iterations i ON r.iteration_id = i.id
       LEFT JOIN users creator ON r.creator_id = creator.id
       LEFT JOIN users assignee ON r.assignee_id = assignee.id
       WHERE r.id = ?`,
      [reqId]
    ) as any[];

    const r = rows[0];
    return {
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
      task_count: 0,
      has_prototype: false,
      created_at: r.created_at,
      updated_at: r.updated_at,
      project: r.project_name ? { id: r.project_id, name: r.project_name, description: '', status: r.project_status, color: r.project_color } : null,
      iteration: r.iteration_name ? { id: r.iteration_id, name: r.iteration_name, status: r.iteration_status } : null,
      assignee: r.assignee_name ? { id: r.assignee_id, name: r.assignee_name, avatar: r.assignee_avatar } : null,
      creator: r.creator_name ? { id: r.creator_id, name: r.creator_name } : null
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新需求失败'
    });
  }
});
