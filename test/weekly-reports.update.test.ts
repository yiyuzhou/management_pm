import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const query = vi.fn()
const authorize = vi.fn()

vi.mock('~/server/utils/mysql', () => ({ query }))
vi.mock('~/server/utils/permissions', () => ({ authorize }))

const { default: handler } = await import('~/server/api/weekly-reports/[id].put')

function makeEvent() {
  const event = createEvent({ url: '/api/weekly-reports/9', method: 'PUT', headers: {} } as any, {} as any)
  event.context.params = { id: '9' }
  return event
}

describe('PUT /api/weekly-reports/:id — project manager scope', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('readBody', vi.fn(async () => ({ summary: '更新后的周报' })))
    query.mockResolvedValue([{ id: 9, user_id: 8, summary: '更新后的周报' }])
  })

  it('allows a project manager to edit their own report', async () => {
    authorize.mockResolvedValue({ id: 8, role: 'project_manager' })

    await expect(handler(makeEvent())).resolves.toMatchObject({ id: 9, summary: '更新后的周报' })
    expect(authorize).toHaveBeenCalledWith(expect.anything(), 'weekly_report', 'update', '9')
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE weekly_reports SET'), ['更新后的周报', '9'])
  })

  it('rejects a project manager editing another person\'s report', async () => {
    authorize.mockRejectedValue({ statusCode: 403, statusMessage: '只能编辑自己的周报' })

    await expect(handler(makeEvent())).rejects.toMatchObject({ statusCode: 403 })
    expect(query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE weekly_reports SET'), expect.anything())
  })
})
