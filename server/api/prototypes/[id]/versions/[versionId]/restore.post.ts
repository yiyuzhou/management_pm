import { query } from '~/server/utils/mysql'
import { authorize } from '~/server/utils/permissions'
import { createPrototypeVersion, parsePrototypeSnapshot } from '~/server/utils/prototypeVersions'

export default defineEventHandler(async (event) => {
  const currentUser = await authorize(event, 'prototype', 'update')
  const prototypeId = getRouterParam(event, 'id')
  const versionId = getRouterParam(event, 'versionId')

  const versions = await query(
    `SELECT id, prototype_id, revision, version_label, snapshot
       FROM prototype_versions
      WHERE id = ? AND prototype_id = ?`,
    [versionId, prototypeId]
  ) as any[]
  if (versions.length === 0) {
    throw createError({ statusCode: 404, statusMessage: '原型历史版本不存在' })
  }

  const source = versions[0]
  const snapshot = parsePrototypeSnapshot(source.snapshot)
  const prototype = {
    id: Number(prototypeId),
    name: snapshot.name ?? null,
    description: snapshot.description ?? null,
    pages: snapshot.pages ?? [],
    thumbnail: snapshot.thumbnail ?? null,
    status: snapshot.status ?? 'draft',
    requirement_id: snapshot.requirement_id ?? null,
    module: snapshot.module ?? null,
    version: snapshot.version || source.version_label || 'v1.0',
    iteration_id: snapshot.iteration_id ?? null,
    tags: snapshot.tags ?? null,
  }

  await query(
    `UPDATE prototypes SET
       name = ?, description = ?, pages = ?, thumbnail = ?, status = ?,
       requirement_id = ?, module = ?, version = ?, iteration_id = ?, tags = ?
     WHERE id = ?`,
    [
      prototype.name,
      prototype.description,
      JSON.stringify(prototype.pages),
      prototype.thumbnail,
      prototype.status,
      prototype.requirement_id,
      prototype.module,
      prototype.version,
      prototype.iteration_id,
      prototype.tags === null ? null : JSON.stringify(prototype.tags),
      prototypeId,
    ]
  )

  const revision = await createPrototypeVersion(
    prototype,
    currentUser.id,
    `恢复自 ${source.version_label}（修订 #${source.revision}）`
  )

  return { prototypeId, restoredFromVersionId: versionId, revision }
})
