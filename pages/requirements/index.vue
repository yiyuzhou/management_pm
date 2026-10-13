<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <TheSidebar :total-count="meta?.totalCount" />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <TheTopBar
        v-model="selectedIterationId"
        v-model:search="searchKeyword"
        :iterations="meta?.iterations || []"
      />

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto px-6 py-2">
        <!-- Filter Bar -->
        <FilterBar
          v-model:status="filters.status"
          v-model:priority="filters.priority"
          v-model:assignee="filters.assignee"
          v-model:view-mode="viewMode"
          :users="meta?.users || []"
          :status-counts="meta?.statusCounts || {}"
          @create="goCreate"
        />

        <!-- Loading State -->
        <div v-if="listPending" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>

        <!-- List View -->
        <RequirementTable
          v-else-if="viewMode === 'list'"
          :items="visibleItems"
          @view="onView"
          @edit="onEdit"
          @delete="onDelete"
          @change-status="onChangeStatus"
        />

        <!-- Kanban View -->
        <RequirementKanban
          v-else
          :items="kanbanData"
          @view="onView"
          @edit="onEdit"
          @delete="onDelete"
          @create-in-status="goCreate"
        />

        <!-- Pagination -->
        <Pagination
          v-if="data && data.total > 0"
          :page="data.page"
          :page-size="data.pageSize"
          :total="data.total"
          :total-pages="data.totalPages"
          @update:page="onPageChange"
        />
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <RequirementModal
      v-model:visible="modalVisible"
      :users="meta?.users || []"
      :iterations="meta?.iterations || []"
      :projects="meta?.projects || []"
      :edit-data="editData"
      @success="onModalSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
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
                @click="goDeleteTargetDetail"
              >
                去删除关联任务
              </button>
              <button
                v-else
                class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
import type { Requirement, MetaResponse, RequirementStatus } from '~/types'
import { pickLatestIteration } from '~/utils/latest-iteration'

// State
const { selectedProjectId } = useProject()
const route = useRoute()
const selectedIterationId = ref(route.query.iterationId ? String(route.query.iterationId) : '')
let applyingAutoIteration = false
let lastAutoProjectId: string | number | null = null
const userPickedIteration = ref(Boolean(route.query.iterationId))
const searchKeyword = ref('')
const viewMode = ref('list')
const modalVisible = ref(false)
const editData = ref<Requirement | null>(null)
const deleteModalVisible = ref(false)
const deleteTarget = ref<Requirement | null>(null)

const filters = reactive({
  status: 'all',
  priority: 'all',
  assignee: 'all'
})

const currentPage = ref(1)

// Fetch meta data
const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

// Fetch requirements with filters (list view, paginated)
const { data, pending, refresh } = await useFetch('/api/requirements', {
  server: false,
  immediate: false,
  query: computed(() => ({
    page: currentPage.value,
    pageSize: 10,
    status: filters.status,
    priority: filters.priority,
    assigneeId: filters.assignee,
    search: searchKeyword.value,
    projectId: selectedProjectId.value || undefined,
    iterationId: selectedIterationId.value || undefined
  })),
  default: () => ({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }),
  watch: false
})

// Kanban view: fetch all requirements without pagination
const { data: kanbanResponse, refresh: refreshKanban } = await useFetch('/api/requirements', {
  server: false,
  immediate: false,
  query: computed(() => ({
    page: 1,
    pageSize: 200,
    status: filters.status === 'all' ? undefined : filters.status,
    priority: filters.priority === 'all' ? undefined : filters.priority,
    assigneeId: filters.assignee === 'all' ? undefined : filters.assignee,
    search: searchKeyword.value || undefined,
    projectId: selectedProjectId.value || undefined,
    iterationId: selectedIterationId.value || undefined
  })),
  default: () => ({ items: [], total: 0, page: 1, pageSize: 200, totalPages: 0 }),
  watch: false
})

const visibleItems = computed(() => {
  const items = data.value?.items || []
  const projectId = selectedProjectId.value
  if (!projectId) return []
  return items.filter(item => Number(item.project?.id) === Number(projectId))
})

const kanbanData = computed(() => {
  const items = kanbanResponse.value?.items || []
  const projectId = selectedProjectId.value
  if (!projectId) return []
  return items.filter(item => Number(item.project?.id) === Number(projectId))
})

const listPending = computed(() => !selectedProjectId.value || pending.value)

// Watch filter changes to refresh data
let searchDebounce: ReturnType<typeof setTimeout>
watch([() => filters.status, () => filters.priority, () => filters.assignee], () => {
  currentPage.value = 1
  refresh()
  if (viewMode.value === 'kanban') refreshKanban()
})

