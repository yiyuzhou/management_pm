# 列表 API 通过子查询返回派生字段

需求列表 API（`/api/requirements` GET）通过子查询返回 `task_count`（关联任务数）和 `has_prototype`（是否有关联原型），供列表表格渲染。

之前前端 `RequirementTable` 渲染 `relatedTasks` 和 `hasPrototype`，但列表 API 不返回这些字段，导致这两列始终为空。详情 API 已返回 `tasks` 和 `prototypes` 数组，详情页可用 `tasks.length` 和 `prototypes.length > 0` 替代。

`assignee.online`（在线绿点）从列表和详情中移除：数据库 users 表无 online 字段，在线状态属于实时状态，不值得为此引入轮询或 WebSocket。绿点作为纯 UI 装饰直接砍掉。
