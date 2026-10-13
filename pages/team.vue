<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部栏 -->
      <header class="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 flex-shrink-0">
        <h1 class="text-[22px] font-bold text-gray-800">团队设置</h1>
        <div class="flex items-center gap-3">
          <!-- 搜索框 -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索成员姓名或角色..."
              class="w-60 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-all"
            />
          </div>
          <!-- 新增成员按钮 -->
          <button
            v-if="can('create', 'user')"
            class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg text-[13px] font-medium transition-all shadow-sm"
            @click="showAddDialog = true"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            新增成员
          </button>
        </div>
      </header>

      <!-- 内容滚动区 -->
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <!-- 统计卡片行 -->
        <div class="flex gap-5 mb-6">
          <!-- 团队总人数 -->
          <div class="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[13px] text-slate-500">团队总人数</div>
                <div class="text-[28px] font-bold text-gray-800 mt-1">{{ users.length }}</div>
              </div>
              <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
            </div>
          </div>
          <!-- 产品/项目管理 -->
          <div class="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[13px] text-slate-500">产品/项目管理</div>
                <div class="text-[28px] font-bold text-gray-800 mt-1">{{ managementCount }}</div>
              </div>
              <div class="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                </svg>
              </div>
            </div>
          </div>
          <!-- 开发 -->
          <div class="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[13px] text-slate-500">开发</div>
                <div class="text-[28px] font-bold text-gray-800 mt-1">{{ devCount }}</div>
              </div>
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                </svg>
              </div>
            </div>
          </div>
          <!-- 测试 -->
          <div class="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[13px] text-slate-500">测试</div>
                <div class="text-[28px] font-bold text-gray-800 mt-1">{{ testerCount }}</div>
              </div>
              <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>
          <!-- 主管 -->
          <div class="flex-1 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[13px] text-slate-500">主管</div>
                <div class="text-[28px] font-bold text-gray-800 mt-1">{{ adminCount }}</div>
              </div>
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 成员列表卡片 -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <!-- 列表头部 -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-800">成员列表</h3>
            <div class="flex items-center gap-3">
              <!-- 角色筛选 -->
              <div class="relative">
                <select
                  v-model="roleFilter"
                  class="appearance-none pl-3 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-600 focus:outline-none focus:border-blue-300 cursor-pointer"
                >
                  <option value="all">全部角色</option>
                  <option v-for="role in roleOptions" :key="role.slug" :value="role.slug">{{ role.name }}</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- 成员表格 -->
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/50">
                <th class="px-6 py-3.5 text-left text-xs font-medium text-gray-500">成员</th>
                <th class="px-6 py-3.5 text-left text-xs font-medium text-gray-500">角色</th>
                <th class="px-6 py-3.5 text-left text-xs font-medium text-gray-500">权限组</th>
                <th class="px-6 py-3.5 text-left text-xs font-medium text-gray-500">加入时间</th>
                <th class="px-6 py-3.5 text-left text-xs font-medium text-gray-500">状态</th>
                <th class="px-6 py-3.5 text-left text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in pagedUsers"
                :key="member.id"
                class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <!-- 成员信息 -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {{ member.name?.charAt(0) || '?' }}
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-gray-800">{{ member.name }}</div>
                      <div class="text-xs text-gray-400">{{ member.email || '—' }}</div>
                    </div>
                  </div>
                </td>
                <!-- 角色 -->
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    :class="roleTagClass(member.role)"
                  >
                    <span class="w-3.5 h-3.5 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="roleIcon(member.role)"/>
                      </svg>
                    </span>
                    {{ getRoleLabel(member.role) }}
                  </span>
                </td>
                <!-- 权限组 -->
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    :class="permissionTagClass(member.role)"
                  >
                    {{ getPermissionLabel(member.role) }}
                  </span>
                </td>
                <!-- 加入时间 -->
                <td class="px-6 py-4">
                  <span class="text-[13px] text-gray-600">{{ formatDate(member.created_at) }}</span>
                </td>
                <!-- 状态 -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full" :class="statusDotClass(!!member.online)"></span>
                    <span class="text-[13px] text-gray-600">{{ statusLabel(!!member.online) }}</span>
                  </div>
                </td>
                <!-- 操作 -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      v-if="canChangePassword(member)"
                      class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      @click="openChangePassword(member)"
                    >
                      修改密码
                    </button>
                    <button
                      v-if="can('update', 'user')"
                      class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      @click="openEditDialog(member)"
                    >
                      编辑
                    </button>
                    <div v-if="isAdmin" class="relative">
                      <button class="text-gray-400 hover:text-gray-600 p-1" @click.stop="toggleActionMenu(member.id)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                      </button>
                      <div
                        v-if="actionMenuUserId === member.id"
                        class="absolute right-0 top-8 z-20 w-32 bg-white border border-gray-100 rounded-lg shadow-lg py-1"
                      >
                        <button class="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50" @click.stop="viewPassword(member)">查看密码</button>
                        <button class="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50" @click.stop="confirmResetPassword(member)">重置密码</button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 空状态 -->
          <div v-if="filteredUsers.length === 0" class="py-12 text-center text-sm text-gray-400">暂无成员数据</div>

          <!-- 分页区域 -->
          <div v-if="filteredUsers.length > 0" class="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between">
            <span class="text-[13px] text-gray-500">共 {{ filteredUsers.length }} 名成员</span>
            <div class="flex items-center gap-1.5">
              <button
                class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                v-for="page in totalPages"
                :key="page"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors"
                :class="page === currentPage ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 权限说明卡片 -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-base font-semibold text-gray-800 mb-4">权限组说明</h3>
          <div class="flex gap-6">
            <!-- 管理员 -->
            <div class="flex-1 bg-red-50 border border-red-200 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <span class="text-sm font-semibold text-gray-800">管理员</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">拥有全部权限：管理成员、编辑/删除所有内容、修改项目设置</p>
            </div>
            <!-- 编辑者 -->
            <div class="flex-1 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
                <span class="text-sm font-semibold text-gray-800">编辑者</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">可创建/编辑需求、任务、Bug，提交周报，查看所有内容</p>
            </div>
            <!-- 观察者 -->
            <div class="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </div>
                <span class="text-sm font-semibold text-gray-800">观察者</span>
              </div>
              <p class="text-xs text-gray-500 leading-relaxed">仅可查看内容，不可编辑或创建，适用于临时参与或外部人员</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 编辑成员弹窗 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showEditDialog"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          @click.self="showEditDialog = false"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showEditDialog" class="bg-white rounded-2xl shadow-xl p-8 w-[440px]">
              <!-- 弹窗标题栏 -->
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-800">编辑成员</h2>
                <button
                  class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  @click="showEditDialog = false"
                >
                  <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- 表单区域 -->
              <form @submit.prevent="handleEditMember" class="space-y-5">
                <!-- 姓名 -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">姓名 <span class="text-red-500">*</span></label>
                  <input
                    v-model="editForm.nickname"
                    type="text"
                    required
                    placeholder="请输入真实姓名"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-all"
                  />
                </div>
                <!-- 用户名 -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">用户名</label>
                  <input
                    v-model="editForm.username"
                    type="text"
                    required
                    placeholder="请输入用户名"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-all"
                  />
                </div>
                <!-- 邮箱 -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">邮箱</label>
                  <input
                    v-model="editForm.email"
                    type="email"
                    placeholder="请输入邮箱"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-all"
                  />
                </div>
                <!-- 角色 -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">角色</label>
                  <div class="relative">
                    <select
                      v-model="editForm.role"
                      class="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
                    >
                      <option v-for="role in roleOptions" :key="role.slug" :value="role.slug">{{ role.name }}</option>
                    </select>
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>
                <!-- 账号启用状态（与在线无关） -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">账号状态</label>
                  <div class="relative">
                    <select
                      v-model="editForm.status"
                      class="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
                    >
                      <option :value="1">启用</option>
                      <option :value="0">禁用</option>
                    </select>
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>

                <!-- 错误提示 -->
                <div v-if="editError" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                  {{ editError }}
                </div>

                <!-- 底部按钮区 -->
                <div class="flex justify-end gap-3 pt-8">
                  <button
                    type="button"
                    class="px-5 py-2 text-sm font-medium text-slate-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    @click="showEditDialog = false"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    class="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-lg transition-all shadow-sm"
                    :disabled="editing"
                  >
                    {{ editing ? '保存中...' : '确认保存' }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 新增成员弹窗 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showAddDialog"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          @click.self="showAddDialog = false"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showAddDialog" class="bg-white rounded-2xl shadow-xl p-8 w-[440px]">
              <!-- 弹窗标题栏 -->
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-800">新增成员</h2>
                <button
                  class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  @click="showAddDialog = false"
                >
                  <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- 表单区域 -->
              <form @submit.prevent="handleAddMember" class="space-y-5">
                <!-- 姓名 -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">姓名 <span class="text-red-500">*</span></label>
                  <input
                    v-model="addForm.nickname"
                    type="text"
                    required
                    placeholder="请输入真实姓名"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-all"
                  />
                </div>
                <!-- 用户名 -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">用户名</label>
                  <input
                    v-model="addForm.username"
                    type="text"
                    required
                    placeholder="请输入用户名"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-all"
                  />
                </div>
                <!-- 密码 -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">密码</label>
                  <input
                    v-model="addForm.password"
                    type="password"
                    required
                    placeholder="请输入密码"
                    class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 transition-all"
                  />
                </div>
                <!-- 角色 -->
                <div>
                  <label class="block text-[13px] font-medium text-slate-600 mb-2">角色</label>
                  <div class="relative">
                    <select
                      v-model="addForm.role"
                      class="appearance-none w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none focus:border-indigo-400 transition-all cursor-pointer"
                    >
                      <option v-for="role in roleOptions" :key="role.slug" :value="role.slug">{{ role.name }}</option>
                    </select>
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>

                <!-- 错误提示 -->
                <div v-if="addError" class="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                  {{ addError }}
                </div>

                <!-- 底部按钮区 -->
                <div class="flex justify-end gap-3 pt-8">
                  <button
                    type="button"
                    class="px-5 py-2 text-sm font-medium text-slate-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    @click="showAddDialog = false"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    class="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-lg transition-all shadow-sm"
                    :disabled="adding"
                  >
                    {{ adding ? '添加中...' : '确认新增' }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 修改密码 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showChangeDialog && passwordTarget" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40" @click="closeChangePassword"></div>
          <div class="relative w-[400px] bg-white rounded-2xl shadow-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-1">修改密码</h3>
            <p class="text-sm text-gray-500 mb-4">{{ passwordTarget.name || passwordTarget.nickname }}</p>
            <div class="space-y-3">
              <div v-if="isSelf(passwordTarget)">
                <label class="block text-xs text-gray-500 mb-1">当前密码</label>
                <input v-model="changeForm.current_password" type="password" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="请输入当前密码" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">新密码</label>
                <input v-model="changeForm.new_password" type="password" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="至少 6 位" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">确认新密码</label>
                <input v-model="changeForm.confirm_password" type="password" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="再次输入新密码" />
              </div>
              <p v-if="passwordError" class="text-sm text-red-500">{{ passwordError }}</p>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" @click="closeChangePassword">取消</button>
              <button
                class="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                :disabled="passwordLoading"
                @click="submitChangePassword"
              >
                {{ passwordLoading ? '保存中...' : '确认修改' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 查看密码 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPasswordDialog" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40" @click="showPasswordDialog = false"></div>
          <div class="relative w-[400px] bg-white rounded-2xl shadow-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">查看密码</h3>
            <p class="text-sm text-gray-500 mb-4">{{ passwordTarget?.name || passwordTarget?.nickname }}</p>
            <div v-if="passwordLoading" class="text-sm text-gray-400 py-4">加载中...</div>
            <div v-else-if="viewedPassword" class="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <span class="font-mono text-sm text-gray-800">{{ viewedPassword }}</span>
              <button class="text-xs text-indigo-500 hover:text-indigo-600" @click="copyPassword">复制</button>
            </div>
            <p v-else class="text-sm text-gray-600 leading-relaxed">密码已加密存储，无法查看明文。可将密码重置为 123456 后再查看。</p>
            <div class="flex justify-end mt-6">
              <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" @click="showPasswordDialog = false">关闭</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 重置密码确认 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showResetDialog" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40" @click="showResetDialog = false"></div>
          <div class="relative w-[400px] bg-white rounded-2xl shadow-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">重置密码</h3>
            <p class="text-sm text-gray-600 leading-relaxed">确定将「{{ passwordTarget?.name || passwordTarget?.nickname }}」的密码重置为 <span class="font-mono font-medium">123456</span> 吗？</p>
            <p v-if="passwordError" class="text-sm text-red-500 mt-3">{{ passwordError }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" @click="showResetDialog = false">取消</button>
              <button class="px-4 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50" :disabled="passwordLoading" @click="resetPassword">
                {{ passwordLoading ? '重置中...' : '确认重置' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, RoleRecord } from '~/types'

const { selectedProjectId } = useProject()
const { can, user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'admin')

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

// 团队页面展示所有用户，不根据项目过滤
const { data: usersData, refresh: refreshUsers } = await useFetch('/api/users', {
  default: () => []
})

const { data: rolesData } = await useFetch<RoleRecord[]>('/api/roles', {
  default: () => []
})
const roleOptions = computed(() => rolesData.value || [])

let presencePoll: ReturnType<typeof setInterval> | undefined
const actionMenuUserId = ref<number | null>(null)
const showPasswordDialog = ref(false)
const showResetDialog = ref(false)
const showChangeDialog = ref(false)
const passwordTarget = ref<any>(null)
const viewedPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const changeForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

function isSelf(member: any) {
  return Number(member?.id) === Number(user.value?.id)
}

function canChangePassword(member: any) {
  return isAdmin.value || isSelf(member)
}

function openChangePassword(member: any) {
  actionMenuUserId.value = null
  passwordTarget.value = member
  passwordError.value = ''
  changeForm.current_password = ''
  changeForm.new_password = ''
  changeForm.confirm_password = ''
  showChangeDialog.value = true
}

function closeChangePassword() {
  showChangeDialog.value = false
  passwordError.value = ''
}

async function submitChangePassword() {
  if (!passwordTarget.value || passwordLoading.value) return
  if (changeForm.new_password.length < 6) {
    passwordError.value = '新密码至少 6 位'
    return
  }
  if (changeForm.new_password !== changeForm.confirm_password) {
    passwordError.value = '两次输入的新密码不一致'
    return
  }
  if (isSelf(passwordTarget.value) && !changeForm.current_password) {
    passwordError.value = '请输入当前密码'
    return
  }
  passwordLoading.value = true
  passwordError.value = ''
  try {
    await $fetch(`/api/users/${passwordTarget.value.id}/password`, {
      method: 'PUT',
      body: {
        current_password: changeForm.current_password || undefined,
        new_password: changeForm.new_password
      }
    })
    closeChangePassword()
  } catch (err: any) {
    passwordError.value = err.data?.statusMessage || err.message || '修改密码失败'
  } finally {
    passwordLoading.value = false
  }
}

function toggleActionMenu(id: number) {
  actionMenuUserId.value = actionMenuUserId.value === id ? null : id
}

async function viewPassword(member: any) {
  actionMenuUserId.value = null
  passwordTarget.value = member
  viewedPassword.value = ''
  passwordError.value = ''
  showPasswordDialog.value = true
  passwordLoading.value = true
  try {
    const data = await $fetch<{ password: string | null }>(`/api/users/${member.id}/password`)
    viewedPassword.value = data.password || ''
  } catch (err: any) {
    passwordError.value = err.data?.statusMessage || err.message || '查看密码失败'
  } finally {
    passwordLoading.value = false
  }
}

function confirmResetPassword(member: any) {
  actionMenuUserId.value = null
  passwordTarget.value = member
  passwordError.value = ''
  showResetDialog.value = true
}

async function resetPassword() {
  if (!passwordTarget.value) return
  passwordLoading.value = true
  passwordError.value = ''
  try {
    const data = await $fetch<{ password: string }>(`/api/users/${passwordTarget.value.id}/reset-password`, { method: 'POST' })
    showResetDialog.value = false
    viewedPassword.value = data.password
    showPasswordDialog.value = true
  } catch (err: any) {
    passwordError.value = err.data?.statusMessage || err.message || '重置密码失败'
  } finally {
    passwordLoading.value = false
  }
}

async function copyPassword() {
  if (!viewedPassword.value) return
  try {
    await navigator.clipboard.writeText(viewedPassword.value)
  } catch {
    // ignore
  }
}

function closeActionMenu() {
  actionMenuUserId.value = null
}

onMounted(() => {
  document.addEventListener('click', closeActionMenu)
  presencePoll = setInterval(() => {
    refreshUsers()
  }, 30000)
})
onUnmounted(() => {
  document.removeEventListener('click', closeActionMenu)
  if (presencePoll) clearInterval(presencePoll)
})

const searchKeyword = ref('')
const roleFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10

const users = computed(() => {
  const metaUsers = meta.value?.users || []
  const apiUsers = usersData.value || []
  if (apiUsers.length > 0) return apiUsers as any[]
  return metaUsers
})

const filteredUsers = computed(() => {
  let result = users.value
  if (roleFilter.value !== 'all') {
    result = result.filter((u: any) => u.role === roleFilter.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter((u: any) =>
      u.name?.toLowerCase().includes(kw) ||
      u.nickname?.toLowerCase().includes(kw) ||
      u.email?.toLowerCase().includes(kw) ||
      getRoleLabel(u.role).toLowerCase().includes(kw)
    )
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)))

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

// 搜索或筛选变化时重置页码
watch([searchKeyword, roleFilter], () => {
  currentPage.value = 1
})

// 统计计算
const managementCount = computed(() => users.value.filter((u: any) => u.role === 'pm' || u.role === 'project_manager').length)
const devCount = computed(() => users.value.filter((u: any) => u.role === 'developer').length)
const testerCount = computed(() => users.value.filter((u: any) => u.role === 'tester').length)
const adminCount = computed(() => users.value.filter((u: any) => u.role === 'admin').length)

// 角色标签
function getRoleLabel(role: string) {
  const found = roleOptions.value.find(item => item.slug === role)
  if (found) return found.name
  const map: Record<string, string> = {
    admin: '管理员',
    pm: '产品经理',
    project_manager: '项目经理',
    developer: '开发工程师',
    tester: '测试工程师'
  }
  return map[role] || role
}

function roleTagClass(role: string) {
  const map: Record<string, string> = {
    admin: 'bg-amber-100 text-amber-700',
    pm: 'bg-violet-100 text-violet-700',
    project_manager: 'bg-purple-100 text-purple-700',
    developer: 'bg-blue-100 text-blue-700',
    tester: 'bg-emerald-100 text-emerald-700'
  }
  return map[role] || 'bg-gray-100 text-gray-500'
}

function roleIcon(role: string) {
  const map: Record<string, string> = {
    admin: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    pm: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    project_manager: 'M5 3h14v18H5zM8 7h8M8 11h8M8 15h5',
    developer: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    tester: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
  return map[role] || 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
}

// 权限组标签
function getPermissionLabel(role: string) {
  if (role === 'admin') return '管理员'
  return '编辑者'
}

function permissionTagClass(role: string) {
  if (role === 'admin') return 'bg-red-200 text-red-600'
  return 'bg-indigo-50 text-indigo-600'
}

// 在线状态（真实登录活跃，不是账号启用字段 users.status）
function statusLabel(online: boolean) {
  return online ? '在线' : '离线'
}

function statusDotClass(online: boolean) {
  return online ? 'bg-emerald-500' : 'bg-slate-400'
}

// 日期格式化
function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 新增成员弹窗
const showAddDialog = ref(false)
const adding = ref(false)
const addError = ref('')
const addForm = ref({
  nickname: '',
  username: '',
  password: '',
  role: 'developer'
})

// 编辑成员弹窗
const showEditDialog = ref(false)
const editing = ref(false)
const editError = ref('')
const editForm = ref({
  id: 0,
  nickname: '',
  username: '',
  email: '',
  role: 'developer',
  status: 1
})

function openEditDialog(member: any) {
  editForm.value = {
    id: member.id,
    nickname: member.nickname || member.name || '',
    username: member.username || '',
    email: member.email || '',
    role: member.role || 'developer',
    status: member.status ?? 1
  }
  editError.value = ''
  showEditDialog.value = true
}

async function handleEditMember() {
  editing.value = true
  editError.value = ''
  try {
    await $fetch(`/api/users/${editForm.value.id}`, {
      method: 'PUT',
      body: {
        nickname: editForm.value.nickname,
        username: editForm.value.username,
        email: editForm.value.email,
        role: editForm.value.role,
        status: editForm.value.status
      }
    })
    showEditDialog.value = false
    await refreshUsers()
  } catch (err: any) {
    editError.value = err.data?.statusMessage || err.message || '编辑成员失败'
  } finally {
    editing.value = false
  }
}

async function handleAddMember() {
  adding.value = true
  addError.value = ''
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: {
        nickname: addForm.value.nickname,
        username: addForm.value.username,
        password: addForm.value.password,
        role: addForm.value.role
      }
    })
    showAddDialog.value = false
    addForm.value = { nickname: '', username: '', password: '', role: 'developer' }
    await refreshUsers()
  } catch (err: any) {
    addError.value = err.data?.statusMessage || err.message || '添加成员失败'
  } finally {
    adding.value = false
  }
}
</script>
