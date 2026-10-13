-- =====================================================
-- 需求池 - 需求列表 PRD 数据库设计
-- 数据库: voice_rdm
-- =====================================================

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `role` VARCHAR(50) NOT NULL DEFAULT 'developer' COMMENT '角色slug，对应 roles.slug',
  `status` TINYINT UNSIGNED DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
  `last_seen_at` TIMESTAMP NULL DEFAULT NULL COMMENT '最近在线时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表（系统预置 5 个角色，可新增自定义角色）
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(50) NOT NULL COMMENT '角色标识，写入 users.role',
  `name` VARCHAR(50) NOT NULL COMMENT '显示名称',
  `description` VARCHAR(255) DEFAULT NULL,
  `inherit_role` VARCHAR(50) DEFAULT NULL COMMENT '操作权限模板，系统角色为空表示自身',
  `is_system` TINYINT UNSIGNED DEFAULT 0 COMMENT '1-系统预置不可删除',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE IF NOT EXISTS `role_menus` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT UNSIGNED NOT NULL,
  `menu_key` VARCHAR(50) NOT NULL,
  UNIQUE KEY `uk_role_menu` (`role_id`, `menu_key`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_role_menus_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色可见菜单';

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT UNSIGNED NOT NULL,
  `resource` VARCHAR(50) NOT NULL,
  `action` VARCHAR(20) NOT NULL,
  `scope` ENUM('all', 'own') NOT NULL DEFAULT 'all',
  UNIQUE KEY `uk_role_perm` (`role_id`, `resource`, `action`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色操作权限';

-- 项目表
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '项目名称',
  `description` TEXT COMMENT '项目描述',
  `status` ENUM('planning', 'active', 'paused', 'completed') DEFAULT 'planning' COMMENT '项目状态',
  `color` VARCHAR(20) DEFAULT '#3B82F6' COMMENT '项目颜色标识',
  `start_date` DATE DEFAULT NULL COMMENT '开始日期',
  `end_date` DATE DEFAULT NULL COMMENT '结束日期',
  `owner_id` INT UNSIGNED DEFAULT NULL COMMENT '项目负责人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 项目成员表
CREATE TABLE IF NOT EXISTS `project_members` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT UNSIGNED NOT NULL COMMENT '项目ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `role` ENUM('owner', 'admin', 'member') DEFAULT 'member' COMMENT '成员角色',
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_project_user` (`project_id`, `user_id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目成员表';

-- 迭代表
CREATE TABLE IF NOT EXISTS `iterations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT UNSIGNED NOT NULL COMMENT '项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '迭代名称',
  `description` TEXT COMMENT '迭代描述',
  `status` ENUM('planning', 'active', 'completed') DEFAULT 'planning' COMMENT '迭代状态',
  `start_date` DATE DEFAULT NULL COMMENT '开始日期',
  `end_date` DATE DEFAULT NULL COMMENT '结束日期',
  `created_by` INT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_project_status` (`project_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='迭代表';

-- 需求表
CREATE TABLE IF NOT EXISTS `requirements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `req_no` VARCHAR(20) NOT NULL COMMENT '需求编号',
  `title` VARCHAR(200) NOT NULL COMMENT '需求标题',
  `description` TEXT COMMENT '需求描述',
  `status` ENUM('draft', 'pending', 'approved', 'rejected', 'in_progress', 'completed', 'closed') DEFAULT 'draft' COMMENT '需求状态',
  `priority` ENUM('p0', 'p1', 'p2', 'p3') DEFAULT 'p2' COMMENT '优先级',
  `type` ENUM('feature', 'bug', 'improvement', 'task') DEFAULT 'feature' COMMENT '需求类型',
  `project_id` INT UNSIGNED DEFAULT NULL COMMENT '所属项目ID',
  `iteration_id` INT UNSIGNED DEFAULT NULL COMMENT '所属迭代ID',
  `creator_id` INT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `assignee_id` INT UNSIGNED DEFAULT NULL COMMENT '负责人ID',
  `tags` JSON DEFAULT NULL COMMENT '标签数组',
  `attachments` JSON DEFAULT NULL COMMENT '附件列表',
  `module` VARCHAR(50) DEFAULT NULL COMMENT '所属模块',
  `expected_date` DATE DEFAULT NULL COMMENT '期望完成日期',
  `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT '完成时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_req_no` (`req_no`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`iteration_id`) REFERENCES `iterations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_project` (`project_id`),
  KEY `idx_assignee` (`assignee_id`),
  FULLTEXT KEY `ft_title_desc` (`title`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='需求表';

-- 需求变更历史表
CREATE TABLE IF NOT EXISTS `requirement_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `requirement_id` INT UNSIGNED NOT NULL COMMENT '需求ID',
  `field` VARCHAR(50) NOT NULL COMMENT '变更字段',
  `old_value` TEXT COMMENT '旧值',
  `new_value` TEXT COMMENT '新值',
  `changed_by` INT UNSIGNED DEFAULT NULL COMMENT '变更人ID',
  `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_requirement` (`requirement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='需求变更历史表';

-- 原型表
CREATE TABLE IF NOT EXISTS `prototypes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT UNSIGNED NOT NULL COMMENT '项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '原型名称',
  `description` TEXT COMMENT '原型描述',
  `status` ENUM('draft', 'in_review', 'approved', 'archived') DEFAULT 'draft' COMMENT '状态',
  `pages` JSON DEFAULT NULL COMMENT '页面列表',
  `thumbnail` VARCHAR(255) DEFAULT NULL COMMENT '缩略图',
  `creator_id` INT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `requirement_id` INT UNSIGNED DEFAULT NULL COMMENT '关联需求ID',
  `module` VARCHAR(100) DEFAULT NULL COMMENT '所属模块',
  `version` VARCHAR(50) DEFAULT 'v1.0' COMMENT '版本号',
  `iteration_id` INT UNSIGNED DEFAULT NULL COMMENT '所属迭代ID',
  `tags` JSON DEFAULT NULL COMMENT '标签列表',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`iteration_id`) REFERENCES `iterations`(`id`) ON DELETE SET NULL,
  KEY `idx_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原型表';

-- 原型版本追溯表：每次创建、保存或恢复均新增不可变快照
CREATE TABLE IF NOT EXISTS `prototype_versions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `prototype_id` INT UNSIGNED NOT NULL COMMENT '原型ID',
  `revision` INT UNSIGNED NOT NULL COMMENT '内部修订号',
  `version_label` VARCHAR(50) NOT NULL COMMENT '原型版本标识',
  `snapshot` JSON NOT NULL COMMENT '完整原型快照',
  `change_summary` VARCHAR(255) NOT NULL COMMENT '本次变更说明',
  `created_by` INT UNSIGNED DEFAULT NULL COMMENT '操作人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_prototype_revision` (`prototype_id`, `revision`),
  KEY `idx_prototype_created` (`prototype_id`, `created_at`),
  FOREIGN KEY (`prototype_id`) REFERENCES `prototypes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原型版本快照表';

-- 任务表
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `task_no` VARCHAR(20) NOT NULL COMMENT '任务编号',
  `title` VARCHAR(200) NOT NULL COMMENT '任务标题',
  `description` TEXT COMMENT '任务描述',
  `status` ENUM('todo', 'in_progress', 'review', 'done') DEFAULT 'todo' COMMENT '任务状态',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '优先级',
  `type` ENUM('development', 'design', 'test', 'research', 'other') DEFAULT 'development' COMMENT '任务类型',
  `project_id` INT UNSIGNED DEFAULT NULL COMMENT '项目ID',
  `requirement_id` INT UNSIGNED DEFAULT NULL COMMENT '关联需求ID',
  `iteration_id` INT UNSIGNED DEFAULT NULL COMMENT '所属迭代ID',
  `creator_id` INT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
  `assignee_id` INT UNSIGNED DEFAULT NULL COMMENT '负责人ID',
  `estimated_hours` DECIMAL(6,2) DEFAULT NULL COMMENT '预估工时',
  `actual_hours` DECIMAL(6,2) DEFAULT NULL COMMENT '实际工时',
  `start_date` DATE DEFAULT NULL COMMENT '开始时间',
  `due_date` DATE DEFAULT NULL COMMENT '截止时间',
  `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT '完成时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_task_no` (`task_no`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`iteration_id`) REFERENCES `iterations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_status` (`status`),
  KEY `idx_assignee` (`assignee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

CREATE TABLE IF NOT EXISTS `task_assignees` (
  `task_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`task_id`, `user_id`),
  KEY `idx_user` (`user_id`),
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务多人负责人';

-- Bug表
CREATE TABLE IF NOT EXISTS `bugs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `bug_no` VARCHAR(20) NOT NULL COMMENT 'Bug编号',
  `title` VARCHAR(200) NOT NULL COMMENT 'Bug标题',
  `description` TEXT COMMENT 'Bug描述',
  `steps` TEXT COMMENT '复现步骤',
  `expected_result` TEXT COMMENT '预期结果',
  `actual_result` TEXT COMMENT '实际结果',
  `severity` ENUM('critical', 'major', 'minor', 'trivial') DEFAULT 'minor' COMMENT '严重程度',
  `priority` ENUM('p0', 'p1', 'p2', 'p3') DEFAULT 'p2' COMMENT '优先级',
  `status` ENUM('new', 'confirmed', 'in_progress', 'fixed', 'verified', 'closed', 'reopened') DEFAULT 'new' COMMENT 'Bug状态',
  `project_id` INT UNSIGNED DEFAULT NULL COMMENT '项目ID',
  `requirement_id` INT UNSIGNED DEFAULT NULL COMMENT '关联需求ID',
  `task_id` INT UNSIGNED DEFAULT NULL COMMENT '关联任务ID',
  `reporter_id` INT UNSIGNED DEFAULT NULL COMMENT '报告人ID',
  `assignee_id` INT UNSIGNED DEFAULT NULL COMMENT '负责人ID',
  `iteration_id` INT UNSIGNED DEFAULT NULL COMMENT '所属迭代ID',
  `module` VARCHAR(100) DEFAULT NULL COMMENT '所属模块',
  `tags` JSON DEFAULT NULL COMMENT '标签列表',
  `screenshots` JSON DEFAULT NULL COMMENT '截图列表',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_bug_no` (`bug_no`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`iteration_id`) REFERENCES `iterations`(`id`) ON DELETE SET NULL,
  KEY `idx_status` (`status`),
  KEY `idx_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bug表';

-- 周报表
CREATE TABLE IF NOT EXISTS `weekly_reports` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `week_start` DATE NOT NULL COMMENT '周开始日期',
  `week_end` DATE NOT NULL COMMENT '周结束日期',
  `completed_work` JSON NOT NULL COMMENT '本周完成工作',
  `next_week_plan` JSON NOT NULL COMMENT '下周计划',
  `summary` TEXT COMMENT '工作总结',
  `hours` DECIMAL(5,2) DEFAULT 0 COMMENT '工作时长',
  `status` ENUM('draft', 'submitted') DEFAULT 'draft' COMMENT '提交状态',
  `submitted_at` TIMESTAMP NULL DEFAULT NULL COMMENT '提交时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_week` (`user_id`, `week_start`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  KEY `idx_week` (`week_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='周报表';

-- 评论表
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `target_type` ENUM('requirement', 'prototype', 'task', 'bug') NOT NULL COMMENT '评论目标类型',
  `target_id` INT UNSIGNED NOT NULL COMMENT '评论目标ID',
  `parent_id` INT UNSIGNED DEFAULT NULL COMMENT '父评论ID(回复)',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `author_id` INT UNSIGNED DEFAULT NULL COMMENT '作者ID',
  `attachments` JSON DEFAULT NULL COMMENT '附件',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 文件/附件表
CREATE TABLE IF NOT EXISTS `attachments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL COMMENT '文件名',
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
  `file_size` INT UNSIGNED DEFAULT 0 COMMENT '文件大小(字节)',
  `mime_type` VARCHAR(100) DEFAULT NULL COMMENT '文件类型',
  `target_type` ENUM('requirement', 'prototype', 'task', 'bug', 'comment') DEFAULT NULL COMMENT '关联类型',
  `target_id` INT UNSIGNED DEFAULT NULL COMMENT '关联ID',
  `uploader_id` INT UNSIGNED DEFAULT NULL COMMENT '上传人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  KEY `idx_target` (`target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件表';

-- 消息通知表
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '接收人',
  `type` VARCHAR(50) NOT NULL COMMENT 'requirement_assigned / bug_assigned / requirement_due',
  `title` VARCHAR(255) NOT NULL,
  `content` VARCHAR(500) DEFAULT NULL,
  `link` VARCHAR(255) DEFAULT NULL,
  `ref_type` VARCHAR(50) DEFAULT NULL,
  `ref_id` VARCHAR(50) DEFAULT NULL,
  `dedupe_key` VARCHAR(100) DEFAULT NULL,
  `is_read` TINYINT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_user_read` (`user_id`, `is_read`, `created_at`),
  UNIQUE KEY `uk_dedupe` (`user_id`, `type`, `ref_type`, `ref_id`, `dedupe_key`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息通知';

-- 系统配置表
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `value` TEXT COMMENT '配置值',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 初始化数据
INSERT INTO `users` (`username`, `email`, `password_hash`, `nickname`, `role`) VALUES
('admin', 'admin@lycheeai.com', '$2b$10$EKX0.ZJQjxu1r.C4dHq35.3fTqvZSLHqB2Mnr0OV.9mT7WKSoUYB2', '管理员', 'admin'),
('pm1', 'pm1@lycheeai.com', '$2b$10$EKX0.ZJQjxu1r.C4dHq35.3fTqvZSLHqB2Mnr0OV.9mT7WKSoUYB2', '产品经理1', 'pm'),
('dev1', 'dev1@lycheeai.com', '$2b$10$EKX0.ZJQjxu1r.C4dHq35.3fTqvZSLHqB2Mnr0OV.9mT7WKSoUYB2', '开发1', 'developer'),
('test1', 'test1@lycheeai.com', '$2b$10$EKX0.ZJQjxu1r.C4dHq35.3fTqvZSLHqB2Mnr0OV.9mT7WKSoUYB2', '测试1', 'tester'),
('pm2', 'pm2@lycheeai.com', '$2b$10$EKX0.ZJQjxu1r.C4dHq35.3fTqvZSLHqB2Mnr0OV.9mT7WKSoUYB2', '产品经理2', 'pm'),
('manager1', 'manager1@lycheeai.com', '$2b$10$EKX0.ZJQjxu1r.C4dHq35.3fTqvZSLHqB2Mnr0OV.9mT7WKSoUYB2', '项目经理1', 'project_manager');

INSERT INTO `roles` (`slug`, `name`, `description`, `inherit_role`, `is_system`) VALUES
('admin', '管理员', '系统管理员，可管理账号与权限', NULL, 1),
('pm', '产品经理', '产品需求与原型', NULL, 1),
('project_manager', '项目经理', '除账号管理外的全部业务权限', NULL, 1),
('developer', '开发工程师', '任务与缺陷处理', NULL, 1),
('tester', '测试工程师', '测试与缺陷验证', NULL, 1);

INSERT INTO `role_menus` (`role_id`, `menu_key`)
SELECT r.id, m.menu_key
FROM `roles` r
CROSS JOIN (
  SELECT 'dashboard' AS menu_key UNION ALL
  SELECT 'projects' UNION ALL
  SELECT 'requirements' UNION ALL
  SELECT 'prototype' UNION ALL
  SELECT 'tasks' UNION ALL
  SELECT 'bugs' UNION ALL
  SELECT 'weekly' UNION ALL
  SELECT 'iteration' UNION ALL
  SELECT 'team'
) m
WHERE r.slug IN ('admin', 'pm', 'project_manager', 'developer', 'tester');

INSERT INTO `role_menus` (`role_id`, `menu_key`)
SELECT r.id, 'permissions' FROM `roles` r WHERE r.slug = 'admin';

INSERT INTO `projects` (`name`, `description`, `status`, `color`, `owner_id`) VALUES
('电商平台V3.0', '新一代电商平台重构项目', 'active', '#3B82F6', 2),
('智能语音助手', 'AI语音交互产品', 'active', '#8B5CF6', 2),
('数据中台', '企业级数据中台建设', 'planning', '#10B981', 2);

INSERT INTO `project_members` (`project_id`, `user_id`, `role`) VALUES
(1, 1, 'owner'),
(1, 2, 'admin'),
(1, 3, 'member'),
(1, 4, 'member'),
(1, 5, 'member'),
(2, 1, 'owner'),
(2, 2, 'admin'),
(2, 3, 'member'),
(3, 1, 'owner'),
(3, 2, 'admin');

INSERT INTO `iterations` (`project_id`, `name`, `description`, `status`, `start_date`, `end_date`, `created_by`) VALUES
(1, '2024 Q4 Sprint 3', '用户中心改版迭代', 'active', '2024-12-02', '2024-12-15', 2),
(1, '2024 Q4 Sprint 4', '订单系统优化', 'planning', '2024-12-16', '2024-12-29', 2),
(2, '2024 Q4 Sprint 2', '语音识别优化', 'active', '2024-11-18', '2024-12-01', 2);

INSERT INTO `requirements` (`req_no`, `title`, `description`, `status`, `priority`, `type`, `project_id`, `iteration_id`, `creator_id`, `assignee_id`, `tags`, `module`, `expected_date`) VALUES
('REQ-001', '用户中心页面改版', '重新设计用户中心页面，提升用户体验', 'in_progress', 'p0', 'feature', 1, 1, 2, 3, '["UI", "用户体验"]', '用户中心', '2024-12-15'),
('REQ-002', '订单列表批量导出', '支持订单列表的批量导出功能', 'completed', 'p1', 'feature', 1, 1, 2, 3, '["导出", "订单"]', '订单管理', '2024-12-10'),
('REQ-003', '登录页面白屏问题', '修复某些情况下登录页面白屏的问题', 'completed', 'p0', 'bug', 1, 1, 4, 3, '["Bug", "登录"]', '用户中心', '2024-12-05'),
('REQ-004', '语音识别准确率提升', '优化语音识别算法，提升准确率至95%以上', 'pending', 'p0', 'improvement', 2, 3, 2, 3, '["AI", "语音"]', '语音识别', '2024-12-20'),
('REQ-005', '数据看板开发', '开发数据可视化看板', 'draft', 'p1', 'feature', 3, NULL, 2, NULL, '["数据", "可视化"]', '数据看板', '2025-01-15');

INSERT INTO `tasks` (`task_no`, `title`, `description`, `status`, `priority`, `type`, `project_id`, `requirement_id`, `iteration_id`, `creator_id`, `assignee_id`, `estimated_hours`, `due_date`) VALUES
('TASK-001', '用户中心API接口开发', '开发用户中心相关API', 'in_progress', 'high', 'development', 1, 1, 1, 2, 3, 16, '2024-12-10'),
('TASK-002', '用户中心UI设计', '设计用户中心页面', 'done', 'high', 'design', 1, 1, 1, 2, 5, 12, '2024-12-05'),
('TASK-003', '订单导出功能测试', '测试订单导出功能', 'todo', 'medium', 'test', 1, 2, 1, 2, 4, 8, '2024-12-12');

INSERT INTO `bugs` (`bug_no`, `title`, `description`, `severity`, `priority`, `status`, `project_id`, `requirement_id`, `reporter_id`, `assignee_id`) VALUES
('BUG-001', '头像上传显示异常', '上传头像后显示为空白', 'major', 'p1', 'fixed', 1, 1, 4, 3),
('BUG-002', '页面加载缓慢', '首页加载时间超过5秒', 'minor', 'p2', 'in_progress', 1, NULL, 4, 3),
('BUG-003', '消息通知未推送', '新消息没有推送通知', 'critical', 'p0', 'confirmed', 2, 4, 4, 3);

INSERT INTO `prototypes` (`project_id`, `name`, `description`, `status`, `pages`, `creator_id`, `requirement_id`) VALUES
(1, '用户中心原型', '用户中心页面交互原型', 'approved', '[{"name": "个人主页", "size": "375x812"}, {"name": "编辑资料", "size": "375x812"}]', 5, 1),
(1, '订单管理原型', '订单管理流程原型', 'in_review', '[{"name": "订单列表", "size": "375x812"}, {"name": "订单详情", "size": "375x812"}]', 5, 2);

INSERT INTO `prototype_versions` (`prototype_id`, `revision`, `version_label`, `snapshot`, `change_summary`, `created_by`)
SELECT id, 1, COALESCE(version, 'v1.0'),
       JSON_OBJECT('name', name, 'description', description, 'pages', pages, 'thumbnail', thumbnail,
                   'status', status, 'requirement_id', requirement_id, 'module', module,
                   'version', COALESCE(version, 'v1.0'), 'iteration_id', iteration_id, 'tags', tags),
       '初始版本', creator_id
FROM `prototypes`;

INSERT INTO `weekly_reports` (`user_id`, `week_start`, `week_end`, `completed_work`, `next_week_plan`, `summary`, `hours`, `status`, `submitted_at`) VALUES
(2, '2024-12-02', '2024-12-08', '["完成用户中心需求文档", "组织需求评审会议"]', '["跟进用户中心开发进度", "准备数据看板需求"]', '本周主要推进用户中心改版项目', 42, 'submitted', NOW()),
(3, '2024-12-02', '2024-12-08', '["完成订单导出功能开发", "修复登录页面Bug"]', '["用户中心API开发", "代码重构优化"]', '本周完成了订单导出核心功能', 45, 'submitted', NOW()),
(5, '2024-12-02', '2024-12-08', '["完成用户中心设计稿", "更新设计系统组件库"]', '["数据看板页面设计", "设计规范文档整理"]', '用户中心设计稿已确认', 38, 'submitted', NOW());
