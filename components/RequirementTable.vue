<template>
  <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full table-fixed">
        <thead>
          <tr class="border-b border-gray-100">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap"
              :style="{ width: col.width }"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group"
            @click="viewDetail(item)"
          >
            <!-- ID -->
            <td class="px-4 py-3 text-sm text-gray-500 font-mono whitespace-nowrap">
              {{ item.id }}
            </td>

            <!-- Title -->
            <td class="px-4 py-3 overflow-hidden">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-sm text-gray-800 font-medium truncate" :title="item.title">{{ item.title }}</span>
                <span
                  v-if="item.has_prototype"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-500 rounded text-xs flex-shrink-0"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                  </svg>
                  原型
                </span>
              </div>
            </td>

            <!-- Priority -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                :class="{
                  'bg-red-50 text-red-600': item.priority === 'p0',
                  'bg-orange-50 text-orange-600': item.priority === 'p1',
                  'bg-yellow-50 text-yellow-600': item.priority === 'p2',
                  'bg-gray-50 text-gray-500': item.priority === 'p3'
                }"
              >
                {{ priorityLabel(item.priority) }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-4 py-3 whitespace-nowrap" @click.stop>
              <RequirementStatusSelect
                :status="item.status"
                :editable="can('update', 'requirement')"
                @change="status => emit('change-status', item, status)"
              />
            </td>

            <!-- Assignee -->
            <td class="px-4 py-3 whitespace-nowrap">
              <div v-if="item.assignee" class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {{ item.assignee.name.charAt(0) }}
                </div>
                <span class="text-sm text-gray-700 whitespace-nowrap">{{ item.assignee.name }}</span>
              </div>
              <span v-else class="text-sm text-gray-400">未指派</span>
            </td>

            <!-- Iteration -->
            <td class="px-4 py-3 whitespace-nowrap">
              <span v-if="item.iteration" class="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium whitespace-nowrap" :title="item.iteration.name">
                {{ item.iteration.name }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>

            <!-- Related Tasks -->
            <td class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              <span v-if="item.task_count > 0">{{ item.task_count }} 个任务</span>
              <span v-else class="text-gray-400">—</span>
            </td>

            <!-- Created At -->
            <td class="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
              {{ formatDate(item.created_at) }}
            </td>

            <!-- Actions -->
            <td class="px-4 py-3">
              <div v-if="can('update', 'requirement') || can('delete', 'requirement')" class="flex items-center gap-2">
                <button
                  v-if="can('update', 'requirement')"
                  class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                  title="编辑"
                  @click.stop="$emit('edit', item)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  v-if="can('delete', 'requirement')"
                  class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="删除"
                  @click.stop="$emit('delete', item)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
              <span v-else class="text-gray-300">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="py-20 text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <p class="text-sm text-gray-400">暂无需求数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Requirement, Priority, RequirementStatus } from '~/types'
import { PRIORITY_LABELS } from '~/types'

const { can } = useAuth()

const emit = defineEmits<{
  'view': [item: Requirement]
  'edit': [item: Requirement]
  'delete': [item: Requirement]
  'change-status': [item: Requirement, status: RequirementStatus]
}>()

const props = defineProps<{
  items: Requirement[]
}>()

const router = useRouter()

function viewDetail(item: Requirement) {
  router.push(`/requirements/${item.id}`)
}

const columns = [
  { key: 'id', label: '需求ID', width: '150px' },
  { key: 'title', label: '需求标题' },
  { key: 'priority', label: '优先级', width: '100px' },
  { key: 'status', label: '状态', width: '112px' },
  { key: 'assignee', label: '负责人', width: '112px' },
  { key: 'iteration', label: '所属迭代', width: '220px' },
  { key: 'relatedTasks', label: '关联任务', width: '88px' },
  { key: 'createdAt', label: '创建时间', width: '168px' },
  { key: 'actions', label: '操作', width: '80px' }
]

function priorityLabel(p: Priority) {
  return PRIORITY_LABELS[p] || p
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  return `${date} ${time}`
}
</script>
