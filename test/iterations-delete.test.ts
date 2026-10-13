import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const ctx = {
  reqCount: 0,
  deleted: false,
}

vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 1, role: 'admin' })),
}))

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string) => {
    if (sql.includes('SELECT id FROM iterations')) return [{ id: 9 }]
    if (sql.includes('COUNT(*)')) return [{ count: ctx.reqCount }]
    if (sql.startsWith('DELETE FROM iterations')) {
      ctx.deleted = true
      return { affectedRows: 1 }
    }
    return []
  }),
}))

const { default: handler } = await import('~/server/api/iterations/[id].delete')

describe('DELETE /api/iterations/:id', () => {
  beforeEach(() => {
    ctx.reqCount = 0
    ctx.deleted = false
  })

  it('blocks delete when the iteration still has requirements', async () => {
    ctx.reqCount = 2
    const event = createEvent({ url: '/api/iterations/9', method: 'DELETE', headers: {} } as any, {} as any)
    ;(event.context as any).params = { id: '9' }
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: expect.stringContaining('请先删除关联需求'),
    })
    expect(ctx.deleted).toBe(false)
  })

  it('deletes an empty iteration', async () => {
    const event = createEvent({ url: '/api/iterations/9', method: 'DELETE', headers: {} } as any, {} as any)
    ;(event.context as any).params = { id: '9' }
    await expect(handler(event)).resolves.toEqual({ success: true })
    expect(ctx.deleted).toBe(true)
  })
})
