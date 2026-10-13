# 表单 Modal 自行调用 API，成功后 emit success 事件

RequirementModal 和 BugModal 内部直接调用 `$fetch` 提交数据，自行管理 loading/error 状态。成功后 emit `success` 事件（不带数据），父组件收到后只需 `refresh()` 刷新列表。

之前 Modal 通过 `emit('submit', data)` 将数据抛给父组件，但 Vue 3 的 `emit()` 返回 void，`await emit(...)` 立即 resolve。导致 submitting spinner 一闪而过、无法防重复提交、API 错误无法回显到 Modal。BugModal 更在 emit 后立即重置表单，API 失败则用户数据丢失。

Modal 自管 API 调用后职责清晰：Modal 负责提交、loading、错误回显；父组件负责刷新列表。
