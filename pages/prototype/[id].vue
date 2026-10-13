<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <!-- 左侧区域 -->
        <div class="flex items-center gap-3">
          <!-- 返回按钮 -->
          <button
            class="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            @click="goBackFromPrototype()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <!-- Loading skeleton -->
          <div v-if="pending" class="flex items-center gap-3">
            <div class="h-5 w-32 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <!-- Error -->
          <div v-else-if="error" class="flex items-center gap-3">
            <h1 class="text-lg font-bold text-gray-500">原型详情</h1>
          </div>
          <!-- Loaded -->
          <div v-else class="flex flex-col gap-0.5">
            <!-- 面包屑 -->
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <span>原型中心</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="text-indigo-500">原型详情</span>
            </div>
            <!-- 标题行 -->
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-bold text-gray-800">{{ prototype?.name || '原型详情' }}</h1>
              <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                {{ prototype?.version || 'v1.0' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 右侧操作 -->
        <div class="flex items-center gap-3">
          <button
            v-if="can('update', 'prototype')"
            class="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium transition-colors"
            @click="handleEdit"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            编辑信息
          </button>
          <button
            v-if="can('create', 'prototype')"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            @click="router.push('/prototype/new')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            上传新版本
          </button>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="pending" class="flex-1 flex items-center justify-center">
        <div class="text-gray-400 text-sm">加载中...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center py-20">
        <svg class="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-gray-400 text-sm mb-2">{{ error.statusCode === 404 ? '原型不存在或已被删除' : '加载失败' }}</p>
        <button class="text-blue-500 text-sm hover:underline" @click="goBackFromPrototype()">返回</button>
      </div>

      <!-- Content -->
      <div v-else class="flex-1 flex overflow-hidden">
        <!-- 左栏 - 原型预览 -->
        <div class="flex-1 flex flex-col bg-gray-50">
          <!-- 预览工具栏 -->
          <div class="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
            <!-- 工具栏左侧 -->
            <div class="flex items-center gap-2">
              <!-- 缩放按钮组 -->
              <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button 
                  class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  @click="zoomOut"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                </button>
                <div class="w-px h-5 bg-gray-200"></div>
                <span class="px-3 text-sm text-gray-600 min-w-[60px] text-center">{{ zoomLevel }}%</span>
                <div class="w-px h-5 bg-gray-200"></div>
                <button 
                  class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  @click="zoomIn"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              </div>
              <button 
                class="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                @click="fitToWidth"
              >
                适配宽度
              </button>
            </div>
            
            <!-- 工具栏右侧 -->
            <div class="flex items-center gap-2">
              <!-- 页面切换 -->
              <div class="flex items-center gap-1">
                <button 
                  class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600"
                  :disabled="selectedPage === 0"
                  @click="selectedPage--"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div class="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-[60px] text-center">
                  {{ selectedPage + 1 }} / {{ prototypePages.length || 1 }}
                </div>
                <button 
                  class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600"
                  :disabled="selectedPage >= prototypePages.length - 1"
                  @click="selectedPage++"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              <div class="w-px h-6 bg-gray-200 mx-1"></div>
              <button class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 原型大图区域 -->
          <div class="flex-1 overflow-auto p-8 flex items-center justify-center bg-gray-50">
            <div 
              class="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200"
              :style="{ width: `${375 * zoomLevel / 100}px`, height: `${812 * zoomLevel / 100}px` }"
            >
              <img
                v-if="prototypePages[selectedPage]?.thumbnail"
                :src="prototypePages[selectedPage].thumbnail"
                :alt="prototypePages[selectedPage].name"
                class="w-full h-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
                @click="openImageModal(prototypePages[selectedPage].thumbnail)"
              />
              <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm">暂无图片</p>
              </div>
            </div>
          </div>
          
          <!-- 页面缩略图导航 -->
          <div class="h-20 bg-white border-t border-gray-100 flex items-center px-4 gap-3 overflow-x-auto">
            <button
              v-for="(page, i) in prototypePages"
              :key="i"
              class="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all"
              :class="selectedPage === i ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'"
              @click="selectedPage = i"
            >
              <img 
                v-if="page.thumbnail"
                :src="page.thumbnail" 
                :alt="page.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                {{ i + 1 }}
              </div>
            </button>
          </div>
        </div>

        <!-- 右栏 - 信息面板 -->
        <div class="w-96 bg-gray-50 border-l border-gray-200 flex flex-col overflow-y-auto">
          <!-- 基本信息卡片 -->
          <div class="m-4 bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-1 h-5 bg-indigo-500 rounded-full"></div>
              <h3 class="font-semibold text-gray-800">基本信息</h3>
            </div>
            
            <div class="space-y-3 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-400">当前版本</span>
                <span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {{ prototype?.version || 'v1.0' }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">所属模块</span>
                <span class="text-gray-700 font-medium">{{ prototype?.module || '未设置' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">设计者</span>
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs">
                    {{ prototype?.creator?.name?.charAt(0) || '?' }}
                  </div>
                  <span class="text-gray-700 font-medium">{{ prototype?.creator?.name || '未知' }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">更新时间</span>
                <span class="text-gray-600">{{ formatDateTime(prototype?.updated_at) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">查看次数</span>
                <span class="text-gray-600">{{ prototype?.view_count || 0 }} 次</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-400">页面数量</span>
                <span class="text-gray-600">{{ prototype?.pageCount || 0 }} 页</span>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100">
              <h4 class="text-sm font-medium text-gray-700 mb-2">原型描述</h4>
              <p class="text-sm text-gray-500 leading-relaxed">{{ prototype?.description || '暂无描述' }}</p>
            </div>
            
            <div v-if="prototype?.tags?.length" class="mt-4 flex flex-wrap gap-2">
              <span 
                v-for="tag in prototype.tags" 
                :key="tag"
                class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <!-- 关联需求卡片 -->
          <div v-if="prototype?.requirement" class="mx-4 mb-4 bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-1 h-5 bg-violet-500 rounded-full"></div>
              <h3 class="font-semibold text-gray-800">关联需求</h3>
            </div>
            
            <div 
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
              @click="router.push(`/requirements/${prototype.requirement.id}`)"
            >
              <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-800">{{ prototype.requirement.req_no || prototype.requirement.id }}</div>
                <div class="text-xs text-gray-400 truncate">{{ prototype.requirement.title }}</div>
              </div>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
          
          <!-- 版本历史卡片 -->
          <div class="mx-4 mb-4 bg-white rounded-2xl shadow-sm p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-1 h-5 bg-amber-500 rounded-full"></div>
                <h3 class="font-semibold text-gray-800">版本历史</h3>
              </div>
            </div>
            <div v-if="versionsPending" class="py-4 text-sm text-gray-400">加载版本历史...</div>
            <div v-else-if="versionHistory.length === 0" class="py-4 text-sm text-gray-400">暂无可追溯版本</div>
            <div v-else class="space-y-4">
              <div v-for="(version, i) in versionHistory" :key="version.id" class="flex gap-3">
                <!-- 时间线 -->
                <div class="flex flex-col items-center">
                  <div 
                    class="w-3 h-3 rounded-full"
                    :class="i === 0 ? 'bg-violet-500 ring-4 ring-violet-100' : 'bg-gray-300'"
                  ></div>
                  <div v-if="i < versionHistory.length - 1" class="w-0.5 h-full bg-gray-200 mt-1"></div>
                </div>
                <!-- 版本内容 -->
                <div class="flex-1 pb-4">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-gray-800">{{ version.version }} · 修订 #{{ version.revision }}</span>
                    <span v-if="i === 0" class="px-1.5 py-0.5 bg-violet-100 text-violet-600 rounded text-xs">当前</span>
                  </div>
                  <p class="text-sm text-gray-500 mb-1">{{ version.description }}</p>
                  <p class="text-xs text-gray-400">{{ version.author.name }} · {{ formatRelativeTime(version.createdAt) }}</p>
                  <button
                    v-if="i !== 0 && can('update', 'prototype')"
                    class="mt-2 text-xs text-indigo-500 hover:text-indigo-600 disabled:opacity-50"
                    :disabled="restoringVersionId === version.id"
                    @click="restoreVersion(version)"
                  >
                    {{ restoringVersionId === version.id ? '恢复中...' : '恢复此版本' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 图片放大模态框 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showImageModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          @click="closeImageModal"
        >
          <button
            v-if="can('update', 'prototype')"
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            @click.stop="closeImageModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <img
            :src="modalImageUrl"
            class="max-w-[90vw] max-h-[90vh] object-contain"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse } from '~/types'

const router = useRouter()
const route = useRoute()

function safeReturnPath() {
  const from = route.query.from
  if (typeof from !== 'string') return '/prototype'
  if (!from.startsWith('/') || from.startsWith('//') || from.includes('://')) return '/prototype'
  return from
}

function goBackFromPrototype() {
  router.push(safeReturnPath())
}

function prototypePageQuery(extra: Record<string, string> = {}) {
  const query: Record<string, string> = { ...extra }
  const from = typeof route.query.from === 'string' ? route.query.from : ''
  if (from) query.from = from
  return query
}
const { can } = useAuth()
const { data: meta } = await useFetch<MetaResponse>('/api/meta')

const selectedPage = ref(0)
const zoomLevel = ref(100)

// 图片放大模态框状态
const showImageModal = ref(false)
const modalImageUrl = ref('')

// Fetch prototype detail from API
const { data: prototype, pending, error, refresh: refreshPrototype } = await useFetch(`/api/prototypes/${route.params.id}`, {
  server: false,
  default: () => null as any
})

// Normalize pages from API data
const prototypePages = computed(() => {
  if (!prototype.value) return []
  const raw = prototype.value.pages
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
})

type PrototypeVersion = {
  id: number
  revision: number
  version: string
  description: string
  createdAt: string
  author: { name: string; avatar: string | null }
}

const { data: versionsResponse, pending: versionsPending, refresh: refreshVersions } = await useFetch<{ items: PrototypeVersion[] }>(
  `/api/prototypes/${route.params.id}/versions`,
  { server: false, default: () => ({ items: [] }) }
)
const versionHistory = computed(() => versionsResponse.value?.items || [])
const restoringVersionId = ref<number | null>(null)

async function restoreVersion(version: PrototypeVersion) {
  if (!window.confirm(`确认恢复到 ${version.version}（修订 #${version.revision}）吗？当前内容会保留为新的可追溯版本。`)) return
  restoringVersionId.value = version.id
  try {
    await $fetch(`/api/prototypes/${route.params.id}/versions/${version.id}/restore`, { method: 'POST' })
    await Promise.all([refreshPrototype(), refreshVersions()])
  } catch (error: any) {
    alert(`恢复失败：${error?.statusMessage || error?.message || '未知错误'}`)
  } finally {
    restoringVersionId.value = null
  }
}

// Zoom functions
function zoomIn() {
  if (zoomLevel.value < 200) {
    zoomLevel.value += 25
  }
}

function zoomOut() {
  if (zoomLevel.value > 50) {
    zoomLevel.value -= 25
  }
}

function fitToWidth() {
  zoomLevel.value = 100
}

// 图片模态框函数
function openImageModal(url: string) {
  modalImageUrl.value = url
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
  modalImageUrl.value = ''
}

// 编辑原型
function handleEdit() {
  const id = route.params.id
  if (!id) {
    console.error('Prototype ID is missing')
    return
  }
  router.push({ path: `/prototype/${id}/edit`, query: prototypePageQuery() })
}

// Watch data to reset selected page when loaded
watch(() => prototype.value, (val) => {
  if (val && selectedPage.value >= (val.pageCount || 0)) {
    selectedPage.value = 0
  }
})

function formatDateTime(date: string | null | undefined) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatRelativeTime(date: string | null | undefined) {
  if (!date) return ''
  const now = new Date()
  const target = new Date(date)
  if (isNaN(target.getTime())) return ''
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
