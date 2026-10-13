<template>
  <div class="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-xs text-gray-400 font-mono mb-1">{{ task.id }}</div>
        <h4 class="text-base font-semibold text-gray-800">{{ task.title }}</h4>
      </div>
      <span class="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0" :class="statusClass">{{ statusLabel }}</span>
    </div>
    <div class="grid grid-cols-2 gap-x-6 gap-y-3">
      <div>
        <div class="text-xs text-gray-400 mb-1">优先级</div>
        <div class="flex items-center gap-1.5 text-sm text-gray-700">
          <span class="w-2 h-2 rounded-full" :class="priorityDot"></span>
          {{ priorityLabel }}
        </div>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">类型</div>
        <div class="text-sm text-gray-700">{{ typeLabel }}</div>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">负责人</div>
        <div class="text-sm text-gray-700">{{ taskAssigneeNames(task) }}</div>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">关联需求</div>
        <NuxtLink
          v-if="task.requirement?.id"
          :to="`/requirements/${task.requirement.id}`"
          class="text-sm text-blue-500 hover:text-blue-600 hover:underline truncate block"
          :title="task.requirement.title"
        >
          {{ task.requirement.title }}
        </NuxtLink>
        <div v-else class="text-sm text-gray-400">—</div>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">截止时间</div>
        <div class="text-sm text-gray-700">{{ formatDate(task.due_date) }}</div>
      </div>
      <div>
        <div class="text-xs text-gray-400 mb-1">预估工时</div>
        <div class="text-sm text-gray-700">{{ hoursText(task.estimated_hours) }}</div>
      </div>
    </div>
    <div>
      <div class="text-xs text-gray-400 mb-1">任务描述</div>
      <p class="text-sm text-gray-700 whitespace-pre-wrap leading-6">{{ task.description || '暂无描述' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { taskAssigneeNames } from '~/utils/task-assignees'

const props = defineProps<{
  task: {
    id?: string
    title?: string
    description?: string | null
    status?: string
    priority?: string
    type?: string
    estimated_hours?: number | string | null
    due_date?: string | null
    assignee?: { name?: string } | null
    assignees?: { id?: number; name?: string }[]
    requirement?: { id?: string | number; title?: string } | null
  }
}>()

const STATUS_LABELS: Record<string, string> = {
  todo: '待处理',
  in_progress: '进行中',
  review: '评审中',
  done: '已完成'
}
const STATUS_CLASSES: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-50 text-blue-600',
  review: 'bg-yellow-50 text-yellow-600',
  done: 'bg-green-50 text-green-600'
}
const PRIORITY_LABELS: Record<string, string> = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低'
}
const PRIORITY_DOTS: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-red-400',
  medium: 'bg-yellow-400',
  low: 'bg-green-400'
}
const TYPE_LABELS: Record<string, string> = {
  development: '开发',
  design: '设计',
  test: '测试',
  research: '调研',
  doc: '文档'
}

const statusLabel = computed(() => STATUS_LABELS[props.task.status || ''] || props.task.status || '—')
const statusClass = computed(() => STATUS_CLASSES[props.task.status || ''] || 'bg-gray-100 text-gray-500')
const priorityLabel = computed(() => PRIORITY_LABELS[props.task.priority || ''] || props.task.priority || '—')
const priorityDot = computed(() => PRIORITY_DOTS[props.task.priority || ''] || 'bg-gray-400')
const typeLabel = computed(() => TYPE_LABELS[props.task.type || ''] || props.task.type || '—')

function formatDate(value?: string | null) {
  if (!value) return '—'
  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function hoursText(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '—'
  return `${value}h`
}
</script>
