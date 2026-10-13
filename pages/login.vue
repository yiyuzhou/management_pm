<template>
  <div class="min-h-screen flex">
    <!-- ================ -->
    <!-- Left Brand Area  -->
    <!-- ================ -->
    <div
      class="hidden lg:flex w-[560px] flex-col items-center justify-center px-16 py-20"
      style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #a855f7 100%);"
    >
      <!-- Logo (three nested circles) -->
      <div class="w-[120px] h-[120px] rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.15);">
        <div class="w-[88px] h-[88px] rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.25);">
          <div class="w-[56px] h-[56px] rounded-full flex items-center justify-center" style="background: rgba(255,255,255,0.95);">
            <svg class="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M3 10v4" />
              <path d="M7 6v12" />
              <path d="M11 3v18" />
              <path d="M15 7v10" />
              <path d="M19 10v4" />
            </svg>
          </div>
        </div>
      </div>

      <!-- spacer 32px -->
      <div class="h-8"></div>

      <!-- Brand name row -->
      <div class="flex items-center">
        <span class="text-4xl font-bold text-white" style="font-family: 'Source Han Sans', sans-serif;">LycheeAI</span>
        <span class="w-[17px]"></span>
        <span class="w-[7px] h-1.5 rounded-full" style="background: rgba(255,255,255,0.5);"></span>
        <span class="w-[17px]"></span>
        <span class="text-lg text-white/80">智能语音 PDT</span>
      </div>

      <!-- spacer 48px -->
      <div class="h-12"></div>

      <!-- Product slogan -->
      <div class="text-center">
        <p class="text-base text-white/75 leading-relaxed">让每一次对话都充满智慧</p>
        <p class="text-base text-white/75 leading-relaxed">AI 驱动的智能语音产品设计平台</p>
      </div>

      <!-- spacer 48px -->
      <div class="h-12"></div>

      <!-- Feature list -->
      <div class="flex flex-col items-start">
        <!-- Feature 1 -->
        <div class="flex items-center">
          <div class="w-9 h-9 rounded-[10px] flex items-center justify-center" style="background: rgba(255,255,255,0.15);">
            <svg class="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            </svg>
          </div>
          <span class="w-[13px]"></span>
          <span class="text-sm text-white/85">智能语音识别与合成</span>
        </div>
        <div class="h-5"></div>
        <!-- Feature 2 -->
        <div class="flex items-center">
          <div class="w-9 h-9 rounded-[10px] flex items-center justify-center" style="background: rgba(255,255,255,0.15);">
            <svg class="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span class="w-[13px]"></span>
          <span class="text-sm text-white/85">团队协作与需求管理</span>
        </div>
        <div class="h-5"></div>
        <!-- Feature 3 -->
        <div class="flex items-center">
          <div class="w-9 h-9 rounded-[10px] flex items-center justify-center" style="background: rgba(255,255,255,0.15);">
            <svg class="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
            </svg>
          </div>
          <span class="w-[13px]"></span>
          <span class="text-sm text-white/85">可视化原型设计工具</span>
        </div>
      </div>
    </div>

    <!-- ================ -->
    <!-- Right Form Area  -->
    <!-- ================ -->
    <div class="flex-1 flex flex-col items-center justify-center px-16 py-20 bg-gray-50">
      <!-- Login Card -->
      <div class="w-[440px] bg-white rounded-[20px] p-12 flex flex-col" style="box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
        <!-- Card Title -->
        <div class="flex flex-col items-start">
          <h1 class="text-[28px] font-bold text-slate-900 leading-tight">欢迎回来</h1>
          <div class="h-1"></div>
          <p class="text-sm text-slate-400">登录您的账户以继续使用</p>
        </div>

        <!-- spacer 40px -->
        <div class="h-10"></div>

        <!-- Login Form -->
        <div class="flex flex-col items-start w-full">
          <!-- Username Field -->
          <div class="flex flex-col items-start w-full">
            <label class="text-[13px] font-medium text-slate-600">用户名</label>
            <div class="h-2"></div>
            <div class="w-full h-12 flex items-center px-4 border border-slate-200 rounded-[10px]">
              <svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="w-[11px] flex-shrink-0"></span>
              <input
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                class="flex-1 text-sm text-slate-800 placeholder-slate-300 bg-transparent border-none focus:outline-none focus:ring-0"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>

          <!-- spacer 24px -->
          <div class="h-6"></div>

          <!-- Password Field -->
          <div class="flex flex-col items-start w-full">
            <!-- Label row with forgot password -->
            <div class="flex items-center justify-between w-full">
              <label class="text-[13px] font-medium text-slate-600">密码</label>
              <button
                class="text-[13px] font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
                @click="showForgotTip = true"
              >
                忘记密码？
              </button>
            </div>
            <div class="h-2"></div>
            <div class="w-full h-12 flex items-center px-4 border border-slate-200 rounded-[10px]">
              <svg class="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span class="w-[11px] flex-shrink-0"></span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="flex-1 text-sm text-slate-800 placeholder-slate-300 bg-transparent border-none focus:outline-none focus:ring-0"
                @keyup.enter="handleLogin"
              />
              <button
                class="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- spacer 24px -->
          <div class="h-6"></div>

          <!-- Remember me -->
          <div class="flex items-center">
            <button
              class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
              :class="rememberMe ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 bg-white'"
              @click="rememberMe = !rememberMe"
            >
              <svg v-if="rememberMe" class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
            <span class="w-[9px]"></span>
            <span class="text-[13px] text-slate-500">记住我</span>
          </div>

          <!-- spacer 24px -->
          <div class="h-6"></div>

          <!-- Error message -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="error" class="w-full flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg mb-4">
              <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>
          </Transition>

          <!-- Forgot password tip -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="showForgotTip" class="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg mb-4">
              <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-blue-600">请联系管理员重置密码</p>
            </div>
          </Transition>

          <!-- Login button -->
          <button
            class="w-full h-12 flex items-center justify-center text-white rounded-[10px] text-[15px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"
            :disabled="loading"
            @click="handleLogin"
          >
            <span v-if="loading" class="inline-flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              登录中...
            </span>
            <span v-else>登 录</span>
          </button>

        </div>
      </div>

      <!-- spacer 32px -->
      <div class="h-8"></div>

      <!-- Copyright -->
      <p class="text-xs text-slate-400">© 2026 LycheeAI. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  username: '',
  password: ''
})
const loading = ref(false)
const error = ref('')
const showForgotTip = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

const router = useRouter()
const route = useRoute()
const { user } = useAuth()

async function handleLogin() {
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const userInfo = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: form.username,
        password: form.password
      }
    })
    user.value = userInfo as any
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
