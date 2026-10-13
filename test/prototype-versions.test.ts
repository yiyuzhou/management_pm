import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const query = vi.fn()

vi.mock('~/server/utils/mysql', () => ({ query }))
vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 2, role: 'pm' })),
  requireRole: vi.fn(async () => ({ id: 2, role: 'pm' })),
}))

const { default: versionsHandler } = await import('~/server/api/prototypes/[id]/versions/index.get')
const { default: restoreHandler } = await import('~/server/api/prototypes/[id]/versions/[versionId]/restore.post')

function makeEvent() {
  const event = createEvent({ url: '/api/prototypes/12/versions', method: 'GET', headers: {} } as any, {} as any)
  event.context.params = { id: '12' }
  return event
}

describe('GET /api/prototypes/:id/versions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    query.mockResolvedValue([
      {
        id: 7,
        prototype_id: 12,
        revision: 3,
        version_label: 'v1.2',
        change_summary: '更新登录页交互',
        created_at: '2026-07-14T08:00:00.000Z',
        author_name: '产品经理',
        author_avatar: null,
      },
    ])
  })

  it('returns immutable versions newest first with author details', async () => {
    await expect(versionsHandler(makeEvent())).resolves.toEqual({
      items: [{
        id: 7,
        revision: 3,
        version: 'v1.2',
        description: '更新登录页交互',
        createdAt: '2026-07-14T08:00:00.000Z',
        author: { name: '产品经理', avatar: null },
      }],
    })
    expect(query).toHaveBeenCalledWith(expect.stringContaining('FROM prototype_versions'), ['12'])
  })
})

describe('POST /api/prototypes/:id/versions/:versionId/restore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('MAX(revision)')) return [{ max_revision: 3 }]
      if (sql.includes('FROM prototype_versions')) return [{
        id: 7, prototype_id: 12, revision: 3, version_label: 'v1.2',
        snapshot: JSON.stringify({ name: '登录页', pages: [{ name: '登录', size: '375x812' }], version: 'v1.2', tags: ['认证'] }),
      }]
      return []
    })
  })

  it('restores the snapshot and writes a new immutable revision instead of mutating history', async () => {
    const event = createEvent({ url: '/api/prototypes/12/versions/7/restore', method: 'POST', headers: {} } as any, {} as any)
    event.context.params = { id: '12', versionId: '7' }

    await expect(restoreHandler(event)).resolves.toMatchObject({ prototypeId: '12', restoredFromVersionId: '7', revision: 4 })
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE prototypes SET'), expect.arrayContaining(['登录页', '12']))
    expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO prototype_versions'), expect.arrayContaining([12, 4, 'v1.2']))
  })
})
