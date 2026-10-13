import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { insertRequirementHistory } from '~/server/utils/requirementHistory';

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authorize(event, 'requirement', 'update');
    const id = getRouterParam(event, 'id');
    const prototypeId = getRouterParam(event, 'prototypeId');

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
      'SELECT id, name FROM prototypes WHERE id = ? AND requirement_id = ?',
      [prototypeId, reqId]
    ) as any[];

    if (prototypes.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '未找到该需求下的关联原型'
      });
    }

    await query(
      'UPDATE prototypes SET requirement_id = NULL WHERE id = ? AND requirement_id = ?',
      [prototypeId, reqId]
    );

    await insertRequirementHistory(reqId, '取消关联原型', prototypes[0].name || '', null, currentUser.id);

    return { ok: true, prototype_id: Number(prototypeId) };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '取消关联失败'
    });
  }
});
