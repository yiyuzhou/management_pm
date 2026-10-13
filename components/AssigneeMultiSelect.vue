<template>
  <div class="relative" @click.stop>
    <button
      type="button"
      class="w-full min-h-[40px] px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-left flex flex-wrap gap-1 items-center focus:outline-none focus:border-blue-400 transition-all"
      @click="open = !open"
    >
      <span v-if="selectedUsers.length === 0" class="text-gray-400">不指派</span>
      <span
        v-for="user in selectedUsers"
        :key="user.id"
        class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md"
      >
        {{ user.name }}
        <span class="text-blue-400 hover:text-blue-600 leading-none" @click.stop="toggle(user.id)">×</span>
      </span>
    </button>
    <div
      v-if="open"
      class="absolute z-30 mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1"
    >
      <button
        type="button"
        class="w-full px-3 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-50"
        @click="clear"
      >
        不指派
      </button>
      <label
        v-for="user in users"
        :key="user.id"
        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
      >
        <input
          type="checkbox"
          class="rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          :checked="isSelected(user.id)"
          @change="toggle(user.id)"
        />
        {{ user.name }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: Array<string | number>
  users: { id: number; name: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const open = ref(false)

const selectedIds = computed(() => props.modelValue.map(id => Number(id)).filter(id => id > 0))
const selectedUsers = computed(() => props.users.filter(user => selectedIds.value.includes(Number(user.id))))

function isSelected(id: number) {
  return selectedIds.value.includes(Number(id))
}

function toggle(id: number) {
  const next = new Set(selectedIds.value)
  const num = Number(id)
  if (next.has(num)) next.delete(num)
  else next.add(num)
  emit('update:modelValue', [...next])
}

function clear() {
  emit('update:modelValue', [])
  open.value = false
}

function onDocClick() {
  open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>
