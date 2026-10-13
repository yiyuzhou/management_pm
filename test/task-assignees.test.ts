import { describe, expect, it, vi } from 'vitest'

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async () => []),
}))

import { normalizeAssigneeIds } from '~/server/utils/taskAssignees'
import { taskAssigneeList, taskAssigneeNames } from '~/utils/task-assignees'
import { normalizeDraftAssigneeIds } from '~/utils/task-draft'

describe('task multi assignees', () => {
  it('normalizes assignee_ids and assignee_id', () => {
    expect(normalizeAssigneeIds({ assignee_ids: ['2', 2, 5, 0, 'x'] })).toEqual([2, 5])
    expect(normalizeAssigneeIds({ assignee_id: 8 })).toEqual([8])
    expect(normalizeAssigneeIds({})).toEqual([])
  })

  it('reads assignees from draft rows', () => {
    expect(normalizeDraftAssigneeIds({ assignee_ids: [1, 3] })).toEqual([1, 3])
    expect(normalizeDraftAssigneeIds({ assignee_id: 4 })).toEqual([4])
  })

  it('displays assignee names', () => {
    expect(taskAssigneeNames({ assignees: [{ id: 1, name: '易雨洲' }, { id: 2, name: '黄飞' }] })).toBe('易雨洲、黄飞')
    expect(taskAssigneeList({ assignee: { id: 1, name: 'A' } })).toEqual([{ id: 1, name: 'A' }])
  })
})
