// ============================================================
// Auth Types (ADR-0009)
// ============================================================

export interface CurrentUser {
  id: number
  username: string
  nickname: string
  email: string
  role: string
  role_name?: string
  inherit_role?: string
  menus?: string[]
  permissions?: Record<string, 'all' | 'own'>
  avatar: string | null
}

export interface RoleRecord {
  id: number
  slug: string
  name: string
  description: string | null
  inherit_role: string
  is_system: boolean
  user_count?: number
  menus: string[]
  permissions?: Record<string, 'all' | 'own'>
  created_at?: string
}

// ============================================================
// Requirement Types (ADR-0002, 0004, 0005, 0007)
// ============================================================

export type Priority = 'p0' | 'p1' | 'p2' | 'p3'
export type RequirementStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'closed'

export interface User {
  id: number
  name: string
  nickname?: string
  avatar?: string | null
  role: string
}

export interface Iteration {
  id: number
  name: string
  status: 'planning' | 'active' | 'completed'
  start_date?: string | null
  end_date?: string | null
}

export interface Module {
  id: string
  name: string
}

export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  color: string
  start_date?: string | null
  end_date?: string | null
  member_count?: number
  requirement_count?: number
  owner?: User | null
  created_at?: string
  updated_at?: string
}

export type ProjectMemberRole = 'owner' | 'admin' | 'member'

export interface ProjectMember {
  id: number
  user_id: number
  role: ProjectMemberRole
  joined_at: string
  nickname: string
  email: string
  avatar: string | null
  user_role: string
}

export interface ProjectStats {
  requirement_total: number
  requirement_completed: number
  task_total: number
  task_done: number
  bug_total: number
  bug_fixed: number
  iteration_total: number
  iteration_active: number
}

export interface ProjectDetail extends Project {
  owner_id: number | null
  updated_at: string
  members: ProjectMember[]
  stats: ProjectStats
  iterations: Iteration[]
}

export const PROJECT_MEMBER_ROLE_LABELS: Record<ProjectMemberRole, string> = {
  owner: '所有者',
  admin: '管理员',
  member: '成员'
}

export const PROJECT_MEMBER_ROLE_CLASSES: Record<ProjectMemberRole, string> = {
  owner: 'bg-purple-50 text-purple-600',
  admin: 'bg-blue-50 text-blue-600',
  member: 'bg-gray-50 text-gray-500'
}

export interface Requirement {
  id: string
  req_id: number
  title: string
  description: string
  priority: Priority
  status: RequirementStatus
  type: 'feature' | 'bug' | 'improvement' | 'task'
  module: string | null
  expected_date: string | null
  tags: string[]
  attachments?: { url: string; filename: string; size: number; type: string }[]
  links?: { url: string; title: string }[]
  task_count: number
  has_prototype: boolean
  created_at: string
  updated_at: string
  assignee: User | null
  creator: User | null
  iteration: Iteration | null
  project: Project | null
}

