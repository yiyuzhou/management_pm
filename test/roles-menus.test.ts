import { describe, expect, it } from 'vitest'
import { defaultMenuKeys, permissionRoleOf, sanitizeMenus } from '~/utils/menus'
import { permissionSummary, sanitizePermissionMap, scopesFromStaticMatrix } from '~/utils/permission-matrix'

describe('role menus', () => {
  it('defaults all current menus to existing roles, permissions only for admin', () => {
    expect(defaultMenuKeys('developer')).toContain('requirements')
    expect(defaultMenuKeys('developer')).not.toContain('permissions')
    expect(defaultMenuKeys('admin')).toContain('permissions')
  })

  it('strips unknown keys and keeps permissions exclusive to admin', () => {
    expect(sanitizeMenus(['requirements', 'unknown', 'permissions'], 'developer')).toEqual(['requirements'])
    expect(sanitizeMenus(['team'], 'admin')).toContain('permissions')
  })
})

describe('permissionRoleOf', () => {
  it('uses inherit_role for custom roles and falls back to developer', () => {
    expect(permissionRoleOf({ role: 'admin' })).toBe('admin')
    expect(permissionRoleOf({ role: 'operator', inherit_role: 'pm' })).toBe('pm')
    expect(permissionRoleOf({ role: 'operator', inherit_role: 'nope' })).toBe('developer')
  })
})

describe('role operation permissions', () => {
  it('seeds developer with own-only task update', () => {
    const map = scopesFromStaticMatrix('developer')
    expect(map['task:update']).toBe('own')
    expect(map['project:delete']).toBeUndefined()
    expect(map['bug:create']).toBe('all')
  })

  it('drops invalid keys and upgrades illegal own scope', () => {
    expect(sanitizePermissionMap({ 'project:delete': 'all', 'nope:create': 'all', 'project:update': 'own' })).toEqual({
      'project:delete': 'all',
      'project:update': 'all',
    })
  })

  it('summarizes granted actions', () => {
    expect(permissionSummary({ 'project:read': 'all', 'task:update': 'own' })).toBe('查看 1 · 新建 0 · 编辑 1 · 删除 0')
  })
})
