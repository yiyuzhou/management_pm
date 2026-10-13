import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const { query, getCurrentUser } = vi.hoisted(() => ({
  query: vi.fn(),
  getCurrentUser: vi.fn(),
}))

vi.mock('~/server/utils/mysql', () => ({ query }))
vi.mock('~/server/utils/auth', async () => {
  const actual = await vi.importActual<typeof import('~/server/utils/auth')>('~/server/utils/auth')
  return { ...actual, getCurrentUser }
})

const { default: handler } = await import('~/server/api/users/[id]/password.put')
const { hashPassword } = await import('~/server/utils/auth')

function makeEvent(id: string, body: Record<string, string>) {
  vi.stubGlobal('readBody', vi.fn(async () => body))
  const event = createEvent({ url: `/api/users/${id}/password`, method: 'PUT', headers: {} } as any, {} as any)
  ;(event.context as any).params = { id }
  return event
}

describe('PUT /api/users/:id/password', () => {
  beforeEach(() => {
    query.mockReset()
    getCurrentUser.mockReset()
  })

  it('lets a user change their own password with the current password', async () => {
    getCurrentUser.mockResolvedValue({ id: 8, role: 'developer' })
    query
      .mockResolvedValueOnce([{ id: 8, password_hash: hashPassword('oldpass') }])
      .mockResolvedValueOnce({ affectedRows: 1 })

    await expect(handler(makeEvent('8', { current_password: 'oldpass', new_password: 'newpass' })))
      .resolves.toEqual({ success: true })
    expect(query.mock.calls[1][0]).toContain('UPDATE users SET password_hash')
  })

  it('rejects changing someone else password for non-admin', async () => {
    getCurrentUser.mockResolvedValue({ id: 8, role: 'developer' })
    await expect(handler(makeEvent('3', { new_password: 'newpass' })))
      .rejects.toMatchObject({ statusCode: 403 })
  })

  it('lets admin change another user password without current password', async () => {
    getCurrentUser.mockResolvedValue({ id: 1, role: 'admin' })
    query
      .mockResolvedValueOnce([{ id: 3, password_hash: hashPassword('secret') }])
      .mockResolvedValueOnce({ affectedRows: 1 })

    await expect(handler(makeEvent('3', { new_password: 'newpass' })))
      .resolves.toEqual({ success: true })
  })
})