export interface RequirementListResponse {
  items: Requirement[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RequirementDetail extends Requirement {
  tasks: Task[]
  bugs: Bug[]
  prototypes: Prototype[]
}

export interface RequirementHistoryItem {
  id: number | string
  field: string
  old_value: string | null
  new_value: string | null
  user_name: string
  changed_at: string
}

export interface MetaResponse {
  totalCount: number
  myBugCount?: number
  myTaskCount?: number
  users: User[]
  projects: Project[]
  iterations: Iteration[]
  modules: Module[]
  statusCounts: Record<string, number>
}

// ============================================================
// Project Types
// ============================================================

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: '规划中',
  active: '进行中',
  paused: '已暂停',
  completed: '已完成',
  archived: '已归档'
}

export const PROJECT_STATUS_CLASSES: Record<ProjectStatus, string> = {
  planning: 'bg-blue-50 text-blue-600',
  active: 'bg-green-50 text-green-600',
  paused: 'bg-yellow-50 text-yellow-600',
  completed: 'bg-indigo-50 text-indigo-600',
  archived: 'bg-gray-100 text-gray-400'
}

// ============================================================
// Label / Class Maps (ADR-0002)
// ============================================================

export const PRIORITY_LABELS: Record<Priority, string> = {
  p0: 'P0 最高',
  p1: 'P1 高',
  p2: 'P2 中',
  p3: 'P3 低'
}

export const PRIORITY_CLASSES: Record<Priority, string> = {
  p0: 'bg-red-50 text-red-600',
  p1: 'bg-orange-50 text-orange-600',
  p2: 'bg-yellow-50 text-yellow-600',
  p3: 'bg-gray-50 text-gray-500'
}

export const PRIORITY_DOT_COLORS: Record<Priority, string> = {
  p0: '#ef4444',
  p1: '#f97316',
  p2: '#eab308',
  p3: '#9ca3af'
}

export const STATUS_LABELS: Record<RequirementStatus, string> = {
  draft: '草稿',
  pending: '评审中',
  approved: '已确定',
  rejected: '已拒绝',
  in_progress: '进行中',
  completed: '已完成',
  closed: '已关闭'
}

export const STATUS_CLASSES: Record<RequirementStatus, string> = {
  draft: 'bg-gray-50 text-gray-500',
  pending: 'bg-yellow-50 text-yellow-600',
  approved: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-600',
  in_progress: 'bg-blue-50 text-blue-600',
  completed: 'bg-indigo-50 text-indigo-600',
  closed: 'bg-gray-100 text-gray-400'
}

export const STATUS_DOT_COLORS: Record<RequirementStatus, string> = {
  draft: '#9ca3af',
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  in_progress: '#3b82f6',
  completed: '#6366f1',
  closed: '#9ca3af'
}

// ============================================================
// Task Types
// ============================================================

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'

export interface Task {
  id: string
  task_id: number
  title: string
  description: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'development' | 'design' | 'test' | 'research' | 'other'
  estimated_hours: number | null
  actual_hours: number | null
  start_date: string | null
  due_date: string | null
  created_at: string
  updated_at: string
  assignee: User | null
  creator: User | null
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待处理',
  in_progress: '进行中',
  review: '评审中',
  done: '已完成'
}

// ============================================================
// Bug Types (ADR-0002)
// ============================================================

export type BugStatus = 'new' | 'confirmed' | 'in_progress' | 'fixed' | 'verified' | 'closed' | 'reopened'
export type Severity = 'critical' | 'major' | 'minor' | 'trivial'

export interface Bug {
  id: string
  bug_id: number
  title: string
  description: string
  steps: string
  expected_result: string
  actual_result: string
  severity: Severity
  priority: Priority
  status: BugStatus
  screenshots: string[]
  tags: string[]
  module: string | null
  iteration: Iteration | null
  created_at: string
  updated_at: string
  assignee: User | null
  reporter: User | null
  requirement: { id: string; title: string } | null
  project: Project | null
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: '严重',
  major: '一般',
  minor: '轻微',
  trivial: '微小'
}

export const SEVERITY_CLASSES: Record<Severity, string> = {
  critical: 'bg-red-50 text-red-600',
  major: 'bg-orange-50 text-orange-600',
  minor: 'bg-yellow-50 text-yellow-600',
  trivial: 'bg-gray-50 text-gray-500'
}

export const BUG_STATUS_LABELS: Record<BugStatus, string> = {
  new: '新建',
  confirmed: '已确认',
  in_progress: '处理中',
  fixed: '已修复',
  verified: '已验证',
  closed: '已关闭',
  reopened: '重新打开'
}

export const BUG_STATUS_CLASSES: Record<BugStatus, string> = {
  new: 'bg-red-50 text-red-600',
  confirmed: 'bg-orange-50 text-orange-600',
  in_progress: 'bg-blue-50 text-blue-600',
  fixed: 'bg-green-50 text-green-600',
  verified: 'bg-indigo-50 text-indigo-600',
  closed: 'bg-gray-100 text-gray-400',
  reopened: 'bg-red-50 text-red-600'
}

// ============================================================
// Prototype Types
// ============================================================

export interface Prototype {
  id: number
  name: string
  description: string
  status: 'draft' | 'in_review' | 'approved' | 'archived'
  thumbnail: string | null
  pages: { name: string; size: string }[]
  created_at: string
  creator: User | null
}

export interface PrototypeVersion {
  id: number
  revision: number
  version: string
  description: string
  createdAt: string
  author: Pick<User, 'name' | 'avatar'>
}
