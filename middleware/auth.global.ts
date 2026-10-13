export default defineNuxtRouteMiddleware(async (to) => {
  const { user } = useAuth()

  // 已登录用户访问 /login 时，跳转首页
  if (to.path === '/login') {
    if (user.value) return navigateTo('/')
    return
  }

  // 用户状态已存在（SSR hydration 后或客户端导航时已加载），直接放行
  if (user.value) return

  // 尝试从服务端加载当前用户信息
  try {
    if (import.meta.server) {
      // SSR 期间：useRequestFetch 会转发浏览器请求中的 cookie（含 httpOnly cookie）
      const requestFetch = useRequestFetch()
      const me = await requestFetch('/api/auth/me')
      user.value = me
    } else {
      // 客户端导航：$fetch 自动携带同源 cookie（含 httpOnly cookie）
      const me = await $fetch('/api/auth/me')
      user.value = me as any
    }
  } catch {
    // token 无效或不存在，跳转登录页
    user.value = null
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
