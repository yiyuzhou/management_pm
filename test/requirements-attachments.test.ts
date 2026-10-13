import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

let body: any
let insertSql = ''
let insertParams: any[] = []

vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 7, role: 'pm' })),
  requireRole: vi.fn(async () => ({ id: 7, role: 'pm' })),
}))

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.includes('INSERT INTO requirements')) {
      insertSql = sql
      insertParams = params
      return { insertId: 99 }
    }
    return [{
      id: 99, req_no: 'REQ-TEST', title: '附件需求', description: '', priority: 'p2',
      status: 'draft', type: 'feature', module: null, expected_date: null, tags: '[]',
      created_at: '2026-01-01', updated_at: '2026-01-01', project_name: null,
      iteration_name: null, creator_name: '产品经理', assignee_name: null,
    }]
  }),
}))

const { default: handler } = await import('~/server/api/requirements/index.post')

describe('POST /api/requirements — attachments', () => {
  beforeEach(() => {
    body = {
      title: '附件需求', priority: 'p2', status: 'draft', type: 'feature', project_id: 1,
      attachments: [{ url: 'https://files.example/spec.pdf', filename: 'spec.pdf', size: 1024, type: 'application/pdf' }],
    }
    insertSql = ''
    insertParams = []
    vi.stubGlobal('readBody', vi.fn(async () => body))
  })

  it('persists uploaded attachment metadata with the new requirement', async () => {
    const event = createEvent({ url: '/api/requirements', method: 'POST', headers: {} } as any, {} as any)
    await handler(event)

    expect(insertSql).toContain('attachments')
    expect(insertParams).toContain(JSON.stringify(body.attachments))
  })
})
