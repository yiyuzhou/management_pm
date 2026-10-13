<template>
  <div class="h-screen flex bg-slate-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-[89px] bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
        <div class="flex items-center gap-3">
          <button
            class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            @click="goBackFromBug()"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex flex-col gap-1">
            <!-- Breadcrumb -->
            <div class="flex items-center gap-1 text-xs text-slate-400">
              <span>Bug 追踪</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <span>{{ isCreate ? '提交 Bug' : (isView ? 'Bug 详情' : '编辑 Bug') }}</span>
            </div>
            <!-- Title -->
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span class="text-lg font-bold text-slate-800">{{ isCreate ? '新建 Bug' : (bug?.id || 'BUG') }}</span>
              <span
                v-if="!isCreate && bug?.status"
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="getBugStatusClass(bug.status)"
              >{{ bugStatusLabel(bug.status) }}</span>
            </div>
          </div>
        </div>
        <!-- Right: Edit button (view mode) or Status select (edit mode) -->
        <div class="flex items-center gap-3">
          <button
            v-if="isView && canMaybeOwn('update', 'bug')"
            class="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            @click="navigateTo({ path: `/bugs/${route.params.id}`, query: bugPageQuery({ edit: 'true' }) })"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            编辑
          </button>
          <select
            v-if="isEdit && !isCreate"
            v-model="form.status"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
          >
            <option v-for="s in availableStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="pending" class="flex-1 flex items-center justify-center">
        <div class="text-slate-400 text-sm">加载中...</div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center py-20">
        <svg class="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-slate-400 text-sm mb-2">{{ error.statusCode === 404 ? 'Bug 不存在或已被删除' : '加载失败' }}</p>
        <button class="text-blue-500 text-sm hover:underline" @click="goBackFromBug()">返回</button>
      </div>

      <!-- Content -->
      <template v-else>
        <div class="flex-1 overflow-y-auto py-6 px-8">
          <div class="w-full flex flex-col gap-6">
            <!-- Bug 信息卡片 (Full Width) -->
            <div class="w-full bg-white rounded-2xl p-6" style="box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <!-- Card Title -->
              <div class="flex items-center mb-5">
                <span class="w-[5px] h-5 rounded-full bg-red-600 mr-3"></span>
                <h3 class="text-base font-semibold text-slate-800">Bug 信息</h3>
              </div>

              <!-- View: 只读详情 -->
              <template v-if="isView">
                <h2 class="text-lg font-semibold text-slate-900 mb-5">{{ form.title || bug?.title || '—' }}</h2>
                <div class="grid grid-cols-4 gap-x-6 gap-y-4">
                  <div>
                    <div class="text-xs text-slate-400 mb-1">严重程度</div>
                    <span class="px-2 py-0.5 rounded text-xs font-medium" :class="getSeverityClass(form.severity)">{{ severityLabel(form.severity) }}</span>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 mb-1">优先级</div>
                    <span class="text-sm text-slate-800">{{ priorityLabel(form.priority) }}</span>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 mb-1">所属迭代</div>
                    <NuxtLink
                      v-if="form.iteration_id"
                      :to="`/requirements?iterationId=${form.iteration_id}`"
                      class="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >{{ iterationDisplay }}</NuxtLink>
                    <span v-else class="text-sm text-slate-400">—</span>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 mb-1">关联需求</div>
                    <NuxtLink
                      v-if="form.requirement_id"
                      :to="`/requirements/${form.requirement_id}`"
                      class="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >{{ requirementDisplay }}</NuxtLink>
                    <span v-else class="text-sm text-slate-400">—</span>
                  </div>
                  <div>
                    <div class="text-xs text-slate-400 mb-1">指派给</div>
                    <span class="text-sm text-slate-800">{{ assigneeDisplay }}</span>
                  </div>
                  <div class="col-span-3">
                    <div class="text-xs text-slate-400 mb-1">标签</div>
                    <div v-if="form.tags?.length" class="flex flex-wrap gap-1.5">
                      <span v-for="(tag, i) in form.tags" :key="i" class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md">{{ tag }}</span>
                    </div>
                    <span v-else class="text-sm text-slate-400">—</span>
                  </div>
                </div>
              </template>

              <!-- Edit / Create form -->
              <template v-else>
              <div class="mb-5">
                <label class="block text-[13px] font-medium text-slate-700 mb-2">
                  Bug 标题 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="请输入 Bug 标题，简明描述问题现象"
                  class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>

              <!-- Row 1: 4 Columns - 严重程度 / 优先级 / 关联需求 / 所属迭代 -->
              <div class="flex gap-4 mb-5">
                <div class="flex-1">
                  <label class="block text-[13px] font-medium text-slate-700 mb-2">
                    严重程度 <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.severity"
                    :disabled="!canEdit"
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                    :class="{ 'bg-slate-50 cursor-not-allowed': !canEdit }"
                  >
                    <option value="">请选择</option>
                    <option v-for="(label, val) in SEVERITY_LABELS" :key="val" :value="val">{{ label }}</option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="block text-[13px] font-medium text-slate-700 mb-2">
                    优先级 <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.priority"
                    :disabled="!canEdit"
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                    :class="{ 'bg-slate-50 cursor-not-allowed': !canEdit }"
                  >
                    <option value="">请选择</option>
                    <option v-for="(label, val) in PRIORITY_LABELS" :key="val" :value="val">{{ label }}</option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="block text-[13px] font-medium text-slate-700 mb-2">所属迭代</label>
                  <select
                    v-model="form.iteration_id"
                    :disabled="!canEdit"
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                    :class="{ 'bg-slate-50 cursor-not-allowed': !canEdit }"
                  >
                    <option value="">选择迭代</option>
                    <option v-for="iter in meta?.iterations || []" :key="iter.id" :value="iter.id">{{ iter.name }}</option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="block text-[13px] font-medium text-slate-700 mb-2">关联需求</label>
                  <select
                    v-model="form.requirement_id"
                    :disabled="!canEdit || !form.iteration_id"
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                    :class="{ 'bg-slate-50 cursor-not-allowed': !canEdit || !form.iteration_id }"
                  >
                    <option value="">{{ form.iteration_id ? '选择需求' : '请先选择迭代' }}</option>
                    <option v-for="req in requirements" :key="req.req_id" :value="req.req_id">{{ req.id }} - {{ req.title }}</option>
                  </select>
                </div>
              </div>

              <!-- Row 2: 3 Columns - 指派给 / 所属模块 / 标签 -->
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-[13px] font-medium text-slate-700 mb-2">
                    指派给 <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.assignee_id"
                    :disabled="!canEdit"
                    class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                    :class="{ 'bg-slate-50 cursor-not-allowed': !canEdit }"
                  >
                    <option value="">选择负责人</option>
                    <option v-for="user in meta?.users || []" :key="user.id" :value="user.id">{{ user.name }}</option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="block text-[13px] font-medium text-slate-700 mb-2">标签</label>
                  <div class="min-h-[42px] px-3 py-2 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center gap-2">
                    <span
                      v-for="(tag, i) in form.tags"
                      :key="i"
                      class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md"
                    >
                      {{ tag }}
                      <button
                        v-if="canEdit"
                        class="text-blue-400 hover:text-blue-600"
                        @click="form.tags.splice(i, 1)"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </span>
                    <div v-if="canEdit" class="flex items-center">
                      <input
                        v-if="tagInputVisible"
                        ref="tagInputRef"
                        v-model="tagInputValue"
                        type="text"
                        class="w-24 px-2 py-1 text-xs text-slate-700 border border-blue-300 rounded-md focus:outline-none"
                        placeholder="标签名"
                        @keyup.enter="addTag"
                        @blur="addTag"
                      />
                      <button
                        v-else
                        class="text-xs text-slate-400 hover:text-blue-500 transition-colors"
                        @click="showTagInput"
                      >
                        + 添加标签
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </template>
            </div>

            <!-- 富文本编辑卡片 (Full Width) -->
            <div class="w-full bg-white rounded-2xl p-6 flex flex-col" style="box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <!-- Card Title -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <span class="w-[5px] h-5 rounded-full bg-amber-500 mr-3"></span>
                  <h3 class="text-base font-semibold text-slate-800">Bug 详情描述</h3>
                  <span v-if="!isView" class="text-red-500 text-[13px] ml-2">*</span>
                </div>
                <div v-if="!isView" class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span class="text-xs text-slate-400">支持富文本，可直接粘贴图片</span>
                </div>
              </div>

              <!-- Rich Text Toolbar -->
              <div v-if="!isView" class="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-4 flex items-center flex-wrap gap-1">
                <!-- Text Style Group -->
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors text-sm font-bold" title="加粗" @click="exec('bold')">B</button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors text-sm italic" title="斜体" @click="exec('italic')">I</button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors text-sm underline" title="下划线" @click="exec('underline')">U</button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors text-sm line-through" title="删除线" @click="exec('strikeThrough')">S</button>
                <span class="w-px h-5 bg-slate-200 mx-1"></span>
                <!-- Heading Group -->
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors text-xs font-semibold" title="标题1" @click="exec('formatBlock', '<h1>')">H1</button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors text-xs font-semibold" title="标题2" @click="exec('formatBlock', '<h2>')">H2</button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors text-xs font-semibold" title="标题3" @click="exec('formatBlock', '<h3>')">H3</button>
                <span class="w-px h-5 bg-slate-200 mx-1"></span>
                <!-- List Group -->
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="有序列表" @click="exec('insertOrderedList')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h10M7 12h10M7 18h10M3 6h.01M3 12h.01M3 18h.01"/></svg>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="无序列表" @click="exec('insertUnorderedList')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="引用" @click="exec('formatBlock', '<blockquote>')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h6v6H3zM3 13h6v6H3zM15 5h6v6h-6zM15 13h6v6h-6z"/></svg>
                </button>
                <span class="w-px h-5 bg-slate-200 mx-1"></span>
                <!-- Insert Group -->
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="插入图片" @click="insertImage">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="插入链接" @click="insertLink">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="插入代码" @click="exec('formatBlock', '<pre>')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="插入表格" @click="insertTable">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M9 4v16M15 4v16M3 4h18v16H3V4z"/></svg>
                </button>
                <span class="w-px h-5 bg-slate-200 mx-1"></span>
                <!-- Undo/Redo -->
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="撤销" @click="exec('undo')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6"/></svg>
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 transition-colors" title="重做" @click="exec('redo')">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"/></svg>
                </button>
              </div>

              <!-- Hidden file input for image insertion -->
              <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="onImageSelected" />

              <!-- Rich Text Edit Area -->
              <div class="flex-1 bg-white border border-slate-200 rounded-lg p-5 min-h-[400px]" @click="handleEditorClick">
                <!-- 复现步骤 -->
                <div class="mb-4">
                  <h4 class="text-base font-semibold text-slate-800 mb-2">复现步骤</h4>
                  <div
                    ref="stepsEditorRef"
                    class="rich-editor w-full text-sm text-slate-700 focus:outline-none"
                    :class="{ 'bg-slate-50 cursor-not-allowed': !canEdit, 'min-h-[120px]': canEdit }"
                    :contenteditable="canEdit"
                    data-placeholder="请详细描述复现步骤：1. 打开应用，进入首页... 2. 点击「我的」Tab 进入个人中心... 3. 观察页面加载情况..."
                    @input="onEditorInput('steps', $event)"
                    @focus="activeEditor = 'steps'"
                    @paste="onPaste($event, 'steps')"
                  ></div>
                </div>

                <!-- Divider -->
                <hr class="border-slate-100 my-4" />

                <!-- 预期结果 -->
                <div class="mb-4">
                  <h4 class="text-base font-semibold text-slate-800 mb-2">预期结果</h4>
                  <div
                    ref="expectedEditorRef"
                    class="rich-editor w-full text-sm text-slate-700 focus:outline-none"
                    :class="{ 'bg-slate-50 cursor-not-allowed': !canEdit, 'min-h-[80px]': canEdit }"
                    :contenteditable="canEdit"
                    data-placeholder="描述期望的正确行为..."
                    @input="onEditorInput('expected_result', $event)"
                    @focus="activeEditor = 'expected'"
                    @paste="onPaste($event, 'expected_result')"
                  ></div>
                </div>

                <!-- Divider -->
                <hr class="border-slate-100 my-4" />

                <!-- 实际结果 -->
                <div>
                  <h4 class="text-base font-semibold text-slate-800 mb-2">实际结果</h4>
                  <div
                    ref="actualEditorRef"
                    class="rich-editor w-full text-sm text-slate-700 focus:outline-none"
                    :class="{ 'bg-slate-50 cursor-not-allowed': !canEdit, 'min-h-[80px]': canEdit }"
                    :contenteditable="canEdit"
                    data-placeholder="描述实际出现的错误..."
                    @input="onEditorInput('actual_result', $event)"
                    @focus="activeEditor = 'actual'"
                    @paste="onPaste($event, 'actual_result')"
                  ></div>
                </div>
              </div>

              <!-- Paste Hint -->
              <div v-if="!isView" class="mt-4 bg-amber-50 rounded-lg px-4 py-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="text-[13px] text-amber-900">提示：截图后可直接 Ctrl+V 粘贴到编辑区，图片将嵌入在对应描述位置</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <footer class="h-[76px] bg-white border-t border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
          <!-- Left hint -->
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-sm text-slate-400">
              {{ isCreate ? '填写 Bug 信息后点击提交' : (canEdit ? '修改后将保存到服务器' : '当前为查看模式') }}
            </span>
          </div>
          <!-- Right buttons -->
          <div class="flex items-center gap-3">
            <button
              class="px-5 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
              @click="goBackFromBug()"
            >
              {{ isCreate ? '取消' : '返回' }}
            </button>
            <button
              v-if="canEdit"
              class="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!isValid || saving"
              @click="save"
            >
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              {{ saving ? '保存中...' : (isCreate ? '提交' : '保存') }}
            </button>
          </div>
        </footer>
      </template>
    </main>

    <!-- 图片放大模态框 -->
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
          v-if="showImageModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          @click="closeImageModal"
        >
          <button
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            @click.stop="closeImageModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <img
            :src="modalImageUrl"
            class="max-w-[90vw] max-h-[90vh] object-contain"
            @click.stop
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, Severity, BugStatus, Priority, Requirement } from '~/types'
import { SEVERITY_LABELS, SEVERITY_CLASSES, BUG_STATUS_LABELS, BUG_STATUS_CLASSES, PRIORITY_LABELS } from '~/types'
import { pickLatestIteration } from '~/utils/latest-iteration'

