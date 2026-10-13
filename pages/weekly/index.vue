<template>
  <div class="min-h-screen flex bg-slate-50">
    <TheSidebar :total-count="meta?.totalCount" />

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 flex-shrink-0">
        <h1 class="text-[22px] font-bold text-slate-900">周报</h1>
        <div class="flex items-center gap-3">
          <!-- Week Period Selector -->
          <div class="relative">
            <button
              class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-slate-600 hover:border-indigo-300 transition-colors"
              @click="showWeekPicker = !showWeekPicker"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>{{ weekLabel }}</span>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <!-- Week Picker Dropdown -->
            <div
              v-if="showWeekPicker"
              class="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 p-3"
            >
              <div class="flex items-center justify-between mb-3">
                <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100" @click="prevWeek">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <span class="text-sm font-medium text-gray-700">{{ weekLabel }}</span>
                <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100" @click="nextWeek">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              <button
                class="w-full px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                @click="goToCurrentWeek"
              >
                回到本周
              </button>
            </div>
          </div>
          <!-- Submit Button -->
          <button
            v-if="can('create', 'weekly_report') && activeTab === 'mine'"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50"
            :disabled="saving"
            @click="saveReport"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            {{ saving ? '提交中...' : (existingReportId !== null ? '重新提交' : '提交周报') }}
          </button>
        </div>
      </header>

      <!-- Content Scroll Area -->
      <div class="flex-1 overflow-y-auto p-6" @click="showWeekPicker = false">
        <!-- Tab Bar -->
        <div class="inline-flex items-center bg-white border border-gray-100 rounded-xl shadow-sm p-1 mb-6">
          <button
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="activeTab === 'mine' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'mine'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            我的周报
          </button>
          <button
            class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="activeTab === 'team' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-700'"
            @click="activeTab = 'team'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            团队周报
          </button>
        </div>

        <!-- ==================== My Weekly Report Tab ==================== -->
        <div v-if="activeTab === 'mine'" class="flex gap-6">
          <!-- Left Column: Completed Work -->
          <div class="flex-1 flex flex-col gap-5">
            <!-- Completed Work Card -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <!-- Card Header -->
              <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-slate-900">本周完成</h3>
                    <p class="text-xs text-slate-400">记录本周已完成的工作内容</p>
                  </div>
                </div>
                <button
                  class="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm font-medium text-indigo-600 transition-colors"
                  @click="addCompletedItem"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  添加事项
                </button>
              </div>

              <!-- Completed Items List -->
              <div class="space-y-3">
                <div
                  v-for="(item, i) in completedWork"
                  :key="i"
                  class="bg-slate-50 border border-gray-100 rounded-xl p-4 flex items-start gap-4 group"
                >
                  <!-- Number Badge -->
                  <div class="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-[13px] font-semibold text-white">{{ i + 1 }}</span>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <!-- Requirement Tag -->
                    <div v-if="item.requirementNo" class="mb-1.5">
                      <span class="px-2 py-0.5 bg-indigo-50 rounded text-[11px] text-indigo-600 font-medium">
                        {{ item.requirementNo }}
                      </span>
                    </div>
                    <!-- Content -->
                    <textarea
                      v-model="item.description"
                      rows="2"
                      placeholder="输入工作内容..."
                      class="w-full text-[14px] text-slate-700 bg-transparent border-none outline-none resize-none focus:bg-white focus:px-2 focus:py-1 focus:rounded transition-all"
                    ></textarea>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                      @click="editItem(i)"
                    >
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                      @click="removeCompletedItem(i)"
                    >
                      <svg class="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add Completed Item Button (dashed) -->
              <button
                class="w-full mt-3 py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                @click="addCompletedItem"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                添加本周完成事项
              </button>
            </div>

            <!-- Work Hours Summary -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-4 flex items-center gap-6">
              <div class="flex items-center gap-2">
                <span class="text-[13px] text-slate-400">本周总工时</span>
                <span class="text-xl font-bold text-slate-900">{{ totalHours }}h</span>
              </div>
              <div class="w-px h-8 bg-slate-200"></div>
              <div class="flex items-center gap-2">
                <span class="text-[13px] text-slate-400">完成事项</span>
                <span class="text-xl font-bold text-green-500">{{ completedWork.length }}</span>
              </div>
            </div>

            <!-- Summary -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-slate-900">本周总结</h3>
              </div>
              <textarea
                v-model="summary"
                rows="3"
                placeholder="请输入本周工作总结..."
                class="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Right Column: History Reports -->
          <div class="w-[380px] flex-shrink-0">
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-0">
              <h3 class="text-base font-semibold text-slate-900 mb-4">我的历史周报</h3>
              <div v-if="historyLoading" class="py-8 text-center text-sm text-slate-400">加载中...</div>
              <div v-else-if="historyReports.length === 0" class="py-8 text-center text-sm text-slate-400">暂无历史周报</div>
              <div v-else class="space-y-2.5">
                <button
                  v-for="report in historyReports"
                  :key="report.id"
                  class="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-colors text-left group"
                  :class="{ 'ring-2 ring-indigo-300': formatDate(report.weekStart) === currentWeekStart }"
                  @click="loadHistoryReport(report.weekStart)"
                >
                  <!-- Week Number Badge -->
                  <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-indigo-500">{{ getWeekNumberFromDate(report.weekStart) }}</span>
                  </div>
                  <!-- Week Info -->
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-medium text-slate-800">第{{ getWeekNumberFromDate(report.weekStart) }}周</div>
                    <div class="text-[11px] text-slate-400">
                      {{ formatDateRange(report.weekStart, report.weekEnd) }} · {{ report.completedWork?.length || 0 }} 项完成
                    </div>
                  </div>
                  <!-- Delete Button -->
                  <button
                    v-if="can('delete', 'weekly_report') || report.userId === authUser?.id"
                    class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="删除周报"
                    @click.stop="deleteReport(report.id)"
                  >
                    <svg class="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                  <!-- Arrow -->
                  <svg class="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== Team Weekly Report Tab ==================== -->
        <div v-if="activeTab === 'team'" class="flex gap-6">
          <!-- Left Column: Team Reports -->
          <div class="flex-1">
            <!-- Stats -->
            <div class="grid grid-cols-4 gap-4 mb-6">
              <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="text-2xl font-bold text-slate-800">{{ teamStats.completed }}</div>
                <div class="text-sm text-slate-500 mt-1">完成任务</div>
              </div>
              <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="text-2xl font-bold text-green-500">{{ teamReports.length }}</div>
                <div class="text-sm text-slate-500 mt-1">已提交人数</div>
              </div>
              <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="text-2xl font-bold text-red-500">{{ teamStats.notSubmitted }}</div>
                <div class="text-sm text-slate-500 mt-1">未提交人数</div>
              </div>
              <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div class="text-2xl font-bold text-blue-500">{{ teamStats.submissionRate }}%</div>
                <div class="text-sm text-slate-500 mt-1">提交率</div>
              </div>
            </div>

            <!-- Team Reports List -->
            <div v-if="teamReports.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center">
              <svg class="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-slate-400 text-sm">本周暂无团队周报</p>
            </div>

            <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 class="font-semibold text-slate-800">团队成员周报</h3>
                <select v-model="roleFilter" class="px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-sm text-slate-600 outline-none focus:border-indigo-300">
                  <option value="">全部成员</option>
                  <option value="pm">产品经理</option>
                  <option value="developer">开发工程师</option>
                  <option value="project_manager">项目经理</option>
                  <option value="tester">测试工程师</option>
                </select>
              </div>
              <div class="divide-y divide-gray-50">
                <div v-for="report in filteredTeamReports" :key="report.id" class="p-5">
                  <!-- User Header -->
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-medium">
                        {{ report.userName?.charAt(0) || '?' }}
                      </div>
                      <div>
                        <div class="font-medium text-slate-800">{{ report.userName }}</div>
                        <div class="text-xs text-slate-400">{{ getRoleLabel(report.role) }} · 提交于 {{ formatDateTime(report.submittedAt) }}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-4 text-sm">
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span class="text-slate-600">{{ report.completedWork?.length || 0 }} 项完成</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-slate-600">{{ report.hours }}h</span>
                      </div>
                      <button
                        v-if="can('delete', 'weekly_report')"
                        class="text-xs text-red-500 hover:text-red-600"
                        @click="deleteReport(report.id)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <!-- Completed Work -->
                  <div v-if="report.completedWork?.length" class="mb-3">
                    <h4 class="text-sm font-medium text-slate-700 mb-2">本周完成</h4>
                    <div class="space-y-2">
                      <div v-for="(item, i) in report.completedWork" :key="i" class="flex items-start gap-2 text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                        <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span class="text-[10px] font-semibold text-green-600">{{ i + 1 }}</span>
                        </div>
                        <div class="flex-1">
                          <span>{{ typeof item === 'string' ? item : (item.description || item.title || '') }}</span>
                          <span v-if="typeof item === 'object' && item.hours" class="text-xs text-slate-400 ml-2">· {{ item.hours }}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Summary -->
                  <div v-if="report.summary" class="bg-slate-50 rounded-lg p-3">
                    <p class="text-sm text-slate-600">{{ report.summary }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: History (same as mine) -->
          <div class="w-[380px] flex-shrink-0">
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-0">
              <h3 class="text-base font-semibold text-slate-900 mb-4">团队历史周报</h3>
              <div v-if="historyLoading" class="py-8 text-center text-sm text-slate-400">加载中...</div>
              <div v-else-if="teamHistoryReports.length === 0" class="py-8 text-center text-sm text-slate-400">暂无历史周报</div>
              <div v-else class="space-y-2.5">
                <button
                  v-for="report in teamHistoryReports"
                  :key="report.id"
                  class="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-colors text-left"
                  @click="loadTeamHistoryReport(report.weekStart)"
                >
                  <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-indigo-500">{{ getWeekNumberFromDate(report.weekStart) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-medium text-slate-800">第{{ getWeekNumberFromDate(report.weekStart) }}周</div>
                    <div class="text-[11px] text-slate-400">
                      {{ formatDateRange(report.weekStart, report.weekEnd) }} · {{ report.completedWork?.length || 0 }} 项完成
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { MetaResponse } from '~/types'

const { can, user: authUser } = useAuth()
const { data: meta } = await useFetch<MetaResponse>('/api/meta')

// Tab state
const activeTab = ref<'mine' | 'team'>('mine')

// Week state
const currentWeekStart = ref(getWeekStart(new Date()))
const showWeekPicker = ref(false)

const weekLabel = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const year = start.getFullYear()
  const weekNum = getWeekNumber(start)
  return `${year}年 第${weekNum}周 (${formatDateShort(start)} - ${formatDateShort(end)})`
})

