export interface TaskDraftRow {
  title?: string
  description?: string
  priority?: string
  type?: string
  assignee_id?: string | number
  assignee_ids?: Array<string | number>
  estimated_hours?: string | number
  start_date?: string
  due_date?: string
}

export function normalizeDraftAssigneeIds(row: TaskDraftRow | null | undefined): number[] {
  if (Array.isArray(row?.assignee_ids) && row.assignee_ids.length) {
    return [...new Set(row.assignee_ids.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0))]
  }
  const single = Number(row?.assignee_id)
  return Number.isInteger(single) && single > 0 ? [single] : []
}

export function taskDraftStorageKey(requirementId: string | number) {
  return `rdm:req-task-draft:${requirementId}`
}

export function isMeaningfulTaskDraft(rows: TaskDraftRow[] | null | undefined) {
  return (rows || []).some(row =>
    Boolean(String(row.title || '').trim()
      || String(row.description || '').trim()
      || row.assignee_id
      || (Array.isArray(row.assignee_ids) && row.assignee_ids.length)
      || row.estimated_hours
      || row.start_date
      || row.due_date)
  )
}

export function serializeTaskDrafts(rows: TaskDraftRow[]) {
  return JSON.stringify(rows.map(row => ({
    title: row.title || '',
    description: row.description || '',
    priority: row.priority || 'medium',
    type: row.type || 'development',
    assignee_id: normalizeDraftAssigneeIds(row)[0] || '',
    assignee_ids: normalizeDraftAssigneeIds(row),
    estimated_hours: row.estimated_hours || '',
    start_date: row.start_date || '',
    due_date: row.due_date || ''
  })))
}

function parseDay(value?: string | null): Date | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function isDueBeforeStart(start?: string | null, due?: string | null): boolean {
  const from = parseDay(start)
  const to = parseDay(due)
  return !!(from && to && to < from)
}

/** Inclusive calendar days × 8 hours. Returns null when dates are missing or invalid. */
export function estimatedHoursFromDates(start?: string | null, due?: string | null): number | null {
  const from = parseDay(start)
  const to = parseDay(due)
  if (!from || !to || to < from) return null
  const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1
  return days * 8
}

export function parseTaskDrafts(raw: string | null): TaskDraftRow[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
