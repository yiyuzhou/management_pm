import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const ctx = {
  rows: [] as any[],
  updatedStatus: '',
  completedReqIds: [] as number[],
}

vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 1, role: 'admin' })),
}))

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.includes('FROM requirements WHERE req_no')) return ctx.rows
    if (sql.startsWith('UPDATE requirements')) {
      ctx.updatedStatus = params[0]
      return { affectedRows: ctx.rows.length }
    }
    if (sql.includes('UPDATE tasks')) {
      ctx.completedReqIds = params
      return { affectedRows: params.length }
    }
    return []
  }),
}))

const { default: handler } = await import('~/server/api/requirements/batch-status.post')

describe('POST /api/requirements/batch-status', () => {
  beforeEach(() => {
    ctx.rows = [
      { id: 1, req_no: 'REQ-1', status: 'pending' },
      { id: 2, req_no: 'REQ-2', status: 'in_progress' },
    ]
    ctx.updatedStatus = ''
    ctx.completedReqIds = []
    vi.stubGlobal('readBody', vi.fn(async () => ({ ids: ['REQ-1', 'REQ-2'], status: 'completed' })))
  })

  it('updates selected requirements and completes associated tasks', async () => {
    const event = createEvent({ url: '/api/requirements/batch-status', method: 'POST', headers: {} } as any, {} as any)
    await expect(handler(event)).resolves.toMatchObject({ success: true, updated: 2, status: 'completed' })
    expect(ctx.updatedStatus).toBe('completed')
    expect(ctx.completedReqIds).toEqual([1, 2])
  })

  it('rejects an invalid status', async () => {
    vi.stubGlobal('readBody', vi.fn(async () => ({ ids: ['REQ-1'], status: 'done' })))
    const event = createEvent({ url: '/api/requirements/batch-status', method: 'POST', headers: {} } as any, {} as any)
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 })
  })
})
