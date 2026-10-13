<template>
  <div class="h-screen flex bg-slate-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部栏 -->
      <header class="h-[81px] bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
        <!-- 左侧：面包屑 + 标题 -->
        <div class="flex items-center gap-3">
          <button
            class="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            @click="router.push('/prototype')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="flex flex-col gap-1">
            <!-- 面包屑 -->
            <div class="flex items-center gap-1 text-xs text-slate-400">
              <span>原型中心</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <span>新建原型</span>
            </div>
            <!-- 标题行 -->
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold text-slate-800">新建原型</span>
              <span class="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-500">草稿</span>
            </div>
          </div>
        </div>
        <!-- 右侧操作 -->
        <div class="flex items-center gap-3">
          <button
            class="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors border border-slate-200"
            @click="showVersionHistory = true"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            版本历史
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors border border-slate-200"
            @click="router.push('/prototype')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            返回
          </button>
        </div>
      </header>

      <!-- 内容滚动区 -->
      <div class="flex-1 overflow-y-auto">
        <div class="w-full px-6 py-6 flex gap-5 items-start">
          <!-- 左侧表单区 -->
          <div class="w-[320px] flex flex-col gap-5 flex-shrink-0">
            <!-- 基本信息卡片 -->
            <div class="bg-white rounded-2xl p-6" style="box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <!-- 卡片标题 -->
              <div class="flex items-center mb-5">
                <span class="w-[5px] h-5 rounded-full bg-blue-500 mr-3"></span>
                <h3 class="text-base font-semibold text-slate-800">基本信息</h3>
              </div>

              <!-- 原型名称 -->
              <div class="mb-5">
                <label class="block text-[13px] font-medium text-slate-700 mb-2">
                  原型名称 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="请输入原型名称"
                  class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all"
                  :class="{ 'border-red-300': errors.name }"
                />
                <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
              </div>

              <!-- 关联需求 -->
              <div class="mb-5 relative">
                <label class="block text-[13px] font-medium text-slate-700 mb-2">
                  关联需求
                </label>
                <div class="min-h-[44px] flex items-center flex-wrap gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                  <!-- 已关联需求标签 -->
                  <span
                    v-for="req in selectedRequirements"
                    :key="req.id"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium"
                  >
                    {{ req.title }}
                    <button class="text-blue-400 hover:text-blue-600" @click="removeRequirement(req.id)">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </span>
                  <!-- 添加需求按钮 -->
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded text-xs transition-colors"
                    @click="showRequirementDropdown = !showRequirementDropdown"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    添加需求
                  </button>
                </div>
                <!-- 需求下拉选择 -->
                <div
                  v-if="showRequirementDropdown"
                  ref="reqDropdownRef"
                  class="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20 max-h-60 overflow-y-auto"
                >
                  <div v-if="availableRequirements.length === 0" class="px-3 py-4 text-center text-sm text-slate-400">暂无可关联需求</div>
                  <button
                    v-for="req in availableRequirements"
                    :key="req.id"
                    class="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                    @click="addRequirement(req)"
                  >
                    <span class="text-xs text-slate-400 font-mono">{{ req.id }}</span>
                    <span class="text-sm text-slate-700 flex-1 truncate">{{ req.title }}</span>
                  </button>
                </div>
              </div>

              <!-- 版本号 -->
              <div class="mb-5">
                <label class="block text-[13px] font-medium text-slate-700 mb-2">
                  版本号 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.version"
                  type="text"
                  placeholder="例如 v1.0"
                  class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all"
                />
              </div>

              <!-- 原型描述 -->
              <div>
                <label class="block text-[13px] font-medium text-slate-700 mb-2">
                  原型描述
                </label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  placeholder="请输入原型描述..."
                  class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all resize-none"
                ></textarea>
              </div>
            </div>

            <!-- 迭代信息卡片 -->
            <div class="bg-white rounded-2xl p-6" style="box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <!-- 卡片标题 -->
              <div class="flex items-center mb-4">
                <span class="w-[5px] h-5 rounded-full bg-blue-500 mr-3"></span>
                <h3 class="text-base font-semibold text-slate-800">迭代信息</h3>
              </div>

              <!-- 所属迭代 -->
              <div class="mb-4">
                <label class="block text-[13px] font-medium text-slate-700 mb-2">
                  所属迭代 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.iteration_id"
                    class="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 transition-all cursor-pointer pr-10"
                    :class="{ 'text-slate-400': !form.iteration_id, 'border-red-300': errors.iteration_id }"
                  >
                    <option value="">请选择迭代</option>
                    <option v-for="iter in iterations" :key="iter.id" :value="iter.id">{{ iter.name }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <p v-if="errors.iteration_id" class="mt-1 text-xs text-red-500">{{ errors.iteration_id }}</p>
              </div>

              <!-- 标签 -->
              <div>
                <label class="block text-[13px] font-medium text-slate-700 mb-2">
                  标签
                </label>
                <div class="min-h-[40px] flex items-center flex-wrap gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
                  <span
                    v-for="(tag, i) in form.tags"
                    :key="i"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium"
                  >
                    {{ tag }}
                    <button class="text-slate-400 hover:text-slate-600" @click="form.tags.splice(i, 1)">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </span>
                  <input
                    v-if="tagInputVisible"
                    ref="tagInputRef"
                    v-model="tagInputValue"
                    type="text"
                    placeholder="输入标签名"
                    class="flex-1 min-w-[80px] text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                    @keyup.enter="addTag"
                    @blur="addTag"
                  />
                  <button
                    v-else
                    class="inline-flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded text-xs transition-colors"
                    @click="showTagInput"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    添加标签
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧上传区 -->
          <div class="flex-1 flex flex-col gap-6">
            <!-- 上传卡片 -->
            <div class="bg-white rounded-2xl p-6" style="box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <!-- 卡片标题 -->
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center">
                  <span class="w-[5px] h-5 rounded-full bg-blue-500 mr-3"></span>
                  <h3 class="text-base font-semibold text-slate-800">原型页面</h3>
                  <span class="ml-2 px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-500">
                    {{ form.pages.length }}/20
                  </span>
                </div>
                <button
                  class="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                  @click="triggerFileInput"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  添加页面
                </button>
              </div>

              <!-- 页面列表 -->
              <div v-if="form.pages.length > 0" class="space-y-3 mb-5">
                <div
                  v-for="(page, index) in form.pages"
                  :key="page.id"
                  class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl group hover:bg-slate-100/80 transition-colors"
                  :class="{ 'ring-2 ring-blue-300': index === dragIndex }"
                  draggable="true"
                  @dragstart="onDragStart(index)"
                  @dragover.prevent="onDragOver(index)"
                  @dragend="onDragEnd"
                  @drop.prevent="onDrop(index)"
                >
                  <!-- 拖拽手柄 -->
                  <div class="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 flex-shrink-0">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                      <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                      <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                  </div>

                  <!-- 页面缩略图 -->
                  <button
                    type="button"
                    class="w-[101px] h-[70px] bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative"
                    :class="page.thumbnail ? 'cursor-zoom-in hover:ring-2 hover:ring-blue-300' : 'cursor-default'"
                    :disabled="!page.thumbnail"
                    @mousedown.stop
                    @click.stop="openPreview(index)"
                  >
                    <img v-if="page.thumbnail" :src="page.thumbnail" class="w-full h-full object-cover" />
                    <div v-else class="text-slate-300">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div v-if="page.isCover" class="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded font-medium">封面</div>
                  </button>

                  <!-- 页面信息 -->
                  <button
                    type="button"
                    class="flex-1 min-w-0 text-left"
                    :class="page.thumbnail ? 'cursor-zoom-in' : ''"
                    :disabled="!page.thumbnail"
                    @mousedown.stop
                    @click.stop="openPreview(index)"
                  >
                    <div class="text-sm font-medium text-slate-800 truncate">{{ page.name }}</div>
                    <div class="text-xs text-slate-400 mt-1">{{ page.size || '375×812' }} · {{ formatFileSize(page.fileSize) }}</div>
                  </button>

                  <!-- 设为封面 -->
                  <button
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                    :class="page.isCover ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'"
                    @click="setCover(index)"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                    {{ page.isCover ? '已设封面' : '设为封面' }}
                  </button>

                  <!-- 操作按钮组 -->
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <button
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      title="替换"
                      @click="replacePage(index)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    </button>
                    <button
                      class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="删除"
                      @click="deletePage(index)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 拖拽上传区 -->
              <div
                class="border-2 border-dashed rounded-xl py-5 px-4 text-center transition-colors cursor-pointer"
                :class="isDragging ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'"
                @click="triggerFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onFileDrop"
              >
<div class="flex items-center justify-center gap-3">
              <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <span class="text-sm text-slate-500">拖拽文件到此处或</span>
              <button 
                type="button"
                class="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-lg text-sm font-medium transition-colors"
                @click.stop="triggerFileInput"
              >
                选择文件
              </button>
            </div>
                <p class="mt-2 text-xs text-slate-400">支持 PNG、JPG、SVG、PDF 等格式，单文件不超过 10MB</p>
              </div>

              <!-- 隐藏文件输入 -->
              <input
                ref="fileInputRef"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,application/pdf"
                class="hidden"
                @change="onFileSelect"
              />
            </div>

            <!-- 排序提示卡片 -->
            <div class="bg-blue-50/50 rounded-xl p-4 flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm text-slate-700 font-medium">拖拽页面可调整顺序</p>
                <p class="text-xs text-slate-400 mt-1">第一个页面将自动设为封面，也可手动点击"设为封面"按钮指定</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <footer class="h-[76px] bg-white border-t border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
        <!-- 左侧信息 -->
        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span>更新于 {{ formatCurrentTime() }}</span>
          <span class="w-px h-3 bg-slate-200"></span>
          <div class="flex items-center gap-1.5">
            <span>更新人</span>
            <span class="text-slate-600">{{ authUser?.nickname || '未知' }}</span>
          </div>
        </div>
        <!-- 右侧按钮组 -->
        <div class="flex items-center gap-3">
          <button
            class="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
            @click="router.push('/prototype')"
          >
            取消
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            :disabled="submitting"
            @click="onSubmit('draft')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
            </svg>
            保存草稿
          </button>
          <button
            class="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="submitting"
            @click="onSubmit('in_review')"
          >
            <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            提交
          </button>
        </div>
      </footer>
    </main>

    <ImagePreviewModal
      v-model="previewVisible"
      :src="previewPage?.thumbnail"
      :title="previewPage?.name"
      :has-prev="previewIndex > 0"
      :has-next="previewIndex >= 0 && previewIndex < form.pages.length - 1"
      @prev="previewIndex = Math.max(0, previewIndex - 1)"
      @next="previewIndex = Math.min(form.pages.length - 1, previewIndex + 1)"
    />
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse, Requirement, Iteration, Module } from '~/types'

