# 角色可配置菜单与操作权限

在保留 5 个系统角色（admin / pm / project_manager / developer / tester）的前提下，新增 `roles`、`role_menus`、`role_permissions` 表。管理员可增删改自定义角色，并在同一编辑弹窗中配置可见菜单和资源操作权限（查看/新建/编辑/删除，任务/Bug/周报的编辑可设为仅自己的）。

`users.role` 存储 `roles.slug`。写接口走 `authorize` 读取该角色的 `role_permissions`；静态矩阵仅作种子与回退。「权限管理」页面与角色写接口仅 `users.role === 'admin'` 可访问。
