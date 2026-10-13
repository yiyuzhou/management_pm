<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <h1 class="text-xl font-bold text-gray-800">原型中心</h1>
        <div class="flex items-center gap-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="searchKeyword" type="text" placeholder="搜索原型..." class="w-60 pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all" />
          </div>
          <button v-if="can('create', 'prototype')" class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" @click="navigateTo('/prototype/new')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            新建原型
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Filter Bar -->
        <div class="flex items-center gap-2 mb-6">
          <button
            v-for="filter in typeFilters"
            :key="filter.value"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="activeType === filter.value ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
            @click="activeType = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="flex items-center justify-center py-20">
          <div class="text-gray-400 text-sm">加载中...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredPrototypes.length === 0" class="flex flex-col items-center justify-center py-20">
          <svg class="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
          </svg>
          <p class="text-gray-400 text-sm">暂无原型数据</p>
        </div>

        <!-- Prototype Grid -->
        <div v-else class="grid grid-cols-4 gap-4">
          <div v-for="proto in filteredPrototypes" :key="proto.id" class="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" @click="navigateTo(`/prototype/${proto.id}`)">
            <!-- Thumbnail -->
            <div class="aspect-[4/3] bg-gray-100 relative overflow-hidden">
              <img v-if="getThumbnail(proto)" :src="getThumbnail(proto)" :alt="proto.name" class="absolute inset-0 w-full h-full object-cover" />
              <div v-else class="absolute inset-0 flex items-center justify-center text-gray-300">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                </svg>
              </div>
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
              <div class="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  v-if="can('update', 'prototype')"
                  class="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-500"
                  title="编辑"
                  @click.stop="navigateTo(`/prototype/${proto.id}/edit`)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </button>
                <button
                  v-if="can('delete', 'prototype')"
                  class="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-500 hover:text-red-500"
                  title="删除"
                  @click.stop="onDelete(proto)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            <!-- Info -->
            <div class="p-4">
              <h3 class="font-medium text-gray-800 truncate">{{ proto.name }}</h3>
              <p class="text-xs text-gray-400 mt-1">{{ proto.pageCount }} 个页面 · 更新于 {{ formatRelativeTime(proto.updated_at) }}</p>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium">
                    {{ proto.author?.charAt(0) || '?' }}
                  </div>
                  <span class="text-xs text-gray-500">{{ proto.author }}</span>
                </div>
                <span class="px-2 py-0.5 text-xs rounded" :class="getStatusClass(proto.status)">{{ getStatusLabel(proto.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

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
                <h3 class="text-base font-semibold text-gray-800">确认删除</h3>
                <p class="text-sm text-gray-500 mt-0.5">确定要删除原型「{{ deleteTarget.name }}」吗？此操作不可恢复。</p>
              </div>
            </div>
            <p v-if="deleteError" class="text-sm text-red-500 mb-3">{{ deleteError }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="closeDeleteModal">取消</button>
              <button
                class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                :disabled="deleting"
                @click="confirmDelete"
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
import type { MetaResponse } from '~/types'

const { can } = useAuth()
const { selectedProjectId } = useProject()

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  }))
})

const searchKeyword = ref('')
const activeType = ref('all')

const typeFilters = [
  { value: 'all', label: '全部' },
  { value: 'page', label: '页面' },
  { value: 'component', label: '组件' },
  { value: 'flow', label: '流程图' }
]

const { data: prototypes, pending, refresh } = await useFetch('/api/prototypes', {
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

const filteredPrototypes = computed(() => {
  let result = prototypes.value || []
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(p => p.name?.toLowerCase().includes(kw))
  }
  return result
})

function getThumbnail(proto: any): string | null {
  // 优先使用原型自身的缩略图
  if (proto.thumbnail) return proto.thumbnail
  // 其次使用封面页的缩略图
  const pages = proto.pages
  if (Array.isArray(pages) && pages.length > 0) {
    const cover = pages.find((p: any) => p.isCover)
    if (cover?.thumbnail) return cover.thumbnail
    // 最后使用第一页的缩略图
    if (pages[0]?.thumbnail) return pages[0].thumbnail
  }
  return null
}

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    'in_progress': 'bg-blue-50 text-blue-500',
    'completed': 'bg-green-50 text-green-500',
    'reviewing': 'bg-yellow-50 text-yellow-500',
    'in_review': 'bg-yellow-50 text-yellow-500',
    'approved': 'bg-blue-50 text-blue-500',
    'draft': 'bg-gray-50 text-gray-500',
    'archived': 'bg-gray-100 text-gray-400',
    '进行中': 'bg-blue-50 text-blue-500',
    '已完成': 'bg-green-50 text-green-500',
    '评审中': 'bg-yellow-50 text-yellow-500'
  }
  return map[status] || 'bg-gray-50 text-gray-500'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    'in_progress': '进行中',
    'completed': '已完成',
    'reviewing': '评审中',
    'in_review': '评审中',
    'approved': '已通过',
    'draft': '草稿',
    'archived': '已归档'
  }
  return map[status] || status
}

const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)
const deleteError = ref('')

function onDelete(proto: any) {
  deleteTarget.value = proto
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTarget.value = null
  deleteError.value = ''
}

async function confirmDelete() {
  if (!deleteTarget.value || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/prototypes/${deleteTarget.value.id}`, { method: 'DELETE' })
    closeDeleteModal()
    await refresh()
  } catch (e: any) {
    deleteError.value = e.data?.message || e.statusMessage || '删除失败'
  } finally {
    deleting.value = false
  }
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
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`
}
</script>
