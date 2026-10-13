import { parseStoredProjectId, SELECTED_PROJECT_STORAGE_KEY } from '~/utils/selected-project'

/**
 * 全局项目选择状态 composable
 *
 * 使用 cookie + useState，保证刷新后服务端和客户端都能拿到选中的项目 ID，
 * 避免列表先按「未选项目」请求、再被清空。
 */
export function useProject() {
  const cookie = useCookie(SELECTED_PROJECT_STORAGE_KEY, {
    default: () => '',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  const selectedProjectId = useState<number | null>('selected_project_id', () => {
    return parseStoredProjectId(cookie.value)
  })

  if (import.meta.client && selectedProjectId.value == null) {
    const stored = parseStoredProjectId(cookie.value)
      || parseStoredProjectId(localStorage.getItem(SELECTED_PROJECT_STORAGE_KEY))
    if (stored) selectedProjectId.value = stored
  }

  const hasSelectedProject = computed(() => selectedProjectId.value !== null)

  function persist(id: number | null) {
    cookie.value = id ? String(id) : ''
    if (!import.meta.client) return
    if (id) localStorage.setItem(SELECTED_PROJECT_STORAGE_KEY, String(id))
    else localStorage.removeItem(SELECTED_PROJECT_STORAGE_KEY)
  }

  function selectProject(id: number) {
    selectedProjectId.value = id
    persist(id)
  }

  watch(selectedProjectId, (id) => {
    if (id) persist(id)
  })

  return {
    selectedProjectId,
    hasSelectedProject,
    selectProject,
  }
}
