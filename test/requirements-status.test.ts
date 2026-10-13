import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const ctx = {
  body: {} as any,
  oldStatus: 'completed',
  updateParams: [] as any[],
  taskUpdateSql: '',
}

vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 2, role: 'pm' })),
  requireRole: vi.fn(async () => ({ id: 2, role: 'pm' })),
}))

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.startsWith('SELECT id FROM requirements')) return [{ id: 42 }]
    if (sql.includes('FROM requirements WHERE id = ?')) {
      return [{ status: ctx.oldStatus, priority: 'p1', assignee_id: 3, title: '已完成需求' }]
    }
    if (sql.startsWith('UPDATE requirements')) {
      ctx.updateParams = params
      return { affectedRows: 1 }
    }
    if (sql.includes('UPDATE tasks')) {
      ctx.taskUpdateSql = sql
      return { affectedRows: 2 }
    }
    if (sql.startsWith('SELECT r.*')) return [{
      id: 42, req_no: 'REQ-042', title: '更名需求', description: '', priority: 'p1',
      status: ctx.body.status || ctx.oldStatus, type: 'feature', module: null, tags: '[]', attachments: '[]',
      expected_date: null, created_at: '2026-01-01', updated_at: '2026-01-01',
    }]
    return []
  }),
}))

const { default: handler } = await import('~/server/api/requirements/[id].put')

describe('PUT /api/requirements/:id — status preservation', () => {
  beforeEach(() => {
    ctx.body = { title: '更名需求' }
    ctx.updateParams = []
    ctx.oldStatus = 'completed'
    ctx.taskUpdateSql = ''
    vi.stubGlobal('readBody', vi.fn(async () => ctx.body))
  })

  it('keeps the stored status when an edit does not explicitly change it', async () => {
    const event = createEvent({ url: '/api/requirements/REQ-042', method: 'PUT', headers: {} } as any, {} as any)
    ;(event.context as any).params = { id: 'REQ-042' }
    await handler(event)

    expect(ctx.updateParams).toContain('completed')
    expect(ctx.taskUpdateSql).toBe('')
  })

  it('marks associated tasks done when the requirement becomes completed', async () => {
    ctx.oldStatus = 'pending'
    ctx.body = { title: '更名需求', status: 'completed' }
    const event = createEvent({ url: '/api/requirements/REQ-042', method: 'PUT', headers: {} } as any, {} as any)
    ;(event.context as any).params = { id: 'REQ-042' }
    await handler(event)
    expect(ctx.taskUpdateSql).toContain("status = 'done'")
    expect(ctx.taskUpdateSql).toContain('requirement_id')
  })
})
