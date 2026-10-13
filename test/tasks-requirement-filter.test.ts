import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

let capturedSql = ''
let capturedParams: any[] = []

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    capturedSql = sql
    capturedParams = params
    return []
  }),
}))

vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 2, role: 'pm' })),
}))

const { default: handler } = await import('~/server/api/tasks/index.get')

function makeEvent(query: Record<string, string>) {
  const url = new URL('http://localhost/api/tasks')
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value))
  return createEvent({ url: `${url.pathname}${url.search}`, method: 'GET', headers: {} } as any, {} as any)
}

describe('GET /api/tasks — requirement filter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedSql = ''
    capturedParams = []
  })

  it('filters tasks by the requirement primary key for the legacy requirement_id query', async () => {
    await handler(makeEvent({ requirement_id: '42' }))

    expect(capturedSql).toContain('AND t.requirement_id = ?')
    expect(capturedParams).toContain('42')
  })
})
