import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const query = vi.fn()
let body: any = {}

vi.mock('~/server/utils/mysql', () => ({ query }))
vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 2, role: 'pm' })),
  requireRole: vi.fn(async () => ({ id: 2, role: 'pm' })),
}))

const { default: associateHandler } = await import('~/server/api/requirements/[id]/prototypes/index.post')
const { default: unlinkHandler } = await import('~/server/api/requirements/[id]/prototypes/[prototypeId].delete')

function makeEvent(url: string, method: string, params: Record<string, string>) {
  const event = createEvent({ url, method, headers: {} } as any, {} as any)
  event.context.params = params
  return event
}

describe('POST /api/requirements/:id/prototypes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    body = { prototype_id: 7 }
    vi.stubGlobal('readBody', vi.fn(async () => body))
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM requirements')) return [{ id: 42 }]
      if (sql.includes('FROM prototypes')) {
        return [{ id: 7, name: '登录页', thumbnail: 'https://cdn.example/login.png', pages: '[]', requirement_id: null }]
      }
      return { affectedRows: 1 }
    })
  })

  it('links an existing prototype to the requirement', async () => {
    const event = makeEvent('/api/requirements/REQ-042/prototypes', 'POST', { id: 'REQ-042' })
    await expect(associateHandler(event)).resolves.toMatchObject({
      id: 7,
      name: '登录页',
      requirement_id: 42,
    })
    expect(query).toHaveBeenCalledWith(
      'UPDATE prototypes SET requirement_id = ? WHERE id = ?',
      [42, 7]
    )
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO requirement_history'),
      [42, '关联原型', null, '登录页', 2]
    )
  })

  it('rejects a missing prototype_id', async () => {
    body = {}
    const event = makeEvent('/api/requirements/REQ-042/prototypes', 'POST', { id: 'REQ-042' })
    await expect(associateHandler(event)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('returns 404 when the prototype does not exist', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM requirements')) return [{ id: 42 }]
      if (sql.includes('FROM prototypes')) return []
      return { affectedRows: 0 }
    })
    const event = makeEvent('/api/requirements/REQ-042/prototypes', 'POST', { id: 'REQ-042' })
    await expect(associateHandler(event)).rejects.toMatchObject({ statusCode: 404 })
  })
})

describe('DELETE /api/requirements/:id/prototypes/:prototypeId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM requirements')) return [{ id: 42 }]
      if (sql.includes('FROM prototypes')) return [{ id: 7, name: '登录页' }]
      return { affectedRows: 1 }
    })
  })

  it('clears requirement_id only for the linked prototype', async () => {
    const event = makeEvent('/api/requirements/REQ-042/prototypes/7', 'DELETE', {
      id: 'REQ-042',
      prototypeId: '7',
    })
    await expect(unlinkHandler(event)).resolves.toEqual({ ok: true, prototype_id: 7 })
    expect(query).toHaveBeenCalledWith(
      'UPDATE prototypes SET requirement_id = NULL WHERE id = ? AND requirement_id = ?',
      ['7', 42]
    )
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO requirement_history'),
      [42, '取消关联原型', '登录页', null, 2]
    )
  })

  it('returns 404 when the prototype is not linked to this requirement', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM requirements')) return [{ id: 42 }]
      if (sql.includes('FROM prototypes')) return []
      return { affectedRows: 0 }
    })
    const event = makeEvent('/api/requirements/REQ-042/prototypes/7', 'DELETE', {
      id: 'REQ-042',
      prototypeId: '7',
    })
    await expect(unlinkHandler(event)).rejects.toMatchObject({ statusCode: 404 })
  })
})
