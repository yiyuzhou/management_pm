<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="close">
        <div class="absolute inset-0 bg-black/45 backdrop-blur-sm" @click="close"></div>
        <div class="relative w-full max-w-[1080px] max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h3 class="text-lg font-bold text-gray-800">系统使用说明</h3>
              <p class="text-xs text-gray-400 mt-0.5">从立项到迭代收口的协作流程</p>
            </div>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50" @click="close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            <div class="space-y-4">
              <div v-for="step in steps" :key="step.n" class="flex gap-3">
                <div class="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5" :class="step.tone">{{ step.n }}</div>
                <div>
                  <div class="text-sm font-semibold text-gray-800">{{ step.title }}</div>
                  <p class="text-xs text-gray-500 leading-5 mt-1">{{ step.desc }}</p>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 rounded-xl border border-slate-100 p-5 overflow-x-auto">
              <div class="text-xs font-medium text-gray-500 mb-4 flex items-center gap-3">
                <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-pink-500"></span> 产品 / 项目经理</span>
                <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> 开发</span>
                <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> 测试</span>
              </div>

              <div class="min-w-[520px] flex flex-col items-center">
                <div class="flex items-center gap-2">
                  <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-pink-50 text-pink-700 border-pink-100">新建项目</div>
                  <span class="text-slate-300 text-sm">→</span>
                  <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-pink-50 text-pink-700 border-pink-100">新建迭代</div>
                  <span class="text-slate-300 text-sm">→</span>
                  <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-pink-50 text-pink-700 border-pink-100">迭代中新增需求</div>
                </div>
                <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-pink-50 text-pink-700 border-pink-100 w-[280px] text-center">需求评审会后<br><span class="font-normal text-[11px]">评审中 → 已确定</span></div>
                <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-blue-50 text-blue-700 border-blue-100 w-[280px] text-center">开发确认需求并新建任务</div>
                <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-blue-50 text-blue-700 border-blue-100 w-[280px] text-center">开发中及时变更任务状态</div>
                <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-blue-50 text-blue-700 border-blue-100 w-[280px] text-center">任务状态变为「已完成」</div>
                <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-amber-50 text-amber-700 border-amber-100 w-[280px] text-center">测试介入测试</div>
                <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-amber-50 text-amber-700 border-amber-100 w-[280px] text-center">发现问题则记录到 Bug 追踪</div>
                <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                <div class="relative pl-10">
                  <div class="absolute left-0 top-4 bottom-6 w-7 border-2 border-r-0 border-orange-400 rounded-l-2xl pointer-events-none"></div>
                  <div class="absolute left-[5px] top-1.5 text-orange-400 text-[10px] leading-none">▲</div>
                  <div class="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-orange-500 whitespace-nowrap">打回修复</div>

                  <div class="flex flex-col items-center">
                    <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-blue-50 text-blue-700 border-blue-100 w-[280px] text-center">开发确认 Bug 并修复</div>
                    <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                    <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-amber-50 text-amber-700 border-amber-100 w-[280px] text-center">测试复测</div>
                    <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                    <div class="flex items-center gap-2">
                      <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-orange-50 text-orange-600 border-orange-200 ring-1 ring-orange-200">重新打开</div>
                      <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-emerald-50 text-emerald-600 border-emerald-100">已验证</div>
                      <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-slate-100 text-slate-600 border-slate-200">已关闭</div>
                    </div>
                    <p class="text-[11px] text-gray-400 mt-1.5">复测后由测试修改 Bug 状态；重新打开则回到开发修复</p>
                  </div>
                </div>
                <div class="text-slate-300 text-sm leading-5 my-0.5">↓</div>
                <div class="px-3 py-2 rounded-lg text-xs font-semibold border shadow-sm bg-pink-50 text-pink-700 border-pink-100 w-[320px] text-center">本迭代需求、任务、Bug 均已解决<br><span class="font-normal text-[11px]">产品经理确认无误后修改迭代状态</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

const steps = [
  { n: 1, tone: 'bg-pink-500', title: '立项与迭代', desc: '项目经理或产品先新增项目，再新增项目迭代，然后到该迭代中新增需求。' },
  { n: 2, tone: 'bg-pink-500', title: '需求评审定稿', desc: '待开完需求会议后，把新增需求从「评审中」修改为「已确定」。' },
  { n: 3, tone: 'bg-blue-500', title: '开发拆任务', desc: '开发确认需求后去新增任务，开发过程中及时变更任务状态。' },
  { n: 4, tone: 'bg-amber-500', title: '测试介入', desc: '任务状态为「已完成」后，测试介入测试。测出问题则记录到 Bug 追踪。' },
  { n: 5, tone: 'bg-blue-500', title: 'Bug 确认与修复', desc: '开发对 Bug 进行确认，确认后修复；修复完成后测试再介入复测。' },
  { n: 6, tone: 'bg-amber-500', title: '复测结论', desc: '测试可将复测 Bug 修改为「重新打开」「已验证」或「已关闭」。' },
  { n: 7, tone: 'bg-pink-500', title: '迭代收口', desc: '本次迭代中所有需求、任务和 Bug 都已解决后，由产品经理确认无误并修改迭代状态。' }
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
