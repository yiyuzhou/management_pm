# 前端类型与字段命名统一为 snake_case，对齐数据库列名

前端表单字段、类型定义全部使用 snake_case，与 API 和数据库列名对齐。不做 camelCase ↔ snake_case 转换层。

之前前端表单用 `assigneeId`、`iterationId`、`expectedDate`（camelCase），API 期望 `assignee_id`、`iteration_id`、`expected_date`（snake_case），导致字段名不匹配——POST/PUT 请求中 camelCase 字段被 API 忽略。`BugModal` 更严重：`form.expected` 对应 API 的 `expected_result`，`form.actual` 对应 `actual_result`，连字段名都不只是驼峰差异。

同时修正 `types/index.ts` 的 `Requirement` 接口：移除数据库不存在的字段（`hasPrototype`、`relatedTasks`），将 camelCase 改为 snake_case（`expectedDate` → `expected_date`、`createdAt` → `created_at`）。这些派生字段改由 API 层或前端计算得出。