// 迭代切换时刷新数据
watch(selectedIterationId, () => {
  if (!applyingAutoIteration) userPickedIteration.value = true
  currentPage.value = 1
  refresh()
  if (viewMode.value === 'kanban') refreshKanban()
})

watch(
  () => [selectedProjectId.value, meta.value?.iterations] as const,
  () => {
    const projectId = selectedProjectId.value
    const iterations = meta.value?.iterations || []
    if (!projectId) return
    if (lastAutoProjectId !== projectId) {
      const isSwitch = lastAutoProjectId !== null
      lastAutoProjectId = projectId
      if (isSwitch) userPickedIteration.value = false
    }
    if (userPickedIteration.value) return

    const queryId = route.query.iterationId ? String(route.query.iterationId) : ''
    applyingAutoIteration = true
    if (queryId && iterations.some(it => String(it.id) === queryId)) {
      selectedIterationId.value = queryId
      userPickedIteration.value = true
    } else {
      const latest = pickLatestIteration(iterations)
      selectedIterationId.value = latest ? String(latest.id) : ''
    }
    nextTick(() => { applyingAutoIteration = false })
  },
  { immediate: true }
)

watch(() => route.query.iterationId, (id) => {
  if (!id) return
  userPickedIteration.value = true
  selectedIterationId.value = String(id)
})

// 项目切换时刷新数据
watch(selectedProjectId, (projectId) => {
  if (!projectId) return
  currentPage.value = 1
  refresh()
  if (viewMode.value === 'kanban') refreshKanban()
}, { immediate: true })

// Debounced search
watch(searchKeyword, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    currentPage.value = 1
    refresh()
    if (viewMode.value === 'kanban') refreshKanban()
  }, 300)
})

// Refresh kanban when switching to kanban view
watch(viewMode, (newVal) => {
  if (newVal === 'kanban') refreshKanban()
})

function onPageChange(page: number) {
  currentPage.value = page
  refresh()
}

const router = useRouter()

function goCreate() {
  router.push('/requirements/new')
}

function onView(item: Requirement) {
  // Navigate to detail page
  router.push(`/requirements/${item.id}`)
}

function onEdit(item: Requirement) {
  editData.value = item
  modalVisible.value = true
}

async function refreshListAndMeta() {
  await refresh()
  if (viewMode.value === 'kanban') await refreshKanban()
  const newMeta = await $fetch<MetaResponse>('/api/meta')
  meta.value = newMeta
}

async function onChangeStatus(item: Requirement, status: RequirementStatus) {
  try {
    await $fetch(`/api/requirements/${item.id}`, {
      method: 'PUT',
      body: { status }
    })
    await refreshListAndMeta()
  } catch (e: any) {
    alert(e.data?.message || e.statusMessage || '修改状态失败')
  }
}

const deleteBlocked = computed(() => (deleteTarget.value?.task_count || 0) > 0)
const deleteModalMessage = computed(() => {
  const item = deleteTarget.value
  if (!item) return ''
  if ((item.task_count || 0) > 0) {
    return `需求「${item.title}」下还有 ${item.task_count} 个关联任务，请先手动删除这些任务后再删除需求。`
  }
  return `确定要删除需求「${item.title}」吗？`
})

function onDelete(item: Requirement) {
  deleteTarget.value = item
  deleteModalVisible.value = true
}

function goDeleteTargetDetail() {
  const item = deleteTarget.value
  deleteModalVisible.value = false
  if (item) router.push(`/requirements/${item.id}`)
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  if ((deleteTarget.value.task_count || 0) > 0) return
  try {
    await $fetch(`/api/requirements/${deleteTarget.value.id}`, { method: 'DELETE' })
    deleteModalVisible.value = false
    deleteTarget.value = null
    await refresh()
    if (viewMode.value === 'kanban') await refreshKanban()
    const newMeta = await $fetch<MetaResponse>('/api/meta')
    meta.value = newMeta
  } catch (e: any) {
    const message = e.data?.message || e.statusMessage || '删除失败'
    alert(message)
  }
}

async function onModalSuccess() {
  editData.value = null
  await refresh()
  if (viewMode.value === 'kanban') await refreshKanban()
  // Refresh meta to update counts
  const newMeta = await $fetch<MetaResponse>('/api/meta')
  meta.value = newMeta
}
</script>

<style scoped>
.border-3 {
  border-width: 3px;
}
</style>