// Form data
const completedWork = ref<any[]>([])
const summary = ref('')
const saving = ref(false)
const existingReportId = ref<number | null>(null)
const existingReportStatus = ref<string>('')

const totalHours = computed(() => {
  return completedWork.value.reduce((sum, item) => sum + (Number(item.hours) || 0), 0)
})

// ==================== My Report ====================
async function loadReport() {
  try {
    const data = await $fetch('/api/weekly-reports', {
      params: { weekStart: currentWeekStart.value, userId: authUser.value?.id }
    }) as any[]

    if (data && data.length > 0) {
      const r = data[0]
      existingReportId.value = r.id || null
      existingReportStatus.value = r.status || ''
      completedWork.value = (r.completedWork || []).map((item: any) => {
        if (typeof item === 'string') {
          return { description: item, hours: 0, requirementNo: '' }
        }
        return {
          description: item.description || item.title || '',
          hours: item.hours || 0,
          requirementNo: item.requirementNo || ''
        }
      })
      summary.value = r.summary || ''
    } else {
      resetForm()
    }
  } catch {
    resetForm()
  }
}

function resetForm() {
  completedWork.value = []
  summary.value = ''
  existingReportId.value = null
  existingReportStatus.value = ''
}

function addCompletedItem() {
  completedWork.value.push({ description: '', hours: 0, requirementNo: '' })
}

