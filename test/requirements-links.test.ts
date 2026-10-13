import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'
import { mergeStoredAttachments, splitStoredAttachments } from '~/server/utils/requirementAttachments'

let body: any
let insertParams: any[] = []

vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 7, role: 'pm' })),
  requireRole: vi.fn(async () => ({ id: 7, role: 'pm' })),
}))

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.includes('INSERT INTO requirements')) {
      insertParams = params
      return { insertId: 99 }
    }
    return [{
      id: 99, req_no: 'REQ-TEST', title: '链接需求', description: '', priority: 'p2',
      status: 'draft', type: 'feature', module: null, expected_date: null, tags: '[]',
      attachments: JSON.stringify(insertParams[12] ? JSON.parse(insertParams[12]) : []),
      created_at: '2026-01-01', updated_at: '2026-01-01', project_name: null,
      iteration_name: null, creator_name: '产品经理', assignee_name: null,
    }]
  }),
}))

const { default: handler } = await import('~/server/api/requirements/index.post')

describe('requirement document links', () => {
  beforeEach(() => {
    body = {
      title: '链接需求',
      priority: 'p2',
      status: 'draft',
      project_id: 1,
      attachments: [{ url: 'https://files.example/spec.pdf', filename: 'spec.pdf', size: 1024, type: 'application/pdf' }],
      links: [{ url: 'https://xxx.feishu.cn/docx/abc', title: '登录注册原型' }],
    }
    insertParams = []
    vi.stubGlobal('readBody', vi.fn(async () => body))
  })

  it('stores feishu links alongside file attachments', async () => {
    const event = createEvent({ url: '/api/requirements', method: 'POST', headers: {} } as any, {} as any)
    const result = await handler(event)

    expect(insertParams).toContain(JSON.stringify(mergeStoredAttachments(body.attachments, body.links)))
    expect(result.links).toEqual([{ url: 'https://xxx.feishu.cn/docx/abc', title: '登录注册原型' }])
    expect(result.attachments).toEqual(body.attachments)
  })

  it('splits stored link attachments back out for the client', () => {
    expect(splitStoredAttachments(mergeStoredAttachments(
      [{ url: 'https://files.example/a.png', filename: 'a.png', size: 1, type: 'image/png' }],
      [{ url: 'https://xxx.feishu.cn/wiki/1', title: '飞书知识库' }]
    ))).toEqual({
      attachments: [{ url: 'https://files.example/a.png', filename: 'a.png', size: 1, type: 'image/png' }],
      links: [{ url: 'https://xxx.feishu.cn/wiki/1', title: '飞书知识库' }],
    })
  })
})
