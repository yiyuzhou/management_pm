import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEvent } from 'h3'

const query = vi.fn()
const authorize = vi.fn(async () => ({ id: 1, role: 'admin' }))

vi.mock('~/server/utils/permissions', () => ({ authorize }))
vi.mock('~/server/utils/mysql', () => ({ query }))
vi.mock('~/server/utils/auth', async () => {
  const actual = await vi.importActual<typeof import('~/server/utils/auth')>('~/server/utils/auth')
  return actual
})

const { default: viewHandler } = await import('~/server/api/users/[id]/password.get')
const { default: resetHandler } = await import('~/server/api/users/[id]/reset-password.post')
const { hashPassword, DEFAULT_RESET_PASSWORD } = await import('~/server/utils/auth')

describe('admin user password actions', () => {
  beforeEach(() => {
    query.mockReset()
    authorize.mockResolvedValue({ id: 1, role: 'admin' })
  })

  it('returns the default password when the hash matches', async () => {
    query.mockResolvedValueOnce([{ id: 3, password_hash: hashPassword(DEFAULT_RESET_PASSWORD) }])
    const event = createEvent({ url: '/api/users/3/password', method: 'GET', headers: {} } as any, {} as any)
    ;(event.context as any).params = { id: '3' }
    const result = await viewHandler(event)
    expect(result.password).toBe('123456')
  })

  it('resets the password to 123456', async () => {
    query.mockResolvedValueOnce([{ id: 3 }])
    query.mockResolvedValueOnce({ affectedRows: 1 })
    const event = createEvent({ url: '/api/users/3/reset-password', method: 'POST', headers: {} } as any, {} as any)
    ;(event.context as any).params = { id: '3' }
    const result = await resetHandler(event)
    expect(result.password).toBe('123456')
    expect(query.mock.calls[1][0]).toContain('UPDATE users SET password_hash')
  })
})
