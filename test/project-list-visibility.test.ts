import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

let capturedSql = ''
const authorize = vi.fn()

vi.mock('~/server/utils/permissions', () => ({ authorize }))
vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string) => {
    capturedSql = sql
    return []
  }),
}))

const { default: handler } = await import('~/server/api/projects/index.get')

function makeEvent() {
  return createEvent({ url: '/api/projects', method: 'GET', headers: {} } as any, {} as any)
}

describe('GET /api/projects visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedSql = ''
  })

  it('lets admin see every project', async () => {
    authorize.mockResolvedValue({ id: 1, role: 'admin' })
    await handler(makeEvent())
    expect(capturedSql).not.toMatch(/EXISTS/)
  })

  it('hides projects a member is not assigned to', async () => {
    authorize.mockResolvedValue({ id: 9, role: 'developer' })
    await handler(makeEvent())
    expect(capturedSql).toMatch(/EXISTS/)
    expect(capturedSql).toMatch(/pm\.user_id/)
  })
})
