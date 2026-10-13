-- 为已部署的数据库新增原型版本追溯，并为存量原型建立不可变的历史基线。
CREATE TABLE IF NOT EXISTS `prototype_versions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `prototype_id` INT UNSIGNED NOT NULL,
  `revision` INT UNSIGNED NOT NULL,
  `version_label` VARCHAR(50) NOT NULL,
  `snapshot` JSON NOT NULL,
  `change_summary` VARCHAR(255) NOT NULL,
  `created_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_prototype_revision` (`prototype_id`, `revision`),
  KEY `idx_prototype_created` (`prototype_id`, `created_at`),
  FOREIGN KEY (`prototype_id`) REFERENCES `prototypes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原型版本快照表';

INSERT IGNORE INTO `prototype_versions` (`prototype_id`, `revision`, `version_label`, `snapshot`, `change_summary`, `created_by`)
SELECT p.id, 1, COALESCE(p.version, 'v1.0'),
       JSON_OBJECT('name', p.name, 'description', p.description, 'pages', p.pages, 'thumbnail', p.thumbnail,
                   'status', p.status, 'requirement_id', p.requirement_id, 'module', p.module,
                   'version', COALESCE(p.version, 'v1.0'), 'iteration_id', p.iteration_id, 'tags', p.tags),
       '历史基线', p.creator_id
FROM `prototypes` p;
