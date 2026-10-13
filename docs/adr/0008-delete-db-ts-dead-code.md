# 删除 db.ts 和 data/manage.json 死代码

删除 `server/utils/db.ts` 和 `data/manage.json`。这是 MySQL 迁移前的 JSON 文件数据层遗留物，当前没有任何 server API 引用——所有 API 都 import `~/server/utils/mysql`。

保留它有害：Nitro auto-import 机制将 `getRequirements()`、`findUser()` 等函数全局注册，开发者可能误用；其数据模型（`high/medium/low` 优先级、`reviewing/developing` 状态、字符串 ID `'u1'`）与 MySQL 完全不兼容，与 ADR-0002 的枚举统一决策冲突。`mysql.ts` 无降级逻辑，不会在连接失败时切换到 JSON 存储。
