<template>
  <div class="min-h-screen flex bg-gray-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold text-gray-800">任务看板</h1>
          <div class="flex items-center gap-2">
            <span class="text-gray-300">|</span>
            <!-- 迭代筛选 -->
            <div class="relative iteration-dropdown">
              <button
                class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                @click="showIterDropdown = !showIterDropdown"
              >
                <span class="text-sm text-gray-600">{{ currentIteration?.name || '全部迭代' }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div
                v-if="showIterDropdown"
                class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 max-h-72 overflow-y-auto"
                @click.stop
              >
                <button
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  :class="!selectedIterationId ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
                  @click="selectIteration(null)"
                >
                  全部迭代
                </button>
                <button
                  v-for="iter in meta?.iterations || []"
                  :key="iter.id"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors truncate"
                  :class="String(selectedIterationId) === String(iter.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
                  @click="selectIteration(iter.id)"
                >
                  {{ iter.name }}
                </button>
              </div>
            </div>
            <!-- 需求筛选 -->
            <div class="relative requirement-dropdown">
              <button
                class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                @click="showReqDropdown = !showReqDropdown"
              >
                <span class="text-sm text-gray-600">{{ currentRequirement?.title || '全部需求' }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div
                v-if="showReqDropdown"
                class="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 max-h-72 overflow-y-auto"
                @click.stop
              >
                <button
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors truncate"
                  :class="!selectedRequirementId ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
                  @click="selectRequirement(null)"
                >
                  全部需求
                </button>
                <button
                  v-for="req in requirementList"
                  :key="req.id"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors truncate"
                  :class="String(selectedRequirementId) === String(req.req_id) ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
                  :title="req.title"
                  @click="selectRequirement(req.req_id)"
                >
                  {{ req.title }}
                </button>
              </div>
            </div>
            <!-- 状态筛选 -->
            <div class="relative status-dropdown">
              <button
                class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                @click="showStatusDropdown = !showStatusDropdown"
              >
                <span class="text-sm text-gray-600">{{ currentStatusLabel }}</span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div
                v-if="showStatusDropdown"
                class="absolute top-full left-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1"
                @click.stop
              >
                <button
                  v-for="item in statusFilterOptions"
                  :key="item.value"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  :class="selectedStatus === item.value ? 'text-blue-600 bg-blue-50' : 'text-gray-600'"
                  @click="selectStatus(item.value)"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center p-0.5 bg-gray-100 rounded-lg">
            <button
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              :class="taskView === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              @click="taskView = 'list'"
            >
              任务列表
            </button>
            <button
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              :class="taskView === 'board' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              @click="taskView = 'board'"
            >
              任务看板
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div v-for="member in (meta?.users || []).slice(0, 3)" :key="member.id" class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium -ml-2 first:ml-0 border-2 border-white">
              {{ member.name?.charAt(0) || '?' }}
            </div>
          </div>
          <button v-if="can('create', 'task')" class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm" @click="openCreateModal">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            新建任务
          </button>
        </div>
      </header>

      <div v-if="listPending" class="flex-1 flex items-center justify-center text-sm text-gray-400">加载中...</div>

      <!-- Task list -->
      <div v-else-if="taskView === 'list'" class="flex-1 overflow-y-auto p-6">
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/50">
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">编号</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">标题</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">状态</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">优先级</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">类型</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">负责人</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">关联需求</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">截止时间</th>
                <th class="px-5 py-3 text-left text-xs font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="listTasks.length === 0">
                <td colspan="9" class="px-5 py-16 text-center text-sm text-gray-400">暂无任务</td>
              </tr>
              <tr
                v-for="task in listTasks"
                :key="task.id"
                class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                @click="openDetailModal(task)"
              >
                <td class="px-5 py-3 text-xs text-gray-400 font-mono">{{ task.id }}</td>
                <td class="px-5 py-3 text-sm text-gray-800 font-medium">{{ task.title }}</td>
                <td class="px-5 py-3 whitespace-nowrap" @click.stop>
                  <InlineStatusSelect
                    :status="task.status"
                    :options="taskStatusOptions"
                    :editable="canMaybeOwn('update', 'task')"
                    @change="status => changeTaskStatus(task, status)"
                  />
                </td>
                <td class="px-5 py-3">
                  <span class="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <span class="w-2 h-2 rounded-full" :class="getPriorityColor(task.priority)"></span>
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-sm text-gray-600">{{ getTypeLabel(task.type) }}</td>
                <td class="px-5 py-3 text-sm text-gray-600">{{ taskAssigneeNames(task) }}</td>
                <td class="px-5 py-3 text-sm truncate max-w-[180px]" @click.stop>
                  <NuxtLink
                    v-if="task.requirement?.id"
                    :to="`/requirements/${task.requirement.id}`"
                    class="text-blue-500 hover:text-blue-600 hover:underline"
                    :title="task.requirement.title"
                  >
                    {{ task.requirement.title }}
                  </NuxtLink>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-5 py-3 text-sm text-gray-500">{{ formatTaskDate(task.due_date) }}</td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <button
                      v-if="canMaybeOwn('update', 'task')"
                      class="text-xs text-blue-500 hover:text-blue-600"
                      @click.stop="openEditModal(task)"
                    >
                      编辑
                    </button>
                    <button
                      v-if="can('delete', 'task')"
                      class="text-xs text-red-500 hover:text-red-600"
                      @click.stop="openDeleteModal(task)"
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

      <!-- Kanban Board -->
      <div v-else class="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div class="flex gap-4 h-full min-w-max">
          <!-- Column: Todo -->
          <div
            class="w-72 flex flex-col bg-gray-100 rounded-xl p-3"
            @dragover.prevent="onDragOver($event, 'todo')"
            @dragleave="onDragLeave"
            @drop="onDrop('todo')"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                <span class="font-medium text-gray-700">待处理</span>
                <span class="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-500">{{ todoTasks.length }}</span>
              </div>
              <button v-if="can('create', 'task')" class="text-gray-400 hover:text-gray-600" @click="openCreateInStatus('todo')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto space-y-2">
              <div
                v-for="task in todoTasks"
                :key="task.id"
                draggable="true"
                class="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                :class="{ 'opacity-50 ring-2 ring-blue-400': draggingTaskId === task.id }"
                @click="openDetailModal(task)"
                @dragstart="onDragStart(task)"
                @dragend="onDragEnd"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-gray-400">{{ task.id }}</span>
                  <div class="flex items-center gap-1.5">
                    <button v-if="canMaybeOwn('update', 'task')" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity" @click.stop="openEditModal(task)" @dragstart.stop>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <span class="w-2 h-2 rounded-full" :class="getPriorityColor(task.priority)"></span>
                  </div>
                </div>
                <h4 class="text-sm font-medium text-gray-800 mb-2">{{ task.title }}</h4>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-500">{{ getTypeLabel(task.type) }}</span>
                  </div>
                  <div v-if="taskAssigneeList(task).length" class="flex -space-x-1">
                    <div
                      v-for="user in taskAssigneeList(task).slice(0, 3)"
                      :key="user.id"
                      class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      :title="user.name"
                    >
                      {{ user.name?.charAt(0) || '?' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="todoTasks.length === 0" class="text-center py-8 text-gray-300 text-xs">拖拽任务到这里</div>
            </div>
          </div>

          <!-- Column: In Progress -->
          <div
            class="w-72 flex flex-col bg-blue-50 rounded-xl p-3"
            :class="{ 'ring-2 ring-blue-300': dragOverStatus === 'in_progress' }"
            @dragover.prevent="onDragOver($event, 'in_progress')"
            @dragleave="onDragLeave"
            @drop="onDrop('in_progress')"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span class="font-medium text-gray-700">进行中</span>
                <span class="px-2 py-0.5 bg-blue-100 rounded text-xs text-blue-600">{{ inProgressTasks.length }}</span>
              </div>
              <button v-if="can('create', 'task')" class="text-gray-400 hover:text-gray-600" @click="openCreateInStatus('in_progress')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto space-y-2">
              <div
                v-for="task in inProgressTasks"
                :key="task.id"
                draggable="true"
                class="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                :class="{ 'opacity-50 ring-2 ring-blue-400': draggingTaskId === task.id }"
                @click="openDetailModal(task)"
                @dragstart="onDragStart(task)"
                @dragend="onDragEnd"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-gray-400">{{ task.id }}</span>
                  <div class="flex items-center gap-1.5">
                    <button v-if="canMaybeOwn('update', 'task')" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity" @click.stop="openEditModal(task)" @dragstart.stop>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <span class="w-2 h-2 rounded-full" :class="getPriorityColor(task.priority)"></span>
                  </div>
                </div>
                <h4 class="text-sm font-medium text-gray-800 mb-2">{{ task.title }}</h4>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="px-1.5 py-0.5 bg-blue-50 rounded text-xs text-blue-500">{{ getTypeLabel(task.type) }}</span>
                  </div>
                  <div v-if="taskAssigneeList(task).length" class="flex -space-x-1">
                    <div
                      v-for="user in taskAssigneeList(task).slice(0, 3)"
                      :key="user.id"
                      class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      :title="user.name"
                    >
                      {{ user.name?.charAt(0) || '?' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="inProgressTasks.length === 0" class="text-center py-8 text-gray-300 text-xs">拖拽任务到这里</div>
            </div>
          </div>

          <!-- Column: Review -->
          <div
            class="w-72 flex flex-col bg-yellow-50 rounded-xl p-3"
            :class="{ 'ring-2 ring-yellow-300': dragOverStatus === 'review' }"
            @dragover.prevent="onDragOver($event, 'review')"
            @dragleave="onDragLeave"
            @drop="onDrop('review')"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span class="font-medium text-gray-700">评审中</span>
                <span class="px-2 py-0.5 bg-yellow-100 rounded text-xs text-yellow-600">{{ reviewTasks.length }}</span>
              </div>
              <button v-if="can('create', 'task')" class="text-gray-400 hover:text-gray-600" @click="openCreateInStatus('review')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto space-y-2">
              <div
                v-for="task in reviewTasks"
                :key="task.id"
                draggable="true"
                class="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                :class="{ 'opacity-50 ring-2 ring-blue-400': draggingTaskId === task.id }"
                @click="openDetailModal(task)"
                @dragstart="onDragStart(task)"
                @dragend="onDragEnd"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-gray-400">{{ task.id }}</span>
                  <div class="flex items-center gap-1.5">
                    <button v-if="canMaybeOwn('update', 'task')" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity" @click.stop="openEditModal(task)" @dragstart.stop>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <span class="w-2 h-2 rounded-full" :class="getPriorityColor(task.priority)"></span>
                  </div>
                </div>
                <h4 class="text-sm font-medium text-gray-800 mb-2">{{ task.title }}</h4>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="px-1.5 py-0.5 bg-yellow-50 rounded text-xs text-yellow-500">{{ getTypeLabel(task.type) }}</span>
                  </div>
                  <div v-if="taskAssigneeList(task).length" class="flex -space-x-1">
                    <div
                      v-for="user in taskAssigneeList(task).slice(0, 3)"
                      :key="user.id"
                      class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      :title="user.name"
                    >
                      {{ user.name?.charAt(0) || '?' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="reviewTasks.length === 0" class="text-center py-8 text-gray-300 text-xs">拖拽任务到这里</div>
            </div>
          </div>

          <!-- Column: Done -->
          <div
            class="w-72 flex flex-col bg-green-50 rounded-xl p-3"
            :class="{ 'ring-2 ring-green-300': dragOverStatus === 'done' }"
            @dragover.prevent="onDragOver($event, 'done')"
            @dragleave="onDragLeave"
            @drop="onDrop('done')"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                <span class="font-medium text-gray-700">已完成</span>
                <span class="px-2 py-0.5 bg-green-100 rounded text-xs text-green-600">{{ doneTasks.length }}</span>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto space-y-2">
              <div
                v-for="task in doneTasks"
                :key="task.id"
                draggable="true"
                class="group bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-75"
                :class="{ 'opacity-30 ring-2 ring-blue-400': draggingTaskId === task.id }"
                @click="openDetailModal(task)"
                @dragstart="onDragStart(task)"
                @dragend="onDragEnd"
              >
                <div class="flex items-start justify-between mb-2">
                  <span class="text-xs text-gray-400">{{ task.id }}</span>
                  <div class="flex items-center gap-1.5">
                    <button v-if="canMaybeOwn('update', 'task')" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity" @click.stop="openEditModal(task)" @dragstart.stop>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                <h4 class="text-sm font-medium text-gray-800 mb-2 line-through">{{ task.title }}</h4>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="px-1.5 py-0.5 bg-green-50 rounded text-xs text-green-500">{{ getTypeLabel(task.type) }}</span>
                  </div>
                  <div v-if="taskAssigneeList(task).length" class="flex -space-x-1">
                    <div
                      v-for="user in taskAssigneeList(task).slice(0, 3)"
                      :key="user.id"
                      class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      :title="user.name"
                    >
                      {{ user.name?.charAt(0) || '?' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="doneTasks.length === 0" class="text-center py-8 text-gray-300 text-xs">拖拽任务到这里</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Task Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeCreateModal">
          <div class="bg-white rounded-xl w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">新建任务</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="closeCreateModal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">任务标题 <span class="text-red-500">*</span></label>
                <input v-model="newTask.title" type="text" placeholder="请输入任务标题" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">任务描述</label>
                <textarea v-model="newTask.description" rows="3" placeholder="请输入任务描述" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">优先级</label>
                  <select v-model="newTask.priority" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                    <option value="urgent">紧急</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">任务类型</label>
                  <select v-model="newTask.type" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                    <option value="development">开发</option>
                    <option value="design">设计</option>
                    <option value="test">测试</option>
                    <option value="doc">文档</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">指派给</label>
                  <AssigneeMultiSelect v-model="newTask.assignee_ids" :users="meta?.users || []" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">所属项目</label>
                  <select v-model="newTask.project_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                    <option value="">请选择项目</option>
                    <option v-for="p in meta?.projects || []" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">所属迭代</label>
                  <select v-model="newTask.iteration_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                    <option value="">不指定</option>
                    <option v-for="it in (meta?.iterations || [])" :key="it.id" :value="it.id">{{ it.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">关联需求</label>
                  <select v-model="newTask.requirement_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" :disabled="!newTask.iteration_id">
                    <option value="">{{ newTask.iteration_id ? '不关联' : '请先选择迭代' }}</option>
                    <option v-for="r in createRequirementList" :key="r.req_id || r.id" :value="r.req_id || r.id">{{ r.title }}</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">开始时间</label>
                  <input v-model="newTask.start_date" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">截止时间</label>
                  <input v-model="newTask.due_date" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
                </div>
              </div>
              <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="closeCreateModal">取消</button>
              <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50" :disabled="!newTask.title || submitting" @click="createTask">
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                创建
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Task Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeEditModal">
          <div class="bg-white rounded-xl w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">编辑任务</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="closeEditModal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">任务标题 <span class="text-red-500">*</span></label>
                <input v-model="editTask.title" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">任务描述</label>
                <textarea v-model="editTask.description" rows="3" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">优先级</label>
                  <select v-model="editTask.priority" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                    <option value="urgent">紧急</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">任务类型</label>
                  <select v-model="editTask.type" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                    <option value="development">开发</option>
                    <option value="design">设计</option>
                    <option value="test">测试</option>
                    <option value="doc">文档</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">任务状态</label>
                  <select v-model="editTask.status" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                    <option value="todo">待处理</option>
                    <option value="in_progress">进行中</option>
                    <option value="review">评审中</option>
                    <option value="done">已完成</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">指派给</label>
                  <AssigneeMultiSelect v-model="editTask.assignee_ids" :users="meta?.users || []" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">所属项目</label>
                  <select v-model="editTask.project_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all">
                    <option value="">请选择项目</option>
                    <option v-for="p in meta?.projects || []" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">开始时间</label>
                  <input v-model="editTask.start_date" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">截止时间</label>
                <input v-model="editTask.due_date" type="date" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all" />
              </div>
              <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="closeEditModal">取消</button>
              <button class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50" :disabled="!editTask.title || submitting" @click="saveEditTask">
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                保存
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- View Task Detail -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDetailModal && detailTask" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeDetailModal">
          <div class="bg-white rounded-xl w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div class="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-800">任务详情</h3>
              <button class="text-gray-400 hover:text-gray-600" @click="closeDetailModal">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-5">
              <TaskDetailContent :task="detailTask" />
            </div>
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="closeDetailModal">关闭</button>
              <button
                v-if="canMaybeOwn('update', 'task')"
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                @click="editFromDetail"
              >
                编辑
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal && deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeDeleteModal"></div>
          <div class="relative w-96 bg-white rounded-2xl shadow-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-800">确认删除</h3>
                <p class="text-sm text-gray-500 mt-0.5">确定要删除任务「{{ deleteTarget.title }}」吗？</p>
              </div>
            </div>
            <p v-if="deleteError" class="text-sm text-red-500 mb-3">{{ deleteError }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button class="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors" @click="closeDeleteModal">取消</button>
              <button
                class="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                :disabled="deleting"
                @click="confirmDeleteTask"
              >
                {{ deleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, TaskStatus } from '~/types'
import { TASK_STATUS_LABELS } from '~/types'
import InlineStatusSelect from '~/components/InlineStatusSelect.vue'
import { taskAssigneeList, taskAssigneeNames } from '~/utils/task-assignees'
import { pickLatestIteration } from '~/utils/latest-iteration'

const { can, canMaybeOwn } = useAuth()
const { selectedProjectId } = useProject()
const route = useRoute()

const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

// 需求列表（用于下拉筛选）
const selectedRequirementId = ref('')
const showReqDropdown = ref(false)
const selectedStatus = ref<'all' | TaskStatus>('all')
const showStatusDropdown = ref(false)
const statusFilterOptions: { value: 'all' | TaskStatus; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'todo', label: TASK_STATUS_LABELS.todo },
  { value: 'in_progress', label: TASK_STATUS_LABELS.in_progress },
  { value: 'review', label: TASK_STATUS_LABELS.review },
  { value: 'done', label: TASK_STATUS_LABELS.done }
]

const taskStatusOptions = [
  { value: 'todo', label: TASK_STATUS_LABELS.todo, class: 'bg-gray-100 text-gray-600' },
  { value: 'in_progress', label: TASK_STATUS_LABELS.in_progress, class: 'bg-blue-50 text-blue-600' },
  { value: 'review', label: TASK_STATUS_LABELS.review, class: 'bg-yellow-50 text-yellow-600' },
  { value: 'done', label: TASK_STATUS_LABELS.done, class: 'bg-green-50 text-green-600' }
]
const currentStatusLabel = computed(() => {
  return statusFilterOptions.find(item => item.value === selectedStatus.value)?.label || '全部状态'
})
function selectStatus(status: 'all' | TaskStatus) {
  selectedStatus.value = status
  showStatusDropdown.value = false
}

// 迭代筛选
const selectedIterationId = ref('')
const showIterDropdown = ref(false)
const iterationAuto = ref(!route.query.task)
const taskView = ref<'board' | 'list'>('board')

const currentIteration = computed(() => {
  return (meta.value?.iterations || []).find((it: any) => String(it.id) === String(selectedIterationId.value))
})

function applyLatestIteration() {
  const latest = pickLatestIteration(meta.value?.iterations || [])
  selectedIterationId.value = latest ? String(latest.id) : ''
}

watch([() => meta.value?.iterations, selectedProjectId], () => {
  if (!iterationAuto.value) {
    const stillVisible = (meta.value?.iterations || []).some((it: any) => String(it.id) === String(selectedIterationId.value))
    if (selectedIterationId.value && !stillVisible) {
      iterationAuto.value = true
    }
  }
  if (iterationAuto.value) applyLatestIteration()
}, { immediate: true })

function selectIteration(id: string | number | null) {
  iterationAuto.value = false
  selectedIterationId.value = id ? String(id) : ''
  showIterDropdown.value = false
}

const { data: requirementsData, refresh: refreshRequirements } = await useFetch('/api/requirements', {
  server: false,
  immediate: false,
  query: computed(() => ({
    page: 1,
    pageSize: 200,
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ items: [], total: 0, page: 1, pageSize: 200, totalPages: 0 }),
  watch: false
})

const requirementList = computed(() => {
  const items = (requirementsData.value?.items || []) as any[]
  if (!selectedIterationId.value) return items
  return items.filter(r => String(r.iteration?.id || '') === String(selectedIterationId.value))
})

const currentRequirement = computed(() => {
  return requirementList.value.find(r => String(r.req_id) === String(selectedRequirementId.value))
})

function selectRequirement(id: string | number | null) {
  selectedRequirementId.value = id ? String(id) : ''
  showReqDropdown.value = false
}

const { data: tasksData, pending: tasksPending, refresh } = await useFetch('/api/tasks', {
  server: false,
  immediate: false,
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined,
    requirementId: selectedRequirementId.value || undefined,
    iterationId: selectedIterationId.value || undefined
  })),
  default: () => [],
  watch: false
})

const listPending = computed(() => !selectedProjectId.value || tasksPending.value)

watch(selectedProjectId, (projectId) => {
  if (!projectId) return
  refreshRequirements()
  refresh()
}, { immediate: true })

watch(selectedIterationId, () => {
  const still = requirementList.value.some(r => String(r.req_id) === String(selectedRequirementId.value))
  if (selectedRequirementId.value && !still) selectedRequirementId.value = ''
})

watch([selectedRequirementId, selectedIterationId], () => {
  if (!selectedProjectId.value) return
  refresh()
})

// 点击外部关闭下拉
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const reqDropdown = document.querySelector('.requirement-dropdown')
  const iterDropdown = document.querySelector('.iteration-dropdown')
  const statusDropdown = document.querySelector('.status-dropdown')
  if (reqDropdown && !reqDropdown.contains(target)) {
    showReqDropdown.value = false
  }
  if (iterDropdown && !iterDropdown.contains(target)) {
    showIterDropdown.value = false
  }
  if (statusDropdown && !statusDropdown.contains(target)) {
    showStatusDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const allTasks = computed(() => tasksData.value || [])
const listTasks = computed(() => {
  if (selectedStatus.value === 'all') return allTasks.value
  return allTasks.value.filter((t: any) => t.status === selectedStatus.value)
})
const todoTasks = computed(() => allTasks.value.filter((t: any) => t.status === 'todo'))
const inProgressTasks = computed(() => allTasks.value.filter((t: any) => t.status === 'in_progress'))
const reviewTasks = computed(() => allTasks.value.filter((t: any) => t.status === 'review'))
const doneTasks = computed(() => allTasks.value.filter((t: any) => t.status === 'done'))

const activeIteration = computed(() => (meta.value?.iterations || []).find((i: any) => i.status === 'active'))
const daysLeft = computed(() => {
  const iter = activeIteration.value
  if (!iter || !iter.end_date) return -1
  const diff = new Date(iter.end_date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
})

// 拖拽逻辑
const draggingTask = ref<any>(null)
const draggingTaskId = ref<string>('')
const dragOverStatus = ref('')

const skipCardClick = ref(false)

function onDragStart(task: any) {
  skipCardClick.value = true
  draggingTask.value = task
  draggingTaskId.value = task.id
}

function onDragEnd() {
  draggingTask.value = null
  draggingTaskId.value = ''
  dragOverStatus.value = ''
}

function onDragOver(_e: DragEvent, status: string) {
  dragOverStatus.value = status
}

function onDragLeave() {
  dragOverStatus.value = ''
}

async function changeTaskStatus(task: any, status: string) {
  if (!task || task.status === status) return
  const previous = task.status
  task.status = status
  try {
    await $fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: { status }
    })
  } catch (e: any) {
    task.status = previous
    alert(e.data?.message || e.statusMessage || '修改状态失败')
  }
}

async function onDrop(newStatus: string) {
  dragOverStatus.value = ''
  const task = draggingTask.value
  if (!task || task.status === newStatus) {
    draggingTask.value = null
    draggingTaskId.value = ''
    return
  }

  // 乐观更新：先改本地数据
  task.status = newStatus
  draggingTask.value = null
  draggingTaskId.value = ''

  try {
    await $fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
  } catch {
    // 失败则刷新恢复
    await refresh()
    alert('更新任务状态失败，请重试')
  }
}

// 新建任务
const showCreateModal = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

const newTask = reactive({
  title: '',
  description: '',
  status: 'todo' as string,
  priority: 'medium',
  type: 'development',
  assignee_ids: [] as number[],
  project_id: '' as string | number,
  requirement_id: '' as string | number,
  iteration_id: '' as string | number,
  start_date: '',
  due_date: ''
})

const createRequirementList = computed(() => {
  const items = (requirementsData.value?.items || []) as any[]
  if (!newTask.iteration_id) return []
  return items.filter(r => String(r.iteration?.id || '') === String(newTask.iteration_id))
})

watch(() => newTask.iteration_id, (id, prev) => {
  if (prev == null || prev === '') return
  if (String(id) === String(prev)) return
  newTask.requirement_id = ''
})

function applyCreateDefaults(status = 'todo') {
  const latest = pickLatestIteration(meta.value?.iterations || [])
  newTask.status = status
  newTask.project_id = selectedProjectId.value || ''
  newTask.requirement_id = selectedRequirementId.value ? Number(selectedRequirementId.value) : ''
  newTask.iteration_id = selectedIterationId.value
    ? Number(selectedIterationId.value)
    : (latest ? latest.id : '')
}

function openCreateModal() {
  applyCreateDefaults('todo')
  showCreateModal.value = true
}

function openCreateInStatus(status: string) {
  applyCreateDefaults(status)
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  errorMessage.value = ''
  newTask.title = ''
  newTask.description = ''
  newTask.status = 'todo'
  newTask.priority = 'medium'
  newTask.type = 'development'
  newTask.assignee_ids = []
  newTask.project_id = ''
  newTask.requirement_id = ''
  newTask.iteration_id = ''
  newTask.start_date = ''
  newTask.due_date = ''
}

async function createTask() {
  submitting.value = true
  errorMessage.value = ''
  try {
    const body: any = {
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      type: newTask.type,
      start_date: newTask.start_date || null,
      due_date: newTask.due_date || null
    }
    body.assignee_ids = newTask.assignee_ids || []
    if (newTask.project_id) body.project_id = Number(newTask.project_id)
    if (newTask.requirement_id) body.requirement_id = Number(newTask.requirement_id)
    if (newTask.iteration_id) body.iteration_id = Number(newTask.iteration_id)

    await $fetch('/api/tasks', {
      method: 'POST',
      body
    })
    closeCreateModal()
    await refresh()
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || '创建失败'
  } finally {
    submitting.value = false
  }
}

// 编辑任务
const showEditModal = ref(false)
const editTask = reactive({
  id: '',
  task_id: 0,
  title: '',
  description: '',
  status: 'todo' as string,
  priority: 'medium',
  type: 'development',
  assignee_ids: [] as number[],
  project_id: '' as string | number,
  start_date: '',
  due_date: ''
})

const showDetailModal = ref(false)
const detailTask = ref<any>(null)

function openDetailModal(task: any) {
  if (skipCardClick.value) {
    skipCardClick.value = false
    return
  }
  detailTask.value = task
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  detailTask.value = null
}

function editFromDetail() {
  const task = detailTask.value
  closeDetailModal()
  if (task) openEditModal(task)
}

watch([tasksData, () => route.query.task], ([list, taskKey]) => {
  const key = String(taskKey || '')
  if (!key || showDetailModal.value || showEditModal.value) return
  const task = (list || []).find((t: any) => String(t.id) === key || String(t.task_id) === key)
  if (task) openDetailModal(task)
})

const showDeleteModal = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)
const deleteError = ref('')

function openDeleteModal(task: any) {
  deleteTarget.value = task
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteTarget.value = null
  deleteError.value = ''
}

async function confirmDeleteTask() {
  if (!deleteTarget.value || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/tasks/${deleteTarget.value.id}`, { method: 'DELETE' })
    const deletedId = deleteTarget.value.id
    closeDeleteModal()
    if (detailTask.value?.id === deletedId) closeDetailModal()
    await refresh()
  } catch (e: any) {
    deleteError.value = e.data?.message || e.statusMessage || '删除失败'
  } finally {
    deleting.value = false
  }
}

function openEditModal(task: any) {
  editTask.id = task.id
  editTask.task_id = task.task_id
  editTask.title = task.title || ''
  editTask.description = task.description || ''
  editTask.status = task.status || 'todo'
  editTask.priority = task.priority || 'medium'
  editTask.type = task.type || 'development'
  editTask.assignee_ids = taskAssigneeList(task).map(u => Number(u.id))
  editTask.project_id = task.project?.id || ''
  editTask.start_date = task.start_date ? String(task.start_date).split('T')[0] : ''
  editTask.due_date = task.due_date ? String(task.due_date).split('T')[0] : ''
  errorMessage.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  errorMessage.value = ''
}

async function saveEditTask() {
  submitting.value = true
  errorMessage.value = ''
  try {
    const body: any = {
      title: editTask.title,
      description: editTask.description,
      status: editTask.status,
      priority: editTask.priority,
      type: editTask.type,
      start_date: editTask.start_date || null,
      due_date: editTask.due_date || null
    }
    body.assignee_ids = editTask.assignee_ids || []
    if (editTask.project_id) body.project_id = Number(editTask.project_id)

    await $fetch(`/api/tasks/${editTask.id}`, {
      method: 'PUT',
      body
    })
    closeEditModal()
    await refresh()
  } catch (e: any) {
    errorMessage.value = e.data?.message || e.statusMessage || '保存失败'
  } finally {
    submitting.value = false
  }
}

function getPriorityColor(priority: string) {
  const map: Record<string, string> = {
    'urgent': 'bg-red-500',
    'high': 'bg-red-400',
    'medium': 'bg-yellow-400',
    'low': 'bg-green-400'
  }
  return map[priority] || 'bg-gray-400'
}

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    'development': '开发',
    'design': '设计',
    'test': '测试',
    'doc': '文档'
  }
  return map[type] || type || '任务'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    todo: '待处理',
    in_progress: '进行中',
    review: '评审中',
    done: '已完成'
  }
  return map[status] || status
}

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-50 text-blue-600',
    review: 'bg-yellow-50 text-yellow-600',
    done: 'bg-green-50 text-green-600'
  }
  return map[status] || 'bg-gray-100 text-gray-500'
}

function getPriorityLabel(priority: string) {
  const map: Record<string, string> = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority] || priority
}

function formatTaskDate(value?: string | null) {
  if (!value) return '—'
  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toISOString().slice(0, 10)
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