const { canMaybeOwn } = useAuth()
const { selectedProjectId } = useProject()

const route = useRoute()
const router = useRouter()
const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

// Mode determination: 'create' | 'view' | 'edit'
const isCreate = computed(() => route.params.id === 'new')
const isView = computed(() => !isCreate.value && route.query.edit !== 'true')
const isEdit = computed(() => !isCreate.value && route.query.edit === 'true')

function safeReturnPath() {
  const from = route.query.from
  if (typeof from !== 'string') return '/bugs'
  if (!from.startsWith('/') || from.startsWith('//') || from.includes('://')) return '/bugs'
  return from
}

function goBackFromBug() {
  router.push(safeReturnPath())
}

function bugPageQuery(extra: Record<string, string> = {}) {
  const query: Record<string, string> = { ...extra }
  const from = typeof route.query.from === 'string' ? route.query.from : ''
  if (from) query.from = from
  return query
}

// Only fetch bug data when not creating
const { data: bug, pending: fetchPending, error, refresh } = await useFetch(`/api/bugs/${route.params.id}`, {
  server: false,
  immediate: !isCreate.value,
  default: () => null as any
})

// For create mode, pending should be false since we don't fetch
const pending = computed(() => !isCreate.value && fetchPending.value)

const form = reactive({
  title: '',
  severity: '' as Severity | '',
  priority: '' as Priority | '',
  status: 'new' as BugStatus,
  requirement_id: '' as string | number,
  iteration_id: '' as string | number,
  assignee_id: '' as string | number,
  tags: [] as string[],
  steps: '',
  expected_result: '',
  actual_result: ''
})

