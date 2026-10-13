import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const authorize = vi.fn(async () => {
  throw Object.assign(new Error('无权限执行此操作'), { statusCode: 403 })
})

vi.mock('~/server/utils/permissions', () => ({ authorize }))
vi.mock('~/server/utils/mysql', () => ({ query: vi.fn() }))

const { default: handler } = await import('~/server/api/projects/[id]/members.post')

describe('POST /api/projects/:id/members', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('readBody', vi.fn(async () => ({ user_id: 3, role: 'member' })))
  })

  it('rejects callers without project update permission before changing membership', async () => {
    const event = createEvent({ url: '/api/projects/1/members', method: 'POST', headers: {} } as any, {} as any)
    ;(event.context as any).params = { id: '1' }

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 })
    expect(authorize).toHaveBeenCalledWith(event, 'project', 'update')
  })
})
