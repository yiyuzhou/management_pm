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
              <h2 class="text-lg font-semibold text-gray-800">{{ isEdit ? '编辑需求' : '新建需求' }}</h2>
            </div>
            <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" @click="onClose">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">标题 <span class="text-red-500">*</span></label>
              <input v-model="form.title" type="text" placeholder="请输入需求标题" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" :class="{ 'border-red-300': errors.title }" />
              <p v-if="errors.title" class="mt-1 text-xs text-red-500">{{ errors.title }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <ClientOnly>
                <RichTextEditor v-model="form.description" placeholder="请输入需求详细描述..." height="220px" />
                <template #fallback>
                  <div class="h-[260px] rounded-lg border border-gray-200 bg-white animate-pulse"></div>
                </template>
              </ClientOnly>
            </div>

            <!-- Priority + Status -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">优先级 <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select v-model="form.priority" class="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer" :class="{ 'border-red-300': errors.priority }">
                    <option value="">请选择优先级</option>
                    <option value="p0">P0 最高</option>
                    <option value="p1">P1 高</option>
                    <option value="p2">P2 中</option>
                    <option value="p3">P3 低</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <p v-if="errors.priority" class="mt-1 text-xs text-red-500">{{ errors.priority }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
                <div class="relative">
                  <select v-model="form.status" class="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer">
                    <option v-if="form.status === 'draft'" value="draft">草稿</option>
                    <option value="pending">评审中</option>
                    <option value="approved">已确定</option>
                    <option value="in_progress">进行中</option>
                    <option value="completed">已完成</option>
                    <option v-if="form.status === 'closed' || form.status === 'rejected'" :value="form.status">{{ form.status === 'closed' ? '已关闭' : '已拒绝' }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <!-- Project + Assignee + Iteration -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">所属项目 <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select v-model="form.project_id" class="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer" :class="{ 'border-red-300': errors.project_id }">
                    <option value="">请选择项目</option>
                    <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <p v-if="errors.project_id" class="mt-1 text-xs text-red-500">{{ errors.project_id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">负责人 <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select v-model="form.assignee_id" class="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer" :class="{ 'border-red-300': errors.assignee_id }">
                    <option value="">请选择负责人</option>
                    <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <p v-if="errors.assignee_id" class="mt-1 text-xs text-red-500">{{ errors.assignee_id }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">所属迭代</label>
                <div class="relative">
                  <select v-model="form.iteration_id" class="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all cursor-pointer">
                    <option value="">请选择迭代</option>
                    <option v-for="it in iterations" :key="it.id" :value="it.id">{{ it.name }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            <!-- Expected Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">期望上线日期</label>
              <input v-model="form.expected_date" type="date" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
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
                {{ isEdit ? '保存修改' : '创建需求' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { User, Iteration, Module, Project, Requirement, RequirementStatus } from '~/types'

const props = defineProps<{
  visible: boolean
  users: User[]
  iterations: Iteration[]
  projects?: Project[]
  editData?: Requirement | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const isEdit = computed(() => !!props.editData)
const submitting = ref(false)
const errorMessage = ref('')

const { selectedProjectId } = useProject()

const form = reactive({
  title: '',
  description: '',
  priority: 'p1',
  assignee_id: '',
  iteration_id: '' as string | number,
  project_id: '' as string | number,
  expected_date: '',
  status: 'pending' as RequirementStatus
})

const errors = reactive({
  title: '',
  priority: '',
  assignee_id: '',
  project_id: ''
})

function latestIterationId(): number | '' {
  const list = props.iterations || []
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

watch(() => props.visible, (val) => {
  if (val) {
    errorMessage.value = ''
    if (props.editData) {
      form.title = props.editData.title
      form.description = props.editData.description || ''
      form.priority = props.editData.priority
      form.assignee_id = props.editData.assignee ? String(props.editData.assignee.id) : ''
      form.iteration_id = props.editData.iteration ? props.editData.iteration.id : ''
      form.project_id = props.editData.project ? props.editData.project.id : ''
      form.expected_date = props.editData.expected_date || ''
      form.status = props.editData.status || 'pending'
    } else {
      form.title = ''
      form.description = ''
      form.priority = 'p1'
      form.assignee_id = ''
      form.iteration_id = latestIterationId()
      form.project_id = selectedProjectId.value ?? ''
      form.expected_date = ''
      form.status = 'pending'
    }
    errors.title = ''
    errors.priority = ''
    errors.assignee_id = ''
    errors.project_id = ''
  }
})

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

function onClose() {
  emit('update:visible', false)
}

async function onSubmit(status: string) {
  if (!validate(status !== 'draft')) return

  submitting.value = true
  errorMessage.value = ''

  try {
    const data = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: status === 'draft' ? 'draft' : form.status,
        assignee_id: form.assignee_id ? parseInt(form.assignee_id) : null,
        iteration_id: form.iteration_id ? parseInt(form.iteration_id) : null,
      project_id: form.project_id ? parseInt(form.project_id) : null,
      expected_date: form.expected_date || null
    }

    if (isEdit.value && props.editData) {
      await $fetch(`/api/requirements/${props.editData.id}`, {
        method: 'PUT',
        body: data
      })
    } else {
      await $fetch('/api/requirements', {
        method: 'POST',
        body: data
      })
    }

    emit('success')
    emit('update:visible', false)
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || '操作失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
