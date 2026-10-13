CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT UNSIGNED NOT NULL,
  `resource` VARCHAR(50) NOT NULL,
  `action` VARCHAR(20) NOT NULL,
  `scope` ENUM('all', 'own') NOT NULL DEFAULT 'all',
  UNIQUE KEY `uk_role_perm` (`role_id`, `resource`, `action`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色操作权限';
