<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="onClose"></div>

        <div class="relative w-[680px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-800">新建原型</h2>
            </div>
            <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" @click="onClose">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">原型名称 <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" placeholder="请输入原型名称" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" :class="{ 'border-red-300': errors.name }" />
              <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea v-model="form.description" rows="4" placeholder="请输入原型描述..." class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"></textarea>
            </div>

            <!-- Project + Requirement -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">所属项目 <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select v-model="form.project_id" class="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer" :class="{ 'border-red-300': errors.project_id }" @change="onProjectChange">
                    <option value="">请选择项目</option>
                    <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <p v-if="errors.project_id" class="mt-1 text-xs text-red-500">{{ errors.project_id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">关联需求</label>
                <div class="relative">
                  <select v-model="form.requirement_id" class="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer" :disabled="!form.project_id">
                    <option value="">请选择需求（可选）</option>
                    <option v-for="r in requirementOptions" :key="r.id" :value="r.id">{{ r.title }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <p v-if="!form.project_id" class="mt-1 text-xs text-gray-400">请先选择项目</p>
              </div>
            </div>

            <!-- Error message -->
            <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg text-sm font-medium transition-colors" @click="onSubmit('draft')">
              保存为草稿
            </button>
            <div class="flex items-center gap-3">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="onClose">取消</button>
              <button class="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" :disabled="submitting" @click="onSubmit('pending')">
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                创建原型
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Project, Requirement } from '~/types'

const props = defineProps<{
  visible: boolean
  projects: Project[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const { user } = useAuth()

const submitting = ref(false)
const errorMessage = ref('')
const requirementOptions = ref<Requirement[]>([])

const form = reactive({
  name: '',
  description: '',
  project_id: '',
  requirement_id: ''
})

const errors = reactive({
  name: '',
  project_id: ''
})

watch(() => props.visible, (val) => {
  if (val) {
    errorMessage.value = ''
    form.name = ''
    form.description = ''
    form.project_id = ''
    form.requirement_id = ''
    requirementOptions.value = []
    errors.name = ''
    errors.project_id = ''
  }
})

async function onProjectChange() {
  form.requirement_id = ''
  requirementOptions.value = []
  if (!form.project_id) return
  try {
    const data = await $fetch<{ items: Requirement[] }>('/api/requirements', {
      query: { projectId: form.project_id, pageSize: 100 }
    })
    requirementOptions.value = data?.items || []
  } catch {
    requirementOptions.value = []
  }
}

function validate(): boolean {
  let valid = true
  errors.name = ''
  errors.project_id = ''
  if (!form.name.trim()) { errors.name = '请输入原型名称'; valid = false }
  if (!form.project_id) { errors.project_id = '请选择所属项目'; valid = false }
  return valid
}

function onClose() {
  emit('update:visible', false)
}

async function onSubmit(status: string) {
  if (status !== 'draft' && !validate()) return

  submitting.value = true
  errorMessage.value = ''

  try {
    await $fetch('/api/prototypes', {
      method: 'POST',
      body: {
        name: form.name,
        description: form.description,
        project_id: parseInt(form.project_id),
        requirement_id: form.requirement_id ? parseInt(form.requirement_id) : null,
        creator_id: user.value?.id || null,
        pages: [],
        thumbnail: null
      }
    })

    emit('success')
    emit('update:visible', false)
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || '创建原型失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
