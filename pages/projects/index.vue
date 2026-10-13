<template>
  <div class="min-h-screen flex bg-slate-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="bg-white border-b border-slate-100 flex items-center justify-between px-8 py-4 flex-shrink-0">
        <!-- Left: Title + Count -->
        <div class="flex items-center gap-3">
          <h1 class="text-[22px] font-bold text-slate-900">项目管理</h1>
          <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">{{ projects.length }} 个项目</span>
        </div>
        <!-- Right: Search + Notification -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="searchKeyword" type="text" placeholder="搜索项目名称..." class="w-60 h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all" />
          </div>
          <NotificationBell tone="outline" />
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <!-- Operation Bar -->
        <div class="flex items-center justify-between mb-6">
          <!-- Left: Filters -->
          <div class="flex items-center gap-3">
            <!-- Status Filter Dropdown -->
            <div class="relative" ref="statusDropdownRef">
              <button
                class="flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors min-w-[120px]"
                @click="showStatusDropdown = !showStatusDropdown"
              >
                <span class="flex-1 text-left">{{ statusFilterLabel }}</span>
                <svg class="w-4 h-4 text-slate-400 transition-transform" :class="showStatusDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-1"
              >
                <div v-if="showStatusDropdown" class="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 min-w-[140px]">
                  <button
                    v-for="filter in statusFilters"
                    :key="filter.value"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left"
                    :class="activeStatus === filter.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'"
                    @click="activeStatus = filter.value; showStatusDropdown = false"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="filter.dotClass"></span>
                    <span class="flex-1">{{ filter.label }}</span>
                    <span class="text-xs text-slate-400">{{ filter.count }}</span>
                  </button>
                </div>
              </Transition>
            </div>
            <!-- Sort Filter Dropdown -->
            <div class="relative" ref="sortDropdownRef">
              <button
                class="flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors min-w-[120px]"
                @click="showSortDropdown = !showSortDropdown"
              >
                <span class="flex-1 text-left">{{ sortFilterLabel }}</span>
                <svg class="w-4 h-4 text-slate-400 transition-transform" :class="showSortDropdown ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 -translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 -translate-y-1"
              >
                <div v-if="showSortDropdown" class="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50 min-w-[140px]">
                  <button
                    v-for="option in sortOptions"
                    :key="option.value"
                    class="w-full flex items-center px-3 py-2 text-sm transition-colors text-left"
                    :class="activeSort === option.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'"
                    @click="activeSort = option.value; showSortDropdown = false"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>
          <!-- Right: New Project Button -->
          <button v-if="can('create', 'project')" class="flex items-center gap-1.5 h-9 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors" @click="openCreateModal">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            新建项目
          </button>
        </div>

        <!-- Project List -->
        <div class="space-y-4">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-[17px] hover:shadow-md transition-shadow cursor-pointer group"
            @click="goToProject(project.id)"
          >
            <!-- Project Icon -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" :style="{ background: `linear-gradient(135deg, ${project.color || '#6366f1'}, ${shiftColor(project.color || '#6366f1')})` }">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>

            <!-- Project Info -->
            <div class="flex-1 min-w-0">
              <!-- Name Row -->
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-base font-semibold text-slate-900 truncate">{{ project.name }}</h3>
                <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-full" v-if="project.status === 'active'">当前</span>
              </div>
              <!-- Description -->
              <p class="text-[13px] text-slate-500 mb-2 truncate">{{ project.description || '暂无描述' }}</p>
              <!-- Meta Info -->
              <div class="flex items-center gap-4 text-xs text-slate-400">
                <div class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span>{{ project.requirement_count || 0 }} 需求</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span>{{ project.member_count || 0 }} 人</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ formatRelativeTime(project.created_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Status & Actions -->
            <div class="flex items-center gap-4 flex-shrink-0" @click.stop>
              <!-- Status Label -->
              <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" :class="getStatusPillClass(project.status)">
                <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(project.status)"></span>
                {{ getStatusLabel(project.status) }}
              </span>
              <!-- Enter Button -->
              <button class="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[13px] font-medium transition-colors" @click="goToProject(project.id)">
                进入项目
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <!-- More Actions -->
              <div v-if="can('update', 'project') || can('delete', 'project')" class="relative">
                <button
                  class="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                  @click.stop="toggleActionMenu(project.id)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </button>
                <div
                  v-if="openMenuId === project.id"
                  class="absolute right-0 top-full mt-1 w-28 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20"
                  @click.stop
                >
                  <button
                    v-if="can('update', 'project')"
                    class="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    @click="openEditModal(project)"
                  >
                    编辑
                  </button>
                  <button
                    v-if="can('delete', 'project')"
                    class="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    @click="openDeleteModal(project)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredProjects.length === 0" class="py-20 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <p class="text-sm text-slate-400">暂无项目数据</p>
        </div>

        <!-- Pagination -->
        <div v-if="filteredProjects.length > 0" class="flex items-center justify-between pt-8 mt-2">
          <!-- Page Info -->
          <div class="text-[13px] text-slate-500">
            显示 <span class="font-medium text-slate-800">1</span> 到 <span class="font-medium text-slate-800">{{ filteredProjects.length }}</span> 条，共 <span class="font-medium text-slate-800">{{ filteredProjects.length }}</span> 条记录
          </div>
          <!-- Page Buttons -->
          <div class="flex items-center gap-1">
            <button class="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" disabled>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button class="w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-lg text-[13px] font-medium">1</button>
            <button class="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" disabled>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Project Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeFormModal">
          <div class="bg-white rounded-xl w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 class="text-lg font-bold text-slate-800">{{ editingProjectId ? '编辑项目' : '新建项目' }}</h3>
              <button class="text-slate-400 hover:text-slate-600" @click="closeFormModal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">项目名称 <span class="text-red-500">*</span></label>
                <input v-model="newProject.name" type="text" placeholder="请输入项目名称" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">项目描述</label>
                <textarea v-model="newProject.description" rows="3" placeholder="请输入项目描述" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">项目状态</label>
                  <select v-model="newProject.status" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all">
                    <option value="planning">规划中</option>
                    <option value="active">进行中</option>
                    <option value="paused">已暂停</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">项目颜色</label>
                  <div class="flex items-center gap-2">
                    <button v-for="color in projectColors" :key="color" class="w-8 h-8 rounded-lg border-2 transition-all" :class="newProject.color === color ? 'border-slate-800' : 'border-transparent'" :style="{ backgroundColor: color }" @click="newProject.color = color"></button>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">开始日期</label>
                  <input v-model="newProject.start_date" type="date" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">预计结束日期</label>
                  <input v-model="newProject.end_date" type="date" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                </div>
              </div>
              <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
              <button class="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors" @click="closeFormModal">取消</button>
              <button class="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newProject.name || submitting" @click="saveProject">
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {{ editingProjectId ? '保存' : '创建' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal && deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeDeleteModal"></div>
          <div class="relative w-96 bg-white rounded-2xl shadow-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-800">{{ deleteBlocked ? '无法删除' : '确认删除' }}</h3>
                <p class="text-sm text-slate-500 mt-0.5">{{ deleteModalMessage }}</p>
              </div>
            </div>
            <p v-if="deleteError" class="text-sm text-red-500 mb-3">{{ deleteError }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors" @click="closeDeleteModal">
                {{ deleteBlocked ? '我知道了' : '取消' }}
              </button>
              <button
                v-if="!deleteBlocked"
                class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                :disabled="deleting"
                @click="confirmDeleteProject"
              >
                {{ deleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, ProjectStatus } from '~/types'
import { PROJECT_STATUS_LABELS } from '~/types'

const { can } = useAuth()

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

const { data: projectsData, refresh } = await useFetch('/api/projects', {
  default: () => [] as any[]
})

const router = useRouter()
const projects = computed(() => (projectsData.value as any[]) || [])

const searchKeyword = ref('')
const activeStatus = ref('all')
const activeSort = ref('updated')
const showCreateModal = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const editingProjectId = ref<number | null>(null)
const openMenuId = ref<number | null>(null)
const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)
const deleteError = ref('')
const showStatusDropdown = ref(false)
const showSortDropdown = ref(false)
const statusDropdownRef = ref<HTMLElement | null>(null)
const sortDropdownRef = ref<HTMLElement | null>(null)

const projectColors = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6']

const activeCount = computed(() => projects.value.filter(p => p.status === 'active').length)
const planningCount = computed(() => projects.value.filter(p => p.status === 'planning').length)
const completedCount = computed(() => projects.value.filter(p => p.status === 'completed' || p.status === 'archived').length)

const statusFilters = computed(() => [
  { value: 'all', label: '全部状态', count: projects.value.length, dotClass: 'bg-slate-400' },
  { value: 'active', label: '进行中', count: activeCount.value, dotClass: 'bg-green-500' },
  { value: 'planning', label: '规划中', count: planningCount.value, dotClass: 'bg-blue-500' },
  { value: 'completed', label: '已完成', count: completedCount.value, dotClass: 'bg-indigo-500' }
])

const sortOptions = [
  { value: 'updated', label: '最近更新' },
  { value: 'created', label: '最新创建' },
  { value: 'name', label: '项目名称' }
]

const statusFilterLabel = computed(() => {
  const found = statusFilters.value.find(f => f.value === activeStatus.value)
  return found?.label || '全部状态'
})

const sortFilterLabel = computed(() => {
  const found = sortOptions.find(o => o.value === activeSort.value)
  return found?.label || '最近更新'
})

const filteredProjects = computed(() => {
  let result = projects.value
  if (activeStatus.value !== 'all') {
    if (activeStatus.value === 'completed') {
      result = result.filter(p => p.status === 'completed' || p.status === 'archived')
    } else {
      result = result.filter(p => p.status === activeStatus.value)
    }
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p =>
      p.name?.toLowerCase().includes(keyword) ||
      p.description?.toLowerCase().includes(keyword)
    )
  }
  // Sort
  if (activeSort.value === 'name') {
    result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  } else if (activeSort.value === 'created') {
    result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else {
    // updated - use created_at as fallback
    result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  return result
})

function getStatusLabel(status: string) {
  return PROJECT_STATUS_LABELS[status as ProjectStatus] || status
}

function getStatusPillClass(status: string) {
  const map: Record<string, string> = {
    planning: 'bg-blue-50 text-blue-600',
    active: 'bg-green-50 text-green-600',
    paused: 'bg-yellow-50 text-yellow-600',
    completed: 'bg-indigo-50 text-indigo-600',
    archived: 'bg-slate-100 text-slate-400'
  }
  return map[status] || 'bg-slate-100 text-slate-500'
}

function getStatusDotClass(status: string) {
  const map: Record<string, string> = {
    planning: 'bg-blue-500',
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    completed: 'bg-indigo-500',
    archived: 'bg-slate-400'
  }
  return map[status] || 'bg-slate-400'
}

function shiftColor(hex: string): string {
  // Shift the color to create a gradient end color
  const colors: Record<string, string> = {
    '#6366f1': '#8b5cf6',
    '#3b82f6': '#6366f1',
    '#10b981': '#06b6d4',
    '#8b5cf6': '#a855f7',
    '#f59e0b': '#f97316',
    '#ef4444': '#f43f5e',
    '#ec4899': '#f43f5e'
  }
  return colors[hex] || '#8b5cf6'
}

function formatRelativeTime(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const now = new Date()
  const target = new Date(dateStr)
  const diff = now.getTime() - target.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `更新于 ${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `更新于 ${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `更新于 ${days} 天前`
  const d = new Date(dateStr)
  return `更新于 ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function goToProject(id: number) {
  router.push(`/projects/${id}`)
}

function toDateInput(value?: string | null) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function resetProjectForm() {
  newProject.name = ''
  newProject.description = ''
  newProject.status = 'planning'
  newProject.color = '#6366f1'
  newProject.start_date = new Date().toISOString().slice(0, 10)
  newProject.end_date = ''
  errorMessage.value = ''
}

function openCreateModal() {
  editingProjectId.value = null
  resetProjectForm()
  showCreateModal.value = true
}

function closeFormModal() {
  showCreateModal.value = false
  editingProjectId.value = null
  errorMessage.value = ''
}

function toggleActionMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function openEditModal(project: any) {
  openMenuId.value = null
  editingProjectId.value = project.id
  newProject.name = project.name || ''
  newProject.description = project.description || ''
  newProject.status = project.status || 'planning'
  newProject.color = project.color || '#6366f1'
  newProject.start_date = toDateInput(project.start_date)
  newProject.end_date = toDateInput(project.end_date)
  errorMessage.value = ''
  showCreateModal.value = true
}

const deleteBlocked = computed(() => (deleteTarget.value?.requirement_count || 0) > 0)
const deleteModalMessage = computed(() => {
  const item = deleteTarget.value
  if (!item) return ''
  if ((item.requirement_count || 0) > 0) {
    return `项目「${item.name}」下还有 ${item.requirement_count} 个需求，请先删除这些需求后再删除项目。`
  }
  return `确定要删除项目「${item.name}」吗？此操作不可恢复。`
})

function openDeleteModal(project: any) {
  openMenuId.value = null
  deleteTarget.value = project
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTarget.value = null
  deleteError.value = ''
}

async function confirmDeleteProject() {
  if (!deleteTarget.value || deleting.value || deleteBlocked.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/projects/${deleteTarget.value.id}`, { method: 'DELETE' })
    closeDeleteModal()
    await refresh()
  } catch (e: any) {
    deleteError.value = e.data?.message || e.statusMessage || '删除失败'
  } finally {
    deleting.value = false
  }
}

async function saveProject() {
  submitting.value = true
  errorMessage.value = ''
  const body = {
    name: newProject.name,
    description: newProject.description,
    status: newProject.status,
    color: newProject.color,
    start_date: newProject.start_date || null,
    end_date: newProject.end_date || null
  }
  try {
    if (editingProjectId.value) {
      await $fetch(`/api/projects/${editingProjectId.value}`, { method: 'PUT', body })
    } else {
      await $fetch('/api/projects', { method: 'POST', body })
    }
    closeFormModal()
    resetProjectForm()
    await refresh()
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || (editingProjectId.value ? '保存失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

// Close dropdowns on outside click
function handleClickOutside(e: MouseEvent) {
  if (statusDropdownRef.value && !statusDropdownRef.value.contains(e.target as Node)) {
    showStatusDropdown.value = false
  }
  if (sortDropdownRef.value && !sortDropdownRef.value.contains(e.target as Node)) {
    showSortDropdown.value = false
  }
  openMenuId.value = null
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const newProject = reactive({
  name: '',
  description: '',
  status: 'planning' as ProjectStatus,
  color: '#6366f1',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: ''
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
