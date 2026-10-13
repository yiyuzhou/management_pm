import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { mergeStoredAttachments, splitStoredAttachments } from '~/server/utils/requirementAttachments';
import { notifyRequirementAssigned } from '~/server/utils/notifications';
import { insertRequirementHistory } from '~/server/utils/requirementHistory';

function generateReqNo() {
  const date = new Date();
  const prefix = 'REQ';
  const timestamp = date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：仅 admin/pm 可创建需求
    const currentUser = await authorize(event, 'requirement', 'create');

    const body = await readBody(event);
    const {
      title, description, priority, type, status,
      project_id, iteration_id, assignee_id,
      module, tags, attachments, links, expected_date
    } = body;

    // 将 expected_date 格式化为 YYYY-MM-DD，避免 ISO 字符串导致 MySQL 报错
    const formattedDate = expected_date
      ? new Date(expected_date).toISOString().slice(0, 10)
      : null;

    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: '需求标题不能为空'
      });
    }

    if (!project_id) {
      throw createError({
        statusCode: 400,
        statusMessage: '所属项目不能为空'
      });
    }

    const reqNo = generateReqNo();

    const result = await query(
      `INSERT INTO requirements (req_no, title, description, priority, type, status,
                                project_id, iteration_id, creator_id, assignee_id,
                                module, tags, attachments, expected_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reqNo, title, description, priority || 'p2', type || 'feature', status || 'draft',
       project_id || null, iteration_id || null, currentUser.id, assignee_id || null,
       module || null, JSON.stringify(tags || []), JSON.stringify(mergeStoredAttachments(attachments, links)), formattedDate]
    ) as any;

    await insertRequirementHistory(result.insertId, '创建', null, title, currentUser.id);

    const rows = await query(
      `SELECT r.*,
              p.name as project_name,
              i.name as iteration_name,
              creator.nickname as creator_name,
              assignee.nickname as assignee_name,
              assignee.avatar as assignee_avatar
       FROM requirements r
       LEFT JOIN projects p ON r.project_id = p.id
       LEFT JOIN iterations i ON r.iteration_id = i.id
       LEFT JOIN users creator ON r.creator_id = creator.id
       LEFT JOIN users assignee ON r.assignee_id = assignee.id
       WHERE r.id = ?`,
      [result.insertId]
    ) as any[];

    const r = rows[0];
    if (assignee_id) {
      await notifyRequirementAssigned({
        assigneeId: assignee_id,
        actorId: currentUser.id,
        title: r.title,
        reqNo: r.req_no
      })
    }
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
      project: r.project_name ? { id: r.project_id, name: r.project_name, description: '', status: 'active', color: '' } : null,
      iteration: r.iteration_name ? { id: r.iteration_id, name: r.iteration_name } : null,
      assignee: r.assignee_name ? { id: r.assignee_id, name: r.assignee_name, avatar: r.assignee_avatar } : null,
      creator: r.creator_name ? { id: r.creator_id, name: r.creator_name } : null
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '创建需求失败'
    });
  }
});