function removeCompletedItem(i: number) {
  completedWork.value.splice(i, 1)
}

function editItem(_i: number) {
  // Items are inline-editable; this is a placeholder for potential modal editing
}

async function saveReport() {
  // 如果本周已提交过周报，确认是否覆盖
  if (existingReportId.value !== null) {
    const confirmed = window.confirm('本周已提交过周报，是否覆盖重新提交？')
    if (!confirmed) return
  }

  saving.value = true
  try {
    const weekEnd = new Date(currentWeekStart.value)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const body = {
      ...(existingReportId.value === null ? {
        week_start: formatDate(currentWeekStart.value),
        week_end: formatDate(weekEnd),
      } : {}),
      completed_work: completedWork.value.filter(i => i.description?.trim()).map(i => ({
        description: i.description,
        hours: i.hours,
        requirementNo: i.requirementNo
      })),
      next_week_plan: [],
      summary: summary.value,
      hours: totalHours.value
    }

    await $fetch(existingReportId.value === null ? '/api/weekly-reports' : `/api/weekly-reports/${existingReportId.value}`, {
      method: existingReportId.value === null ? 'POST' : 'PUT',
      body
    })
    existingReportStatus.value = 'submitted'
    alert('周报提交成功！')
    await loadHistory()
    await loadReport()
  } catch (error: any) {
    alert('提交失败：' + (error?.statusMessage || error?.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

// ==================== History Reports ====================
const historyReports = ref<any[]>([])
const historyLoading = ref(false)

async function loadHistory() {
  historyLoading.value = true
  try {
    const data = await $fetch('/api/weekly-reports', {
      params: { userId: authUser.value?.id }
    }) as any[]
    historyReports.value = data || []
  } catch {
    historyReports.value = []
  } finally {
    historyLoading.value = false
  }
}

function loadHistoryReport(weekStart: string) {
  currentWeekStart.value = formatDate(weekStart)
  showWeekPicker.value = false
}

// ==================== Team Report ====================
const roleFilter = ref('')
const teamReports = ref<any[]>([])

const filteredTeamReports = computed(() => {
  if (!roleFilter.value) return teamReports.value
  return teamReports.value.filter(r => r.role === roleFilter.value)
})

const teamStats = computed(() => {
  const reports = teamReports.value
  const totalCompleted = reports.reduce((sum, r) => sum + (r.completedWork?.length || 0), 0)
  const totalMembers = meta.value?.users?.length || 0
  const submittedCount = reports.length
  const notSubmitted = Math.max(0, totalMembers - submittedCount)
  const submissionRate = totalMembers > 0 ? Math.round((submittedCount / totalMembers) * 100) : 0
  return {
    completed: totalCompleted,
    notSubmitted,
    submissionRate
  }
})

async function loadTeamReports() {
  try {
    const data = await $fetch('/api/weekly-reports', {
      params: { weekStart: currentWeekStart.value }
    }) as any[]
    teamReports.value = data || []
  } catch {
    teamReports.value = []
  }
}

// Team history
const teamHistoryReports = ref<any[]>([])

async function loadTeamHistory() {
  try {
    const data = await $fetch('/api/weekly-reports') as any[]
    teamHistoryReports.value = data || []
  } catch {
    teamHistoryReports.value = []
  }
}

function loadTeamHistoryReport(weekStart: string) {
  currentWeekStart.value = formatDate(weekStart)
}

// ==================== Week Navigation ====================
function prevWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() - 7)
  currentWeekStart.value = formatDate(d)
}

function nextWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + 7)
  currentWeekStart.value = formatDate(d)
}

