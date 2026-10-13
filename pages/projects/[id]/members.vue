<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-4">
          <button class="text-gray-400 hover:text-gray-600" @click="router.push(`/projects/${projectId}`)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex items-center gap-3">
            <div v-if="project" class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: (project.color || '#3b82f6') + '20' }">
              <svg class="w-5 h-5" :style="{ color: project.color || '#3b82f6' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-800">{{ project?.name || '项目' }} - 成员管理</h1>
              <p class="text-xs text-gray-400 mt-0.5">共 {{ members.length }} 位成员</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="searchKeyword" type="text" placeholder="搜索成员..." class="w-52 pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 focus:bg-white transition-all" />
          </div>
          <button v-if="can('update', 'project')" class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" @click="showAddModal = true">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            添加成员
          </button>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="pending" class="flex-1 flex items-center justify-center">
        <div class="text-gray-400 text-sm">加载中...</div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center py-20">
        <p class="text-gray-400 text-sm mb-2">{{ error.statusCode === 404 ? '项目不存在' : '加载失败' }}</p>
        <button class="text-blue-500 text-sm hover:underline" @click="router.push('/projects')">返回项目列表</button>
      </div>

      <!-- Content -->
      <div v-else class="flex-1 overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto">
          <!-- Role Stats -->
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <div class="text-2xl font-bold text-gray-800">{{ members.length }}</div>
              <div class="text-sm text-gray-500 mt-1">全部成员</div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <div class="text-2xl font-bold text-purple-500">{{ ownerCount }}</div>
              <div class="text-sm text-gray-500 mt-1">所有者</div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <div class="text-2xl font-bold text-blue-500">{{ adminCount }}</div>
              <div class="text-sm text-gray-500 mt-1">管理员</div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100">
              <div class="text-2xl font-bold text-gray-500">{{ memberCount }}</div>
              <div class="text-sm text-gray-500 mt-1">普通成员</div>
            </div>
          </div>

          <!-- Member List -->
          <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">成员</th>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">邮箱</th>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">职位</th>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">项目角色</th>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">加入时间</th>
                  <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredMembers" :key="member.id" class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-sm font-medium">
                        {{ member.nickname?.charAt(0) || '?' }}
                      </div>
                      <span class="text-sm font-medium text-gray-800">{{ member.nickname }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm text-gray-500">{{ member.email || '-' }}</td>
                  <td class="px-5 py-4">
                    <span class="text-sm text-gray-600">{{ getRoleLabel(member.user_role) }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="px-2 py-1 rounded text-xs font-medium" :class="getMemberRoleClass(member.role)">{{ getMemberRoleLabel(member.role) }}</span>
                  </td>
                  <td class="px-5 py-4 text-sm text-gray-500">{{ formatDate(member.joined_at) }}</td>
                  <td class="px-5 py-4">
                    <div v-if="can('update', 'project')" class="flex items-center gap-2">
                      <select
                        :value="member.role"
                        class="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 focus:outline-none focus:border-blue-300 cursor-pointer"
                        :disabled="member.role === 'owner'"
                        @change="changeRole(member, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="owner">所有者</option>
                        <option value="admin">管理员</option>
                        <option value="member">成员</option>
                      </select>
                      <button
                        class="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        :disabled="member.role === 'owner'"
                        :title="member.role === 'owner' ? '不能移除所有者' : '移除成员'"
                        @click="removeMember(member)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                    <span v-else class="px-2 py-1 text-xs text-gray-500">{{ PROJECT_MEMBER_ROLE_LABELS[member.role] || member.role }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="filteredMembers.length === 0" class="py-16 text-center">
              <svg class="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <p class="text-sm text-gray-400">{{ searchKeyword ? '没有找到匹配的成员' : '暂无成员' }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Member Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAddModal = false">
          <div class="bg-white rounded-xl w-[440px] shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">添加成员</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="showAddModal = false">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">选择成员（可多选）</label>
                <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-2 space-y-1">
                  <label
                    v-for="user in availableUsers"
                    :key="user.id"
                    class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      :value="user.id"
                      v-model="newMember.userIds"
                      class="w-4 h-4 text-blue-500 rounded focus:ring-blue-400 border-gray-300"
                    />
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium">
                        {{ user.name?.charAt(0) || '?' }}
                      </div>
                      <span class="text-sm text-gray-800">{{ user.name }}</span>
                      <span class="text-xs text-gray-400">({{ getRoleLabel(user.role) }})</span>
                    </div>
                  </label>
                  <p v-if="availableUsers.length === 0" class="text-xs text-gray-400 text-center py-4">所有用户已加入该项目</p>
                </div>
                <p v-if="newMember.userIds.length > 0" class="text-xs text-blue-600 mt-1.5">已选择 {{ newMember.userIds.length }} 位成员</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">项目角色</label>
                <div class="flex items-center gap-3">
                  <label v-for="r in ['admin', 'member'] as const" :key="r" class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" :value="r" v-model="newMember.role" class="text-blue-500 focus:ring-blue-400" />
                    <span class="text-sm text-gray-700">{{ getMemberRoleLabel(r) }}</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="showAddModal = false">取消</button>
              <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50" :disabled="newMember.userIds.length === 0 || adding" @click="addMember">
                {{ adding ? '添加中...' : `添加 ${newMember.userIds.length} 位成员` }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, ProjectDetail, ProjectMember, ProjectMemberRole } from '~/types'
import { PROJECT_MEMBER_ROLE_LABELS, PROJECT_MEMBER_ROLE_CLASSES } from '~/types'

const { can } = useAuth()

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

const { data: project, pending, error, refresh } = await useFetch<ProjectDetail>(`/api/projects/${projectId}`, {
  server: false,
  default: () => null as any
})

const searchKeyword = ref('')
const showAddModal = ref(false)
const adding = ref(false)

const newMember = reactive({
  userIds: [] as number[],
  role: 'member' as ProjectMemberRole
})

const members = computed<ProjectMember[]>(() => project.value?.members || [])

const filteredMembers = computed(() => {
  if (!searchKeyword.value) return members.value
  const kw = searchKeyword.value.toLowerCase()
  return members.value.filter(m =>
    m.nickname?.toLowerCase().includes(kw) ||
    m.email?.toLowerCase().includes(kw)
  )
})

const ownerCount = computed(() => members.value.filter(m => m.role === 'owner').length)
const adminCount = computed(() => members.value.filter(m => m.role === 'admin').length)
const memberCount = computed(() => members.value.filter(m => m.role === 'member').length)

const availableUsers = computed(() => {
  if (!meta.value || !project.value) return []
  const memberIds = members.value.map(m => m.user_id)
  return meta.value.users.filter(u => !memberIds.includes(u.id))
})

function getMemberRoleLabel(role: ProjectMemberRole) {
  return PROJECT_MEMBER_ROLE_LABELS[role] || role
}

function getMemberRoleClass(role: ProjectMemberRole) {
  return PROJECT_MEMBER_ROLE_CLASSES[role] || ''
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    'admin': '管理员',
    'pm': '产品经理',
    'project_manager': '项目经理',
    'developer': '开发',
    'tester': '测试'
  }
  return map[role] || role || '-'
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function addMember() {
  if (newMember.userIds.length === 0) return
  adding.value = true
  const failedUsers: string[] = []
  const successCount = ref(0)

  try {
    // 批量添加成员
    for (const userId of newMember.userIds) {
      try {
        await $fetch(`/api/projects/${projectId}/members`, {
          method: 'POST',
          body: {
            user_id: userId,
            role: newMember.role
          }
        })
        successCount.value++
      } catch (e: any) {
        const user = availableUsers.value.find(u => u.id === userId)
        failedUsers.push(user?.name || `用户${userId}`)
      }
    }

    showAddModal.value = false
    newMember.userIds = []
    newMember.role = 'member'
    await refresh()

    // 显示结果提示
    if (failedUsers.length > 0) {
      alert(`成功添加 ${successCount.value} 位成员，以下成员添加失败：${failedUsers.join(', ')}`)
    } else if (successCount.value > 0) {
      alert(`成功添加 ${successCount.value} 位成员`)
    }
  } catch (e: any) {
    alert(e.data?.message || e.statusMessage || '添加失败')
  } finally {
    adding.value = false
  }
}

async function changeRole(member: ProjectMember, newRole: string) {
  const oldRole = member.role
  member.role = newRole as ProjectMemberRole // 乐观更新
  try {
    await $fetch(`/api/projects/${projectId}/members/${member.user_id}`, {
      method: 'PUT',
      body: { role: newRole }
    })
    await refresh()
  } catch (e: any) {
    member.role = oldRole // 回滚
    alert(e.data?.message || e.statusMessage || '更新角色失败')
  }
}

async function removeMember(member: ProjectMember) {
  if (!confirm(`确定要移除 ${member.nickname} 吗？`)) return
  try {
    await $fetch(`/api/projects/${projectId}/members/${member.user_id}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || e.statusMessage || '移除失败')
  }
}
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
