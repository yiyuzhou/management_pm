import type { CurrentUser } from '~/types'
import { PERMISSION_MATRIX, scopesFromStaticMatrix } from '~/utils/permission-matrix'

type Role = 'admin' | 'pm' | 'project_manager' | 'developer' | 'tester'
type Resource = 'project' | 'requirement' | 'task' | 'bug' | 'iteration' | 'prototype' | 'weekly_report' | 'user'
type Action = 'create' | 'read' | 'update' | 'delete'

const ROLE_LABELS: Record<Role, string> = {
  admin: '管理员',
  pm: '产品经理',
  project_manager: '项目经理',
  developer: '开发',
  tester: '测试',
}

/**
 * 全局认证状态 composable
 * 封装当前用户信息和权限判断方法
 */
export function useAuth() {
  // 使用 Nuxt useState 实现跨组件共享
  const user = useState<CurrentUser | null>('auth_user', () => null)

  const isLoggedIn = computed(() => !!user.value)
  const role = computed<Role | null>(() => {
    const slug = user.value?.inherit_role || user.value?.role
    return (slug as Role) || null
  })
  const roleLabel = computed(() => {
    if (!user.value) return ''
    if (user.value.role_name) return user.value.role_name
    const slug = user.value.role as Role
    return ROLE_LABELS[slug] || user.value.role
  })

  /**
   * 判断当前用户是否有权执行某操作
   * 注意：前端只判断全局权限，不判断 own resource（前端无法确定资源归属）
   * own resource 的检查由后端 authorize 函数兜底
   */
  function can(action: Action, resource: Resource): boolean {
    if (!user.value) return false
    const key = `${resource}:${action}`
    const stored = user.value.permissions
    if (stored) return stored[key] === 'all'
    const r = (user.value.inherit_role || user.value.role) as Role
    const entry = PERMISSION_MATRIX[key]
    if (!entry) return false
    return entry.roles.includes(r)
  }

  /**
   * 判断当前用户是否有可能通过 own resource 权限执行某操作
   * 用于 UI 层判断是否显示"编辑"按钮（即使全局权限不通过，own 权限可能通过）
   */
  function canMaybeOwn(action: Action, resource: Resource): boolean {
    if (!user.value) return false
    const key = `${resource}:${action}`
    const stored = user.value.permissions
    if (stored) return stored[key] === 'all' || stored[key] === 'own'
    const r = (user.value.inherit_role || user.value.role) as Role
    const fallback = scopesFromStaticMatrix(r)
    return fallback[key] === 'all' || fallback[key] === 'own'
  }

  /**
   * 判断当前用户是否是某个资源的创建者或负责人
   */
  function isOwnResource(
    item: { creator?: { id: number } | null; assignee?: { id: number } | null; reporter?: { id: number } | null; user_id?: number }
  ): boolean {
    if (!user.value) return false
    const userId = user.value.id
    if (item.user_id === userId) return true
    if (item.creator?.id === userId) return true
    if (item.assignee?.id === userId) return true
    if (item.reporter?.id === userId) return true
    return false
  }

  /**
   * 登出
   */
  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    isLoggedIn,
    role,
    roleLabel,
    can,
    canMaybeOwn,
    isOwnResource,
    logout,
  }
}