function goToCurrentWeek() {
  currentWeekStart.value = getWeekStart(new Date())
  showWeekPicker.value = false
}

// ==================== Utilities ====================
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return formatDate(d)
}

function getWeekNumber(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getWeekNumberFromDate(dateStr: string): number {
  return getWeekNumber(new Date(dateStr))
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateShort(date: Date): string {
  return `${date.getMonth() + 1}.${date.getDate()}`
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.getMonth() + 1}.${s.getDate()} - ${e.getMonth() + 1}.${e.getDate()}`
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    'pm': '产品经理',
    'project_manager': '项目经理',
    'developer': '开发工程师',
    'tester': '测试工程师',
    'admin': '管理员'
  }
  return map[role] || role
}

async function deleteReport(reportId: number) {
  if (!confirm('确定要删除这篇周报吗？')) return
  try {
    await $fetch(`/api/weekly-reports/${reportId}`, { method: 'DELETE' })
    await Promise.all([loadHistory(), loadReport(), loadTeamReports(), loadTeamHistory()])
  } catch (e: any) {
    alert('删除失败：' + (e?.statusMessage || e?.message || '未知错误'))
  }
}

// ==================== Watchers ====================
watch(currentWeekStart, () => {
  loadReport()
  loadTeamReports()
}, { immediate: true })

// Load history on mount
onMounted(() => {
  loadHistory()
  loadTeamHistory()
})
</script>
