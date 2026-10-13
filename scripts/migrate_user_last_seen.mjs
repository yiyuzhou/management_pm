import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '101.126.91.130',
  port: parseInt(process.env.DB_PORT || '4005'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sGq0EqkU0yAwlYEW',
  database: process.env.DB_NAME || 'voice_rdm',
})

const [cols] = await connection.query(
  `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_seen_at'`
)
if (cols.length) {
  console.log('last_seen_at already exists')
} else {
  await connection.query(
    `ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP NULL DEFAULT NULL COMMENT '最近在线时间' AFTER status`
  )
  console.log('added users.last_seen_at')
}
await connection.end()
