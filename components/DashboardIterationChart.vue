<template>
  <div class="bg-white rounded-2xl p-5 border border-gray-100 mb-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold text-gray-800">各迭代需求</h3>
        <p class="text-xs text-gray-400 mt-0.5">折线为需求总数，柱状为总量，绿色为已完成</p>
      </div>
      <div class="flex items-center gap-4 text-xs text-gray-500">
        <span class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-sm bg-indigo-400"></span>
          需求总数
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-4 h-0.5 rounded-full bg-indigo-500"></span>
          总数趋势
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-4 h-0.5 rounded-full bg-emerald-500"></span>
          已完成
        </span>
      </div>
    </div>

    <div v-if="points.length === 0" class="h-[280px] flex items-center justify-center text-sm text-gray-400">
      暂无迭代数据
    </div>
    <div
      v-else
      ref="chartRef"
      class="relative w-full"
      @mouseleave="hoverIndex = null"
    >
      <svg
        :viewBox="`0 0 ${layout.width} ${layout.height}`"
        preserveAspectRatio="none"
        class="block w-full"
        :style="{ height: layout.height + 'px' }"
      >
        <line
          v-for="(tick, i) in yTicks"
          :key="'g' + i"
          :x1="layout.padding.left"
          :x2="layout.width - layout.padding.right"
          :y1="tick.y"
          :y2="tick.y"
          stroke="#F1F5F9"
          stroke-width="1"
        />
        <text
          v-for="(tick, i) in yTicks"
          :key="'l' + i"
          :x="layout.padding.left - 8"
          :y="tick.y + 4"
          text-anchor="end"
          class="fill-gray-400"
          font-size="11"
        >
          {{ tick.value }}
        </text>

        <rect
          v-for="(point, index) in plotted"
          :key="'bar-' + point.id"
          :x="point.barX"
          :y="point.totalY"
          :width="layout.barWidth"
          :height="Math.max(point.totalH, 0)"
          rx="5"
          :fill="hoverIndex === index ? '#6366F1' : '#C7D2FE'"
          class="cursor-pointer"
          @mouseenter="hoverIndex = index"
        />

        <polyline
          :points="totalLinePoints"
          fill="none"
          stroke="#4F46E5"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <polyline
          :points="doneLinePoints"
          fill="none"
          stroke="#10B981"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray="5 4"
        />

        <circle
          v-for="(point, index) in plotted"
          :key="'total-' + point.id"
          :cx="point.cx"
          :cy="point.totalY"
          r="5"
          fill="#4F46E5"
          stroke="#fff"
          stroke-width="2"
          class="cursor-pointer"
          @mouseenter="hoverIndex = index"
        />
        <circle
          v-for="(point, index) in plotted"
          :key="'done-' + point.id"
          :cx="point.cx"
          :cy="point.doneY"
          r="4"
          fill="#10B981"
          stroke="#fff"
          stroke-width="2"
          class="cursor-pointer"
          @mouseenter="hoverIndex = index"
        />

        <text
          v-for="(point, index) in plotted"
          :key="'x-' + point.id"
          :x="point.cx"
          :y="layout.height - 12"
          text-anchor="middle"
          class="fill-gray-500"
          font-size="12"
        >
          {{ shortName(point.name, index) }}
        </text>
      </svg>

      <div
        v-if="hoverPoint"
        class="absolute z-10 pointer-events-none bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg"
        :style="tooltipStyle"
      >
        <div class="font-medium mb-1">{{ hoverPoint.name }}</div>
        <div>需求总数 {{ hoverPoint.total }}</div>
        <div>已完成 {{ hoverPoint.done }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { chartLayout, niceMax, type IterationRequirementPoint } from '~/utils/dashboard-chart'

const props = defineProps<{
  points: IterationRequirementPoint[]
}>()

const hoverIndex = ref<number | null>(null)
const chartRef = ref<HTMLElement | null>(null)
const chartWidth = ref(960)
const chartHeight = 280
let observer: ResizeObserver | null = null

watch([chartRef, () => props.points.length], () => {
  observer?.disconnect()
  observer = null
  const el = chartRef.value
  if (!el || typeof ResizeObserver === 'undefined') return
  const sync = () => {
    chartWidth.value = Math.max(el.clientWidth, 320)
  }
  sync()
  observer = new ResizeObserver(sync)
  observer.observe(el)
}, { flush: 'post' })

onUnmounted(() => observer?.disconnect())

const layout = computed(() => chartLayout(props.points.length, chartWidth.value, chartHeight))

const maxValue = computed(() => niceMax(Math.max(0, ...props.points.map(p => Math.max(p.total, p.done)))))

const yTicks = computed(() => {
  const max = maxValue.value
  const box = layout.value
  return [0, 1, 2, 3, 4].map((step) => {
    const value = Math.round((max / 4) * step)
    const y = box.padding.top + box.innerHeight - (value / max) * box.innerHeight
    return { value, y }
  })
})

const plotted = computed(() => {
  const max = maxValue.value || 1
  const box = layout.value
  return props.points.map((point, index) => {
    const cx = box.padding.left + box.slot * index + box.slot / 2
    const totalH = (point.total / max) * box.innerHeight
    const doneH = (point.done / max) * box.innerHeight
    return {
      ...point,
      cx,
      barX: cx - box.barWidth / 2,
      totalH,
      totalY: box.padding.top + box.innerHeight - totalH,
      doneY: box.padding.top + box.innerHeight - doneH
    }
  })
})

const totalLinePoints = computed(() => plotted.value.map(p => `${p.cx},${p.totalY}`).join(' '))
const doneLinePoints = computed(() => plotted.value.map(p => `${p.cx},${p.doneY}`).join(' '))
const hoverPoint = computed(() => hoverIndex.value === null ? null : plotted.value[hoverIndex.value])
const tooltipStyle = computed(() => {
  if (!hoverPoint.value) return {}
  const left = (hoverPoint.value.cx / layout.value.width) * 100
  return {
    left: `${Math.min(Math.max(left, 12), 88)}%`,
    top: '8px',
    transform: 'translateX(-50%)'
  }
})

function shortName(name: string, index: number) {
  if (props.points.length > 6) return name.length > 6 ? name.slice(0, 6) + '…' : name
  if (name.length > 12) return name.slice(0, 12) + '…'
  return name || `迭代${index + 1}`
}
</script>
