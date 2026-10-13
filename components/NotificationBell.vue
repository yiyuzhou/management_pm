<template>
  <div class="relative" ref="rootRef">
    <button
      class="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
      :class="tone === 'outline'
        ? 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
        : 'bg-gray-50 hover:bg-gray-100 text-gray-500'"
      @click.stop="toggle"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
      </svg>
      <span
        v-if="unreadCount > 0"
        class="absolute top-1.5 right-1.5 min-w-[8px] h-2 px-0 bg-red-500 rounded-full"
      ></span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
      @click.stop
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div class="text-sm font-semibold text-gray-800">消息</div>
        <button
          v-if="unreadCount > 0"
          class="text-xs text-blue-500 hover:text-blue-600"
          @click="markAllRead"
        >
          全部已读
        </button>
      </div>
      <div class="max-h-[420px] overflow-y-auto">
        <button
          v-for="item in items"
          :key="item.id"
          class="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50/50': !item.isRead }"
          @click="openItem(item)"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              :class="iconWrapClass(item.type)"
            >
              <span class="text-xs font-medium">{{ typeMark(item.type) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</span>
                <span v-if="!item.isRead" class="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5 leading-5 line-clamp-2">{{ item.content }}</p>
              <div class="text-[11px] text-gray-400 mt-1">{{ formatTime(item.createdAt) }}</div>
            </div>
          </div>
        </button>
        <div v-if="items.length === 0" class="py-10 text-center text-sm text-gray-400">暂无消息</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tone?: 'soft' | 'outline'
}>()

interface NoticeItem {
  id: number
  type: string
  title: string
  content: string
  link: string
  isRead: boolean
  createdAt: string
}

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const unreadCount = ref(0)
const items = ref<NoticeItem[]>([])

async function loadNotices() {
  try {
    const data = await $fetch<{ unreadCount: number; items: NoticeItem[] }>('/api/notifications')
    unreadCount.value = data.unreadCount || 0
    items.value = data.items || []
  } catch {
    // ignore
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) loadNotices()
}

async function markAllRead() {
  await $fetch('/api/notifications/read', { method: 'PUT', body: { all: true } })
  items.value = items.value.map(item => ({ ...item, isRead: true }))
  unreadCount.value = 0
}

async function openItem(item: NoticeItem) {
  if (!item.isRead) {
    await $fetch('/api/notifications/read', { method: 'PUT', body: { id: item.id } })
    item.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
  open.value = false
  if (item.link) navigateTo(item.link)
}

function typeMark(type: string) {
  if (type === 'bug_assigned') return 'Bug'
  if (type === 'requirement_due') return '期'
  return '需'
}

function iconWrapClass(type: string) {
  if (type === 'bug_assigned') return 'bg-red-50 text-red-500'
  if (type === 'requirement_due') return 'bg-amber-50 text-amber-500'
  return 'bg-blue-50 text-blue-500'
}

function formatTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} 天前`
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function onDocClick(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) open.value = false
}

onMounted(() => {
  loadNotices()
  document.addEventListener('click', onDocClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(loadNotices, 60000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
