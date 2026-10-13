import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PERMISSION_MATRIX = {
  'project:create':   { roles: ['admin', 'project_manager'] },
  'project:read':     { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'project:update':   { roles: ['admin', 'pm', 'project_manager'] },
  'project:delete':   { roles: ['admin', 'project_manager'] },
  'requirement:create':  { roles: ['admin', 'pm', 'project_manager'] },
  'requirement:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'requirement:update':  { roles: ['admin', 'pm', 'project_manager'] },
  'requirement:delete':  { roles: ['admin', 'pm', 'project_manager'] },
  'task:create':  { roles: ['admin', 'pm', 'project_manager'] },
  'task:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'task:update':  { roles: ['admin', 'pm', 'project_manager'], ownRoles: ['developer', 'tester'] },
  'task:delete':  { roles: ['admin', 'pm', 'project_manager'] },
  'bug:create':  { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'bug:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'bug:update':  { roles: ['admin', 'pm', 'project_manager', 'tester'], ownRoles: ['developer'] },
  'bug:delete':  { roles: ['admin', 'project_manager'] },
  'iteration:create':  { roles: ['admin', 'pm', 'project_manager'] },
  'iteration:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'iteration:update':  { roles: ['admin', 'pm', 'project_manager'] },
  'iteration:delete':  { roles: ['admin', 'pm', 'project_manager'] },
  'prototype:create':  { roles: ['admin', 'pm', 'project_manager'] },
  'prototype:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'prototype:update':  { roles: ['admin', 'pm', 'project_manager'] },
  'prototype:delete':  { roles: ['admin', 'project_manager'] },
  'weekly_report:create':  { roles: ['admin', 'project_manager', 'developer', 'tester'] },
  'weekly_report:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'weekly_report:update':  { roles: ['admin'], ownRoles: ['project_manager', 'developer', 'tester'] },
  'weekly_report:delete':  { roles: ['admin', 'project_manager'] },
  'user:create':  { roles: ['admin'] },
  'user:read':    { roles: ['admin', 'pm', 'project_manager', 'developer', 'tester'] },
  'user:update':  { roles: ['admin'] },
  'user:delete':  { roles: ['admin'] },
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '101.126.91.130',
  port: parseInt(process.env.DB_PORT || '4005'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sGq0EqkU0yAwlYEW',
  database: process.env.DB_NAME || 'voice_rdm',
  multipleStatements: true
})

const sql = fs.readFileSync(path.join(__dirname, 'migrate_role_permissions.sql'), 'utf-8')
await connection.query(sql)

const [roles] = await connection.query('SELECT id, slug FROM roles')
let inserted = 0
for (const role of roles) {
  for (const [key, entry] of Object.entries(PERMISSION_MATRIX)) {
    const [resource, action] = key.split(':')
    let scope = null
    if (entry.roles.includes(role.slug)) scope = 'all'
    else if (entry.ownRoles?.includes(role.slug)) scope = 'own'
    if (!scope) continue
    const [result] = await connection.query(
      'INSERT IGNORE INTO role_permissions (role_id, resource, action, scope) VALUES (?, ?, ?, ?)',
      [role.id, resource, action, scope]
    )
    inserted += result.affectedRows || 0
  }
}

const [counts] = await connection.query(
  `SELECT r.slug, COUNT(p.id) cnt
     FROM roles r
     LEFT JOIN role_permissions p ON p.role_id = r.id
    GROUP BY r.id, r.slug
    ORDER BY r.id`
)
console.log('inserted', inserted)
console.log(counts)
await connection.end()
