<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <h1 class="text-xl font-bold text-gray-800">Bug追踪</h1>
        <div class="flex items-center gap-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="searchKeyword" type="text" placeholder="搜索Bug..." class="w-60 pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all" />
          </div>
          <button v-if="can('create', 'bug')" class="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" @click="navigateTo('/bugs/new')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            提交Bug
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Stats -->
        <div class="grid grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-xl p-4 border border-gray-100">
            <div class="text-2xl font-bold text-gray-800">{{ bugs.length }}</div>
            <div class="text-sm text-gray-500 mt-1">全部Bug</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100">
            <div class="text-2xl font-bold text-red-500">{{ criticalCount }}</div>
            <div class="text-sm text-gray-500 mt-1">严重</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100">
            <div class="text-2xl font-bold text-yellow-500">{{ majorCount }}</div>
            <div class="text-sm text-gray-500 mt-1">一般</div>
          </div>
          <div class="bg-white rounded-xl p-4 border border-gray-100">
            <div class="text-2xl font-bold text-green-500">{{ fixedCount }}</div>
            <div class="text-sm text-gray-500 mt-1">已修复</div>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <button
              v-for="filter in statusFilters"
              :key="filter.value"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              :class="activeStatus === filter.value ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
              @click="activeStatus = filter.value"
            >
              {{ filter.label }}
              <span v-if="filter.count !== undefined" class="ml-1 text-xs opacity-75">({{ filter.count }})</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <select v-model="severityFilter" class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-300">
              <option value="all">全部严重程度</option>
              <option value="critical">严重</option>
              <option value="major">一般</option>
              <option value="minor">轻微</option>
              <option value="trivial">微小</option>
            </select>
          </div>
        </div>

        <!-- Bug List -->
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Bug ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">标题</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">严重程度</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">状态</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">指派给</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">创建时间</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bug in filteredBugs" :key="bug.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" @click="navigateTo(`/bugs/${bug.id}`)">
                <td class="px-4 py-3 text-sm text-gray-500 font-mono">{{ bug.id }}</td>
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-gray-800">{{ bug.title }}</div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs font-medium" :class="getSeverityClass(bug.severity)">{{ severityLabel(bug.severity) }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs font-medium" :class="getBugStatusClass(bug.status)">{{ bugStatusLabel(bug.status) }}</span>
                </td>
                <td class="px-4 py-3">
                  <div v-if="bug.assignee" class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium">
                      {{ bug.assignee.name?.charAt(0) || '?' }}
                    </div>
                    <span class="text-sm text-gray-700">{{ bug.assignee.name }}</span>
                  </div>
                  <span v-else class="text-sm text-gray-400">未指派</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(bug.created_at) }}</td>
                <td class="px-4 py-3" @click.stop>
                  <div class="flex items-center gap-2">
                    <select
                      v-if="canMaybeOwn('update', 'bug')"
                      :value="bug.status"
                      class="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 focus:outline-none focus:border-blue-300 cursor-pointer"
                      @change="changeBugStatus(bug, ($event.target as HTMLSelectElement).value)"
                    >
                      <option value="new">新建</option>
                      <option value="confirmed">已确认</option>
                      <option value="in_progress">处理中</option>
                      <option value="fixed">已修复</option>
                      <option value="verified">已验证</option>
                      <option value="closed">已关闭</option>
                      <option value="reopened">重新打开</option>
                    </select>
                    <button
                      v-if="canMaybeOwn('update', 'bug')"
                      class="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                      @click="navigateTo(`/bugs/${bug.id}?edit=true`)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      编辑
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="bugsPending || !selectedProjectId" class="py-20 text-center">
            <p class="text-sm text-gray-400">加载中...</p>
          </div>
          <div v-else-if="filteredBugs.length === 0" class="py-20 text-center">
            <p class="text-sm text-gray-400">暂无Bug数据</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, Severity, BugStatus } from '~/types'
import { SEVERITY_LABELS, SEVERITY_CLASSES, BUG_STATUS_LABELS, BUG_STATUS_CLASSES } from '~/types'

const { can, canMaybeOwn } = useAuth()
const { selectedProjectId } = useProject()

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

const { data: bugsData, pending: bugsPending, refresh } = await useFetch('/api/bugs', {
  server: false,
  immediate: false,
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => [],
  watch: false
})

watch(selectedProjectId, (projectId) => {
  if (!projectId) return
  refresh()
}, { immediate: true })

const searchKeyword = ref('')
const activeStatus = ref('all')
const severityFilter = ref('all')

const bugs = computed(() => bugsData.value || [])

const statusFilters = computed(() => [
  { value: 'all', label: '全部', count: bugs.value.length },
  { value: 'new', label: '新建', count: bugs.value.filter(b => b.status === 'new').length },
  { value: 'in_progress', label: '处理中', count: bugs.value.filter(b => b.status === 'in_progress' || b.status === 'confirmed').length },
  { value: 'fixed', label: '已修复', count: bugs.value.filter(b => b.status === 'fixed').length },
  { value: 'closed', label: '已关闭', count: bugs.value.filter(b => b.status === 'closed').length }
])

const filteredBugs = computed(() => {
  let result = bugs.value
  if (activeStatus.value !== 'all') {
    if (activeStatus.value === 'in_progress') {
      result = result.filter(b => b.status === 'in_progress' || b.status === 'confirmed')
    } else {
      result = result.filter(b => b.status === activeStatus.value)
    }
  }
  if (severityFilter.value !== 'all') {
    result = result.filter(b => b.severity === severityFilter.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(b =>
      (b.title || '').toLowerCase().includes(kw) ||
      String(b.id || '').toLowerCase().includes(kw)
    )
  }
  return result
})

const criticalCount = computed(() => bugs.value.filter(b => b.severity === 'critical').length)
const majorCount = computed(() => bugs.value.filter(b => b.severity === 'major').length)
const fixedCount = computed(() => bugs.value.filter(b => b.status === 'fixed' || b.status === 'verified' || b.status === 'closed').length)

function severityLabel(severity: Severity) {
  return SEVERITY_LABELS[severity] || severity
}

function getSeverityClass(severity: Severity) {
  return SEVERITY_CLASSES[severity] || ''
}

function bugStatusLabel(status: BugStatus) {
  return BUG_STATUS_LABELS[status] || status
}

function getBugStatusClass(status: BugStatus) {
  return BUG_STATUS_CLASSES[status] || ''
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function changeBugStatus(bug: any, newStatus: string) {
  const oldStatus = bug.status
  bug.status = newStatus // 乐观更新
  try {
    await $fetch(`/api/bugs/${bug.id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    await refresh()
  } catch {
    bug.status = oldStatus // 回滚
    alert('更新Bug状态失败，请重试')
  }
}
</script>