// Fetch requirements for the dropdown — only the selected iteration
const { data: requirementsData } = await useFetch<{ items: Requirement[] }>('/api/requirements', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined,
    iterationId: form.iteration_id || undefined,
    pageSize: 200
  })),
  default: () => ({ items: [] })
})
const requirements = computed(() => {
  const items = requirementsData.value?.items || []
  if (!form.iteration_id) return []
  return items.filter(req => String(req.iteration?.id || '') === String(form.iteration_id))
})

const canEdit = computed(() => {
  if (isView.value) return false
  return canMaybeOwn('update', 'bug')
})

const saving = ref(false)
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref<HTMLInputElement | null>(null)

// ===== Rich Text Editor =====
const stepsEditorRef = ref<HTMLElement | null>(null)
const expectedEditorRef = ref<HTMLElement | null>(null)
const actualEditorRef = ref<HTMLElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const activeEditor = ref<'steps' | 'expected' | 'actual'>('steps')
const editorInitialized = ref(false)

// 图片放大模态框状态
const showImageModal = ref(false)
const modalImageUrl = ref('')

function handleEditorClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG') {
    const src = (target as HTMLImageElement).src
    if (src) openImageModal(src)
  }
}

function openImageModal(url: string) {
  modalImageUrl.value = url
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
  modalImageUrl.value = ''
}

