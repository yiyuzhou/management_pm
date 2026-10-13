<template>
  <div class="flex items-center justify-between py-4">
    <!-- Left: Info -->
    <div class="text-sm text-gray-500">
      共 <span class="font-medium text-gray-700">{{ total }}</span> 条记录，第 <span class="font-medium text-gray-700">{{ page }}</span> / {{ totalPages }} 页
    </div>

    <!-- Right: Pagination Buttons -->
    <div class="flex items-center gap-1.5">
      <!-- Previous -->
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors"
        :class="page <= 1
          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
          : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-500'"
        :disabled="page <= 1"
        @click="goTo(page - 1)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <!-- Page Numbers -->
      <template v-for="p in displayPages" :key="p">
        <span v-if="p === '...'" class="px-1 text-gray-400 text-sm">...</span>
        <button
          v-else
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
          :class="p === page
            ? 'bg-blue-500 text-white'
            : 'border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-500'"
          @click="goTo(p as number)"
        >
          {{ p }}
        </button>
      </template>

      <!-- Next -->
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors"
        :class="page >= totalPages
          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
          : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-500'"
        :disabled="page >= totalPages"
        @click="goTo(page + 1)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: number
  pageSize: number
  total: number
  totalPages: number
}>()

const emit = defineEmits<{
  'update:page': [value: number]
}>()

const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const current = props.page
  const total = props.totalPages

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (current > 4) {
    pages.push('...')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 3) {
    pages.push('...')
  }

  pages.push(total)

  return pages
})

function goTo(page: number) {
  if (page < 1 || page > props.totalPages || page === props.page) return
  emit('update:page', page)
}
</script>
