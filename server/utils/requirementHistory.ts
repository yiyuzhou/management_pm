import { query } from '~/server/utils/mysql'
import { normalizeDate } from '~/server/utils/date'

export const REQUIREMENT_HISTORY_STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  pending: '评审中',
  approved: '已确定',
  rejected: '已拒绝',
  in_progress: '进行中',
  completed: '已完成',
  closed: '已关闭'
}

export const REQUIREMENT_HISTORY_PRIORITY_LABELS: Record<string, string> = {
  p0: 'P0',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3'
}

const TYPE_LABELS: Record<string, string> = {
  feature: '功能',
  bug: '缺陷',
  improvement: '优化',
  task: '任务'
}

export interface RequirementHistoryEntry {
  field: string
  oldVal: string | null
  newVal: string | null
}

export function stripHtml(html?: string | null) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateText(text: string, max = 80) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function sameId(a: unknown, b: unknown) {
  return String(a ?? '') === String(b ?? '')
}

async function lookupName(kind: 'user' | 'iteration' | 'project', id: unknown) {
  if (kind === 'user') {
    if (!id) return '未指派'
    const rows = await query('SELECT nickname as name FROM users WHERE id = ?', [id]) as { name?: string }[]
    return rows[0]?.name || '未指派'
  }
  if (!id) return '未分配'
  const table = kind === 'iteration' ? 'iterations' : 'projects'
  const rows = await query(`SELECT name FROM ${table} WHERE id = ?`, [id]) as { name?: string }[]
  return rows[0]?.name || '未分配'
}

function displayDate(value: unknown) {
  return normalizeDate(value) || '未设置'
}

export async function insertRequirementHistory(
  requirementId: number,
  field: string,
  oldValue: string | null,
  newValue: string | null,
  changedBy: number | null
) {
  await query(
    `INSERT INTO requirement_history (requirement_id, field, old_value, new_value, changed_by)
     VALUES (?, ?, ?, ?, ?)`,
    [requirementId, field, oldValue, newValue, changedBy]
  )
}

export async function insertRequirementHistoryEntries(
  requirementId: number,
  entries: RequirementHistoryEntry[],
  changedBy: number | null
) {
  for (const entry of entries) {
    await insertRequirementHistory(requirementId, entry.field, entry.oldVal, entry.newVal, changedBy)
  }
}

export async function collectRequirementChanges(oldRow: any, body: any): Promise<RequirementHistoryEntry[]> {
  const {
    title, description, priority, status, type,
    project_id, iteration_id, assignee_id,
    module, expected_date
  } = body || {}
  const entries: RequirementHistoryEntry[] = []

  if (title !== undefined && title !== oldRow.title) {
    entries.push({ field: '标题', oldVal: oldRow.title || '', newVal: title || '' })
  }

  if (description !== undefined) {
    const oldText = stripHtml(oldRow.description)
    const newText = stripHtml(description)
    if (oldText !== newText) {
      entries.push({
        field: '描述',
        oldVal: truncateText(oldText) || '空',
        newVal: truncateText(newText) || '空'
      })
    }
  }

  if (status !== undefined && oldRow.status !== status) {
    entries.push({
      field: '状态',
      oldVal: REQUIREMENT_HISTORY_STATUS_LABELS[oldRow.status] || oldRow.status,
      newVal: REQUIREMENT_HISTORY_STATUS_LABELS[status] || status
    })
  }

  if (priority !== undefined && oldRow.priority !== priority) {
    entries.push({
      field: '优先级',
      oldVal: REQUIREMENT_HISTORY_PRIORITY_LABELS[oldRow.priority] || oldRow.priority,
      newVal: REQUIREMENT_HISTORY_PRIORITY_LABELS[priority] || priority
    })
  }

  if (type !== undefined && oldRow.type !== type) {
    entries.push({
      field: '类型',
      oldVal: TYPE_LABELS[oldRow.type] || oldRow.type || '',
      newVal: TYPE_LABELS[type] || type || ''
    })
  }

  if (assignee_id !== undefined && !sameId(oldRow.assignee_id, assignee_id)) {
    entries.push({
      field: '负责人',
      oldVal: await lookupName('user', oldRow.assignee_id),
      newVal: await lookupName('user', assignee_id)
    })
  }

  if (iteration_id !== undefined && !sameId(oldRow.iteration_id, iteration_id)) {
    entries.push({
      field: '迭代',
      oldVal: await lookupName('iteration', oldRow.iteration_id),
      newVal: await lookupName('iteration', iteration_id)
    })
  }

  if (project_id !== undefined && !sameId(oldRow.project_id, project_id)) {
    entries.push({
      field: '项目',
      oldVal: await lookupName('project', oldRow.project_id),
      newVal: await lookupName('project', project_id)
    })
  }

  if (module !== undefined && String(oldRow.module || '') !== String(module || '')) {
    entries.push({
      field: '模块',
      oldVal: oldRow.module || '未分配',
      newVal: module || '未分配'
    })
  }

  if (expected_date !== undefined) {
    const oldDate = displayDate(oldRow.expected_date)
    const newDate = expected_date ? displayDate(expected_date) : '未设置'
    if (oldDate !== newDate) {
      entries.push({ field: '截止日期', oldVal: oldDate, newVal: newDate })
    }
  }

  return entries
}
