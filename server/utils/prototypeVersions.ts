import { query } from '~/server/utils/mysql'

const SNAPSHOT_FIELDS = [
  'name', 'description', 'pages', 'thumbnail', 'status', 'requirement_id',
  'module', 'version', 'iteration_id', 'tags'
] as const

function parseJson(value: unknown, fallback: unknown) {
  if (value === null || value === undefined) return fallback
  if (typeof value !== 'string') return value
  try { return JSON.parse(value) } catch { return fallback }
}

/** Extracts the mutable prototype data so a history row can restore it exactly. */
export function prototypeSnapshot(prototype: Record<string, any>) {
  return Object.fromEntries(SNAPSHOT_FIELDS.map((field) => {
    if (field === 'pages') return [field, parseJson(prototype[field], [])]
    if (field === 'tags') return [field, parseJson(prototype[field], null)]
    return [field, prototype[field] ?? null]
  }))
}

/** Writes an immutable revision after a prototype is created, saved, or restored. */
export async function createPrototypeVersion(
  prototype: Record<string, any>,
  authorId: number,
  changeSummary: string
) {
  const rows = await query(
    'SELECT COALESCE(MAX(revision), 0) AS max_revision FROM prototype_versions WHERE prototype_id = ?',
    [prototype.id]
  ) as any[]
  const revision = Number(rows[0]?.max_revision || 0) + 1

  await query(
    `INSERT INTO prototype_versions
      (prototype_id, revision, version_label, snapshot, change_summary, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      prototype.id,
      revision,
      prototype.version || 'v1.0',
      JSON.stringify(prototypeSnapshot(prototype)),
      changeSummary,
      authorId,
    ]
  )
  return revision
}

export function parsePrototypeSnapshot(snapshot: unknown) {
  const parsed = parseJson(snapshot, {})
  return parsed && typeof parsed === 'object' ? parsed as Record<string, any> : {}
}
