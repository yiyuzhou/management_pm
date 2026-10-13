<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue && src"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 overflow-hidden"
        @click="close"
        @wheel.prevent="onWheel"
      >
        <button
          class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="关闭"
          @click.stop="close"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <button
          v-if="hasPrev"
          class="absolute left-4 z-10 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full"
          title="上一张"
          @click.stop="$emit('prev')"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          v-if="hasNext"
          class="absolute right-4 z-10 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full"
          title="下一张"
          @click.stop="$emit('next')"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <img
          :src="src"
          :alt="title"
          class="max-w-[90vw] max-h-[80vh] object-contain select-none"
          :class="scale > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'"
          :style="{ transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`, transformOrigin: 'center center' }"
          draggable="false"
          @click.stop
          @dblclick.stop="toggleZoom"
          @mousedown.prevent="onDragStart"
        />

        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" @click.stop>
          <p v-if="title" class="text-white/80 text-sm px-3 py-1 rounded-full bg-black/40 max-w-[70vw] truncate">
            {{ title }}
          </p>
          <div class="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white/80">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-40"
              title="缩小"
              :disabled="scale <= minScale"
              @click="zoomBy(-0.25)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </button>
            <button class="min-w-[56px] text-xs tabular-nums hover:text-white" title="重置" @click="resetZoom">
              {{ Math.round(scale * 100) }}%
            </button>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-40"
              title="放大"
              :disabled="scale >= maxScale"
              @click="zoomBy(0.25)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  src?: string | null
  title?: string
  hasPrev?: boolean
  hasNext?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  prev: []
  next: []
}>()

const minScale = 0.5
const maxScale = 4
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const dragging = ref(false)
const dragStart = { x: 0, y: 0, tx: 0, ty: 0 }

function close() {
  emit('update:modelValue', false)
}

function clampScale(value: number) {
  return Math.min(maxScale, Math.max(minScale, Number(value.toFixed(2))))
}

function resetZoom() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function zoomBy(delta: number) {
  const next = clampScale(scale.value + delta)
  scale.value = next
  if (next <= 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

function toggleZoom() {
  if (scale.value > 1) resetZoom()
  else scale.value = 2
}

function onWheel(e: WheelEvent) {
  zoomBy(e.deltaY > 0 ? -0.15 : 0.15)
}

function onDragStart(e: MouseEvent) {
  if (scale.value <= 1) return
  dragging.value = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.tx = translateX.value
  dragStart.ty = translateY.value
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e: MouseEvent) {
  if (!dragging.value) return
  translateX.value = dragStart.tx + (e.clientX - dragStart.x)
  translateY.value = dragStart.ty + (e.clientY - dragStart.y)
}

function onDragEnd() {
  dragging.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

function onKey(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') emit('prev')
  if (e.key === 'ArrowRight') emit('next')
  if (e.key === '+' || e.key === '=') zoomBy(0.25)
  if (e.key === '-' || e.key === '_') zoomBy(-0.25)
  if (e.key === '0') resetZoom()
}

watch(() => [props.modelValue, props.src], () => {
  resetZoom()
})

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  onDragEnd()
})
</script>
