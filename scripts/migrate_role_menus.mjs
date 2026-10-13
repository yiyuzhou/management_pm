import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '101.126.91.130',
  port: parseInt(process.env.DB_PORT || '4005'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sGq0EqkU0yAwlYEW',
  database: process.env.DB_NAME || 'voice_rdm',
  multipleStatements: true
})

const sql = fs.readFileSync(path.join(__dirname, 'migrate_role_menus.sql'), 'utf-8')
await connection.query(sql)
const [roles] = await connection.query('SELECT slug, name, is_system FROM roles ORDER BY id')
console.log('roles:', roles)
await connection.end()
