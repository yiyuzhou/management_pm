<template>
  <div class="bg-white rounded-xl border border-gray-100 h-full flex flex-col min-h-0">
    <div class="flex items-center gap-2 px-5 pt-5 pb-4 flex-shrink-0">
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h3 class="font-semibold text-gray-800">修改记录</h3>
      <span class="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{{ items.length }}</span>
    </div>

    <div class="flex-1 overflow-y-auto px-5 pb-5">
      <div v-if="loading" class="py-10 text-center text-sm text-gray-400">加载中...</div>
      <div v-else-if="items.length === 0" class="py-10 text-center text-gray-400">
        <svg class="w-10 h-10 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-sm">暂无修改记录</p>
      </div>
      <div v-else class="relative">
        <div
          v-for="(item, i) in items"
          :key="item.id"
          class="flex gap-3"
        >
          <div class="flex flex-col items-center">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
              :class="i === 0 ? 'bg-gradient-to-br from-blue-400 to-indigo-400 ring-4 ring-blue-50' : 'bg-gradient-to-br from-gray-300 to-gray-400'"
            >
              {{ item.user_name?.charAt(0) || '?' }}
            </div>
            <div v-if="i < items.length - 1" class="w-px flex-1 bg-gray-100 my-1"></div>
          </div>
          <div class="flex-1 min-w-0" :class="i < items.length - 1 ? 'pb-5' : ''">
            <div class="text-sm text-gray-700 leading-5 break-words">
              <span class="font-medium text-gray-800">{{ item.user_name }}</span>
              <span class="text-gray-500"> {{ summary(item) }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-1" :title="formatDateTime(item.changed_at)">
              {{ formatRelativeTime(item.changed_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RequirementHistoryItem } from '~/types'

defineProps<{
  items: RequirementHistoryItem[]
  loading?: boolean
}>()

function truncate(text: string, max = 36) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function quoted(value: string | null | undefined) {
  const text = truncate(value || '')
  return text ? `「${text}」` : ''
}

function summary(item: RequirementHistoryItem) {
  if (item.field === '创建') return '创建了需求'
  if (item.field === '描述') return '更新了描述'
  if (item.field === '新建任务') return `新建了任务${quoted(item.new_value)}`
  if (item.field === '关联原型') return `关联了原型${quoted(item.new_value)}`
  if (item.field === '取消关联原型') return `取消关联了原型${quoted(item.old_value || item.new_value)}`
  const oldVal = truncate(item.old_value || '')
  const newVal = truncate(item.new_value || '')
  if (oldVal && newVal) return `将${item.field}从「${oldVal}」改为「${newVal}」`
  if (newVal) return `将${item.field}设置为「${newVal}」`
  return `修改了${item.field}`
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatRelativeTime(date: string | null | undefined) {
  if (!date) return ''
  const target = new Date(date)
  if (isNaN(target.getTime())) return ''
  const diff = Date.now() - target.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return formatDateTime(date)
}
</script>
