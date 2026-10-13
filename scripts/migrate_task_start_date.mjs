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
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tasks' AND COLUMN_NAME = 'start_date'`
)
if (cols.length) {
  console.log('start_date already exists')
} else {
  await connection.query(
    `ALTER TABLE tasks ADD COLUMN start_date DATE DEFAULT NULL COMMENT '开始时间' AFTER actual_hours`
  )
  console.log('added tasks.start_date')
}
await connection.end()
