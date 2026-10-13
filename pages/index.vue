<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-3">
          <h1 class="text-xl font-bold text-gray-800">仪表盘</h1>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors"
            @click="showUsageGuide = true"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"/>
            </svg>
            使用说明
          </button>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="全局搜索..." class="w-60 pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all" />
          </div>
          <NotificationBell />
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl p-5 border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" @click="navigateTo('/requirements')">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">需求总数</span>
              <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ stats?.requirements ?? 0 }}</div>
            <div class="text-xs text-gray-400 mt-2">全部分类</div>
          </div>

          <div class="bg-white rounded-xl p-5 border border-gray-100 cursor-pointer hover:shadow-md hover:border-green-200 transition-all" @click="navigateTo('/tasks')">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">进行中任务</span>
              <div class="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ stats?.pendingTasks ?? 0 }}</div>
            <div class="text-xs text-gray-400 mt-2">已完成 {{ stats?.doneTasks ?? 0 }}</div>
          </div>

          <div class="bg-white rounded-xl p-5 border border-gray-100 cursor-pointer hover:shadow-md hover:border-red-200 transition-all" @click="navigateTo('/bugs')">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">待处理Bug</span>
              <div class="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ stats?.openBugs ?? 0 }}</div>
            <div class="text-xs text-gray-400 mt-2">待修复</div>
          </div>

          <div class="bg-white rounded-xl p-5 border border-gray-100 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all" @click="navigateTo('/iteration')">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">迭代完成进度</span>
              <div class="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            </div>
            <div class="text-2xl font-bold text-gray-800">{{ iterationProgress?.progress ?? 0 }}%</div>
            <div class="text-xs text-gray-400 mt-1 truncate">{{ iterationProgress?.name || '暂无迭代' }} · 已完成 {{ iterationProgress?.done ?? 0 }}/{{ iterationProgress?.total ?? 0 }}</div>
            <div class="w-full h-1.5 bg-gray-100 rounded-full mt-2">
              <div class="h-full bg-purple-500 rounded-full transition-all" :style="{ width: (iterationProgress?.progress ?? 0) + '%' }"></div>
            </div>
          </div>
        </div>

        <DashboardIterationChart :points="iterationRequirements" />

        <!-- Two Column Layout -->
        <div class="grid grid-cols-3 gap-6">
          <!-- Left: Todo & Activity -->
          <div class="col-span-2 space-y-6">
            <!-- My Todos -->
            <div class="bg-white rounded-xl p-5 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-800">我的待办</h3>
                <NuxtLink to="/tasks" class="text-sm text-blue-500 hover:text-blue-600">查看任务</NuxtLink>
              </div>
              <div v-if="todos.length > 0" class="space-y-3">
                <div
                  v-for="(todo, i) in todos"
                  :key="todo.id || i"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:border-blue-200 border border-transparent transition-colors cursor-pointer"
                  @click="openTodo(todo)"
                >
                  <span class="w-2 h-2 rounded-full" :class="getPriorityClass(todo.priority)"></span>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ todo.title }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">{{ formatDate(todo.time) }}</div>
                  </div>
                  <span class="px-2 py-0.5 text-xs rounded" :class="getTodoTagClass(todo.type)">{{ todoTypeLabel(todo.type) }}</span>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-400 text-sm">暂无待办</div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-xl p-5 border border-gray-100">
              <h3 class="font-semibold text-gray-800 mb-4">最近动态</h3>
              <div v-if="activities.length > 0" class="space-y-4">
                <div v-for="(activity, i) in activities" :key="i" class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {{ activity.user?.charAt(0) || '?' }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm">
                      <span class="font-medium text-gray-800">{{ activity.user }}</span>
                      <span class="text-gray-500"> {{ activity.action }} </span>
                      <span class="font-medium text-gray-800">{{ activity.target }}</span>
                    </div>
                    <div class="text-xs text-gray-400 mt-0.5">{{ formatRelativeTime(activity.time) }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-400 text-sm">暂无动态</div>
            </div>
          </div>

          <!-- Right: Team & Milestones -->
          <div class="space-y-6">
            <!-- Team Members -->
            <div class="bg-white rounded-xl p-5 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-800">团队成员</h3>
                <NuxtLink to="/team" class="text-sm text-blue-500 hover:text-blue-600">管理</NuxtLink>
              </div>
              <div v-if="meta?.users?.length" class="space-y-3">
                <div v-for="member in meta.users.slice(0, 5)" :key="member.id" class="flex items-center gap-3">
                  <div class="relative">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-sm font-medium">
                      {{ member.name?.charAt(0) || '?' }}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-800">{{ member.name }}</div>
                    <div class="text-xs text-gray-400">{{ getRoleLabel(member.role) }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-400 text-sm">暂无成员</div>
            </div>

            <!-- Requirement Status Distribution -->
            <div class="bg-white rounded-xl p-5 border border-gray-100">
              <h3 class="font-semibold text-gray-800 mb-4">需求状态分布</h3>
              <div v-if="requirementStatus.length > 0" class="space-y-3">
                <div v-for="item in requirementStatus" :key="item.status" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(item.status)"></span>
                    <span class="text-sm text-gray-600">{{ getStatusLabel(item.status) }}</span>
                  </div>
                  <span class="text-sm font-medium text-gray-800">{{ item.count }}</span>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-400 text-sm">暂无数据</div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <UsageGuideModal v-model="showUsageGuide" />
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse } from '~/types'

const { selectedProjectId } = useProject()
const showUsageGuide = ref(false)

const { data: meta } = await useFetch('/api/meta', {
  server: false,
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

const { data: dashboardData } = await useFetch('/api/dashboard/stats', {
  server: false,
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({
    stats: { requirements: 0, pendingTasks: 0, doneTasks: 0, openBugs: 0 },
    requirementStatus: [],
    iterationProgress: null,
    iterationRequirements: [],
    recentActivities: [],
    todos: []
  })
})

const stats = computed(() => dashboardData.value?.stats)
const requirementStatus = computed(() => dashboardData.value?.requirementStatus || [])
const iterationProgress = computed(() => dashboardData.value?.iterationProgress)
const iterationRequirements = computed(() => dashboardData.value?.iterationRequirements || [])
const activities = computed(() => dashboardData.value?.recentActivities || [])
const todos = computed(() => dashboardData.value?.todos || [])

function openTodo(todo: { id?: string; kind?: string }) {
  if (todo.kind === 'bug' && todo.id) {
    navigateTo(`/bugs/${todo.id}`)
    return
  }
  if (todo.id) {
    navigateTo({ path: '/tasks', query: { task: todo.id } })
    return
  }
  navigateTo('/tasks')
}

function todoTypeLabel(type: string) {
  const map: Record<string, string> = {
    development: '开发',
    design: '设计',
    test: '测试',
    research: '调研',
    feature: '功能',
    bug: 'Bug'
  }
  return map[type] || type
}

function getTodoTagClass(type: string) {
  const map: Record<string, string> = {
    'feature': 'bg-blue-50 text-blue-500',
    'bug': 'bg-red-50 text-red-500',
    'design': 'bg-purple-50 text-purple-500',
    'test': 'bg-green-50 text-green-500',
    'doc': 'bg-gray-50 text-gray-500',
    '评审': 'bg-purple-50 text-purple-500',
    '开发': 'bg-blue-50 text-blue-500',
    'Bug': 'bg-red-50 text-red-500',
    '文档': 'bg-gray-50 text-gray-500'
  }
  return map[type] || 'bg-gray-50 text-gray-500'
}

function getPriorityClass(priority: string) {
  const map: Record<string, string> = {
    'urgent': 'bg-red-500',
    'high': 'bg-red-400',
    'medium': 'bg-yellow-400',
    'low': 'bg-green-400'
  }
  return map[priority] || 'bg-gray-400'
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    'pm': '产品经理',
    'project_manager': '项目经理',
    'developer': '开发工程师',
    'tester': '测试工程师',
    'admin': '管理员'
  }
  return map[role] || role
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    'draft': '草稿',
    'pending': '评审中',
    'reviewing': '评审中',
    'in_review': '评审中',
    'approved': '已确定',
    'in_progress': '进行中',
    'completed': '已完成',
    'rejected': '已驳回',
    'closed': '已关闭'
  }
  return map[status] || status
}

function getStatusDotClass(status: string) {
  const map: Record<string, string> = {
    'draft': 'bg-gray-400',
    'pending': 'bg-orange-400',
    'reviewing': 'bg-yellow-400',
    'in_review': 'bg-yellow-400',
    'approved': 'bg-blue-400',
    'in_progress': 'bg-indigo-400',
    'completed': 'bg-green-500',
    'rejected': 'bg-red-400',
    'closed': 'bg-gray-500'
  }
  return map[status] || 'bg-gray-400'
}

function formatDate(date: string | null | undefined) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatRelativeTime(date: string | null | undefined) {
  if (!date) return ''
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return formatDate(date)
}
</script>
