<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="close">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative w-[680px] max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-800">提交 Bug</h3>
            </div>
            <button class="text-gray-400 hover:text-gray-600" @click="close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5">
            <!-- Bug 标题 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Bug 标题 <span class="text-red-500">*</span></label>
              <input v-model="form.title" type="text" placeholder="请输入 Bug 标题，简明描述问题现象" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
            </div>

            <!-- 严重程度 + 优先级 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">严重程度 <span class="text-red-500">*</span></label>
                <select v-model="form.severity" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="">请选择严重程度</option>
                  <option v-for="(label, val) in SEVERITY_LABELS" :key="val" :value="val">{{ label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">优先级 <span class="text-red-500">*</span></label>
                <select v-model="form.priority" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="">请选择优先级</option>
                  <option v-for="(label, val) in PRIORITY_LABELS" :key="val" :value="val">{{ label }}</option>
                </select>
              </div>
            </div>

            <!-- 所属迭代 + 关联需求 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">所属迭代</label>
                <select v-model="form.iteration_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="">请选择迭代</option>
                  <option v-for="iter in allIterations" :key="iter.id" :value="iter.id">{{ iter.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">关联需求</label>
                <select v-model="form.requirement_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" :disabled="!form.iteration_id">
                  <option value="">{{ form.iteration_id ? '请选择关联需求' : '请先选择迭代' }}</option>
                  <option v-for="req in iterationRequirements" :key="req.req_id" :value="req.req_id">{{ req.id }} - {{ req.title }}</option>
                </select>
              </div>
            </div>

            <!-- 指派给 + 所属模块 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">指派给 <span class="text-red-500">*</span></label>
                <select v-model="form.assignee_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="">请选择负责人</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">所属模块</label>
                <select v-model="form.module" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                  <option value="">请选择模块</option>
                  <option v-for="mod in allModules" :key="mod.id" :value="mod.name">{{ mod.name }}</option>
                </select>
              </div>
            </div>

            <!-- 复现步骤 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">复现步骤 <span class="text-red-500">*</span></label>
              <textarea v-model="form.steps" rows="4" placeholder="请详细描述复现步骤：&#10;1. 打开...&#10;2. 点击...&#10;3. 观察..." class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"></textarea>
            </div>

            <!-- 预期结果 + 实际结果 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">预期结果</label>
                <textarea v-model="form.expected_result" rows="3" placeholder="描述期望的正确行为..." class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">实际结果</label>
                <textarea v-model="form.actual_result" rows="3" placeholder="描述实际出现的错误..." class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"></textarea>
              </div>
            </div>

            <!-- 截图附件 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">截图附件</label>
              <div
                class="border-2 border-dashed border-gray-200 rounded-lg py-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all relative"
                :class="{ 'border-blue-300 bg-blue-50/30': isDragging }"
                @click="triggerFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onFileDrop"
              >
                <input ref="fileInputRef" type="file" class="hidden" multiple accept="image/*" @change="onFileSelect" />
                <svg class="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span v-if="!uploading" class="text-sm text-gray-400">点击或拖拽图片到此处上传</span>
                <span v-else class="text-sm text-blue-500">上传中...</span>
              </div>
              <!-- Uploaded Images Preview -->
              <div v-if="attachments.length > 0" class="mt-2 flex flex-wrap gap-2">
                <div v-for="(att, idx) in attachments" :key="idx" class="relative group">
                  <img :src="att.url" :alt="att.filename" class="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <button class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" @click="removeAttachment(idx)">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
              <p v-if="uploadError" class="mt-1 text-xs text-red-500">{{ uploadError }}</p>
            </div>

            <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="close">取消</button>
            <button class="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!isValid || submitting" @click="submit">
              <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              提交 Bug
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Requirement, User, Iteration, Module, Severity, Priority } from '~/types'
import { SEVERITY_LABELS, PRIORITY_LABELS } from '~/types'

const props = defineProps<{
  visible: boolean
  requirement?: Requirement | null
  users: User[]
  iterations?: Iteration[]
  modules?: Module[]
  requirements?: Requirement[]
  projectId?: number | string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

// 合并传入的 requirements/iterations/modules，支持独立使用
const allRequirements = computed(() => props.requirements || (props.requirement ? [props.requirement] : []))
const allIterations = computed(() => props.iterations || (props.requirement?.iteration ? [props.requirement.iteration] : []))
const allModules = computed(() => props.modules || [])

const submitting = ref(false)
const errorMessage = ref('')
const uploading = ref(false)
const uploadError = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

interface Attachment {
  url: string
  filename: string
  size: number
  type: string
}

const attachments = ref<Attachment[]>([])

const form = reactive({
  title: '',
  severity: '' as Severity | '',
  priority: '' as Priority | '',
  requirement_id: '' as string | number,
  assignee_id: '' as string | number,
  iteration_id: '' as string | number,
  module: '',
  steps: '',
  expected_result: '',
  actual_result: ''
})

const iterationRequirements = computed(() => {
  if (!form.iteration_id) return []
  return allRequirements.value.filter(req => String(req.iteration?.id || '') === String(form.iteration_id))
})

watch(() => form.iteration_id, (id, prev) => {
  if (prev == null || prev === '') return
  if (String(id) === String(prev)) return
  form.requirement_id = ''
})

// 弹窗打开时重置表单，如果有 requirement 则预填
watch(() => props.visible, (visible) => {
  if (visible) {
    form.title = ''
    form.severity = ''
    form.priority = ''
    form.steps = ''
    form.expected_result = ''
    form.actual_result = ''
    form.module = ''
    form.requirement_id = ''
    form.assignee_id = ''
    form.iteration_id = ''
    attachments.value = []
    uploadError.value = ''
    errorMessage.value = ''

    if (props.requirement) {
      form.requirement_id = props.requirement.req_id
      if (props.requirement.iteration) {
        form.iteration_id = props.requirement.iteration.id
      }
    }
  }
})

const isValid = computed(() => {
  return form.title && form.severity && form.priority && form.assignee_id && form.steps
})

function close() {
  emit('update:visible', false)
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    uploadFiles(Array.from(target.files))
    target.value = ''
  }
}

function onFileDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    uploadFiles(Array.from(e.dataTransfer.files))
  }
}

async function uploadFiles(files: File[]) {
  uploadError.value = ''
  uploading.value = true
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      attachments.value.push(result as Attachment)
    } catch (e: any) {
      uploadError.value = e.data?.message || e.statusMessage || `上传 ${file.name} 失败`
    }
  }
  uploading.value = false
}

function removeAttachment(idx: number) {
  attachments.value.splice(idx, 1)
}

async function submit() {
  if (!isValid.value) return
  submitting.value = true
  errorMessage.value = ''

  try {
    const body: Record<string, any> = {
      title: form.title,
      severity: form.severity,
      priority: form.priority,
      assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
      steps: form.steps,
      expected_result: form.expected_result,
      actual_result: form.actual_result,
    }

    if (form.requirement_id) {
      body.requirement_id = Number(form.requirement_id)
    }
    if (form.iteration_id) {
      body.iteration_id = Number(form.iteration_id)
    }
    if (form.module) {
      body.module = form.module
    }
    if (props.requirement?.project?.id) {
      body.project_id = props.requirement.project.id
    } else if (props.projectId) {
      body.project_id = Number(props.projectId)
    }

    await $fetch('/api/bugs', {
      method: 'POST',
      body
    })

    emit('success')
    emit('update:visible', false)
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || '提交失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
