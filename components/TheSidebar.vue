<template>
  <aside class="w-[240px] h-screen sticky top-0 bg-white flex flex-col border-r border-gray-100 flex-shrink-0">
    <!-- Logo Area -->
    <div class="h-[88px] flex items-center px-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M3 10v4" />
            <path d="M7 6v12" />
            <path d="M11 3v18" />
            <path d="M15 7v10" />
            <path d="M19 10v4" />
          </svg>
        </div>
        <div>
          <div class="text-base font-bold text-gray-800 leading-6">VoiceTeam</div>
          <div class="text-xs text-gray-400 leading-4">媲美语音团队管理平台</div>
        </div>
      </div>
    </div>

    <!-- Project Switcher -->
    <div class="px-4 pb-2 relative" ref="projectSwitcherRef">
      <button
        class="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
        @click="showProjectDropdown = !showProjectDropdown"
      >
        <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ backgroundColor: currentProject?.color || '#3b82f6' }"></span>
        <span class="text-sm text-gray-700 flex-1 truncate text-left">{{ currentProject?.name || '选择项目' }}</span>
        <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" :class="showProjectDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 -translate-y-1"
      >
        <div
          v-if="showProjectDropdown"
          class="absolute left-4 right-4 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 max-h-64 overflow-y-auto"
        >
          <div v-if="projectList.length === 0" class="px-3 py-4 text-center text-sm text-gray-400">
            暂无项目
          </div>
          <button
            v-for="proj in projectList"
            :key="proj.id"
            class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
            :class="proj.id === selectedProjectId ? 'bg-blue-50' : ''"
            @click="selectProject(proj.id)"
          >
            <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ backgroundColor: proj.color || '#3b82f6' }"></span>
            <span class="text-sm text-gray-700 flex-1 truncate text-left">{{ proj.name }}</span>
            <svg v-if="proj.id === selectedProjectId" class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
          <div class="border-t border-gray-100 mt-1 pt-1">
            <NuxtLink to="/projects" class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors" @click="showProjectDropdown = false">
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="text-sm text-gray-500">管理项目</span>
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto px-4 py-2">
      <div class="space-y-1">
        <NuxtLink
          v-for="item in visibleMenuItems"
          :key="item.key"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors"
          :class="isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'"
        >
          <span class="w-5 h-5 flex items-center justify-center flex-shrink-0" v-html="item.icon"></span>
          <span class="text-sm font-medium flex-1">{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="px-2 py-0.5 text-xs font-medium rounded-full"
            :class="isActive(item.path) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </div>
    </nav>

    <!-- User Info -->
    <div class="p-4 border-t border-gray-100 mt-auto flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
            {{ authUser?.nickname?.charAt(0) || '?' }}
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-800 truncate">{{ authUser?.nickname || '未登录' }}</div>
          <div class="text-xs text-gray-400 truncate">{{ roleLabel }}</div>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="handleLogout">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  totalCount?: number
}>()

const route = useRoute()
const { user: authUser, roleLabel, logout } = useAuth()

async function handleLogout() {
  await logout()
}

const { selectedProjectId, selectProject: selectProjectShared } = useProject()

const { data: projects, pending: projectsPending } = useFetch('/api/projects', {
  server: false,
  default: () => []
})

// Fetch requirement count filtered by current project
// This ensures the sidebar badge is always project-specific,
// regardless of which page renders the sidebar
const { data: sidebarMeta } = useFetch<{ totalCount: number; myBugCount?: number; myTaskCount?: number }>('/api/meta', {
  server: false,
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, myBugCount: 0, myTaskCount: 0 })
})

const reqCount = computed(() => sidebarMeta.value?.totalCount ?? 0)
const myBugCount = computed(() => sidebarMeta.value?.myBugCount ?? 0)
const myTaskCount = computed(() => sidebarMeta.value?.myTaskCount ?? 0)

const projectList = computed(() => (projects.value as any[]) || [])

const showProjectDropdown = ref(false)
const projectSwitcherRef = ref<HTMLElement | null>(null)

const currentProject = computed(() => {
  const list = projectList.value
  if (list.length === 0) return null
  return list.find(p => Number(p.id) === Number(selectedProjectId.value)) || list[0]
})

watch([projectList, projectsPending], ([list, pending]) => {
  if (pending) return
  if (list.length === 0) return
  const stillVisible = list.some(p => Number(p.id) === Number(selectedProjectId.value))
  if (!stillVisible) {
    selectProjectShared(list[0].id)
  }
}, { immediate: true })

function selectProject(id: number) {
  selectProjectShared(id)
  showProjectDropdown.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (projectSwitcherRef.value && !projectSwitcherRef.value.contains(e.target as Node)) {
    showProjectDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 项目管理菜单始终跳转到项目列表页，点击具体项目后才进入项目详情
const projectMenuPath = '/projects'

const menuItems = computed(() => [
  {
    key: 'dashboard',
    label: '仪表盘',
    path: '/',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
  },
  {
    key: 'projects',
    label: '项目管理',
    path: projectMenuPath,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`
  },
  {
    key: 'requirements',
    label: '需求池',
    path: '/requirements',
    badge: reqCount.value || undefined,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`
  },
  {
    key: 'prototype',
    label: '原型中心',
    path: '/prototype',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`
  },
  {
    key: 'tasks',
    label: '任务看板',
    path: '/tasks',
    badge: myTaskCount.value || undefined,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>`
  },
  {
    key: 'bugs',
    label: 'Bug追踪',
    path: '/bugs',
    badge: myBugCount.value || undefined,
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"/></svg>`
  },
  {
    key: 'weekly',
    label: '周报',
    path: '/weekly',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`
  },
  {
    key: 'iteration',
    label: '迭代管理',
    path: '/iteration',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`
  },
  {
    key: 'team',
    label: '团队',
    path: '/team',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
  },
  {
    key: 'permissions',
    label: '权限管理',
    path: '/permissions',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`
  }
])

const visibleMenuItems = computed(() => {
  const menus = authUser.value?.menus
  return menuItems.value.filter((item) => {
    if (item.key === 'permissions') return authUser.value?.role === 'admin'
    if (!menus) return true
    return menus.includes(item.key)
  })
})

const isActive = (path: string) => {
  if (!path) return false
  if (path === '/') {
    return route.path === '/'
  }
  // 项目管理菜单：在项目列表页或项目详情页都高亮
  if (path === '/projects' || path.startsWith('/projects/')) {
    return route.path === '/projects' || route.path.startsWith('/projects/')
  }
  return route.path.startsWith(path)
}
</script>
