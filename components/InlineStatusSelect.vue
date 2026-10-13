<template>
  <div class="relative inline-block">
    <button
      ref="buttonEl"
      type="button"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap leading-5"
      :class="[currentClass, editable ? 'hover:brightness-[0.97] cursor-pointer' : 'cursor-default']"
      :disabled="!editable || updating"
      :title="editable ? '点击修改状态' : ''"
      @click.stop="toggle"
    >
      <span>{{ currentLabel }}</span>
      <svg v-if="editable" class="w-2.5 h-2.5 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    <Teleport to="body">
      <div
        v-if="menuOpen"
        ref="menuEl"
        class="fixed z-[80] w-32 flex flex-col bg-white border border-gray-100 rounded-xl shadow-lg py-1"
        :style="menuStyle"
        @click.stop
      >
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 whitespace-nowrap"
          :class="option.value === status ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
          @click="pick(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface StatusOption {
  value: string
  label: string
  class?: string
}

const props = withDefaults(defineProps<{
  status?: string | null
  options: StatusOption[]
  editable?: boolean
  updating?: boolean
}>(), {
  status: '',
  editable: false,
  updating: false
})

const emit = defineEmits<{
  change: [status: string]
}>()

const buttonEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const menuStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })

const current = computed(() => (props.options || []).find(option => option.value === props.status))
const currentLabel = computed(() => current.value?.label || props.status || '—')
const currentClass = computed(() => current.value?.class || 'bg-gray-50 text-gray-500')

function updatePosition() {
  const rect = buttonEl.value?.getBoundingClientRect()
  if (!rect) return
  const menuHeight = menuEl.value?.offsetHeight || (props.options?.length || 3) * 32
  const openUp = rect.bottom + 6 + menuHeight > window.innerHeight && rect.top - 6 - menuHeight > 0
  menuStyle.value = {
    top: `${openUp ? rect.top - 6 - menuHeight : rect.bottom + 6}px`,
    left: `${Math.min(rect.left, window.innerWidth - 136)}px`
  }
}

async function toggle() {
  if (!props.editable || props.updating) return
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    await nextTick()
    updatePosition()
  }
}

function pick(next: string) {
  menuOpen.value = false
  if (next !== props.status) emit('change', next)
}

function onDocClick(event: MouseEvent) {
  const target = event.target as Node
  if (buttonEl.value?.contains(target) || menuEl.value?.contains(target)) return
  menuOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>
