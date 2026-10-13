import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { createPrototypeVersion } from '~/server/utils/prototypeVersions';
import { insertRequirementHistory } from '~/server/utils/requirementHistory';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：admin、产品经理、项目经理可创建原型
    const currentUser = await authorize(event, 'prototype', 'create');

    const body = await readBody(event);
    const {
      project_id, name, description, pages, thumbnail,
      requirement_id, module, version, iteration_id, tags, status
    } = body;

    if (!name || !project_id) {
      throw createError({
        statusCode: 400,
        statusMessage: '原型名称和项目ID不能为空'
      });
    }

    if (!iteration_id) {
      throw createError({
        statusCode: 400,
        statusMessage: '所属迭代不能为空'
      });
    }

    const result = await query(
      `INSERT INTO prototypes (project_id, name, description, pages, thumbnail, creator_id, requirement_id, module, version, iteration_id, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        name,
        description || null,
        JSON.stringify(pages || []),
        thumbnail || null,
        currentUser.id,
        requirement_id || null,
        module || null,
        version || 'v1.0',
        iteration_id || null,
        tags ? JSON.stringify(tags) : null,
        status || 'draft'
      ]
    ) as any;

    const newPrototype = await query(
      `SELECT p.*, proj.name as project_name, u.nickname as creator_name
       FROM prototypes p
       LEFT JOIN projects proj ON p.project_id = proj.id
       LEFT JOIN users u ON p.creator_id = u.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    let parsedPages: any[] = [];
    try {
      parsedPages = newPrototype[0].pages ? JSON.parse(newPrototype[0].pages) : [];
    } catch {
      parsedPages = [];
    }

    let parsedTags: string[] = [];
    try {
      parsedTags = newPrototype[0].tags ? JSON.parse(newPrototype[0].tags) : [];
    } catch {
      parsedTags = [];
    }

    const formatted = {
      ...newPrototype[0],
      pages: parsedPages,
      tags: parsedTags
    };

    await createPrototypeVersion(formatted, currentUser.id, '创建原型');

    const linkedRequirementId = Number(requirement_id);
    if (Number.isFinite(linkedRequirementId) && linkedRequirementId > 0) {
      await insertRequirementHistory(linkedRequirementId, '关联原型', null, name, currentUser.id);
    }

    return formatted;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '创建原型失败'
    });
  }
});
