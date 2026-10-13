# Auth 系统：签名 Cookie 无状态 Session

采用 HMAC 签名 cookie 实现 auth，不新建 sessions 表。登录时将 `user_id` 用 HMAC-SHA256 签名后写入 HTTP-only cookie，`/api/auth/me` 验签后查 users 表获取当前用户。

之前 `login.post.ts` 是半成品：密码验证被注释（永远返回 true）、生成的 token 不持久化、无 `/api/auth/me` 端点、无路由保护、前端无 auth 状态管理。TheSidebar 用户信息全部硬编码。

不新建 sessions 表的理由：schema 已够复杂，无状态签名 cookie 不需额外存储，HMAC 防篡改，Nuxt 3 原生支持 `useCookie`/`getCookie`/`setCookie`，签名用 Node.js 内置 `crypto` 模块无需额外依赖。

## 子决策

- **密码验证**：安装 `bcryptjs`，将种子数据的 `password_hash` 更新为真实 bcrypt hash。每个用户默认密码 `admin123`。
- **默认登录**：无 cookie 时不自动登录，跳转 `/login` 页面。开发阶段也不自动登录——真实流程更好调试。
- **Login 页面**：新建 `pages/login.vue`，用户名+密码表单，调 `/api/auth/login`，成功后写 cookie 跳转首页。新建 `middleware/auth.ts` 全局中间件保护除 `/login` 外的所有路由。
- **API 端点**：新建 `/api/auth/me.get.ts`（读 cookie 验签返回当前用户）、重写 `/api/auth/login.post.ts`（bcrypt 验证 + 签名 cookie）、新建 `/api/auth/logout.post.ts`（清除 cookie）。
