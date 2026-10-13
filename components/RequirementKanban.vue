<template>
  <div class="overflow-x-auto pb-4">
    <div class="flex gap-4 min-w-max">
      <div
        v-for="col in columns"
        :key="col.status"
        class="w-72 flex-shrink-0"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between mb-3 px-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: col.dotColor }"></span>
            <span class="text-sm font-medium text-gray-700">{{ col.label }}</span>
            <span class="text-xs text-gray-400">{{ getStatusItems(col.status).length }}</span>
          </div>
          <button v-if="can('create', 'requirement')" class="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-blue-500 rounded transition-colors" @click="$emit('create-in-status', col.status)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>

        <!-- Column Body -->
        <div class="bg-gray-50 rounded-xl p-2 min-h-[200px] space-y-2">
          <div
            v-for="item in getStatusItems(col.status)"
            :key="item.id"
            class="bg-white rounded-lg p-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            @click="viewDetail(item)"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <span class="text-xs text-gray-400 font-mono">{{ item.id }}</span>
              <span
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                :class="{
                  'bg-red-50 text-red-600': item.priority === 'p0',
                  'bg-orange-50 text-orange-600': item.priority === 'p1',
                  'bg-yellow-50 text-yellow-600': item.priority === 'p2',
                  'bg-gray-50 text-gray-500': item.priority === 'p3'
                }"
              >
                {{ priorityLabel(item.priority) }}
              </span>
            </div>

            <!-- Title -->
            <p class="text-sm text-gray-800 font-medium mb-2 line-clamp-2">{{ item.title }}</p>

            <!-- Tags -->
            <div class="flex items-center gap-1.5 mb-2 flex-wrap">
              <span
                v-if="item.has_prototype"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-500 rounded text-xs"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                </svg>
                原型
              </span>
              <span v-if="item.task_count > 0" class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded text-xs">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                {{ item.task_count }}
              </span>
              <span v-if="item.module" class="inline-flex items-center px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">
                {{ item.module }}
              </span>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between pt-2 border-t border-gray-50">
              <div v-if="item.assignee" class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium">
                  {{ item.assignee.name.charAt(0) }}
                </div>
                <span class="text-xs text-gray-500">{{ item.assignee.name }}</span>
              </div>
              <span v-else class="text-xs text-gray-300">未指派</span>
              <div v-if="can('update', 'requirement') || can('delete', 'requirement')" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  v-if="can('update', 'requirement')"
                  class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  title="编辑"
                  @click.stop="$emit('edit', item)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  v-if="can('delete', 'requirement')"
                  class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="删除"
                  @click.stop="$emit('delete', item)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty Column -->
          <div v-if="getStatusItems(col.status).length === 0" class="py-8 text-center">
            <p class="text-xs text-gray-300">暂无需求</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Requirement, Priority, RequirementStatus } from '~/types'
import {
  PRIORITY_LABELS,
  STATUS_LABELS, STATUS_DOT_COLORS
} from '~/types'

const { can } = useAuth()

const props = defineProps<{
  items: Requirement[]
}>()

const emit = defineEmits<{
  'view': [item: Requirement]
  'edit': [item: Requirement]
  'delete': [item: Requirement]
  'create-in-status': [status: RequirementStatus]
}>()

const router = useRouter()

const columns = [
  { status: 'draft' as RequirementStatus, label: STATUS_LABELS['draft'], dotColor: STATUS_DOT_COLORS['draft'] },
  { status: 'pending' as RequirementStatus, label: STATUS_LABELS['pending'], dotColor: STATUS_DOT_COLORS['pending'] },
  { status: 'approved' as RequirementStatus, label: STATUS_LABELS['approved'], dotColor: STATUS_DOT_COLORS['approved'] },
  { status: 'in_progress' as RequirementStatus, label: STATUS_LABELS['in_progress'], dotColor: STATUS_DOT_COLORS['in_progress'] },
  { status: 'completed' as RequirementStatus, label: STATUS_LABELS['completed'], dotColor: STATUS_DOT_COLORS['completed'] },
  { status: 'closed' as RequirementStatus, label: STATUS_LABELS['closed'], dotColor: STATUS_DOT_COLORS['closed'] }
]

function getStatusItems(status: RequirementStatus) {
  return props.items.filter(item => item.status === status)
}

function viewDetail(item: Requirement) {
  router.push(`/requirements/${item.id}`)
}

function priorityLabel(p: Priority) {
  return PRIORITY_LABELS[p] || p
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
