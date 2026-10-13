import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const historyInserts: any[] = []

vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 8, role: 'pm' })),
}))

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.includes('INSERT INTO requirement_history')) {
      historyInserts.push(params)
      return { insertId: historyInserts.length }
    }
    if (sql.includes('INSERT INTO tasks')) return { insertId: 11 }
    if (sql.includes('FROM tasks')) {
      return [{
        id: 11,
        task_no: 'TASK-001',
        title: params?.[0] ? undefined : '需求三任务',
        description: '',
        status: 'todo',
        priority: 'medium',
        type: 'development',
        estimated_hours: 6.5,
        actual_hours: null,
        start_date: null,
        due_date: '2026-10-23',
        created_at: '2026-10-13',
        updated_at: '2026-10-13',
        assignee_id: null,
        assignee_name: null,
        creator_id: 8,
        creator_name: '管理员',
        requirement_id: 42,
        requirement_title: '需求3',
        project_id: 1,
        project_name: 'lychee-openapi',
      }]
    }
    return []
  }),
}))

const { default: handler } = await import('~/server/api/tasks/index.post')

describe('POST /api/tasks — requirement history', () => {
  beforeEach(() => {
    historyInserts.length = 0
    vi.stubGlobal('readBody', vi.fn(async () => ({
      tasks: [
        { title: '需求三任务', requirement_id: 42 },
        { title: '联调任务', requirement_id: 42 },
      ]
    })))
  })

  it('writes a history row for each task created under a requirement', async () => {
    const event = createEvent({ url: '/api/tasks', method: 'POST', headers: {} } as any, {} as any)
    await handler(event)

    expect(historyInserts).toEqual([
      [42, '新建任务', null, '需求三任务', 8],
      [42, '新建任务', null, '联调任务', 8],
    ])
  })

  it('does not write requirement history when the task has no requirement', async () => {
    vi.stubGlobal('readBody', vi.fn(async () => ({ title: '独立任务' })))
    const event = createEvent({ url: '/api/tasks', method: 'POST', headers: {} } as any, {} as any)
    await handler(event)
    expect(historyInserts).toEqual([])
  })
})
