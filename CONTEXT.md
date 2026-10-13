# 需求管理系统（RDM）

面向产品研发团队的需求管理平台，覆盖需求、任务、Bug、迭代、原型、周报等研发管理全流程。

## Language

### 需求领域

**Requirement**:
一条产品需求，有唯一业务编号（如 REQ-001）和生命周期状态流转。
_Avoid_: 需求项、feature item

**RequirementStatus**:
需求的生命周期状态。枚举值为 `draft`（草稿）、`pending`（评审中）、`approved`（已通过）、`rejected`（已拒绝）、`in_progress`（开发中）、`completed`（已完成）、`closed`（已关闭）。
_Avoid_: 不要与 TaskStatus 或 BugStatus 混淆。前端之前用的 `reviewing` 实际是 `pending`，`developing` 实际是 `in_progress`。

**Priority**:
需求优先级。枚举值为 `p0`（最高）、`p1`（高）、`p2`（中）、`p3`（低）。
_Avoid_: high/medium/low——数量不等，无法映射。

**Module**:
需求所属的功能模块，自由文本分类标签。存储在 requirements 表的 `module` 列，通过 `SELECT DISTINCT` 提供下拉选项。
_Avoid_: 不要与独立实体 Module 混淆——当前无 modules 表，不作为独立资源管理。

### 任务领域

**Task**:
关联到需求的开发任务，有唯一业务编号（如 TASK-001）。

**TaskStatus**:
任务看板列状态。枚举值为 `todo`（待处理）、`in_progress`（进行中）、`review`（评审中）、`done`（已完成）。

### Bug 领域

**Bug**:
产品缺陷记录，有唯一业务编号（如 BUG-001）。

**BugStatus**:
Bug 流转状态。枚举值为 `new`（新建）、`confirmed`（已确认）、`in_progress`（处理中）、`fixed`（已修复）、`verified`（已验证）、`closed`（已关闭）、`reopened`（重新打开）。

**Severity**:
Bug 严重程度。枚举值为 `critical`（严重）、`major`（一般）、`minor`（轻微）、`trivial`（微小）。
_Avoid_: 不要用中文作为值传给 API——前端 option 的 value 必须是英文枚举值，中文仅用于 label 显示。

### 迭代领域

**Iteration**:
一个时间盒内的开发周期，关联到项目。

**IterationStatus**:
迭代阶段。枚举值为 `planning`（规划中）、`active`（进行中）、`completed`（已完成）。

### Auth 领域

**CurrentUser**:
当前登录用户，由 `/api/auth/me` 返回。包含 `id`（数字主键）、`username`、`nickname`、`role`、`avatar`。不包含 `password_hash`。

**Signed Cookie**:
无状态 session 方案。登录时将 `user_id` 用 HMAC-SHA256 签名，写入 HTTP-only cookie。服务端验签后查 users 表获取用户。不存储 session 记录。
_Avoid_: 不要与有状态 session（sessions 表 + 随机 token）混淆。

**Auth Middleware**:
Nuxt 全局路由中间件，保护除 `/login` 外的所有路由。无有效 cookie 时跳转 `/login`。

### 权限领域

**Role**:
用户系统级角色，存储在 `users.role` 列，值为 `roles.slug`。系统预置 `admin`（管理员）、`pm`（产品经理）、`project_manager`（项目经理）、`developer`（开发）、`tester`（测试），不可删除。管理员可在权限管理页新增自定义角色，并为每个角色配置可见菜单。自定义角色通过 `inherit_role` 沿用某一系统角色的操作权限矩阵。权限管理菜单仅 `admin` 可见。
_Avoid_: 不要与 `project_members.role`（项目级角色 owner/admin/member）混淆。项目级角色只控制项目设置权限，系统级角色（及自定义角色的 inherit_role）控制全局功能权限。

**Permission**:
对特定资源执行特定操作的能力。格式为 `resource:action`，如 `requirement:create`、`task:update`。存储在 `role_permissions`，由管理员在权限管理页按角色配置。`scope=all` 表示全部记录，`scope=own` 表示仅自己的任务/Bug/周报。权限管理菜单仍仅 `admin` 可见。

**Own Resource**:
用户有权 CRU 的资源。定义为「创建者或负责人」——即 `creator_id = currentUserId` 或 `assignee_id = currentUserId`。Delete 不受 Own Resource 豁免，始终需要 admin/pm 权限。

**requireRole**:
后端 API 鉴权工具函数。在 handler 开头调用 `requireRole(event, ['admin', 'pm'])`，当前用户角色不在允许列表内时抛出 403。所有写操作 API 必须调用。

**useAuth**:
前端 composable，封装当前用户状态和 `can(action, resource)` 方法。基于静态权限矩阵判断当前角色是否有权执行某操作，用于控制 UI 元素显隐。

**双层鉴权**:
权限在前端和后端两层强制执行。前端隐藏无权操作的 UI 元素（按钮、菜单），后端在 API handler 中用 `requireRole` 兜底校验。后端是安全底线，前端是体验优化。

### 通用

**req_no / task_no / bug_no**:
业务编号字符串，作为面向用户展示的 ID。API 返回时映射到 `id` 字段。

**id（数字主键）**:
数据库自增主键，API 返回时映射到 `reqId` / `taskId` / `bugId` 字段。前端一般不直接使用，除非需要传给 API 做关联（如 `requirement_id`）。

**CurrentUser 作为 creator_id / reporter_id**:
创建需求、提交 Bug 时，`creator_id` / `reporter_id` 应从 Signed Cookie 中获取当前用户 ID，不由前端传入。
