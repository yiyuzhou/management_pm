# 静态角色鉴权（RBAC-Static）

采用静态角色枚举 + 硬编码权限矩阵，不新建 roles/permissions 表。5 个系统级角色（admin/pm/project_manager/developer/tester）的权限在前后端代码中硬编码，前后端双层强制执行。设计师职责由产品经理承担；项目经理拥有除账号管理以外的全部业务权限。

## 权限矩阵

| 资源 | admin | pm | project_manager | developer | tester |
|------|-------|-----|-----------------|-----------|--------|
| 项目 | CRUD | RU | CRUD | R | R |
| 需求 | CRUD | CRUD | CRUD | R | R |
| 任务 | CRUD | CRUD | CRUD | RU(own) | RU(own) |
| Bug | CRUD | CRU | CRUD | CRU(own) | CRU |
| 迭代 | CRUD | CRUD | CRUD | R | R |
| 原型 | CRUD | CRU | CRUD | R | R |
| 周报 | CRUD | R(all) | CRUD | CRU(own) | CRU(own) |
| 用户管理 | CRUD | R | R | R | R |

C=创建, R=读取, U=更新, D=删除。`(own)` = 仅自己创建或负责的资源。

## 子决策

- **静态角色**：不新建 roles/permissions/role_permissions 表。角色是 `users.role` ENUM，5 个固定值。理由：团队规模小，角色不会动态变化，建表是过度设计。
- **Own Resource 定义**：`creator_id = currentUserId` 或 `assignee_id = currentUserId`。Delete 不受 Own 豁免，始终需要 admin/pm。
- **后端执行**：`server/utils/permissions.ts` 导出 `requireRole(event, allowedRoles)` 和 `requireOwnership(event, resourceId, resourceType)` 工具函数。每个写操作 API handler 开头调用。
- **前端执行**：`composables/useAuth.ts` 封装当前用户 + `can(action, resource)` 方法。页面用 `v-if="can('create', 'requirement')"` 控制按钮显隐。路由中间件不拦截（所有菜单可见）。
- **菜单策略**：所有角色看到全部菜单项，只隐藏无权操作的按钮。避免"我能看什么"的困惑。
- **登录方式**：仅账号密码登录。设计稿中的手机验证码、第三方登录暂不实现，登录页 UI 按设计稿风格重做，第三方按钮保留为占位。
