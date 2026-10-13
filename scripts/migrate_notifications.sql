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
