<template>
  <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
    <!-- Left: Title + Iteration Selector -->
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-bold text-gray-800">需求池</h1>
      <div class="flex items-center gap-2">
        <span class="text-gray-300">|</span>
        <div class="relative iteration-dropdown">
          <button
            class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            @click="showIterDropdown = !showIterDropdown"
          >
            <span class="text-sm text-gray-600">{{ currentIteration?.name || '全部迭代' }}</span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div
            v-if="showIterDropdown"
            class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1"
            @click.stop
          >
            <button
              class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              :class="!selectedIterationId ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
              @click="selectIteration(null)"
            >
              全部迭代
            </button>
            <button
              v-for="iter in iterations"
              :key="iter.id"
              class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              :class="String(selectedIterationId) === String(iter.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
              @click="selectIteration(iter.id)"
            >
              {{ iter.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Search + Notification -->
    <div class="flex items-center gap-3">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="searchValue"
          type="text"
          placeholder="搜索需求..."
          class="w-60 pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all"
          @input="onSearch"
        />
      </div>
      <NotificationBell />
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Iteration } from '~/types'

const props = defineProps<{
  iterations: Iteration[]
  modelValue: string
  search: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:search': [value: string]
}>()

const showIterDropdown = ref(false)
const searchValue = ref(props.search)

const selectedIterationId = computed(() => props.modelValue)

const currentIteration = computed(() => {
  return props.iterations.find(it => String(it.id) === String(selectedIterationId.value))
})

function selectIteration(id: string | null) {
  emit('update:modelValue', id || '')
  showIterDropdown.value = false
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    emit('update:search', searchValue.value)
  }, 300)
}

// Close dropdown on outside click
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const dropdownEl = document.querySelector('.iteration-dropdown')
  if (dropdownEl && !dropdownEl.contains(target)) {
    showIterDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
