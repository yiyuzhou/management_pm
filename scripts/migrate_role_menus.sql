-- 角色表 + 可见菜单。保留 5 个系统角色，users.role 改为 slug 字符串。

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

ALTER TABLE `users`
  MODIFY COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'developer' COMMENT '角色slug，对应 roles.slug';

INSERT IGNORE INTO `roles` (`slug`, `name`, `description`, `inherit_role`, `is_system`) VALUES
('admin', '管理员', '系统管理员，可管理账号与权限', NULL, 1),
('pm', '产品经理', '产品需求与原型', NULL, 1),
('project_manager', '项目经理', '除账号管理外的全部业务权限', NULL, 1),
('developer', '开发工程师', '任务与缺陷处理', NULL, 1),
('tester', '测试工程师', '测试与缺陷验证', NULL, 1);

INSERT IGNORE INTO `role_menus` (`role_id`, `menu_key`)
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

INSERT IGNORE INTO `role_menus` (`role_id`, `menu_key`)
SELECT r.id, 'permissions' FROM `roles` r WHERE r.slug = 'admin';
