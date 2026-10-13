import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ ownerId: 8 }))

vi.mock('~/server/utils/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 8, role: 'project_manager' })),
}))
vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async () => [{ user_id: state.ownerId }]),
}))

const { authorize } = await import('~/server/utils/permissions')

describe('project manager — weekly report permissions', () => {
  beforeEach(() => { state.ownerId = 8 })

  it('can update only their own weekly report', async () => {
    await expect(authorize({}, 'weekly_report', 'update', 9)).resolves.toMatchObject({ role: 'project_manager' })

    state.ownerId = 3
    await expect(authorize({}, 'weekly_report', 'update', 9)).rejects.toMatchObject({ statusCode: 403 })
  })

  it('can read and delete all weekly reports', async () => {
    await expect(authorize({}, 'weekly_report', 'read')).resolves.toMatchObject({ role: 'project_manager' })
    await expect(authorize({}, 'weekly_report', 'delete', 3)).resolves.toMatchObject({ role: 'project_manager' })
  })
})
