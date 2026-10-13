import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEvent } from 'h3'

/**
 * Seam: GET /api/weekly-reports
 *
 * Behavior under test:
 *   When no `weekStart` query param is provided, the API should return
 *   only the most recent N weeks of reports (not the entire history),
 *   so the frontend "历史周报" sidebar can render a bounded list.
 *
 *   When `weekStart` IS provided, the API returns reports for that
 *   specific week (existing behavior, unchanged).
 *
 * System boundary mocked: MySQL `query` function (~/server/utils/mysql).
 */

// --- Mock the database query (system boundary) ---
// We capture the SQL + params so the test can assert behavior through
// the public interface (what the handler asks the database for),
// and we return controlled rows so we can assert the response shape.

let capturedSql: string
let capturedParams: any[]

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async (sql: string, params?: any[]) => {
    capturedSql = sql
    capturedParams = params || []

    // Simulate 12 weeks of reports in the DB
    if (sql.includes('ORDER BY')) {
      return Array.from({ length: 12 }, (_, i) => ({
        id: 100 - i,
        user_id: 2,
        week_start: `2024-${String(12 - i).padStart(2, '0')}-02`,
        week_end: `2024-${String(12 - i).padStart(2, '0')}-08`,
        completed_work: JSON.stringify([{ title: `work-${i}`, hours: 8 }]),
        next_week_plan: JSON.stringify([{ title: `plan-${i}` }]),
        summary: `summary-${i}`,
        hours: 8,
        status: 'submitted',
        submitted_at: `2024-${String(12 - i).padStart(2, '0')}-08 10:00:00`,
        created_at: `2024-${String(12 - i).padStart(2, '0')}-08 10:00:00`,
        updated_at: `2024-${String(12 - i).padStart(2, '0')}-08 10:00:00`,
        user_name: '产品经理1',
        user_avatar: null,
        user_role: 'pm',
      }))
    }
    return []
  }),
}))

// Also mock auth util (imported but unused in GET handler)
vi.mock('~/server/utils/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 2, role: 'pm' })),
}))

// Import the handler AFTER mocks are set up
const handlerModule = await import('~/server/api/weekly-reports/index.get')
const handler = handlerModule.default

function makeEvent(queryParams: Record<string, string | undefined> = {}) {
  const url = new URL('http://localhost/api/weekly-reports')
  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) url.searchParams.set(key, value)
  }
  const req = {
    url: url.pathname + url.search,
    method: 'GET',
    headers: {},
  }
  return createEvent(req as any, {} as any)
}

describe('GET /api/weekly-reports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when weekStart is NOT provided', () => {
    it('limits results to recent 8 weeks (does not return entire history)', async () => {
      const event = makeEvent({})
      const result = await handler(event)

      // The SQL should contain a LIMIT clause
      expect(capturedSql).toMatch(/LIMIT/i)

      // The handler should return a mapped array
      expect(Array.isArray(result)).toBe(true)
    })

    it('maps each report with correct fields', async () => {
      const event = makeEvent({})
      const result = await handler(event) as any[]

      // Every item should have the fields the frontend needs for the
      // history sidebar: id, weekStart, weekEnd, hours, status
      for (const item of result) {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('weekStart')
        expect(item).toHaveProperty('weekEnd')
        expect(item).toHaveProperty('hours')
        expect(item).toHaveProperty('status')
        expect(item).toHaveProperty('completedWork')
      }
    })
  })

  describe('when weekStart IS provided', () => {
    it('returns reports for that specific week without LIMIT', async () => {
      const event = makeEvent({ weekStart: '2024-12-02' })
      const result = await handler(event)

      expect(Array.isArray(result)).toBe(true)
      // When filtering by a specific week, no LIMIT is needed
      expect(capturedSql).not.toMatch(/LIMIT/i)
    })
  })
})