function getActiveEditorEl(): HTMLElement | null {
  if (activeEditor.value === 'steps') return stepsEditorRef.value
  if (activeEditor.value === 'expected') return expectedEditorRef.value
  if (activeEditor.value === 'actual') return actualEditorRef.value
  return null
}

function onEditorInput(field: 'steps' | 'expected_result' | 'actual_result', e: Event) {
  const el = e.target as HTMLElement
  if (el.innerHTML === '<br>') {
    form[field] = ''
  } else {
    form[field] = el.innerHTML
  }
}

function exec(command: string, value?: string) {
  if (!canEdit.value) return
  const editor = getActiveEditorEl()
  if (!editor) return
  editor.focus()
  document.execCommand(command, false, value)
  // Sync content back to form
  const fieldMap: Record<string, 'steps' | 'expected_result' | 'actual_result'> = {
    steps: 'steps',
    expected: 'expected_result',
    actual: 'actual_result'
  }
  const field = fieldMap[activeEditor.value]
  if (field) {
    form[field] = editor.innerHTML
  }
}

function insertLink() {
  if (!canEdit.value) return
  const url = window.prompt('请输入链接地址：', 'https://')
  if (url) {
    exec('createLink', url)
  }
}

function insertImage() {
  if (!canEdit.value) return
  imageInputRef.value?.click()
}

