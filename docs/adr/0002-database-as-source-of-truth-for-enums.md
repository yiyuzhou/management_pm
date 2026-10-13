# 数据库 ENUM 为枚举唯一真相源，前端类型对齐数据库

前端 `Priority`、`Status` 等枚举类型与数据库 ENUM 完全对齐，不在 API 层做映射转换。

之前前端 `Priority` 用 `high/medium/low`（3个），数据库用 `p0/p1/p2/p3`（4个），数量都对不上无法映射。`Status` 前端用 `reviewing/developing`，数据库用 `pending/in_progress`，语义重叠但值不同。`bugs.severity` 前端硬编码中文直接传 API，与数据库 `critical/major/minor/trivial` 不匹配导致插入失败。

选定数据库为准的理由：种子数据已在运行，改 ENUM 需 ALTER TABLE + 数据迁移成本最高；API 双向映射方案因枚举数量不等（p0-p3 有4个，high/medium/low 只有3个）无法完整映射。前端改类型定义 + label 映射表成本可控，且数据库枚举值（`in_progress`、`pending`）比前端自造值更语义准确。
