<template>
  <div class="flex items-center justify-between py-3">
    <!-- Left: Filters -->
    <div class="flex items-center gap-2">
      <!-- Status Filters -->
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="activeStatus === filter.value
          ? 'bg-blue-500 text-white'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
        @click="$emit('update:status', filter.value)"
      >
        {{ filter.label }}
        <span v-if="filter.count !== undefined" class="ml-1 text-xs opacity-75">{{ filter.count }}</span>
      </button>

      <!-- Divider -->
      <span class="w-px h-5 bg-gray-200 mx-1"></span>

      <!-- Priority Filter -->
      <div class="relative priority-dropdown">
        <button
          class="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 transition-colors"
          @click.stop="showPriorityDropdown = !showPriorityDropdown"
        >
          {{ currentPriorityLabel }}
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div
          v-if="showPriorityDropdown"
          class="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1"
          @click.stop
        >
          <button
            v-for="opt in priorityOptions"
            :key="opt.value"
            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            :class="activePriority === opt.value ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
            @click="selectPriority(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Assignee Filter -->
      <div class="relative assignee-dropdown">
        <button
          class="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 transition-colors"
          @click.stop="showAssigneeDropdown = !showAssigneeDropdown"
        >
          {{ currentAssigneeLabel }}
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div
          v-if="showAssigneeDropdown"
          class="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 max-h-60 overflow-y-auto"
          @click.stop
        >
          <button
            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            :class="activeAssignee === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
            @click="selectAssignee('all')"
          >
            全部负责人
          </button>
          <button
            v-for="user in users"
            :key="user.id"
            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            :class="String(activeAssignee) === String(user.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
            @click="selectAssignee(String(user.id))"
          >
            <span class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {{ user.name.charAt(0) }}
            </span>
            {{ user.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Right: View Toggle + New Button -->
    <div class="flex items-center gap-3">
      <!-- View Toggle -->
      <div class="flex items-center bg-gray-50 rounded-lg p-1">
        <button
          class="px-2 py-1 rounded text-sm transition-colors"
          :class="viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="$emit('update:viewMode', 'list')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
        </button>
        <button
          class="px-2 py-1 rounded text-sm transition-colors"
          :class="viewMode === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="$emit('update:viewMode', 'board')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"/>
          </svg>
        </button>
      </div>

      <!-- New Requirement Button -->
      <button
        v-if="can('create', 'requirement')"
        class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        @click="$emit('create')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        新建需求
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'

const { can } = useAuth()

const props = defineProps<{
  status: string
  priority: string
  assignee: string
  viewMode: string
  users: User[]
  statusCounts: Record<string, number>
}>()

const emit = defineEmits<{
  'update:status': [value: string]
  'update:priority': [value: string]
  'update:assignee': [value: string]
  'update:viewMode': [value: string]
  'create': []
}>()

const showPriorityDropdown = ref(false)
const showAssigneeDropdown = ref(false)

const activeStatus = computed(() => props.status)
const activePriority = computed(() => props.priority)
const activeAssignee = computed(() => props.assignee)
const viewMode = computed(() => props.viewMode)

const statusFilters = computed(() => [
  { value: 'all', label: '全部', count: undefined },
  { value: 'draft', label: '草稿', count: props.statusCounts.draft },
  { value: 'pending', label: '评审中', count: props.statusCounts.pending },
  { value: 'approved', label: '已确定', count: props.statusCounts.approved },
  { value: 'in_progress', label: '进行中', count: props.statusCounts.in_progress },
  { value: 'completed', label: '已完成', count: props.statusCounts.completed },
  { value: 'closed', label: '已关闭', count: props.statusCounts.closed }
])

const priorityOptions = [
  { value: 'all', label: '全部优先级' },
  { value: 'p0', label: 'P0 最高' },
  { value: 'p1', label: 'P1 高' },
  { value: 'p2', label: 'P2 中' },
  { value: 'p3', label: 'P3 低' }
]

const currentPriorityLabel = computed(() => {
  return priorityOptions.find(o => o.value === activePriority.value)?.label || '全部优先级'
})

const currentAssigneeLabel = computed(() => {
  if (activeAssignee.value === 'all') return '全部负责人'
  return props.users.find(u => String(u.id) === String(activeAssignee.value))?.name || '全部负责人'
})

function selectPriority(value: string) {
  emit('update:priority', value)
  showPriorityDropdown.value = false
}

function selectAssignee(value: string) {
  emit('update:assignee', value)
  showAssigneeDropdown.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const priorityEl = document.querySelector('.priority-dropdown')
  const assigneeEl = document.querySelector('.assignee-dropdown')
  if (priorityEl && !priorityEl.contains(target)) showPriorityDropdown.value = false
  if (assigneeEl && !assigneeEl.contains(target)) showAssigneeDropdown.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
