<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <h1 class="text-xl font-bold text-gray-800">迭代管理</h1>
        <div class="flex items-center gap-3">
          <button v-if="can('create', 'iteration')" class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" @click="showCreateModal = true">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            新建迭代
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Current Iteration -->
        <div v-if="activeIteration" class="bg-white rounded-xl p-5 border border-gray-100 mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-lg font-bold text-gray-800">{{ activeIteration.name }}</h2>
                <span class="px-2 py-0.5 bg-green-50 text-green-500 rounded text-xs font-medium">进行中</span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ formatDate(activeIteration.start_date) }} - {{ formatDate(activeIteration.end_date) }}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-800">{{ activeIteration.requirement_count }}</div>
              <div class="text-xs text-gray-400">需求数</div>
            </div>
          </div>
        </div>

        <!-- Iteration List -->
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold text-gray-800">迭代列表</h3>
            <div class="flex items-center gap-2">
              <select v-model="statusFilter" class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-300">
                <option value="all">全部状态</option>
                <option value="active">进行中</option>
                <option value="planning">已规划</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/50">
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">迭代名称</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">状态</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">时间范围</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">需求数</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">创建人</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="iter in filteredIterations"
                :key="iter.id"
                :id="`iteration-${iter.id}`"
                class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                :class="{ 'bg-blue-50': String(highlightedIterationId) === String(iter.id) }"
              >
                <td class="px-5 py-4">
                  <div class="font-medium text-gray-800">{{ iter.name }}</div>
                </td>
                <td class="px-5 py-4 whitespace-nowrap">
                  <InlineStatusSelect
                    :status="iter.status"
                    :options="iterationStatusOptions"
                    :editable="can('update', 'iteration')"
                    @change="status => changeIterationStatus(iter, status)"
                  />
                </td>
                <td class="px-5 py-4 text-sm text-gray-600">{{ formatDate(iter.start_date) }} - {{ formatDate(iter.end_date) }}</td>
                <td class="px-5 py-4 text-sm text-gray-600">
                  <span class="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer" @click="goToRequirements(iter)">{{ iter.requirement_count }} 个需求</span>
                </td>
                <td class="px-5 py-4 text-sm text-gray-600">{{ iter.creator_name || '—' }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <button v-if="iter.status !== 'completed' && can('update', 'iteration')" class="px-2 py-1 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" @click="openEditModal(iter)">编辑</button>
                    <button v-if="iter.status === 'active' && can('update', 'iteration')" class="px-2 py-1 text-xs text-green-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors" @click="completeIteration(iter)">完成</button>
                    <button v-if="can('delete', 'iteration')" class="px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" @click="onDelete(iter)">删除</button>
                    <span v-if="iter.status === 'completed' && !can('delete', 'iteration')" class="text-xs text-gray-400">已结束</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="iterationsPending || !selectedProjectId" class="py-12 text-center text-sm text-gray-400">加载中...</div>
          <div v-else-if="filteredIterations.length === 0" class="py-12 text-center text-sm text-gray-400">暂无迭代数据</div>
        </div>
      </div>
    </main>

    <!-- Create Iteration Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
          <div class="bg-white rounded-xl w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">新建迭代</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="closeModal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">迭代名称 <span class="text-red-500">*</span></label>
                <input v-model="newIteration.name" type="text" placeholder="例如：2024 Q4 Sprint 5" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">迭代描述</label>
                <textarea v-model="newIteration.description" rows="3" placeholder="请输入迭代目标和描述" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">所属项目</label>
                <select v-model="newIteration.project_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="">请选择项目</option>
                  <option v-for="p in meta?.projects || []" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">迭代状态</label>
                <select v-model="newIteration.status" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="planning">规划中</option>
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">开始日期 <span class="text-red-500">*</span></label>
                  <input v-model="newIteration.start_date" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">结束日期 <span class="text-red-500">*</span></label>
                  <input v-model="newIteration.end_date" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
                </div>
              </div>
              <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="closeModal">取消</button>
              <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newIteration.name || !newIteration.start_date || !newIteration.end_date || submitting" @click="createIteration">
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                创建
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Iteration Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeEditModal">
          <div class="bg-white rounded-xl w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">编辑迭代</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">迭代名称 <span class="text-red-500">*</span></label>
                <input v-model="editIteration.name" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">所属项目</label>
                <select v-model="editIteration.project_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="">请选择项目</option>
                  <option v-for="p in meta?.projects || []" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">迭代状态</label>
                <select v-model="editIteration.status" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="planning">规划中</option>
                  <option value="active">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">开始日期</label>
                  <input v-model="editIteration.start_date" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">结束日期</label>
                  <input v-model="editIteration.end_date" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
                </div>
              </div>
              <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="closeEditModal">取消</button>
              <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50" :disabled="!editIteration.name || submitting" @click="saveIteration">
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                保存
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteModalVisible" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="deleteModalVisible = false"></div>
          <div class="relative w-96 bg-white rounded-2xl shadow-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-800">{{ deleteBlocked ? '无法删除' : '确认删除' }}</h3>
                <p class="text-sm text-gray-500 mt-0.5">{{ deleteModalMessage }}</p>
              </div>
            </div>
            <p v-if="deleteErrorMessage" class="text-sm text-red-500 mb-2">{{ deleteErrorMessage }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button
                class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                @click="deleteModalVisible = false"
              >
                {{ deleteBlocked ? '我知道了' : '取消' }}
              </button>
              <button
                v-if="deleteBlocked"
                class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                @click="goDeleteTargetRequirements"
              >
                去删除关联需求
              </button>
              <button
                v-else
                class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                :disabled="deleting"
                @click="confirmDelete"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse } from '~/types'
import InlineStatusSelect from '~/components/InlineStatusSelect.vue'

const { can } = useAuth()
const { selectedProjectId } = useProject()
const route = useRoute()
const highlightedIterationId = computed(() => String(route.query.id || ''))

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

const { data: iterationsData, pending: iterationsPending, refresh } = await useFetch('/api/iterations', {
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

const statusFilter = ref('all')

watch(highlightedIterationId, (id) => {
  if (id) statusFilter.value = 'all'
}, { immediate: true })
const showCreateModal = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

const newIteration = reactive({
  name: '',
  description: '',
  status: 'planning',
  project_id: '',
  start_date: '',
  end_date: ''
})

const iterations = computed(() => iterationsData.value || [])

const activeIteration = computed(() => iterations.value.find((i: any) => i.status === 'active'))

const filteredIterations = computed(() => {
  if (statusFilter.value === 'all') return iterations.value
  return iterations.value.filter((i: any) => i.status === statusFilter.value)
})

const iterationStatusOptions = [
  { value: 'planning', label: '已规划', class: 'bg-blue-50 text-blue-500' },
  { value: 'active', label: '进行中', class: 'bg-green-50 text-green-500' },
  { value: 'completed', label: '已完成', class: 'bg-gray-50 text-gray-500' }
]

function statusLabel(status: string) {
  return iterationStatusOptions.find(option => option.value === status)?.label || status
}

function getIterStatusClass(status: string) {
  const map: Record<string, string> = {
    active: 'bg-green-50 text-green-500',
    planning: 'bg-blue-50 text-blue-500',
    completed: 'bg-gray-50 text-gray-500'
  }
  return map[status] || 'bg-gray-50 text-gray-500'
}

function goToRequirements(iter: any) {
  navigateTo(`/requirements?iterationId=${iter.id}`)
}

watch([highlightedIterationId, filteredIterations], ([id]) => {
  if (!id) return
  nextTick(() => {
    document.getElementById(`iteration-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}, { immediate: true })

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function closeModal() {
  showCreateModal.value = false
  errorMessage.value = ''
  newIteration.name = ''
  newIteration.description = ''
  newIteration.status = 'planning'
  newIteration.project_id = ''
  newIteration.start_date = ''
  newIteration.end_date = ''
}

async function createIteration() {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/iterations', {
      method: 'POST',
      body: {
        name: newIteration.name,
        description: newIteration.description,
        status: newIteration.status,
        project_id: newIteration.project_id ? parseInt(newIteration.project_id) : null,
        start_date: newIteration.start_date,
        end_date: newIteration.end_date
      }
    })
    closeModal()
    await refresh()
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || '创建失败，请重试'
  } finally {
    submitting.value = false
  }
}

// 编辑迭代
const showEditModal = ref(false)
const editIteration = reactive({
  id: 0,
  name: '',
  status: 'planning',
  project_id: '' as string | number,
  start_date: '',
  end_date: ''
})

function openEditModal(iter: any) {
  editIteration.id = iter.id
  editIteration.name = iter.name
  editIteration.status = iter.status
  editIteration.project_id = iter.project_id || ''
  editIteration.start_date = iter.start_date ? iter.start_date.split('T')[0] : ''
  editIteration.end_date = iter.end_date ? iter.end_date.split('T')[0] : ''
  errorMessage.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  errorMessage.value = ''
}

async function saveIteration() {
  submitting.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/iterations/${editIteration.id}`, {
      method: 'PUT',
      body: {
        name: editIteration.name,
        status: editIteration.status,
        project_id: editIteration.project_id ? Number(editIteration.project_id) : undefined,
        start_date: editIteration.start_date || null,
        end_date: editIteration.end_date || null
      }
    })
    closeEditModal()
    await refresh()
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || '保存失败，请重试'
  } finally {
    submitting.value = false
  }
}

async function changeIterationStatus(iter: any, status: string) {
  if (iter.status === status) return
  try {
    await $fetch(`/api/iterations/${iter.id}`, {
      method: 'PUT',
      body: { status }
    })
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || e.statusMessage || '修改状态失败')
  }
}

async function completeIteration(iter: any) {
  if (!confirm(`确定要结束迭代「${iter.name}」吗？`)) return
  try {
    await $fetch(`/api/iterations/${iter.id}`, {
      method: 'PUT',
      body: { status: 'completed' }
    })
    await refresh()
  } catch (e: any) {
    alert('操作失败：' + (e.statusMessage || e.message))
  }
}

const deleteModalVisible = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)
const deleteErrorMessage = ref('')
const deleteBlocked = computed(() => Number(deleteTarget.value?.requirement_count || 0) > 0)
const deleteModalMessage = computed(() => {
  const iter = deleteTarget.value
  if (!iter) return ''
  const count = Number(iter.requirement_count || 0)
  if (count > 0) {
    return `迭代「${iter.name}」下还有 ${count} 个关联需求，请先删除关联需求后再删除迭代。`
  }
  return `确定要删除迭代「${iter.name}」吗？此操作不可恢复。`
})

function onDelete(iter: any) {
  deleteTarget.value = iter
  deleteErrorMessage.value = ''
  deleteModalVisible.value = true
}

function goDeleteTargetRequirements() {
  const iter = deleteTarget.value
  deleteModalVisible.value = false
  if (iter) goToRequirements(iter)
}

async function confirmDelete() {
  if (!deleteTarget.value || deleteBlocked.value) return
  deleting.value = true
  deleteErrorMessage.value = ''
  try {
    await $fetch(`/api/iterations/${deleteTarget.value.id}`, { method: 'DELETE' })
    deleteModalVisible.value = false
    deleteTarget.value = null
    await refresh()
  } catch (e: any) {
    deleteErrorMessage.value = e.data?.message || e.statusMessage || '删除失败'
  } finally {
    deleting.value = false
  }
}
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
