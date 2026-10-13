-- 清空业务数据脚本
-- 保留 admin 用户（id=1），清空其他所有业务数据

-- 按照外键依赖顺序删除数据

-- 1. 附件表（没有强外键依赖，但关联多种业务）
DELETE FROM attachments;

-- 2. 评论表
DELETE FROM comments;

-- 3. 周报表
DELETE FROM weekly_reports;

-- 4. Bug表
DELETE FROM bugs;

-- 5. 任务表
DELETE FROM tasks;

-- 6. 需求变更历史表
DELETE FROM requirement_history;

-- 7. 需求表
DELETE FROM requirements;

-- 8. 原型表
DELETE FROM prototypes;

-- 9. 迭代表
DELETE FROM iterations;

-- 10. 项目成员表
DELETE FROM project_members;

-- 11. 项目表
DELETE FROM projects;

-- 12. 清空非 admin 用户（保留 id=1 的 admin）
DELETE FROM users WHERE id != 1;

-- 重置自增ID（可选）
-- ALTER TABLE users AUTO_INCREMENT = 2;
-- ALTER TABLE projects AUTO_INCREMENT = 1;
-- ALTER TABLE iterations AUTO_INCREMENT = 1;
-- ALTER TABLE requirements AUTO_INCREMENT = 1;
-- ALTER TABLE requirement_history AUTO_INCREMENT = 1;
-- ALTER TABLE prototypes AUTO_INCREMENT = 1;
-- ALTER TABLE tasks AUTO_INCREMENT = 1;
-- ALTER TABLE bugs AUTO_INCREMENT = 1;
-- ALTER TABLE weekly_reports AUTO_INCREMENT = 1;
-- ALTER TABLE comments AUTO_INCREMENT = 1;
-- ALTER TABLE attachments AUTO_INCREMENT = 1;
-- ALTER TABLE project_members AUTO_INCREMENT = 1;
