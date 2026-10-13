import { describe, expect, it } from 'vitest'
import { isMeaningfulTaskDraft, parseTaskDrafts, serializeTaskDrafts } from '~/utils/task-draft'

describe('task draft cache', () => {
  it('treats empty rows as not worth saving', () => {
    expect(isMeaningfulTaskDraft([{ title: '  ', description: '' }])).toBe(false)
    expect(isMeaningfulTaskDraft([{ title: '登录校验' }])).toBe(true)
  })

  it('round-trips filled rows', () => {
    const raw = serializeTaskDrafts([{ title: 'A', description: 'd', priority: 'high', type: 'test', assignee_ids: [3, 5], estimated_hours: 4 }])
    const row = parseTaskDrafts(raw)[0]
    expect(row.title).toBe('A')
    expect(row.assignee_ids).toEqual([3, 5])
  })
})
