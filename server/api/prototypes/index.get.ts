import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'prototype', 'read');
    const queryParams = getQuery(event);
    const { projectId, status } = queryParams;

    let sql = `
      SELECT p.*,
             proj.name as project_name,
             u.nickname as creator_name,
             u.avatar as creator_avatar,
             req.title as requirement_title,
             iter.name as iteration_name
      FROM prototypes p
      LEFT JOIN projects proj ON p.project_id = proj.id
      LEFT JOIN users u ON p.creator_id = u.id
      LEFT JOIN requirements req ON p.requirement_id = req.id
      LEFT JOIN iterations iter ON p.iteration_id = iter.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (projectId) {
      sql += ' AND p.project_id = ?';
      params.push(projectId);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY p.updated_at DESC';

    const prototypes = await query(sql, params) as any[];

    return prototypes.map(p => {
      let pages: any[] = Array.isArray(p.pages) ? p.pages : [];
      if (!pages.length && typeof p.pages === 'string') {
        try { pages = JSON.parse(p.pages) || []; } catch { pages = []; }
      }
      let tags: string[] = Array.isArray(p.tags) ? p.tags : [];
      if (!tags.length && typeof p.tags === 'string') {
        try { tags = JSON.parse(p.tags) || []; } catch { tags = []; }
      }
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        thumbnail: p.thumbnail,
        pageCount: pages.length,
        pages,
        module: p.module || null,
        version: p.version || 'v1.0',
        tags,
        project_name: p.project_name,
        author: p.creator_name || '未知',
        creator_avatar: p.creator_avatar,
        requirement_id: p.requirement_id || null,
        requirement_title: p.requirement_title,
        iteration_name: p.iteration_name,
        created_at: p.created_at,
        updated_at: p.updated_at
      };
    });
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取原型列表失败'
    });
  }
});
