# 统一 API 数据格式化：id 映射为业务编号

所有 API 的数据格式化统一为：`id` 字段映射为业务编号（`req_no`、`task_no`、`bug_no`），数字主键保留在 `reqId`/`taskId`/`bugId` 字段中。详情 API 的关联数据（tasks、bugs、prototypes）同样格式化，关联出 assignee/creator 等对象。

之前列表 API 将 `id` 映射为 `req_no`（字符串编号），但详情 API 直接展开原始 DB 行，`id` 是数字主键。导致详情页头部显示数字而非编号、类型定义 `id: string` 与实际返回 number 冲突、BugModal 用 `requirement.id`（数字）作为关联需求值无法与 POST API 的 `requirement_id` 对应。详情 API 返回的 tasks/bugs 数组也是原始 DB 行，前端需要自行做关联和格式化。

统一后 `Requirement.id: string` 的类型定义在列表和详情页都准确，`useFetch<Requirement>` 在两处都能工作。
