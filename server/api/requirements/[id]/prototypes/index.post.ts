import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { insertRequirementHistory } from '~/server/utils/requirementHistory';

function parseJson(value: any, fallback: any) {
  if (value == null || value === 'null') return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authorize(event, 'requirement', 'update');
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const prototypeId = Number(body?.prototype_id);

    if (!Number.isFinite(prototypeId) || prototypeId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '请选择要关联的原型'
      });
    }

    const requirements = await query(
      'SELECT id FROM requirements WHERE req_no = ? OR id = ?',
      [id, id]
    ) as any[];

    if (requirements.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '需求不存在'
      });
    }

    const reqId = requirements[0].id;
    const prototypes = await query(
      'SELECT id, name, thumbnail, pages, requirement_id FROM prototypes WHERE id = ?',
      [prototypeId]
    ) as any[];

    if (prototypes.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '原型不存在'
      });
    }

    await query(
      'UPDATE prototypes SET requirement_id = ? WHERE id = ?',
      [reqId, prototypeId]
    );

    const pt = prototypes[0];
    await insertRequirementHistory(reqId, '关联原型', null, pt.name || '', currentUser.id);
    const pages = parseJson(pt.pages, []);

    return {
      id: pt.id,
      name: pt.name,
      thumbnail: pt.thumbnail,
      pages: Array.isArray(pages) ? pages : [],
      requirement_id: reqId
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '关联原型失败'
    });
  }
});
