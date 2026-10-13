<template>
  <div class="h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-[81px] bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
        <div class="flex items-center gap-3">
          <button
            class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            @click="router.push('/requirements')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <span>需求池</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <span>新建需求</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-gray-800">新建需求</span>
              <span class="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-500">草稿</span>
            </div>
          </div>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors border border-gray-200"
          @click="router.push('/requirements')"
        >
          返回
        </button>
      </header>

      <div class="flex-1 overflow-y-auto">
        <div class="w-full px-6 py-6 flex gap-5 items-start">
          <div class="w-[360px] flex flex-col gap-5 flex-shrink-0">
            <div class="bg-white rounded-2xl p-6" style="box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div class="flex items-center mb-5">
                <span class="w-[5px] h-5 rounded-full bg-blue-500 mr-3"></span>
                <h3 class="text-base font-semibold text-gray-800">基本信息</h3>
              </div>

              <div class="mb-5">
                <label class="block text-[13px] font-medium text-gray-700 mb-2">标题 <span class="text-red-500">*</span></label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="请输入需求标题"
                  class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-all"
                  :class="{ 'border-red-300': errors.title }"
                />
                <p v-if="errors.title" class="mt-1 text-xs text-red-500">{{ errors.title }}</p>
              </div>

              <div class="mb-5">
                <label class="block text-[13px] font-medium text-gray-700 mb-2">优先级 <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select
                    v-model="form.priority"
                    class="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
                    :class="{ 'border-red-300': errors.priority }"
                  >
                    <option value="p0">P0 最高</option>
                    <option value="p1">P1 高</option>
                    <option value="p2">P2 中</option>
                    <option value="p3">P3 低</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <p v-if="errors.priority" class="mt-1 text-xs text-red-500">{{ errors.priority }}</p>
              </div>

              <div class="mb-5">
                <label class="block text-[13px] font-medium text-gray-700 mb-2">所属项目 <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select
                    v-model="form.project_id"
                    class="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
                    :class="{ 'border-red-300': errors.project_id }"
                  >
                    <option value="">请选择项目</option>
                    <option v-for="p in meta?.projects || []" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <p v-if="errors.project_id" class="mt-1 text-xs text-red-500">{{ errors.project_id }}</p>
              </div>

              <div class="mb-5">
                <label class="block text-[13px] font-medium text-gray-700 mb-2">负责人 <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select
                    v-model="form.assignee_id"
                    class="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all cursor-pointer"
                    :class="{ 'border-red-300': errors.assignee_id }"
                  >
                    <option value="">请选择负责人</option>
                    <option v-for="u in meta?.users || []" :key="u.id" :value="u.id">{{ u.name }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <p v-if="errors.assignee_id" class="mt-1 text-xs text-red-500">{{ errors.assignee_id }}</p>
              </div>

              <div class="mb-5">
                <label class="block text-[13px] font-medium text-gray-700 mb-2">所属迭代</label>
                <div class="relative">
                  <select v-model="form.iteration_id" class="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all cursor-pointer">
                    <option value="">请选择迭代</option>
                    <option v-for="it in meta?.iterations || []" :key="it.id" :value="it.id">{{ it.name }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>

              <div>
                <label class="block text-[13px] font-medium text-gray-700 mb-2">期望上线日期</label>
                <input v-model="form.expected_date" type="date" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all" />
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col gap-5 min-w-0">
            <div class="bg-white rounded-2xl p-6" style="box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div class="flex items-center mb-5">
                <span class="w-[5px] h-5 rounded-full bg-blue-500 mr-3"></span>
                <h3 class="text-base font-semibold text-gray-800">需求描述</h3>
              </div>
              <ClientOnly>
                <RichTextEditor v-model="form.description" placeholder="可直接粘贴飞书链接、插入图片和排版需求说明..." height="420px" />
                <template #fallback>
                  <div class="h-[460px] rounded-lg border border-gray-200 bg-white animate-pulse"></div>
                </template>
              </ClientOnly>
            </div>

            <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <footer class="h-[76px] bg-white border-t border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
        <div class="text-xs text-gray-400">创建后可在需求详情中继续关联原型中心的原型</div>
        <div class="flex items-center gap-3">
          <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="router.push('/requirements')">取消</button>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            :disabled="submitting"
            @click="onSubmit('draft')"
          >
            保存为草稿
          </button>
          <button
            class="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="submitting"
            @click="onSubmit('pending')"
          >
            <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            创建需求
          </button>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse } from '~/types'

const router = useRouter()
const { selectedProjectId } = useProject()

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

function latestIterationId(): number | '' {
  const list = meta.value?.iterations || []
  if (list.length === 0) return ''
  const sorted = [...list].sort((a, b) => {
    const da = a.start_date ? Date.parse(String(a.start_date)) : 0
    const db = b.start_date ? Date.parse(String(b.start_date)) : 0
    const sa = Number.isNaN(da) ? 0 : da
    const sb = Number.isNaN(db) ? 0 : db
    if (sb !== sa) return sb - sa
    return (b.id || 0) - (a.id || 0)
  })
  return sorted[0].id
}

const form = reactive({
  title: '',
  description: '',
  priority: 'p1',
  assignee_id: '' as string | number,
  iteration_id: latestIterationId() as string | number,
  project_id: (selectedProjectId.value ?? '') as string | number,
  expected_date: ''
})

const errors = reactive({
  title: '',
  priority: '',
  assignee_id: '',
  project_id: ''
})

const submitting = ref(false)
const errorMessage = ref('')

function validate(requireAll: boolean): boolean {
  let valid = true
  errors.title = ''
  errors.priority = ''
  errors.assignee_id = ''
  errors.project_id = ''
  if (!form.project_id) { errors.project_id = '请选择所属项目'; valid = false }
  if (requireAll) {
    if (!form.title.trim()) { errors.title = '请输入需求标题'; valid = false }
    if (!form.priority) { errors.priority = '请选择优先级'; valid = false }
    if (!form.assignee_id) { errors.assignee_id = '请选择负责人'; valid = false }
  }
  return valid
}

async function onSubmit(status: 'draft' | 'pending') {
  if (!validate(status !== 'draft')) return
  submitting.value = true
  errorMessage.value = ''
  try {
    const result = await $fetch<any>('/api/requirements', {
      method: 'POST',
      body: {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status,
        assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
        iteration_id: form.iteration_id ? Number(form.iteration_id) : null,
        project_id: form.project_id ? Number(form.project_id) : null,
        expected_date: form.expected_date || null
      }
    })
    router.push(`/requirements/${result.id}`)
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || '创建失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>
