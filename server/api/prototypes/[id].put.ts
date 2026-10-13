import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { createPrototypeVersion } from '~/server/utils/prototypeVersions';

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authorize(event, 'prototype', 'update');
    const id = getRouterParam(event, 'id');

    // 检查原型是否存在
    const existing = await query('SELECT * FROM prototypes WHERE id = ?', [id]) as any[];
    if (existing.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '原型不存在' });
    }

    const body = await readBody(event);
    const {
      name, description, pages, thumbnail, status,
      requirement_id, module, version, iteration_id, tags
    } = body;

    // 构建动态更新
    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (pages !== undefined) { updates.push('pages = ?'); params.push(JSON.stringify(pages)); }
    if (thumbnail !== undefined) { updates.push('thumbnail = ?'); params.push(thumbnail); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (requirement_id !== undefined) { updates.push('requirement_id = ?'); params.push(requirement_id || null); }
    if (module !== undefined) { updates.push('module = ?'); params.push(module || null); }
    if (version !== undefined) { updates.push('version = ?'); params.push(version); }
    if (iteration_id !== undefined) { updates.push('iteration_id = ?'); params.push(iteration_id || null); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(tags ? JSON.stringify(tags) : null); }

    const changed = updates.length > 0;
    if (changed) {
      params.push(id);
      await query(`UPDATE prototypes SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // 返回更新后的数据
    const rows = await query(
      `SELECT p.*,
              proj.name as project_name,
              proj.status as project_status,
              proj.color as project_color,
              u.nickname as creator_name,
              u.avatar as creator_avatar,
              req.title as requirement_title,
              req.req_no as requirement_no,
              req.id as requirement_id,
              iter.name as iteration_name,
              iter.status as iteration_status
       FROM prototypes p
       LEFT JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN requirements req ON p.requirement_id = req.id
       LEFT JOIN iterations iter ON p.iteration_id = iter.id
       WHERE p.id = ?`,
      [id]
    ) as any[];

    const p = rows[0];
    let parsedPages: any[] = [];
    try { parsedPages = p.pages ? (typeof p.pages === 'string' ? JSON.parse(p.pages) : p.pages) : []; } catch { parsedPages = []; }

    let parsedTags: string[] = [];
    try { parsedTags = p.tags ? (typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags) : []; } catch { parsedTags = []; }

    const formatted = {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      thumbnail: p.thumbnail,
      pages: parsedPages,
      pageCount: parsedPages.length,
      module: p.module || null,
      version: p.version || 'v1.0',
      tags: parsedTags,
      project: p.project_name ? {
        id: p.project_id,
        name: p.project_name,
        status: p.project_status,
        color: p.project_color
      } : null,
      requirement: p.requirement_title ? {
        id: p.requirement_id,
        title: p.requirement_title,
        req_no: p.requirement_no
      } : null,
      iteration: p.iteration_name ? {
        id: p.iteration_id,
        name: p.iteration_name,
        status: p.iteration_status
      } : null,
      creator: p.creator_name ? {
        id: p.creator_id,
        name: p.creator_name,
        avatar: p.creator_avatar
      } : null,
      created_at: p.created_at,
      updated_at: p.updated_at
    };

    if (changed) {
      await createPrototypeVersion(p, currentUser.id, '保存原型修改');
    }

    return formatted;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新原型失败'
    });
  }
});