async function onImageSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const file = target.files[0]
  target.value = ''
  await uploadAndInsertImage(file)
}

async function uploadAndInsertImage(file: File) {
  const editor = getActiveEditorEl()
  if (!editor) return
  editor.focus()

  // Insert a placeholder
  const placeholderId = `img-loading-${Date.now()}`
  document.execCommand('insertHTML', false, `<span id="${placeholderId}" style="color:#94a3b8;font-size:12px;">[图片上传中...]</span>`)

  try {
    const formData = new FormData()
    formData.append('file', file)
    const result = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })

    // Replace placeholder with the uploaded image
    const placeholder = document.getElementById(placeholderId)
    if (placeholder) {
      placeholder.outerHTML = `<img src="${result.url}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`
    } else {
      document.execCommand('insertImage', false, result.url)
    }

    // Sync content
    const fieldMap: Record<string, 'steps' | 'expected_result' | 'actual_result'> = {
      steps: 'steps',
      expected: 'expected_result',
      actual: 'actual_result'
    }
    const field = fieldMap[activeEditor.value]
    if (field) {
      form[field] = editor.innerHTML
    }
  } catch (err: any) {
    // Remove placeholder on error
    const placeholder = document.getElementById(placeholderId)
    if (placeholder) placeholder.remove()
    alert(err.data?.message || err.statusMessage || '图片上传失败')
  }
}

async function onPaste(e: ClipboardEvent, field: 'steps' | 'expected_result' | 'actual_result') {
  if (!canEdit.value) return
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (!file) continue
      await uploadAndInsertImage(file)
      return
    }
  }
  // Non-image paste: let default happen, then sync after a tick
  nextTick(() => {
    const editor = getActiveEditorEl()
    if (editor) {
      form[field] = editor.innerHTML
    }
  })
}

