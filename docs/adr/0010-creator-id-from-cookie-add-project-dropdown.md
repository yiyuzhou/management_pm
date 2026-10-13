# creator_id/reporter_id 从 Cookie 获取，RequirementModal 增加项目下拉

POST API（requirements、bugs）从 Signed Cookie 解析当前用户 ID 作为 `creator_id` / `reporter_id`，忽略 body 中传入的值。RequirementModal 和 BugModal 表单不显示、不提交这些字段。

`project_id`：RequirementModal 增加项目下拉（数据来自 Meta API 的 `projects`），选填不强制。不选时存 NULL。
