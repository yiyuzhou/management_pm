import { describe, expect, it, vi } from 'vitest'

vi.mock('~/server/utils/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 8, role: 'project_manager' })),
}))

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async () => []),
}))

const { authorize } = await import('~/server/utils/permissions')

describe('role permissions — project_manager', () => {
  it('can manage business resources', async () => {
    await expect(authorize({}, 'project', 'delete', 1)).resolves.toMatchObject({ role: 'project_manager' })
    await expect(authorize({}, 'prototype', 'create')).resolves.toMatchObject({ role: 'project_manager' })
  })

  it('cannot create or update user accounts', async () => {
    await expect(authorize({}, 'user', 'create')).rejects.toMatchObject({ statusCode: 403 })
    await expect(authorize({}, 'user', 'update', 1)).rejects.toMatchObject({ statusCode: 403 })
  })
})
