import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEvent } from 'h3'

/**
 * Feedback loop for bug: "点击历史周报需要数据回显。历史周报展示完成项不正确"
 *
 * Root cause hypothesis: mysql2 may return JSON columns as already-parsed
 * JavaScript objects (not strings). The weekly-reports GET handler calls
 * JSON.parse() unconditionally, which throws on already-parsed arrays,
 * and the catch block silently sets completedWork = [].
 *
 * Compare with bugs/[id].get.ts and prototypes/[id].get.ts which correctly
 * use `typeof x === 'string' ? JSON.parse(x) : x`.
 *
 * This test simulates mysql2 returning JSON columns as parsed objects.
 */

let mockRow: any = null

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async () => {
    return mockRow ? [mockRow] : []
  }),
}))

vi.mock('~/server/utils/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 2, role: 'pm' })),
}))

const handlerModule = await import('~/server/api/weekly-reports/index.get')
const handler = handlerModule.default

function makeEvent(queryParams: Record<string, string | undefined> = {}) {
  const url = new URL('http://localhost/api/weekly-reports')
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) url.searchParams.set(key, value)
  }
  const req = { url: url.pathname + url.search, method: 'GET', headers: {} }
  return createEvent(req as any, {} as any)
}

describe('GET /api/weekly-reports — JSON column handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRow = null
  })

  it('preserves completedWork when mysql2 returns JSON as parsed array (objects)', async () => {
    // Simulate mysql2 returning JSON column as a parsed JS array of objects
    // (what the new frontend sends: {title, description, hours, requirementNo})
    mockRow = {
      id: 1,
      user_id: 2,
      week_start: '2024-12-02',
      week_end: '2024-12-08',
      completed_work: [
        { title: '完成需求文档', description: '描述', hours: 8, requirementNo: 'REQ-024' },
        { title: '组织评审会议', description: '', hours: 4, requirementNo: '' },
      ],
      next_week_plan: [{ title: '跟进开发' }],
      summary: '本周总结',
      hours: 12,
      status: 'submitted',
      submitted_at: '2024-12-08 10:00:00',
      created_at: '2024-12-08 10:00:00',
      updated_at: '2024-12-08 10:00:00',
      user_name: '产品经理',
      user_avatar: null,
      user_role: 'pm',
    }

    const event = makeEvent({ weekStart: '2024-12-02', userId: '2' })
    const result = await handler(event) as any[]

    expect(result).toHaveLength(1)
    // The completed work should NOT be empty — this is the bug
    expect(result[0].completedWork).toHaveLength(2)
    expect(result[0].completedWork[0].title).toBe('完成需求文档')
    expect(result[0].completedWork[1].hours).toBe(4)
  })

  it('preserves completedWork when mysql2 returns JSON as parsed array (strings)', async () => {
    // Simulate mysql2 returning JSON column as a parsed JS array of strings
    // (what the seed data contains: ["完成需求文档", "组织评审会议"])
    mockRow = {
      id: 2,
      user_id: 2,
      week_start: '2024-12-02',
      week_end: '2024-12-08',
      completed_work: ['完成用户中心需求文档', '组织需求评审会议'],
      next_week_plan: ['跟进用户中心开发进度', '准备数据看板需求'],
      summary: '本周主要推进用户中心改版项目',
      hours: 42,
      status: 'submitted',
      submitted_at: '2024-12-08 10:00:00',
      created_at: '2024-12-08 10:00:00',
      updated_at: '2024-12-08 10:00:00',
      user_name: '产品经理',
      user_avatar: null,
      user_role: 'pm',
    }

    const event = makeEvent({ weekStart: '2024-12-02' })
    const result = await handler(event) as any[]

    expect(result).toHaveLength(1)
    expect(result[0].completedWork).toHaveLength(2)
    expect(result[0].completedWork[0]).toBe('完成用户中心需求文档')
  })

  it('preserves completedWork when mysql2 returns JSON as string (fallback)', async () => {
    // Simulate mysql2 returning JSON column as a raw string
    mockRow = {
      id: 3,
      user_id: 2,
      week_start: '2024-12-09',
      week_end: '2024-12-15',
      completed_work: JSON.stringify([{ title: '测试工作', hours: 6 }]),
      next_week_plan: JSON.stringify([{ title: '下周计划' }]),
      summary: '',
      hours: 6,
      status: 'submitted',
      submitted_at: '2024-12-15 10:00:00',
      created_at: '2024-12-15 10:00:00',
      updated_at: '2024-12-15 10:00:00',
      user_name: '产品经理',
      user_avatar: null,
      user_role: 'pm',
    }

    const event = makeEvent({ weekStart: '2024-12-09' })
    const result = await handler(event) as any[]

    expect(result).toHaveLength(1)
    expect(result[0].completedWork).toHaveLength(1)
    expect(result[0].completedWork[0].title).toBe('测试工作')
  })
})
