import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'prototype', 'read');
    const id = getRouterParam(event, 'id');

    const prototypes = await query(
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
              iter.status as iteration_status,
              iter.start_date as iteration_start_date,
              iter.end_date as iteration_end_date
       FROM prototypes p
       LEFT JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN users u ON p.creator_id = u.id
       LEFT JOIN requirements req ON p.requirement_id = req.id
       LEFT JOIN iterations iter ON p.iteration_id = iter.id
       WHERE p.id = ?`,
      [id]
    ) as any[];

    if (prototypes.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '原型不存在'
      });
    }

    const p = prototypes[0];

    let pages: any[] = [];
    try { pages = p.pages ? (typeof p.pages === 'string' ? JSON.parse(p.pages) : p.pages) : []; } catch { pages = []; }

    let tags: string[] = [];
    try { tags = p.tags ? (typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags) : []; } catch { tags = []; }

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      thumbnail: p.thumbnail,
      pages,
      pageCount: pages.length,
      module: p.module || null,
      version: p.version || 'v1.0',
      tags,
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
        status: p.iteration_status,
        start_date: p.iteration_start_date,
        end_date: p.iteration_end_date
      } : null,
      creator: p.creator_name ? {
        id: p.creator_id,
        name: p.creator_name,
        avatar: p.creator_avatar
      } : null,
      created_at: p.created_at,
      updated_at: p.updated_at
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取原型详情失败'
    });
  }
});
