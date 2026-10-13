export default defineNuxtPlugin(() => {
  const { user } = useAuth()
  let timer: ReturnType<typeof setInterval> | undefined

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  }

  const start = () => {
    if (timer) return
    timer = setInterval(() => {
      $fetch('/api/auth/me').catch(() => {})
    }, 30_000)
  }

  watch(user, (current) => {
    if (current) start()
    else stop()
  }, { immediate: true })
})
