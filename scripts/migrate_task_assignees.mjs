import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '101.126.91.130',
  port: parseInt(process.env.DB_PORT || '4005'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sGq0EqkU0yAwlYEW',
  database: process.env.DB_NAME || 'voice_rdm',
})

const [tables] = await connection.query(
  `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'task_assignees'`
)
if (tables.length) {
  console.log('task_assignees already exists')
} else {
  await connection.query(`
    CREATE TABLE task_assignees (
      task_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      PRIMARY KEY (task_id, user_id),
      KEY idx_user (user_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务多人负责人'
  `)
  console.log('created task_assignees')
}

const [copied] = await connection.query(`
  INSERT IGNORE INTO task_assignees (task_id, user_id)
  SELECT id, assignee_id FROM tasks WHERE assignee_id IS NOT NULL
`)
console.log('backfilled', copied.affectedRows, 'rows')
await connection.end()
