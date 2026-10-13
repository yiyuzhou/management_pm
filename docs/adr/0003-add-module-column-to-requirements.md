# requirements 表新增 module 列

在 requirements 表添加 `module VARCHAR(50) DEFAULT NULL` 列，Meta API 通过 `SELECT DISTINCT module FROM requirements WHERE module IS NOT NULL` 提供模块下拉选项。

之前计划假设 requirements 表已有 module 字段，但 schema.sql 中该列不存在。前端类型定义、RequirementModal 表单、详情页都在使用 module，但 POST API 的 INSERT 语句没有该列，导致提交的 module 值被丢弃。

不新建 modules 表的理由：当前无模块管理页面，模块仅为分类标签无需独立实体。如果将来需要模块管理（增删改、排序），可再升级为独立表——加列是可逆的。