function insertTable() {
  if (!canEdit.value) return
  const rows = 3
  const cols = 3
  let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0;"><tbody>'
  for (let r = 0; r < rows; r++) {
    html += '<tr>'
    for (let c = 0; c < cols; c++) {
      html += '<td style="border:1px solid #e2e8f0;padding:8px;min-width:60px;">&nbsp;</td>'
    }
    html += '</tr>'
  }
  html += '</tbody></table>'
  exec('insertHTML', html)
}

// Initialize editor content when bug data loads or when switching to edit mode
function syncEditorContent() {
  nextTick(() => {
    if (stepsEditorRef.value) {
      stepsEditorRef.value.innerHTML = form.steps || ''
    }
    if (expectedEditorRef.value) {
      expectedEditorRef.value.innerHTML = form.expected_result || ''
    }
    if (actualEditorRef.value) {
      actualEditorRef.value.innerHTML = form.actual_result || ''
    }
    editorInitialized.value = true
  })
}

// Initialize form data when bug data loads (pre-flush)
watch(() => form.iteration_id, (id, prev) => {
  if (prev == null || prev === '') return
  if (String(id) === String(prev)) return
  form.requirement_id = ''
})

watch(() => meta.value?.iterations, (iterations) => {
  if (!isCreate.value || form.iteration_id) return
  const latest = pickLatestIteration(iterations)
  if (latest) form.iteration_id = latest.id
}, { immediate: true })

watch(bug, (val) => {
  if (val && !isCreate.value) {
    form.title = val.title || ''
    form.severity = val.severity || ''
    form.priority = val.priority || ''
    form.status = val.status || 'new'
    form.requirement_id = val.requirement?.id || ''
    form.iteration_id = val.iteration?.id || ''
      form.assignee_id = val.assignee?.id || ''
      form.tags = [...(val.tags || [])]
    form.steps = val.steps || ''
    form.expected_result = val.expected_result || ''
    form.actual_result = val.actual_result || ''
  }
}, { immediate: true })

// Sync editor content AFTER DOM updates (flush: 'post' ensures refs are available)
// immediate: true covers the case where useFetch returns cached data instantly
// (bug/pending never "change" so a non-immediate watcher would never fire)
watch([bug, pending, canEdit], () => {
  if (bug.value && !pending.value && !isCreate.value) {
    if (stepsEditorRef.value) {
      stepsEditorRef.value.innerHTML = form.steps || ''
    }
    if (expectedEditorRef.value) {
      expectedEditorRef.value.innerHTML = form.expected_result || ''
    }
    if (actualEditorRef.value) {
      actualEditorRef.value.innerHTML = form.actual_result || ''
    }
    editorInitialized.value = true
  }
}, { flush: 'post', immediate: true })

// For create mode, sync empty editors on mount
onMounted(() => {
  // Sync editor content on mount for ALL modes (create, view, edit).
  // In SPA navigation, useFetch may return cached data instantly — bug/pending
  // never "change", so watchers alone can't catch it. onMounted runs after DOM
  // is rendered, so refs are guaranteed to be available.
  syncEditorContent()
})

const availableStatuses = [
  { value: 'new' as BugStatus, label: BUG_STATUS_LABELS['new'] },
  { value: 'confirmed' as BugStatus, label: BUG_STATUS_LABELS['confirmed'] },
  { value: 'in_progress' as BugStatus, label: BUG_STATUS_LABELS['in_progress'] },
  { value: 'fixed' as BugStatus, label: BUG_STATUS_LABELS['fixed'] },
  { value: 'verified' as BugStatus, label: BUG_STATUS_LABELS['verified'] },
  { value: 'closed' as BugStatus, label: BUG_STATUS_LABELS['closed'] },
  { value: 'reopened' as BugStatus, label: BUG_STATUS_LABELS['reopened'] }
]

const isValid = computed(() => {
  if (isCreate.value) {
    return form.title && form.severity && form.priority && form.assignee_id && form.steps
  }
  return form.title && form.severity && form.priority && form.assignee_id
})

function bugStatusLabel(status: BugStatus | undefined) {
  if (!status) return ''
  return BUG_STATUS_LABELS[status] || status
}

function getBugStatusClass(status: BugStatus | undefined) {
  if (!status) return ''
  return BUG_STATUS_CLASSES[status] || ''
}

function severityLabel(severity?: string) {
  if (!severity) return '—'
  return (SEVERITY_LABELS as Record<string, string>)[severity] || severity
}

