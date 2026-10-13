<template>
  <div class="h-screen flex bg-gray-50 overflow-hidden">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-4">
          <button class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors" @click="router.back()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div v-if="requirement" class="flex items-center gap-3">
            <span class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-mono">{{ requirement.req_no || requirement.id }}</span>
            <h1 class="text-lg font-bold text-gray-800">{{ requirement.title }}</h1>
            <span class="px-2 py-0.5 rounded text-xs font-medium" :class="statusClass(requirement.status)">
              {{ statusLabel(requirement.status) }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="can('update', 'requirement') && requirement && requirement.status !== 'completed' && requirement.status !== 'closed'"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            :disabled="completeReqSubmitting"
            @click="completeRequirement"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ completeReqSubmitting ? '完成中...' : '已完成' }}
          </button>
          <button v-if="can('delete', 'requirement')" class="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" @click="openDeleteRequirement">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            删除
          </button>
          <button v-if="can('update', 'requirement')" class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" @click="editRequirement">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            编辑
          </button>
        </div>
      </header>

      <!-- Content -->
      <div v-if="requirement" class="flex-1 min-h-0 overflow-hidden p-6">
        <div class="flex gap-5 h-full items-stretch">
          <div class="flex-1 min-w-0 overflow-y-auto space-y-5 pr-1">
            <!-- 基本信息卡片 -->
            <div class="bg-white rounded-xl p-5 border border-gray-100">
              <div class="flex items-center gap-4 mb-4">
                <span class="text-sm font-medium text-gray-700">优先级</span>
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :class="{
                    'bg-red-50 text-red-600': requirement.priority === 'p0',
                    'bg-orange-50 text-orange-600': requirement.priority === 'p1',
                    'bg-yellow-50 text-yellow-600': requirement.priority === 'p2',
                    'bg-gray-50 text-gray-500': requirement.priority === 'p3'
                  }"
                >{{ priorityLabel(requirement.priority) }}</span>
                <span class="text-sm font-medium text-gray-700 ml-4">负责人</span>
                <div v-if="requirement.assignee" class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs">
                    {{ requirement.assignee.name?.charAt(0) || '?' }}
                  </div>
                  <span class="text-sm text-gray-700">{{ requirement.assignee.name }}</span>
                </div>
                <span v-else class="text-sm text-gray-400">未指派</span>
                <span class="text-sm font-medium text-gray-700 ml-4">迭代</span>
                <span class="text-sm text-gray-700">{{ requirement.iteration?.name || '未分配' }}</span>
                <span class="text-sm font-medium text-gray-700 ml-4">创建时间</span>
                <span class="text-sm text-gray-700">{{ formatDateTime(requirement.created_at) }}</span>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm font-medium text-gray-700">模块</span>
                <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{{ requirement.module || '未分配' }}</span>
                <span class="text-sm font-medium text-gray-700 ml-4">截止日期</span>
                <span class="text-sm text-gray-700">{{ requirement.expected_date || '未设置' }}</span>
              </div>
            </div>
              <!-- 需求描述 -->
              <div class="bg-white rounded-xl p-5 border border-gray-100">
                <h3 class="font-semibold text-gray-800 mb-3">需求描述</h3>
                <div
                  v-if="hasRichText(requirement.description)"
                  class="rich-content"
                  v-html="requirement.description"
                  @click="onRichContentClick"
                ></div>
                <p v-else class="text-sm text-gray-400">暂无描述</p>
              </div>

              <!-- 关联原型 -->
              <div class="bg-white rounded-xl p-5 border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                    </svg>
                    <h3 class="font-semibold text-gray-800">关联原型</h3>
                    <span class="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{{ requirement.prototypes?.length || 0 }}</span>
                  </div>
                  <button
                    v-if="can('update', 'requirement')"
                    class="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                    @click="openPrototypePicker"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    关联原型
                  </button>
                </div>
                <div v-if="requirement.prototypes?.length" class="flex gap-4 flex-wrap">
                  <div
                    v-for="pt in requirement.prototypes"
                    :key="pt.id"
                    class="w-[200px] cursor-pointer group relative"
                    @click="navigateTo({ path: `/prototype/${pt.id}`, query: { from: `/requirements/${requirementId}` } })"
                  >
                    <button
                      v-if="can('update', 'requirement')"
                      class="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="取消关联"
                      @click.stop="unlinkPrototype(pt)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                    <div class="w-full h-[140px] bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <img v-if="prototypeThumbnail(pt)" :src="prototypeThumbnail(pt) || ''" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/>
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm font-medium text-gray-800 truncate">{{ pt.name }}</div>
                    <div class="text-xs text-gray-400">{{ pt.pages?.length || 0 }} 个页面</div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-400">
                  <p class="text-sm">暂无关联原型</p>
                </div>
                <p v-if="prototypeErrorMessage" class="mt-2 text-sm text-red-500">{{ prototypeErrorMessage }}</p>
              </div>

              <!-- 关联任务 -->
              <div class="bg-white rounded-xl p-5 border border-gray-100">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <h3 class="font-semibold text-gray-800">关联任务</h3>
                    <span class="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{{ requirement.task_count || 0 }}/{{ requirement.task_count || 0 }}</span>
                  </div>
                  <button v-if="can('create', 'task') || can('update', 'requirement')" class="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors" @click="showTaskModal = true">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    新建任务
                  </button>
                </div>
                <!-- 任务表格 -->
                <div v-if="tasks && tasks.length > 0" class="border border-gray-100 rounded-lg overflow-hidden">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-gray-500 font-medium">任务名</th>
                        <th class="px-4 py-3 text-left text-gray-500 font-medium w-[88px]">优先级</th>
                        <th class="px-4 py-3 text-left text-gray-500 font-medium w-[120px]">负责人</th>
                        <th class="px-4 py-3 text-left text-gray-500 font-medium w-[96px]">状态</th>
                        <th class="px-4 py-3 text-left text-gray-500 font-medium w-[120px]">截止时间</th>
                        <th class="px-4 py-3 text-left text-gray-500 font-medium w-[72px]">工时</th>
                        <th class="px-4 py-3 text-left text-gray-500 font-medium w-[100px]">操作</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <template v-for="task in tasks" :key="task.id">
                        <tr :id="`req-task-${task.id}`" class="hover:bg-gray-50 cursor-pointer" @click="toggleExpandedTask(task.id)">
                          <td class="px-4 py-3 text-gray-800">
                            <div class="flex items-center gap-2">
                              <svg class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform" :class="{ 'rotate-90': expandedTaskId === task.id }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                              </svg>
                              <span>{{ task.title }}</span>
                            </div>
                          </td>
                          <td class="px-4 py-3">
                            <span class="inline-flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
                              <span class="w-2 h-2 rounded-full" :class="taskPriorityDot(task.priority)"></span>
                              {{ taskPriorityLabel(task.priority) }}
                            </span>
                          </td>
                          <td class="px-4 py-3">
                            <div v-if="taskAssigneeList(task).length" class="flex items-center gap-1.5 min-w-0">
                              <div class="flex -space-x-1 flex-shrink-0">
                                <div
                                  v-for="user in taskAssigneeList(task).slice(0, 3)"
                                  :key="user.id"
                                  class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs border border-white"
                                  :title="user.name"
                                >
                                  {{ user.name?.charAt(0) || '?' }}
                                </div>
                              </div>
                              <span class="text-gray-700 truncate">{{ taskAssigneeNames(task) }}</span>
                            </div>
                            <span v-else class="text-gray-400">未指派</span>
                          </td>
                          <td class="px-4 py-3">
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs whitespace-nowrap" :class="taskStatusClass(task.status)">{{ taskStatusLabel(task.status) }}</span>
                          </td>
                          <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ task.due_date ? formatDateTime(task.due_date) : '—' }}</td>
                          <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ task.estimated_hours || task.estimated_hours === 0 ? `${task.estimated_hours}h` : '—' }}</td>
                          <td class="px-4 py-3" @click.stop>
                            <div class="flex items-center gap-2">
                              <button
                                v-if="canMaybeOwn('update', 'task')"
                                class="text-xs text-blue-500 hover:text-blue-600"
                                @click="openEditTask(task)"
                              >
                                编辑
                              </button>
                              <button
                                v-if="can('delete', 'task')"
                                class="text-xs text-red-500 hover:text-red-600"
                                @click="openDeleteTask(task)"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr v-if="expandedTaskId === task.id">
                          <td colspan="7" class="px-4 py-3 bg-gray-50/80">
                            <div class="text-xs text-gray-400 mb-1">任务描述</div>
                            <p class="text-sm text-gray-700 whitespace-pre-wrap leading-6">{{ task.description || '暂无描述' }}</p>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-center py-8 text-gray-400">
                  <p class="text-sm">暂无关联任务</p>
                </div>
              </div>

              <!-- 关联 Bug -->
              <div class="bg-white rounded-xl p-5 border border-gray-100">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-800">关联 Bug</h3>
                    <span class="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{{ requirement.bugs?.length || 0 }}</span>
                  </div>
                  <button
                    v-if="can('update', 'requirement')"
                    class="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                    @click="openBugPicker"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    关联 Bug
                  </button>
                </div>
                <div v-if="requirement.bugs && requirement.bugs.length > 0" class="space-y-2">
                  <div
                    v-for="bug in requirement.bugs"
                    :key="bug.id"
                    class="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors group"
                    @click="navigateTo({ path: `/bugs/${bug.id}`, query: { from: `/requirements/${requirementId}` } })"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <span class="text-sm text-gray-400 font-mono flex-shrink-0">{{ bug.bug_no || bug.id }}</span>
                      <span class="text-sm text-gray-700 truncate">{{ bug.title }}</span>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="px-2 py-0.5 rounded text-xs" :class="getBugSeverityClass(bug.severity)">{{ severityLabel(bug.severity) }}</span>
                      <button
                        v-if="can('update', 'requirement')"
                        class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="取消关联"
                        @click.stop="unlinkBug(bug)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-400">
                  <svg class="w-12 h-12 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm">暂无关联 Bug</p>
                </div>
                <p v-if="bugErrorMessage" class="mt-2 text-sm text-red-500">{{ bugErrorMessage }}</p>
              </div>
          </div>

          <aside class="w-[340px] flex-shrink-0 h-full min-h-0">
            <RequirementHistoryPanel :items="historyRecords || []" :loading="historyPending" />
          </aside>
        </div>
      </div>
    </main>

    <!-- Edit Modal -->
    <RequirementModal
      v-model:visible="editModalVisible"
      :users="meta?.users || []"
      :iterations="meta?.iterations || []"
      :modules="meta?.modules || []"
      :projects="meta?.projects || []"
      :edit-data="editData"
      @success="onEditSuccess"
    />

    <!-- Create Task Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showTaskModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl w-[640px] max-h-[90vh] shadow-2xl flex flex-col">
            <div class="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 class="text-lg font-bold text-gray-800">新建任务</h3>
                <p class="text-xs text-gray-400 mt-0.5">可一次添加多条；未提交内容会自动保留，关闭后再打开可继续填写</p>
              </div>
              <button class="text-gray-400 hover:text-gray-600" @click="showTaskModal = false">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-3 overflow-y-auto">
              <div
                v-for="(row, idx) in taskDrafts"
                :key="row.key"
                class="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/40"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-gray-400">任务 {{ idx + 1 }}</span>
                  <button
                    v-if="taskDrafts.length > 1"
                    class="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    @click="removeTaskRow(idx)"
                  >
                    删除
                  </button>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">任务标题 <span class="text-red-500">*</span></label>
                  <input v-model="row.title" type="text" placeholder="请输入任务标题" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-all" />
                </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">任务描述</label>
                <textarea v-model="row.description" rows="2" placeholder="请输入任务描述" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-all resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">优先级</label>
                  <select v-model="row.priority" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all">
                    <option value="urgent">紧急</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">任务类型</label>
                  <select v-model="row.type" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all">
                    <option value="development">开发</option>
                    <option value="design">设计</option>
                    <option value="test">测试</option>
                    <option value="research">调研</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">指派给</label>
                  <AssigneeMultiSelect v-model="row.assignee_ids" :users="taskAssigneeOptions" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">预估工时</label>
                  <input v-model="row.estimated_hours" type="number" step="0.5" placeholder="如: 8" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">开始时间</label>
                  <input v-model="row.start_date" type="date" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">截止时间</label>
                  <input
                    v-model="row.due_date"
                    type="date"
                    :min="row.start_date || undefined"
                    class="w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition-all"
                    :class="isDueBeforeStart(row.start_date, row.due_date) ? 'border-red-400' : 'border-gray-200'"
                  />
                  <p v-if="isDueBeforeStart(row.start_date, row.due_date)" class="text-xs text-red-500 mt-1">截止时间不能早于开始时间</p>
                </div>
              </div>
              </div>
              <button
                type="button"
                class="w-full py-2.5 border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 text-gray-500 hover:text-blue-600 rounded-xl text-sm font-medium transition-colors"
                @click="addTaskRow"
              >
                + 继续添加任务
              </button>
              <p v-if="taskErrorMessage" class="text-sm text-red-500">{{ taskErrorMessage }}</p>
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="showTaskModal = false">取消</button>
              <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50" :disabled="!filledTaskCount || taskSubmitting" @click="createTask">
                <svg v-if="taskSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {{ filledTaskCount > 1 ? `创建 ${filledTaskCount} 个任务` : '创建' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Associate Prototype Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showPrototypeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showPrototypeModal = false">
          <div class="bg-white rounded-xl w-[520px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">关联原型</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="showPrototypeModal = false">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="px-5 pt-4">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  v-model="prototypeSearch"
                  type="text"
                  placeholder="搜索原型名称..."
                  class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div class="p-5 overflow-y-auto flex-1 min-h-[240px]">
              <div v-if="prototypesLoading" class="py-10 text-center text-sm text-gray-400">加载中...</div>
              <div v-else-if="filteredAvailablePrototypes.length === 0" class="py-10 text-center text-sm text-gray-400">
                暂无可关联原型
              </div>
              <div v-else class="space-y-2">
                <button
                  v-for="pt in filteredAvailablePrototypes"
                  :key="pt.id"
                  type="button"
                  class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors disabled:opacity-50"
                  :disabled="prototypeSubmitting"
                  @click="associatePrototype(pt)"
                >
                  <div class="w-16 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img v-if="prototypeThumbnail(pt)" :src="prototypeThumbnail(pt) || ''" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ pt.name }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">
                      {{ pt.pageCount || pt.pages?.length || 0 }} 个页面
                      <span v-if="pt.requirement_title"> · 已关联：{{ pt.requirement_title }}</span>
                    </div>
                  </div>
                </button>
              </div>
              <p v-if="prototypePickerError" class="mt-3 text-sm text-red-500">{{ prototypePickerError }}</p>
            </div>
            <div class="flex items-center justify-between p-5 border-t border-gray-100">
              <button
                v-if="can('create', 'prototype')"
                class="text-sm text-blue-600 hover:underline"
                @click="goCreatePrototype"
              >
                去新建原型
              </button>
              <span v-else></span>
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="showPrototypeModal = false">关闭</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Associate Bug Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBugPickerModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showBugPickerModal = false">
          <div class="bg-white rounded-xl w-[520px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">关联 Bug</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="showBugPickerModal = false">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="px-5 pt-4">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  v-model="bugSearch"
                  type="text"
                  placeholder="搜索 Bug 标题或编号..."
                  class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div class="p-5 overflow-y-auto flex-1 min-h-[240px]">
              <div v-if="bugsLoading" class="py-10 text-center text-sm text-gray-400">加载中...</div>
              <div v-else-if="filteredAvailableBugs.length === 0" class="py-10 text-center text-sm text-gray-400">
                暂无可关联 Bug
              </div>
              <div v-else class="space-y-2">
                <button
                  v-for="bug in filteredAvailableBugs"
                  :key="bug.bug_id || bug.id"
                  type="button"
                  class="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors disabled:opacity-50"
                  :disabled="bugSubmitting"
                  @click="associateBug(bug)"
                >
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ bug.title }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">
                      {{ bug.id }}
                      <span v-if="bug.requirement?.title"> · 已关联：{{ bug.requirement.title }}</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-xs flex-shrink-0" :class="getBugSeverityClass(bug.severity)">{{ severityLabel(bug.severity) }}</span>
                </button>
              </div>
              <p v-if="bugPickerError" class="mt-3 text-sm text-red-500">{{ bugPickerError }}</p>
            </div>
            <div class="flex items-center justify-between p-5 border-t border-gray-100">
              <button
                v-if="can('create', 'bug')"
                class="text-sm text-blue-600 hover:underline"
                @click="goCreateBug"
              >
                去新建 Bug
              </button>
              <span v-else></span>
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="showBugPickerModal = false">关闭</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Task Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditTaskModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeEditTask">
          <div class="bg-white rounded-xl w-[560px] max-h-[90vh] shadow-2xl flex flex-col">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">编辑任务</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="closeEditTask">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-3 overflow-y-auto">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">任务标题 <span class="text-red-500">*</span></label>
                <input v-model="editTask.title" type="text" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">任务描述</label>
                <textarea v-model="editTask.description" rows="3" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">状态</label>
                  <select v-model="editTask.status" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400">
                    <option value="todo">待办</option>
                    <option value="in_progress">进行中</option>
                    <option value="review">评审中</option>
                    <option value="done">已完成</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">优先级</label>
                  <select v-model="editTask.priority" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400">
                    <option value="urgent">紧急</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">任务类型</label>
                  <select v-model="editTask.type" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400">
                    <option value="development">开发</option>
                    <option value="design">设计</option>
                    <option value="test">测试</option>
                    <option value="research">调研</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">指派给</label>
                  <AssigneeMultiSelect v-model="editTask.assignee_ids" :users="taskAssigneeOptions" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">预估工时</label>
                  <input v-model="editTask.estimated_hours" type="number" step="0.5" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">截止时间</label>
                  <input
                    v-model="editTask.due_date"
                    type="date"
                    :min="editTask.start_date || undefined"
                    class="w-full px-3 py-2 bg-white border rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400"
                    :class="isDueBeforeStart(editTask.start_date, editTask.due_date) ? 'border-red-400' : 'border-gray-200'"
                  />
                  <p v-if="isDueBeforeStart(editTask.start_date, editTask.due_date)" class="text-xs text-red-500 mt-1">截止时间不能早于开始时间</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">开始时间</label>
                <input v-model="editTask.start_date" type="date" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
              </div>
              <p v-if="editTaskError" class="text-sm text-red-500">{{ editTaskError }}</p>
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium" @click="closeEditTask">取消</button>
              <button
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                :disabled="!editTask.title.trim() || taskSubmitting"
                @click="saveEditTask"
              >
                {{ taskSubmitting ? '保存中...' : '保存' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Task Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteTaskModal && deleteTaskTarget" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeDeleteTask"></div>
          <div class="relative w-96 bg-white rounded-2xl shadow-2xl p-6">
            <h3 class="text-base font-semibold text-gray-800">确认删除</h3>
            <p class="text-sm text-gray-500 mt-2">确定要删除任务「{{ deleteTaskTarget.title }}」吗？此操作不可恢复。</p>
            <p v-if="deleteTaskError" class="text-sm text-red-500 mt-3">{{ deleteTaskError }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium" @click="closeDeleteTask">取消</button>
              <button
                class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                :disabled="taskSubmitting"
                @click="confirmDeleteTask"
              >
                {{ taskSubmitting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Incomplete Tasks Block Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCompleteBlockedModal" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showCompleteBlockedModal = false"></div>
          <div class="relative w-[420px] bg-white rounded-2xl shadow-2xl p-6">
            <h3 class="text-base font-semibold text-gray-800">无法完成需求</h3>
            <p class="text-sm text-gray-500 mt-2">{{ completeBlockedMessage }}</p>
            <ul v-if="incompleteAssociatedTasks.length" class="mt-3 max-h-40 overflow-y-auto space-y-1.5">
              <li v-for="task in incompleteAssociatedTasks" :key="task.id">
                <button
                  type="button"
                  class="w-full text-left text-sm text-gray-600 flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  @click="viewIncompleteTask(task)"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                  <span class="truncate flex-1">{{ task.title }}</span>
                  <span class="text-xs text-gray-400 flex-shrink-0">{{ taskStatusLabel(task.status) }}</span>
                </button>
              </li>
            </ul>
            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium" @click="showCompleteBlockedModal = false">我知道了</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Requirement Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteReqModal" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteReqModal = false"></div>
          <div class="relative w-96 bg-white rounded-2xl shadow-2xl p-6">
            <h3 class="text-base font-semibold text-gray-800">{{ deleteReqBlocked ? '无法删除' : '确认删除' }}</h3>
            <p class="text-sm text-gray-500 mt-2">{{ deleteReqMessage }}</p>
            <p v-if="deleteReqError" class="text-sm text-red-500 mt-3">{{ deleteReqError }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium" @click="showDeleteReqModal = false">
                {{ deleteReqBlocked ? '我知道了' : '取消' }}
              </button>
              <button
                v-if="!deleteReqBlocked"
                class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                :disabled="deleteReqSubmitting"
                @click="confirmDeleteRequirement"
              >
                {{ deleteReqSubmitting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ImagePreviewModal
      v-model="previewVisible"
      :src="previewImages[previewIndex]"
      :title="previewTitle"
      :has-prev="previewIndex > 0"
      :has-next="previewIndex >= 0 && previewIndex < previewImages.length - 1"
      @prev="previewIndex = Math.max(0, previewIndex - 1)"
      @next="previewIndex = Math.min(previewImages.length - 1, previewIndex + 1)"
    />
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, Requirement, RequirementDetail, RequirementHistoryItem, RequirementStatus, Priority, Severity } from '~/types'
import { estimatedHoursFromDates, isDueBeforeStart, isMeaningfulTaskDraft, normalizeDraftAssigneeIds, parseTaskDrafts, serializeTaskDrafts, taskDraftStorageKey } from '~/utils/task-draft'
import { assignableUsers, taskAssigneeList, taskAssigneeNames } from '~/utils/task-assignees'
import {
  PRIORITY_LABELS,
  STATUS_LABELS, STATUS_CLASSES, STATUS_DOT_COLORS,
  SEVERITY_LABELS, SEVERITY_CLASSES
} from '~/types'

const { can, canMaybeOwn } = useAuth()

const route = useRoute()
const router = useRouter()
const requirementId = route.params.id as string

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})
const taskAssigneeOptions = computed(() => assignableUsers(meta.value?.users))
const { data: requirement, refresh } = await useFetch<RequirementDetail>(`/api/requirements/${requirementId}`, {
  default: () => null as any
})
const { data: historyRecords, pending: historyPending, refresh: refreshHistory } = await useFetch<RequirementHistoryItem[]>(
  `/api/requirements/${requirementId}/history`,
  { default: () => [] }
)

function hasRichText(html?: string | null) {
  if (!html) return false
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0
}

const previewVisible = ref(false)
const previewIndex = ref(0)
const previewImages = ref<string[]>([])
const previewTitle = ref('')

function onRichContentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.tagName !== 'IMG') return
  const img = target as HTMLImageElement
  const imgs = Array.from((e.currentTarget as HTMLElement).querySelectorAll('img')) as HTMLImageElement[]
  previewImages.value = imgs.map(item => item.src)
  previewIndex.value = Math.max(0, imgs.findIndex(item => item === img))
  previewTitle.value = img.alt || ''
  previewVisible.value = true
}

function prototypeThumbnail(pt: { thumbnail?: string | null; pages?: any[] }) {
  if (pt.thumbnail) return pt.thumbnail
  const pages = pt.pages
  if (Array.isArray(pages) && pages.length > 0) {
    const cover = pages.find((p: any) => p.isCover)
    if (cover?.thumbnail) return cover.thumbnail
    if (pages[0]?.thumbnail) return pages[0].thumbnail
  }
  return null
}

// 获取关联任务
const { data: tasks, refresh: refreshTasks } = await useFetch(`/api/tasks`, {
  query: computed(() => ({ requirementId: requirement.value?.req_id })),
  default: () => []
})

const editModalVisible = ref(false)
const editData = ref<Requirement | null>(null)

// 关联原型
const showPrototypeModal = ref(false)
const prototypesLoading = ref(false)
const prototypeSubmitting = ref(false)
const prototypeSearch = ref('')
const prototypeErrorMessage = ref('')
const prototypePickerError = ref('')
const availablePrototypes = ref<any[]>([])

const linkedPrototypeIds = computed(() => new Set((requirement.value?.prototypes || []).map(pt => pt.id)))

const filteredAvailablePrototypes = computed(() => {
  const kw = prototypeSearch.value.trim().toLowerCase()
  return availablePrototypes.value.filter((pt) => {
    if (linkedPrototypeIds.value.has(pt.id)) return false
    if (!kw) return true
    return (pt.name || '').toLowerCase().includes(kw)
  })
})

async function loadAvailablePrototypes() {
  prototypesLoading.value = true
  prototypePickerError.value = ''
  try {
    const list = await $fetch<any[]>('/api/prototypes', {
      query: {
        projectId: requirement.value?.project?.id || undefined
      }
    })
    availablePrototypes.value = list || []
  } catch (e: any) {
    availablePrototypes.value = []
    prototypePickerError.value = e.data?.message || e.statusMessage || '加载原型列表失败'
  } finally {
    prototypesLoading.value = false
  }
}

async function openPrototypePicker() {
  prototypeSearch.value = ''
  prototypePickerError.value = ''
  showPrototypeModal.value = true
  await loadAvailablePrototypes()
}

async function associatePrototype(pt: { id: number }) {
  prototypeSubmitting.value = true
  prototypePickerError.value = ''
  prototypeErrorMessage.value = ''
  try {
    await $fetch(`/api/requirements/${requirementId}/prototypes`, {
      method: 'POST',
      body: { prototype_id: pt.id }
    })
    showPrototypeModal.value = false
    await Promise.all([refresh(), refreshHistory()])
  } catch (e: any) {
    prototypePickerError.value = e.data?.message || e.statusMessage || '关联原型失败'
  } finally {
    prototypeSubmitting.value = false
  }
}

async function unlinkPrototype(pt: { id: number }) {
  prototypeErrorMessage.value = ''
  try {
    await $fetch(`/api/requirements/${requirementId}/prototypes/${pt.id}`, {
      method: 'DELETE'
    })
    await Promise.all([refresh(), refreshHistory()])
  } catch (e: any) {
    prototypeErrorMessage.value = e.data?.message || e.statusMessage || '取消关联失败'
  }
}

function goCreatePrototype() {
  const reqId = requirement.value?.req_id
  showPrototypeModal.value = false
  navigateTo(reqId ? `/prototype/new?requirementId=${reqId}` : '/prototype/new')
}

const showBugPickerModal = ref(false)
const bugsLoading = ref(false)
const bugSubmitting = ref(false)
const bugSearch = ref('')
const bugErrorMessage = ref('')
const bugPickerError = ref('')
const availableBugs = ref<any[]>([])
const showDeleteReqModal = ref(false)
const deleteReqSubmitting = ref(false)
const deleteReqError = ref('')
const showCompleteBlockedModal = ref(false)
const completeReqSubmitting = ref(false)

const associatedTasks = computed(() => {
  if (Array.isArray(requirement.value?.tasks) && requirement.value.tasks.length) return requirement.value.tasks
  return Array.isArray(tasks.value) ? tasks.value : []
})
const incompleteAssociatedTasks = computed(() =>
  associatedTasks.value.filter((t: any) => t.status && t.status !== 'done' && t.status !== 'cancelled')
)
const completeBlockedMessage = computed(() => {
  const count = incompleteAssociatedTasks.value.length
  if (!count) return '该需求还有关联任务未完成，无法直接完成需求。'
  return `该需求还有 ${count} 个关联任务未完成，请先完成全部任务后再将需求标记为已完成。`
})

const linkedBugIds = computed(() => new Set((requirement.value?.bugs || []).map((b: any) => String(b.bug_id || b.id))))

const filteredAvailableBugs = computed(() => {
  const kw = bugSearch.value.trim().toLowerCase()
  return availableBugs.value.filter((bug) => {
    if (linkedBugIds.value.has(String(bug.bug_id)) || linkedBugIds.value.has(String(bug.id))) return false
    if (!kw) return true
    return `${bug.title || ''} ${bug.id || ''}`.toLowerCase().includes(kw)
  })
})

async function loadAvailableBugs() {
  bugsLoading.value = true
  bugPickerError.value = ''
  try {
    const list = await $fetch<any[]>('/api/bugs', {
      query: { projectId: requirement.value?.project?.id || undefined }
    })
    availableBugs.value = list || []
  } catch (e: any) {
    availableBugs.value = []
    bugPickerError.value = e.data?.message || e.statusMessage || '加载 Bug 列表失败'
  } finally {
    bugsLoading.value = false
  }
}

async function openBugPicker() {
  bugSearch.value = ''
  bugPickerError.value = ''
  showBugPickerModal.value = true
  await loadAvailableBugs()
}

async function associateBug(bug: { id: string; bug_id?: number }) {
  bugSubmitting.value = true
  bugPickerError.value = ''
  bugErrorMessage.value = ''
  try {
    await $fetch(`/api/requirements/${requirementId}/bugs`, {
      method: 'POST',
      body: { bug_id: bug.bug_id || bug.id }
    })
    showBugPickerModal.value = false
    await Promise.all([refresh(), refreshHistory()])
  } catch (e: any) {
    bugPickerError.value = e.data?.message || e.statusMessage || '关联 Bug 失败'
  } finally {
    bugSubmitting.value = false
  }
}

async function unlinkBug(bug: { id: string; bug_id?: number }) {
  bugErrorMessage.value = ''
  try {
    await $fetch(`/api/requirements/${requirementId}/bugs/${bug.bug_id || bug.id}`, { method: 'DELETE' })
    await Promise.all([refresh(), refreshHistory()])
  } catch (e: any) {
    bugErrorMessage.value = e.data?.message || e.statusMessage || '取消关联失败'
  }
}

function goCreateBug() {
  showBugPickerModal.value = false
  navigateTo({ path: '/bugs/new', query: { from: `/requirements/${requirementId}` } })
}

async function completeRequirement() {
  if (!requirement.value || completeReqSubmitting.value) return
  if (incompleteAssociatedTasks.value.length) {
    showCompleteBlockedModal.value = true
    return
  }
  completeReqSubmitting.value = true
  try {
    await $fetch(`/api/requirements/${requirementId}`, {
      method: 'PUT',
      body: { status: 'completed' }
    })
    await Promise.all([refresh(), refreshHistory()])
  } catch (e: any) {
    const code = e.statusCode || e.status
    if (code === 409) {
      showCompleteBlockedModal.value = true
    } else {
      alert(e.data?.message || e.statusMessage || '完成需求失败')
    }
  } finally {
    completeReqSubmitting.value = false
  }
}

const deleteReqBlocked = computed(() => (requirement.value?.task_count || requirement.value?.tasks?.length || 0) > 0)
const deleteReqMessage = computed(() => {
  if (!requirement.value) return ''
  if (deleteReqBlocked.value) {
    return `需求「${requirement.value.title}」下还有关联任务，请先删除关联任务后再删除需求。`
  }
  return `确定要删除需求「${requirement.value.title}」吗？此操作不可恢复。`
})

function openDeleteRequirement() {
  deleteReqError.value = ''
  showDeleteReqModal.value = true
}

async function confirmDeleteRequirement() {
  if (!requirement.value || deleteReqBlocked.value || deleteReqSubmitting.value) return
  deleteReqSubmitting.value = true
  deleteReqError.value = ''
  try {
    await $fetch(`/api/requirements/${requirementId}`, { method: 'DELETE' })
    showDeleteReqModal.value = false
    router.push('/requirements')
  } catch (e: any) {
    deleteReqError.value = e.data?.message || e.statusMessage || '删除失败'
  } finally {
    deleteReqSubmitting.value = false
  }
}

// 新建任务
const showTaskModal = ref(false)
const taskSubmitting = ref(false)
const taskErrorMessage = ref('')
const expandedTaskId = ref<string | number | null>(null)

function toggleExpandedTask(id: string | number) {
  expandedTaskId.value = expandedTaskId.value === id ? null : id
}

function viewIncompleteTask(task: { id: string | number }) {
  showCompleteBlockedModal.value = false
  expandedTaskId.value = task.id
  nextTick(() => {
    document.getElementById(`req-task-${task.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

interface TaskDraft {
  key: string
  title: string
  description: string
  priority: string
  type: string
  assignee_ids: number[]
  estimated_hours: string | number
  start_date: string
  due_date: string
}

function emptyTaskDraft(): TaskDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    description: '',
    priority: 'medium',
    type: 'development',
    assignee_ids: [],
    estimated_hours: '',
    start_date: '',
    due_date: ''
  }
}

const taskDrafts = ref<TaskDraft[]>([emptyTaskDraft()])
const filledTaskCount = computed(() => taskDrafts.value.filter(row => row.title.trim()).length)

function restoreTaskDrafts() {
  if (!import.meta.client) return
  const rows = parseTaskDrafts(sessionStorage.getItem(taskDraftStorageKey(requirementId)))
  if (!isMeaningfulTaskDraft(rows)) return
  taskDrafts.value = rows.map(row => ({
    ...emptyTaskDraft(),
    title: row.title || '',
    description: row.description || '',
    priority: row.priority || 'medium',
    type: row.type || 'development',
    assignee_ids: normalizeDraftAssigneeIds(row),
    estimated_hours: row.estimated_hours || '',
    start_date: row.start_date || '',
    due_date: row.due_date || ''
  }))
}

function persistTaskDrafts() {
  if (!import.meta.client) return
  const key = taskDraftStorageKey(requirementId)
  if (!isMeaningfulTaskDraft(taskDrafts.value)) {
    sessionStorage.removeItem(key)
    return
  }
  sessionStorage.setItem(key, serializeTaskDrafts(taskDrafts.value))
}

function clearTaskDrafts() {
  taskDrafts.value = [emptyTaskDraft()]
  if (import.meta.client) sessionStorage.removeItem(taskDraftStorageKey(requirementId))
}

function addTaskRow() {
  taskDrafts.value.push(emptyTaskDraft())
}

function removeTaskRow(idx: number) {
  if (taskDrafts.value.length <= 1) return
  taskDrafts.value.splice(idx, 1)
}

restoreTaskDrafts()
watch(taskDrafts, persistTaskDrafts, { deep: true })
watch(
  () => taskDrafts.value.map(row => `${row.key}:${row.start_date}:${row.due_date}`).join('|'),
  () => {
    for (const row of taskDrafts.value) {
      const hours = estimatedHoursFromDates(row.start_date, row.due_date)
      if (hours != null) row.estimated_hours = hours
    }
  }
)
watch(showTaskModal, (visible) => {
  if (visible) taskErrorMessage.value = ''
})

async function createTask() {
  const items = taskDrafts.value.filter(row => row.title.trim())
  if (!items.length) {
    taskErrorMessage.value = '请至少填写一个任务标题'
    return
  }
  if (items.some(row => isDueBeforeStart(row.start_date, row.due_date))) {
    taskErrorMessage.value = '截止时间不能早于开始时间'
    return
  }

  taskSubmitting.value = true
  taskErrorMessage.value = ''
  try {
    await $fetch('/api/tasks', {
      method: 'POST',
      body: {
        tasks: items.map(row => ({
          title: row.title.trim(),
          description: row.description,
          priority: row.priority,
          type: row.type,
          requirement_id: requirement.value?.req_id || null,
          project_id: requirement.value?.project?.id || null,
          iteration_id: requirement.value?.iteration?.id || null,
          assignee_ids: row.assignee_ids || [],
          estimated_hours: row.estimated_hours ? Number(row.estimated_hours) : null,
          start_date: row.start_date || null,
          due_date: row.due_date || null
        }))
      }
    })
    clearTaskDrafts()
    showTaskModal.value = false
    await Promise.all([refresh(), refreshTasks(), refreshHistory()])
  } catch (e: any) {
    taskErrorMessage.value = e.data?.message || e.statusMessage || '创建任务失败'
  } finally {
    taskSubmitting.value = false
  }
}

const showEditTaskModal = ref(false)
const showDeleteTaskModal = ref(false)
const deleteTaskTarget = ref<any>(null)
const editTaskError = ref('')
const deleteTaskError = ref('')
const editTask = reactive({
  id: '' as string | number,
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  type: 'development',
  assignee_ids: [] as number[],
  estimated_hours: '' as string | number,
  start_date: '',
  due_date: ''
})

function openEditTask(task: any) {
  editTask.id = task.id
  editTask.title = task.title || ''
  editTask.description = task.description || ''
  editTask.status = task.status || 'todo'
  editTask.priority = task.priority || 'medium'
  editTask.type = task.type || 'development'
  editTask.assignee_ids = taskAssigneeList(task).map(u => Number(u.id))
  editTask.estimated_hours = task.estimated_hours ?? ''
  editTask.start_date = task.start_date ? String(task.start_date).split('T')[0] : ''
  editTask.due_date = task.due_date ? String(task.due_date).split('T')[0] : ''
  editTaskError.value = ''
  showEditTaskModal.value = true
}

watch(
  () => [editTask.start_date, editTask.due_date],
  () => {
    if (!showEditTaskModal.value) return
    const hours = estimatedHoursFromDates(editTask.start_date, editTask.due_date)
    if (hours != null) editTask.estimated_hours = hours
  }
)

function closeEditTask() {
  showEditTaskModal.value = false
  editTaskError.value = ''
}

async function saveEditTask() {
  if (!editTask.title.trim() || taskSubmitting.value) return
  if (isDueBeforeStart(editTask.start_date, editTask.due_date)) {
    editTaskError.value = '截止时间不能早于开始时间'
    return
  }
  taskSubmitting.value = true
  editTaskError.value = ''
  try {
    await $fetch(`/api/tasks/${editTask.id}`, {
      method: 'PUT',
      body: {
        title: editTask.title.trim(),
        description: editTask.description,
        status: editTask.status,
        priority: editTask.priority,
        type: editTask.type,
        assignee_ids: editTask.assignee_ids || [],
        estimated_hours: editTask.estimated_hours === '' ? null : Number(editTask.estimated_hours),
        start_date: editTask.start_date || null,
        due_date: editTask.due_date || null
      }
    })
    closeEditTask()
    await Promise.all([refresh(), refreshTasks(), refreshHistory()])
  } catch (e: any) {
    editTaskError.value = e.data?.message || e.statusMessage || '保存失败'
  } finally {
    taskSubmitting.value = false
  }
}

function openDeleteTask(task: any) {
  deleteTaskTarget.value = task
  deleteTaskError.value = ''
  showDeleteTaskModal.value = true
}

function closeDeleteTask() {
  showDeleteTaskModal.value = false
  deleteTaskTarget.value = null
  deleteTaskError.value = ''
}

async function confirmDeleteTask() {
  if (!deleteTaskTarget.value || taskSubmitting.value) return
  taskSubmitting.value = true
  deleteTaskError.value = ''
  try {
    await $fetch(`/api/tasks/${deleteTaskTarget.value.id}`, { method: 'DELETE' })
    closeDeleteTask()
    await Promise.all([refresh(), refreshTasks(), refreshHistory()])
  } catch (e: any) {
    deleteTaskError.value = e.data?.message || e.statusMessage || '删除失败'
  } finally {
    taskSubmitting.value = false
  }
}

function statusLabel(status: RequirementStatus) {
  return STATUS_LABELS[status] || status
}

function statusClass(status: RequirementStatus) {
  return STATUS_CLASSES[status] || ''
}

function priorityLabel(priority: Priority) {
  return PRIORITY_LABELS[priority] || priority
}

function severityLabel(severity: Severity) {
  return SEVERITY_LABELS[severity] || severity
}

function getBugSeverityClass(severity: Severity) {
  return SEVERITY_CLASSES[severity] || ''
}

function taskStatusLabel(status: string) {
  const map: Record<string, string> = {
    'todo': '待办',
    'in_progress': '进行中',
    'review': '评审中',
    'done': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || status
}

function taskStatusClass(status: string) {
  const map: Record<string, string> = {
    'todo': 'bg-gray-100 text-gray-600',
    'in_progress': 'bg-blue-50 text-blue-600',
    'review': 'bg-yellow-50 text-yellow-600',
    'done': 'bg-green-50 text-green-600',
    'cancelled': 'bg-gray-100 text-gray-400'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

function taskPriorityDot(priority: string) {
  const map: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-red-400',
    medium: 'bg-yellow-400',
    low: 'bg-green-400'
  }
  return map[priority] || 'bg-gray-400'
}

function taskPriorityLabel(priority: string) {
  const map: Record<string, string> = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority] || priority
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function editRequirement() {
  editData.value = requirement.value
  editModalVisible.value = true
}

function onEditSuccess() {
  editModalVisible.value = false
  editData.value = null
  refresh()
  refreshHistory()
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
