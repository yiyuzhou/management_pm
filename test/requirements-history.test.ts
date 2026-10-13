import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'
import { collectRequirementChanges, stripHtml } from '~/server/utils/requirementHistory'

const ctx = {
  body: {} as any,
  requirement: {
    id: 42,
    title: '需求3',
    created_at: '2026-10-12T00:00:00.000Z',
    creator_name: '黄飞',
    status: 'approved',
    priority: 'p1',
    assignee_id: 3,
    req_no: 'REQ-261012-171',
    description: '<p>需求3</p>',
    type: 'feature',
    project_id: 1,
    iteration_id: 2,
    module: '未分配',
    expected_date: '2026-10-14',
  } as any,
  history: [] as any[],
  historyInserts: [] as any[],
  oldStatus: 'approved',
}

vi.mock('~/server/utils/permissions', () => ({
  authorize: vi.fn(async () => ({ id: 8, role: 'pm' })),
  requireRole: vi.fn(async () => ({ id: 8, role: 'pm' })),
}))

vi.mock('~/server/utils/notifications', () => ({
  notifyRequirementAssigned: vi.fn(async () => {}),
}))

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.includes('INSERT INTO requirement_history')) {
      ctx.historyInserts.push(params)
      return { insertId: ctx.historyInserts.length }
    }
    if (sql.includes('INSERT INTO requirements')) {
      return { insertId: 99 }
    }
    if (sql.includes('FROM requirement_history')) {
      return ctx.history
    }
    if (sql.startsWith('SELECT id FROM requirements')) {
      return [{ id: ctx.requirement.id }]
    }
    if (sql.includes('FROM requirements r') && sql.includes('creator_id')) {
      return [ctx.requirement]
    }
    if (sql.includes('FROM requirements WHERE id = ?')) {
      return [{ ...ctx.requirement, status: ctx.oldStatus }]
    }
    if (sql.startsWith('SELECT r.*')) {
      return [{
        ...ctx.requirement,
        title: ctx.body.title || ctx.requirement.title,
        status: ctx.body.status || ctx.oldStatus,
        tags: '[]',
        attachments: '[]',
        project_name: 'lychee-openapi',
        project_status: 'active',
        project_color: '',
        iteration_name: 'v2.2.4',
        iteration_status: 'active',
        creator_name: '黄飞',
        assignee_name: '黄飞',
        assignee_avatar: null,
        updated_at: '2026-10-12',
      }]
    }
    if (sql.includes('FROM users')) return [{ name: '黄飞' }]
    if (sql.includes('FROM iterations')) return [{ name: 'v2.2.4' }]
    if (sql.includes('FROM projects')) return [{ name: 'lychee-openapi' }]
    return []
  }),
}))

const { default: getHistory } = await import('~/server/api/requirements/[id]/history.get')
const { default: putRequirement } = await import('~/server/api/requirements/[id].put')
const { default: createRequirement } = await import('~/server/api/requirements/index.post')

function eventFor(url: string, method: string, id?: string) {
  const event = createEvent({ url, method, headers: {} } as any, {} as any)
  if (id) (event.context as any).params = { id }
  return event
}

describe('requirement history', () => {
  beforeEach(() => {
    ctx.body = {}
    ctx.history = []
    ctx.historyInserts = []
    ctx.oldStatus = 'approved'
    ctx.requirement.title = '需求3'
    ctx.requirement.description = '<p>需求3</p>'
    vi.stubGlobal('readBody', vi.fn(async () => ctx.body))
  })

  it('strips html before comparing descriptions', () => {
    expect(stripHtml('<p>需求3</p>')).toBe('需求3')
    expect(stripHtml('<p>需求3</p>')).toBe(stripHtml('需求3'))
  })

  it('collects title and status changes', async () => {
    const entries = await collectRequirementChanges(
      { title: '需求3', status: 'pending', priority: 'p1', description: '需求3' },
      { title: '需求3-改', status: 'approved' }
    )
    expect(entries).toEqual([
      { field: '标题', oldVal: '需求3', newVal: '需求3-改' },
      { field: '状态', oldVal: '评审中', newVal: '已确定' },
    ])
  })

  it('does not record description when only markup changes', async () => {
    const entries = await collectRequirementChanges(
      { title: '需求3', description: '<p>需求3</p>' },
      { description: '需求3' }
    )
    expect(entries).toEqual([])
  })

  it('synthesizes a create record when history table is empty', async () => {
    const result = await getHistory(eventFor('/api/requirements/REQ-261012-171/history', 'GET', 'REQ-261012-171'))
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      field: '创建',
      new_value: '需求3',
      user_name: '黄飞',
    })
  })

  it('does not duplicate create when history already contains it', async () => {
    ctx.history = [{
      id: 1,
      field: '创建',
      old_value: null,
      new_value: '需求3',
      user_name: '黄飞',
      changed_at: '2026-10-12T00:00:00.000Z',
    }]
    const result = await getHistory(eventFor('/api/requirements/REQ-261012-171/history', 'GET', 'REQ-261012-171'))
    expect(result.filter((item: any) => item.field === '创建')).toHaveLength(1)
  })

  it('writes a create history row when a requirement is created', async () => {
    ctx.body = { title: '需求3', project_id: 1, priority: 'p1', status: 'approved' }
    await createRequirement(eventFor('/api/requirements', 'POST'))
    expect(ctx.historyInserts.some(params => params[1] === '创建' && params[3] === '需求3')).toBe(true)
  })

  it('writes field history when a requirement is updated', async () => {
    ctx.body = { title: '需求3-改', status: 'in_progress' }
    await putRequirement(eventFor('/api/requirements/REQ-261012-171', 'PUT', 'REQ-261012-171'))
    const fields = ctx.historyInserts.map(params => params[1])
    expect(fields).toContain('标题')
    expect(fields).toContain('状态')
  })
})
