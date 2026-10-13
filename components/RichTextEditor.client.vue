<template>
  <div class="rich-text-editor rounded-lg border border-gray-200 overflow-hidden bg-white">
    <Toolbar
      class="rich-text-toolbar"
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <Editor
      v-model="html"
      class="rich-text-body"
      :style="{ height }"
      :default-config="editorConfig"
      :mode="mode"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
    <div class="flex items-center justify-end px-3 py-1.5 border-t border-gray-100 text-[11px] text-gray-400 bg-gray-50/80">
      {{ wordCount }} 个字
    </div>
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  height?: string
}>(), {
  modelValue: '',
  placeholder: '请输入需求详细描述...',
  height: '280px'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const mode = 'default'
const editorRef = shallowRef()
const html = ref(props.modelValue || '')
const wordCount = ref(0)
const syncing = ref(false)

const toolbarConfig = {
  excludeKeys: ['group-video', 'insertVideo', 'uploadVideo']
}

const editorConfig = {
  placeholder: props.placeholder,
  autoFocus: false,
  MENU_CONF: {
    uploadImage: {
      customUpload: async (file: File, insertFn: (url: string, alt: string, href: string) => void) => {
        const formData = new FormData()
        formData.append('file', file)
        const result = await $fetch<{ url: string; filename: string }>('/api/upload', {
          method: 'POST',
          body: formData
        })
        insertFn(result.url, result.filename || file.name, result.url)
      }
    }
  }
}

function handleCreated(editor: any) {
  editorRef.value = editor
  wordCount.value = editor.getText().replace(/\s+/g, '').length
}

function handleChange(editor: any) {
  wordCount.value = editor.getText().replace(/\s+/g, '').length
  syncing.value = true
  emit('update:modelValue', html.value)
  nextTick(() => { syncing.value = false })
}

watch(() => props.modelValue, (value) => {
  if (syncing.value) return
  const next = value || ''
  if (next !== html.value) html.value = next
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) editor.destroy()
})
</script>

<style>
.rich-text-editor .w-e-toolbar {
  border-bottom: 1px solid #e5e7eb !important;
  background: #fafafa !important;
  padding: 4px 6px !important;
}
.rich-text-editor .w-e-bar {
  background: transparent !important;
}
.rich-text-editor .w-e-text-container {
  background: #fff !important;
}
.rich-text-editor .w-e-scroll {
  min-height: 180px;
}
.rich-text-editor .w-e-text-placeholder {
  font-size: 14px;
  color: #9ca3af;
  left: 16px !important;
  top: 12px !important;
}
.rich-text-editor .w-e-text-container [data-slate-editor] {
  padding: 12px 16px !important;
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
}
</style>