const router = useRouter()
const route = useRoute()
const { user: authUser } = useAuth()
const { selectedProjectId } = useProject()

// 获取元数据
const { data: meta } = await useFetch<MetaResponse>('/api/meta', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => ({ totalCount: 0, users: [], projects: [], iterations: [], modules: [], statusCounts: {} })
})

// 获取迭代列表
const { data: iterationsData } = await useFetch<Iteration[]>('/api/iterations', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined
  })),
  default: () => []
})
const iterations = computed(() => iterationsData.value || [])

function latestIterationId(): number | '' {
  const list = iterations.value
  if (!list.length) return ''
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

// 获取需求列表
const { data: requirementsData } = await useFetch<{ items: Requirement[] }>('/api/requirements', {
  query: computed(() => ({
    projectId: selectedProjectId.value || undefined,
    pageSize: 100
  })),
  default: () => ({ items: [] })
})

// 表单数据
const form = reactive({
  name: '',
  version: 'v1.0',
  description: '',
  iteration_id: latestIterationId() as string | number,
  tags: [] as string[],
  pages: [] as PrototypePage[],
  requirement_id: null as number | null
})

const errors = reactive({
  name: '',
  iteration_id: ''
})

watch(iterations, (list) => {
  const current = Number(form.iteration_id)
  const exists = list.some(item => item.id === current)
  if (!exists) form.iteration_id = latestIterationId()
}, { immediate: true })

// 关联需求
const selectedRequirements = ref<Requirement[]>([])
const showRequirementDropdown = ref(false)
const reqDropdownRef = ref<HTMLElement | null>(null)

const availableRequirements = computed(() => {
  const selectedIds = selectedRequirements.value.map(r => r.id)
  return (requirementsData.value?.items || []).filter(r => !selectedIds.includes(r.id))
})

function addRequirement(req: Requirement) {
  selectedRequirements.value.push(req)
  form.requirement_id = selectedRequirements.value[0]?.req_id || null
  showRequirementDropdown.value = false
}

function removeRequirement(id: string) {
  selectedRequirements.value = selectedRequirements.value.filter(r => r.id !== id)
  form.requirement_id = selectedRequirements.value[0]?.req_id || null
}

watch(() => requirementsData.value?.items, (items) => {
  const q = route.query.requirementId || route.query.requirement_id
  if (!q || selectedRequirements.value.length) return
  const req = (items || []).find(r => String(r.req_id) === String(q) || r.id === String(q))
  if (req) addRequirement(req)
}, { immediate: true })

// 标签输入
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref<HTMLInputElement | null>(null)

function showTagInput() {
  tagInputVisible.value = true
  nextTick(() => tagInputRef.value?.focus())
}

function addTag() {
  const val = tagInputValue.value.trim()
  if (val && !form.tags.includes(val)) {
    form.tags.push(val)
  }
  tagInputValue.value = ''
  tagInputVisible.value = false
}

// 页面上传
interface PrototypePage {
  id: string
  name: string
  size: string
  thumbnail: string | null
  fileSize: number
  isCover: boolean
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploading = ref(false)
const previewVisible = ref(false)
const previewIndex = ref(-1)
const previewPage = computed(() => form.pages[previewIndex.value] || null)
let pageIdCounter = 0

function openPreview(index: number) {
  if (!form.pages[index]?.thumbnail) return
  previewIndex.value = index
  previewVisible.value = true
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
  uploading.value = true
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await $fetch<{ url: string; filename: string; size: number; type: string }>('/api/upload', {
        method: 'POST',
        body: formData
      })

      const isImage = file.type.startsWith('image/')
      form.pages.push({
        id: `page-${++pageIdCounter}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        size: isImage ? '375×812' : 'PDF',
        thumbnail: isImage ? result.url : null,
        fileSize: result.size,
        isCover: form.pages.length === 0
      })
    } catch (e: any) {
      console.error('上传失败:', e)
      alert(e.data?.message || e.statusMessage || `上传 ${file.name} 失败`)
    }
  }
  uploading.value = false
}

function deletePage(index: number) {
  const wasCover = form.pages[index].isCover
  form.pages.splice(index, 1)
  if (wasCover && form.pages.length > 0) {
    form.pages[0].isCover = true
  }
}

function replacePage(index: number) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml,application/pdf'
  input.onchange = async (e) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
      const file = target.files[0]
      try {
        const formData = new FormData()
        formData.append('file', file)
        const result = await $fetch<{ url: string; filename: string; size: number }>('/api/upload', {
          method: 'POST',
          body: formData
        })
        const isImage = file.type.startsWith('image/')
        form.pages[index].name = file.name.replace(/\.[^.]+$/, '')
        form.pages[index].thumbnail = isImage ? result.url : null
        form.pages[index].fileSize = result.size
        form.pages[index].size = isImage ? '375×812' : 'PDF'
      } catch (err: any) {
        alert(err.data?.message || err.statusMessage || '替换失败')
      }
    }
  }
  input.click()
}

function setCover(index: number) {
  form.pages.forEach((p, i) => {
    p.isCover = i === index
  })
}

// 拖拽排序
const dragIndex = ref(-1)

function onDragStart(index: number) {
  dragIndex.value = index
}

function onDragOver(index: number) {
  if (dragIndex.value === index) return
  const draggedItem = form.pages[dragIndex.value]
  form.pages.splice(dragIndex.value, 1)
  form.pages.splice(index, 0, draggedItem)
  dragIndex.value = index
}

function onDrop(_index: number) {
  dragIndex.value = -1
  // 如果没有封面，设置第一页为封面
  if (form.pages.length > 0 && !form.pages.some(p => p.isCover)) {
    form.pages[0].isCover = true
  }
}

function onDragEnd() {
  dragIndex.value = -1
}

// 版本历史（占位）
const showVersionHistory = ref(false)

// 提交
const submitting = ref(false)

function validate(requireName: boolean): boolean {
  let valid = true
  errors.name = ''
  errors.iteration_id = ''
  if (requireName && !form.name.trim()) { errors.name = '请输入原型名称'; valid = false }
  if (!form.iteration_id) { errors.iteration_id = '请选择所属迭代'; valid = false }
  return valid
}

async function onSubmit(status: string) {
  if (!validate(status !== 'draft')) return

  submitting.value = true
  try {
    const coverPage = form.pages.find(p => p.isCover)
    const payload = {
      project_id: selectedProjectId.value,
      name: form.name,
      description: form.description,
      pages: form.pages.map(p => ({
        name: p.name,
        size: p.size,
        thumbnail: p.thumbnail,
        isCover: p.isCover
      })),
    thumbnail: coverPage?.thumbnail || null,
    requirement_id: form.requirement_id,
    version: form.version,
      iteration_id: form.iteration_id ? Number(form.iteration_id) : null,
      tags: form.tags,
      status
    }

    const result = await $fetch('/api/prototypes', {
      method: 'POST',
      body: payload
    })

    router.push(`/prototype/${(result as any).id}`)
  } catch (e: any) {
    alert(e.data?.message || e.statusMessage || '创建原型失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 工具函数
function formatFileSize(bytes: number | undefined) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function formatCurrentTime() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 点击外部关闭需求下拉
function handleClickOutside(e: MouseEvent) {
  if (!showRequirementDropdown.value) return
  
  const target = e.target as Node
  // 检查点击的是否是添加需求按钮或其子元素
  const addBtn = document.querySelector('button[type="button"]');
  if (addBtn && (addBtn === target || addBtn.contains(target))) {
    return
  }
  
  if (reqDropdownRef.value && !reqDropdownRef.value.contains(target)) {
    showRequirementDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
