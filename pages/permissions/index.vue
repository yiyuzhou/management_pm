<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar />

    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 flex-shrink-0">
        <div>
          <h1 class="text-[22px] font-bold text-gray-800">权限管理</h1>
          <p class="text-sm text-gray-400 mt-1">配置每个角色的可见菜单和增删改权限</p>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg text-[13px] font-medium transition-all shadow-sm"
          @click="openCreate"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          新增角色
        </button>
      </header>

      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-800">角色列表</h2>
          </div>
          <div v-if="pending" class="py-16 flex justify-center">
            <div class="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <table v-else class="w-full">
            <thead>
              <tr class="text-left text-[12px] text-gray-400 border-b border-gray-100">
                <th class="px-6 py-3 font-medium">角色</th>
                <th class="px-6 py-3 font-medium">标识</th>
                <th class="px-6 py-3 font-medium">类型</th>
                <th class="px-6 py-3 font-medium">操作权限</th>
                <th class="px-6 py-3 font-medium">可见菜单</th>
                <th class="px-6 py-3 font-medium">成员</th>
                <th class="px-6 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="role in roles"
                :key="role.id"
                class="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td class="px-6 py-4">
                  <div class="text-[13px] font-medium text-gray-800">{{ role.name }}</div>
                  <div v-if="role.description" class="text-xs text-gray-400 mt-0.5">{{ role.description }}</div>
                </td>
                <td class="px-6 py-4 text-[13px] text-gray-500 font-mono">{{ role.slug }}</td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="role.is_system ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ role.is_system ? '系统' : '自定义' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-[13px] text-gray-600">{{ permissionSummary(role.permissions) }}</td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1 max-w-md">
                    <span
                      v-for="key in role.menus"
                      :key="key"
                      class="px-2 py-0.5 text-[11px] rounded-full bg-indigo-50 text-indigo-600"
                    >
                      {{ menuLabel(key) }}
                    </span>
                    <span v-if="!role.menus.length" class="text-xs text-gray-400">无</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-[13px] text-gray-600">{{ role.user_count || 0 }}</td>
                <td class="px-6 py-4">
                  <div class="flex justify-end gap-2">
                    <button
                      class="px-3 py-1.5 text-[13px] text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                      @click="openEdit(role)"
                    >
                      编辑
                    </button>
                    <button
                      v-if="!role.is_system"
                      class="px-3 py-1.5 text-[13px] text-red-500 border border-red-100 rounded-lg hover:bg-red-50"
                      @click="confirmDelete(role)"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <Teleport to="body">
      <div v-if="dialogVisible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="dialogVisible = false"></div>
        <div class="relative w-[760px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-800">{{ editing ? '编辑角色' : '新增角色' }}</h2>
            <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-50 rounded-lg" @click="dialogVisible = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <form class="flex-1 overflow-y-auto px-6 py-5 space-y-5" @submit.prevent="saveRole">
            <div>
              <label class="block text-[13px] font-medium text-slate-600 mb-2">角色名称 <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" required placeholder="如 运营专员" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-slate-600 mb-2">标识 <span class="text-red-500">*</span></label>
              <input
                v-model="form.slug"
                type="text"
                required
                :disabled="editing"
                placeholder="小写字母，如 operator"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <p class="mt-1 text-xs text-gray-400">写入成员账号的角色值，创建后不可修改</p>
            </div>
            <div>
              <label class="block text-[13px] font-medium text-slate-600 mb-2">描述</label>
              <input v-model="form.description" type="text" placeholder="可选" class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-indigo-400" />
            </div>

            <div>
              <label class="block text-[13px] font-medium text-slate-600 mb-2">可见菜单</label>
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="item in editableMenus"
                  :key="item.key"
                  class="flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-lg text-[13px] text-gray-700 cursor-pointer hover:bg-gray-50"
                >
                  <input v-model="form.menus" type="checkbox" :value="item.key" class="rounded text-indigo-500" />
                  {{ item.label }}
                </label>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-[13px] font-medium text-slate-600">操作权限</label>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <span>从角色复制</span>
                  <select
                    class="px-2 py-1 border border-gray-200 rounded-md text-[12px] text-gray-700"
                    :value="copyFrom"
                    @change="copyPermissions(($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">选择模板</option>
                    <option v-for="role in roles" :key="role.slug" :value="role.slug">{{ role.name }}</option>
                  </select>
                </div>
              </div>
              <p class="text-xs text-gray-400 mb-3">任务 / Bug / 周报的「编辑」可设为仅自己的记录。</p>
              <div class="border border-gray-100 rounded-xl overflow-hidden">
                <table class="w-full text-[13px]">
                  <thead class="bg-gray-50 text-gray-400">
                    <tr>
                      <th class="px-3 py-2 text-left font-medium">资源</th>
                      <th v-for="action in permissionActions" :key="action.key" class="px-3 py-2 text-center font-medium w-28">{{ action.label }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="resource in permissionResources" :key="resource.key" class="border-t border-gray-50">
                      <td class="px-3 py-2 text-gray-700">{{ resource.label }}</td>
                      <td v-for="action in permissionActions" :key="action.key" class="px-3 py-2 text-center">
                        <select
                          v-if="action.key === 'update' && ownUpdateResources.includes(resource.key)"
                          class="w-[108px] px-1.5 py-1 border border-gray-200 rounded-md text-[12px]"
                          :value="form.permissions[`${resource.key}:${action.key}`] || ''"
                          @change="setScope(`${resource.key}:${action.key}`, ($event.target as HTMLSelectElement).value)"
                        >
                          <option value="">无</option>
                          <option value="own">仅自己的</option>
                          <option value="all">全部</option>
                        </select>
                        <input
                          v-else
                          type="checkbox"
                          class="rounded text-indigo-500"
                          :checked="form.permissions[`${resource.key}:${action.key}`] === 'all'"
                          @change="toggleAll(`${resource.key}:${action.key}`, ($event.target as HTMLInputElement).checked)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p v-if="formError" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{{ formError }}</p>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="px-5 py-2 text-sm text-slate-600 border border-gray-200 rounded-lg" @click="dialogVisible = false">取消</button>
              <button type="submit" class="px-5 py-2 text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { RoleRecord } from '~/types'
import { MENU_CATALOG } from '~/utils/menus'
import {
  OWN_UPDATE_RESOURCES,
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  permissionSummary,
  scopesFromStaticMatrix,
  type PermissionMap,
} from '~/utils/permission-matrix'

const { user } = useAuth()
if (user.value && user.value.role !== 'admin') {
  await navigateTo('/')
}

const { data: rolesData, pending, refresh } = await useFetch<RoleRecord[]>('/api/roles', {
  default: () => []
})
const roles = computed(() => rolesData.value || [])

const editableMenus = MENU_CATALOG.filter(item => !item.adminOnly)
const permissionResources = PERMISSION_RESOURCES
const permissionActions = PERMISSION_ACTIONS
const ownUpdateResources = OWN_UPDATE_RESOURCES

const dialogVisible = ref(false)
const editing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const copyFrom = ref('')
const form = reactive({
  name: '',
  slug: '',
  description: '',
  menus: [] as string[],
  permissions: {} as PermissionMap,
  is_system: false
})

function menuLabel(key: string) {
  return MENU_CATALOG.find(item => item.key === key)?.label || key
}

function setScope(key: string, value: string) {
  if (!value) {
    const next = { ...form.permissions }
    delete next[key]
    form.permissions = next
    return
  }
  form.permissions = { ...form.permissions, [key]: value as 'all' | 'own' }
}

function toggleAll(key: string, checked: boolean) {
  setScope(key, checked ? 'all' : '')
}

function copyPermissions(slug: string) {
  copyFrom.value = slug
  if (!slug) return
  const found = roles.value.find(item => item.slug === slug)
  form.permissions = { ...(found?.permissions || scopesFromStaticMatrix(slug)) }
}

function openCreate() {
  editing.value = false
  editingId.value = null
  copyFrom.value = 'developer'
  form.name = ''
  form.slug = ''
  form.description = ''
  form.menus = MENU_CATALOG.filter(item => !item.adminOnly).map(item => item.key)
  form.permissions = { ...scopesFromStaticMatrix('developer') }
  form.is_system = false
  formError.value = ''
  dialogVisible.value = true
}

function openEdit(role: RoleRecord) {
  editing.value = true
  editingId.value = role.id
  copyFrom.value = ''
  form.name = role.name
  form.slug = role.slug
  form.description = role.description || ''
  form.menus = [...(role.menus || [])].filter(key => key !== 'permissions')
  form.permissions = { ...(role.permissions || {}) }
  form.is_system = role.is_system
  formError.value = ''
  dialogVisible.value = true
}

async function saveRole() {
  saving.value = true
  formError.value = ''
  try {
    if (editing.value && editingId.value) {
      await $fetch(`/api/roles/${editingId.value}`, {
        method: 'PUT',
        body: {
          name: form.name,
          description: form.description,
          menus: form.menus,
          permissions: form.permissions
        }
      })
    } else {
      await $fetch('/api/roles', {
        method: 'POST',
        body: {
          name: form.name,
          slug: form.slug,
          description: form.description,
          inherit_role: copyFrom.value || 'developer',
          menus: form.menus,
          permissions: form.permissions
        }
      })
    }
    dialogVisible.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err.data?.statusMessage || err.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(role: RoleRecord) {
  if (!window.confirm(`确定删除角色「${role.name}」？`)) return
  try {
    await $fetch(`/api/roles/${role.id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    window.alert(err.data?.statusMessage || err.message || '删除失败')
  }
}
</script>
