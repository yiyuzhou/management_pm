import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  host: '101.126.91.130',
  port: 4005,
  user: 'root',
  password: 'sGq0EqkU0yAwlYEW',
  database: 'voice_rdm',
  multipleStatements: true
};

async function initDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');

    const sqlPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // 分割 SQL 语句并执行
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement + ';');
        } catch (err) {
          // 忽略表已存在的错误
          if (!err.message.includes('Duplicate') && !err.message.includes('already exists')) {
            console.error('执行 SQL 失败:', err.message);
          }
        }
      }
    }

    console.log('✅ 数据库表创建完成');

    // 验证表是否创建成功
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 已创建的表:');
    tables.forEach(row => {
      console.log('  -', Object.values(row)[0]);
    });

    // 查询数据
    const [users] = await connection.execute('SELECT id, username, nickname, role FROM users');
    console.log('\n👥 用户数据:');
    users.forEach(u => {
      console.log(`  - ${u.username} (${u.nickname}) - ${u.role}`);
    });

    const [projects] = await connection.execute('SELECT id, name, status FROM projects');
    console.log('\n📁 项目数据:');
    projects.forEach(p => {
      console.log(`  - ${p.name} (${p.status})`);
    });

    const [requirements] = await connection.execute('SELECT req_no, title, status FROM requirements');
    console.log('\n📝 需求数据:');
    requirements.forEach(r => {
      console.log(`  - ${r.req_no}: ${r.title} (${r.status})`);
    });

    console.log('\n✅ 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