function getSeverityClass(severity?: string) {
  if (!severity) return 'bg-gray-50 text-gray-500'
  return (SEVERITY_CLASSES as Record<string, string>)[severity] || 'bg-gray-50 text-gray-500'
}

function priorityLabel(priority?: string) {
  if (!priority) return '—'
  return (PRIORITY_LABELS as Record<string, string>)[priority] || priority
}

const requirementDisplay = computed(() => {
  const req = requirements.value.find((item: any) => String(item.req_id) === String(form.requirement_id) || String(item.id) === String(form.requirement_id))
  if (!req) return '—'
  return `${req.id || req.req_no || ''} ${req.title}`.trim()
})

const iterationDisplay = computed(() => {
  const iter = (meta.value?.iterations || []).find((item: any) => String(item.id) === String(form.iteration_id))
  return iter?.name || '—'
})

const assigneeDisplay = computed(() => {
  const user = (meta.value?.users || []).find((item: any) => String(item.id) === String(form.assignee_id))
  return user?.name || '—'
})

function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

function addTag() {
  const val = tagInputValue.value.trim()
  if (val && !form.tags.includes(val)) {
    form.tags.push(val)
  }
  tagInputValue.value = ''
  tagInputVisible.value = false
}

async function save() {
  if (!isValid.value || saving.value) return
  // Final sync from editors to form before saving
  if (stepsEditorRef.value) form.steps = stepsEditorRef.value.innerHTML
  if (expectedEditorRef.value) form.expected_result = expectedEditorRef.value.innerHTML
  if (actualEditorRef.value) form.actual_result = actualEditorRef.value.innerHTML
  saving.value = true
  try {
    if (isCreate.value) {
      // Create new bug
      const body: Record<string, any> = {
        title: form.title,
        severity: form.severity,
        priority: form.priority,
        assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
        steps: form.steps,
        expected_result: form.expected_result || null,
        actual_result: form.actual_result || null,
        tags: form.tags,
      }
      if (form.requirement_id) body.requirement_id = Number(form.requirement_id)
      if (form.iteration_id) body.iteration_id = Number(form.iteration_id)
      if (selectedProjectId.value) body.project_id = Number(selectedProjectId.value)

      const result = await $fetch('/api/bugs', {
        method: 'POST',
        body
      }) as any
      router.push(`/bugs/${result.id}`)
    } else {
      // Update existing bug
      await $fetch(`/api/bugs/${route.params.id}`, {
        method: 'PUT',
        body: {
          title: form.title,
          severity: form.severity,
          priority: form.priority,
          status: form.status,
          requirement_id: form.requirement_id ? Number(form.requirement_id) : null,
          iteration_id: form.iteration_id ? Number(form.iteration_id) : null,
          assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
          tags: form.tags,
          steps: form.steps,
          expected_result: form.expected_result,
          actual_result: form.actual_result
        }
      })
      await refresh()
      // Switch back to view mode
      navigateTo({ path: `/bugs/${route.params.id}`, query: bugPageQuery() })
    }
  } catch (e: any) {
    console.error('Save failed:', e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Placeholder for contenteditable editors */
.rich-editor:empty::before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
}

/* Rich text content styles inside editors */
.rich-editor :deep(h1) {
  font-size: 1.5em;
  font-weight: 700;
  margin: 0.5em 0;
}
.rich-editor :deep(h2) {
  font-size: 1.25em;
  font-weight: 700;
  margin: 0.5em 0;
}
.rich-editor :deep(h3) {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0.5em 0;
}
.rich-editor :deep(ul) {
  list-style: disc;
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.rich-editor :deep(ol) {
  list-style: decimal;
  padding-left: 1.5em;
  margin: 0.5em 0;
}
.rich-editor :deep(blockquote) {
  border-left: 3px solid #cbd5e1;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #64748b;
}
.rich-editor :deep(pre) {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.75em;
  overflow-x: auto;
  font-family: monospace;
  font-size: 0.875em;
  margin: 0.5em 0;
}
.rich-editor :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}
.rich-editor :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 8px 0;
  cursor: zoom-in;
}
.rich-editor :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}
.rich-editor :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 8px;
  min-width: 60px;
}
</style>
