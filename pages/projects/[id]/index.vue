<template>
  <div class="min-h-screen flex bg-slate-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="bg-white border-b border-slate-100 flex items-center justify-between px-8 py-4 flex-shrink-0">
        <div class="flex items-center gap-4">
          <!-- Loading -->
          <div v-if="pending" class="flex items-center gap-3">
            <div class="h-7 w-32 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <!-- Error -->
          <div v-else-if="error" class="flex items-center gap-3">
            <h1 class="text-[22px] font-bold text-slate-900">项目管理</h1>
          </div>
          <!-- Loaded -->
          <template v-else>
            <h1 class="text-[22px] font-bold text-slate-900">项目管理</h1>
            <span
              v-if="project"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium"
              :class="getStatusBadgeClass(project.status)"
            >
              <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(project.status)"></span>
              {{ getStatusLabel(project.status) }}
            </span>
          </template>
        </div>
        <div class="flex items-center gap-3">
          <!-- Search -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="搜索设置项..." class="w-60 h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all" />
          </div>
          <NotificationBell tone="outline" />
        </div>
      </header>

      <!-- Tab Bar -->
      <div class="bg-white border-b border-slate-100 px-8 flex-shrink-0">
        <div class="flex items-center h-[50px]">
          <button
            class="flex items-center h-full px-5 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === 'info' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'"
            @click="activeTab = 'info'"
          >
            项目信息
          </button>
          <button
            class="flex items-center h-full px-5 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === 'members' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'"
            @click="activeTab = 'members'"
          >
            成员管理
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex-1 flex items-center justify-center">
        <div class="text-slate-400 text-sm">加载中...</div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center py-20">
        <svg class="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-slate-400 text-sm mb-2">{{ error.statusCode === 404 ? '项目不存在或已被删除' : '加载失败' }}</p>
        <button class="text-indigo-500 text-sm hover:underline" @click="router.push('/projects')">返回项目列表</button>
      </div>

      <!-- Content -->
      <div v-else class="flex-1 overflow-y-auto px-8 py-6">
        <!-- Info Tab -->
        <div v-if="activeTab === 'info'" class="space-y-6">
          <!-- Project Basic Info Card -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <!-- Card Title Row -->
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 class="text-base font-semibold text-slate-900">项目基本信息</h3>
              </div>
              <button
                v-if="can('update', 'project')"
                class="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[13px] font-medium transition-colors"
                @click="showEditModal = true"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
                编辑信息
              </button>
            </div>

            <!-- Form Area -->
            <div class="space-y-5">
              <!-- Form Row 1: Name + Status + Color -->
              <div class="flex items-start gap-6">
                <!-- Project Name (flex) -->
                <div class="flex-1">
                  <label class="block text-[13px] font-medium text-slate-600 mb-1.5">项目名称</label>
                  <div class="h-10 flex items-center px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                    {{ project?.name || '—' }}
                  </div>
                </div>
                <!-- Project Status -->
                <div class="w-[200px] flex-shrink-0">
                  <label class="block text-[13px] font-medium text-slate-600 mb-1.5">项目状态</label>
                  <div class="h-10 flex items-center gap-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                    <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(project?.status)"></span>
                    <span>{{ getStatusLabel(project?.status) }}</span>
                  </div>
                </div>
                <!-- Project Color -->
                <div class="w-[180px] flex-shrink-0">
                  <label class="block text-[13px] font-medium text-slate-600 mb-1.5">项目色标</label>
                  <div class="h-10 flex items-center gap-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                    <span class="w-5 h-5 rounded" :style="{ backgroundColor: project?.color || '#6366f1' }"></span>
                    <span>{{ getColorName(project?.color) }}</span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-[13px] font-medium text-slate-600 mb-1.5">项目描述</label>
                <div class="min-h-[72px] py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 leading-relaxed">
                  {{ project?.description || '暂无描述' }}
                </div>
              </div>

              <!-- Form Row 3: Start Date + End Date + Owner -->
              <div class="flex items-start gap-6">
                <!-- Start Date -->
                <div class="w-[200px] flex-shrink-0">
                  <label class="block text-[13px] font-medium text-slate-600 mb-1.5">开始日期</label>
                  <div class="h-10 flex items-center gap-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ formatDate(project?.start_date) || '未设置' }}</span>
                  </div>
                </div>
                <!-- End Date -->
                <div class="w-[200px] flex-shrink-0">
                  <label class="block text-[13px] font-medium text-slate-600 mb-1.5">预计结束</label>
                  <div class="h-10 flex items-center gap-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>{{ formatDate(project?.end_date) || '未设置' }}</span>
                  </div>
                </div>
                <!-- Owner -->
                <div class="w-[200px] flex-shrink-0">
                  <label class="block text-[13px] font-medium text-slate-600 mb-1.5">项目负责人</label>
                  <div class="h-10 flex items-center gap-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800">
                    <template v-if="project?.owner">
                      <div class="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[10px] font-medium">
                        {{ project.owner.name?.charAt(0) || '?' }}
                      </div>
                      <span>{{ project.owner.name }}</span>
                    </template>
                    <span v-else class="text-slate-400">未指定</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Cards Row -->
          <div class="grid grid-cols-4 gap-5">
            <!-- Requirements Card -->
            <button type="button" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:border-indigo-200 hover:shadow-md transition-all" @click="drillTo('/requirements')">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[13px] text-slate-500">需求总数</span>
                <div class="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                </div>
              </div>
              <div class="text-[32px] font-bold text-slate-900 leading-none">{{ project?.stats.requirement_total }}</div>
              <div class="flex items-center gap-1.5 mt-1">
                <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                </svg>
                <span class="text-xs text-emerald-500">已完成 {{ project?.stats.requirement_completed }} 个</span>
              </div>
            </button>

            <!-- Tasks Card -->
            <button type="button" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:border-amber-200 hover:shadow-md transition-all" @click="drillTo('/tasks')">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[13px] text-slate-500">任务总数</span>
                <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-2 8l-2 2-2-2"/>
                  </svg>
                </div>
              </div>
              <div class="text-[32px] font-bold text-slate-900 leading-none">{{ project?.stats.task_total }}</div>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-xs text-slate-500">已完成 {{ project?.stats.task_done }} 个</span>
              </div>
            </button>

            <!-- Bugs Card -->
            <button type="button" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:border-red-200 hover:shadow-md transition-all" @click="drillTo('/bugs')">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[13px] text-slate-500">Bug 总数</span>
                <div class="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="text-[32px] font-bold text-slate-900 leading-none">{{ project?.stats.bug_total }}</div>
              <div class="flex items-center gap-1.5 mt-1">
                <svg class="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01"/>
                </svg>
                <span class="text-xs text-red-600">{{ (project?.stats.bug_total || 0) - (project?.stats.bug_fixed || 0) }} 个待处理</span>
              </div>
            </button>

            <!-- Members Card -->
            <button type="button" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:border-emerald-200 hover:shadow-md transition-all" @click="drillToMembers">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[13px] text-slate-500">团队成员</span>
                <div class="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
              <div class="text-[32px] font-bold text-slate-900 leading-none">{{ project?.members.length || 0 }}</div>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-xs text-slate-500">共 {{ project?.members.length || 0 }} 人</span>
              </div>
            </button>
          </div>

          <!-- Recent Activity Card -->
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <!-- Title Row -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3 class="text-base font-semibold text-slate-900">最近活动</h3>
              </div>
              <button class="text-[13px] text-indigo-500 hover:text-indigo-600 transition-colors">查看全部</button>
            </div>

            <!-- Activity List -->
            <div class="space-y-4">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-start gap-3"
              >
                <!-- Avatar -->
                <div
                  v-if="activity.user"
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                >
                  {{ activity.user.charAt(0) }}
                </div>
                <div v-else class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] text-slate-700 leading-relaxed">
                    <span v-if="activity.user" class="font-medium text-slate-800">{{ activity.user }}</span>
                    <span class="text-slate-600">{{ activity.action }}</span>
                    <span v-if="activity.target" class="font-medium text-indigo-500">{{ activity.target }}</span>
                  </p>
                  <p class="text-[11px] text-slate-400 mt-0.5">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Members Tab -->
        <div v-else-if="activeTab === 'members'">
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <!-- Members Header -->
            <div class="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 class="text-base font-semibold text-slate-900">项目成员</h3>
              <NuxtLink :to="`/projects/${project?.id}/members`" class="text-[13px] text-indigo-500 hover:text-indigo-600 transition-colors">
                管理成员 →
              </NuxtLink>
            </div>
            <!-- Members List -->
            <div class="p-5">
              <div class="flex flex-wrap gap-3">
                <div v-for="member in (project?.members || [])" :key="member.id" class="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-medium">
                    {{ member.nickname?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="text-sm text-slate-700">{{ member.nickname }}</div>
                    <div class="text-xs text-slate-400">{{ getMemberRoleLabel(member.role) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showEditModal = false">
          <div class="bg-white rounded-xl w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 class="text-lg font-bold text-slate-800">编辑项目</h3>
              <button class="text-slate-400 hover:text-slate-600" @click="showEditModal = false">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">项目名称</label>
                <input v-model="editForm.name" type="text" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">项目描述</label>
                <textarea v-model="editForm.description" rows="3" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">项目状态</label>
                  <select v-model="editForm.status" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all">
                    <option value="planning">规划中</option>
                    <option value="active">进行中</option>
                    <option value="paused">已暂停</option>
                    <option value="completed">已完成</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">项目颜色</label>
                  <div class="flex items-center gap-2 py-1.5">
                    <button v-for="color in projectColors" :key="color" class="w-7 h-7 rounded-lg border-2 transition-all" :class="editForm.color === color ? 'border-slate-800' : 'border-transparent'" :style="{ backgroundColor: color }" @click="editForm.color = color"></button>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">开始日期</label>
                  <input v-model="editForm.start_date" type="date" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">预计结束日期</label>
                  <input v-model="editForm.end_date" type="date" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">项目负责人</label>
                <select v-model="editForm.owner_id" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all">
                  <option :value="null">未指定</option>
                  <option v-for="user in meta?.users || []" :key="user.id" :value="user.id">{{ user.name }} ({{ getRoleLabel(user.role) }})</option>
                </select>
              </div>
            </div>
            <div class="flex items-center justify-between p-5 border-t border-slate-100 sticky bottom-0 bg-white">
              <button v-if="can('delete', 'project')" class="px-4 py-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors" @click="deleteProject">
                删除项目
              </button>
              <div class="flex items-center gap-3 ml-auto">
                <button class="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors" @click="showEditModal = false">取消</button>
                <button class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :disabled="saving" @click="saveProject">
                  {{ saving ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, ProjectDetail, ProjectStatus } from '~/types'
import { PROJECT_STATUS_LABELS, PROJECT_MEMBER_ROLE_LABELS } from '~/types'

const { can } = useAuth()
const { selectProject } = useProject()

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

function drillTo(path: string) {
  const id = Number(projectId)
  if (Number.isFinite(id)) selectProject(id)
  router.push(path)
}

function drillToMembers() {
  activeTab.value = 'members'
}

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

const { data: project, pending, error, refresh } = await useFetch<ProjectDetail>(`/api/projects/${projectId}`, {
  server: false,
  default: () => null as any
})

const activeTab = ref<'info' | 'members'>('info')
const showEditModal = ref(false)
const saving = ref(false)

const projectColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

const colorNameMap: Record<string, string> = {
  '#3b82f6': 'Blue',
  '#10b981': 'Emerald',
  '#8b5cf6': 'Violet',
  '#f59e0b': 'Amber',
  '#ef4444': 'Red',
  '#ec4899': 'Pink',
  '#6366f1': 'Indigo'
}

function getColorName(color: string | undefined): string {
  if (!color) return 'Indigo'
  return colorNameMap[color.toLowerCase()] || 'Custom'
}

const editForm = reactive({
  name: '',
  description: '',
  status: 'planning' as ProjectStatus,
  color: '#3b82f6',
  start_date: '',
  end_date: '',
  owner_id: null as number | null
})

watch(() => project.value, (p) => {
  if (p) {
    editForm.name = p.name
    editForm.description = p.description
    editForm.status = p.status
    editForm.color = p.color
    editForm.start_date = p.start_date || ''
    editForm.end_date = p.end_date || ''
    editForm.owner_id = p.owner_id
  }
}, { immediate: true })

// Recent activities computed from project data
const recentActivities = computed(() => {
  if (!project.value) return []
  const activities: { id: number; user: string | null; action: string; target: string | null; time: string }[] = []

  // Owner activity
  if (project.value.owner) {
    activities.push({
      id: 1,
      user: project.value.owner.name,
      action: ' 创建了项目 ',
      target: project.value.name,
      time: formatRelativeTime(project.value.created_at)
    })
  }

  // Recent member joins
  const sortedMembers = [...project.value.members].sort((a, b) => {
    return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
  })
  sortedMembers.slice(0, 3).forEach((m, i) => {
    activities.push({
      id: i + 2,
      user: m.nickname,
      action: ' 加入了项目',
      target: null,
      time: formatRelativeTime(m.joined_at)
    })
  })

  // Updated activity
  if (project.value.updated_at && project.value.updated_at !== project.value.created_at) {
    activities.push({
      id: activities.length + 1,
      user: project.value.owner?.name || null,
      action: ' 更新了项目信息',
      target: null,
      time: formatRelativeTime(project.value.updated_at)
    })
  }

  return activities.slice(0, 4)
})

function getStatusLabel(status: ProjectStatus | undefined) {
  if (!status) return ''
  return PROJECT_STATUS_LABELS[status] || status
}

function getStatusBadgeClass(status: ProjectStatus | undefined) {
  const map: Record<string, string> = {
    planning: 'bg-blue-50 text-blue-600',
    active: 'bg-emerald-50 text-emerald-600',
    paused: 'bg-amber-50 text-amber-600',
    completed: 'bg-indigo-50 text-indigo-600',
    archived: 'bg-slate-100 text-slate-400'
  }
  return map[status || ''] || 'bg-slate-100 text-slate-400'
}

function getStatusDotClass(status: ProjectStatus | undefined) {
  const map: Record<string, string> = {
    planning: 'bg-blue-500',
    active: 'bg-emerald-500',
    paused: 'bg-amber-500',
    completed: 'bg-indigo-500',
    archived: 'bg-slate-400'
  }
  return map[status || ''] || 'bg-slate-400'
}

function getMemberRoleLabel(role: string) {
  return PROJECT_MEMBER_ROLE_LABELS[role as keyof typeof PROJECT_MEMBER_ROLE_LABELS] || role
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    'admin': '管理员',
    'pm': '产品经理',
    'project_manager': '项目经理',
    'developer': '开发',
    'tester': '测试'
  }
  return map[role] || role
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatRelativeTime(dateStr: string | null | undefined) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return formatDate(dateStr)
}

async function saveProject() {
  saving.value = true
  try {
    await $fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: {
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
        color: editForm.color,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
        owner_id: editForm.owner_id
      }
    })
    showEditModal.value = false
    await refresh()
  } catch (e: any) {
    alert(e.data?.message || e.statusMessage || '保存失败')
  } finally {
    saving.value = false
  }
}

async function deleteProject() {
  if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) return
  try {
    await $fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    router.push('/projects')
  } catch (e: any) {
    alert(e.data?.message || e.statusMessage || '删除失败')
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
