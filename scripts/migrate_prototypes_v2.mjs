/**
 * 迁移脚本: prototypes 表添加 module, version, iteration_id, tags 字段
 *
 * 用法: node scripts/migrate_prototypes_v2.mjs
 */
import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || '101.126.91.130',
  port: parseInt(process.env.DB_PORT || '4005'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sGq0EqkU0yAwlYEW',
  database: process.env.DB_NAME || 'voice_rdm',
  waitForConnections: true,
  connectionLimit: 2,
  multipleStatements: true,
};

async function migrate() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('🔗 已连接数据库:', config.database);

    // 检查字段是否已存在
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'prototypes'
    `, [config.database]);

    const existingCols = columns.map(c => c.COLUMN_NAME);
    console.log('📋 当前 prototypes 表字段:', existingCols.join(', '));

    // 1. 添加 module 字段
    if (!existingCols.includes('module')) {
      console.log('➕ 添加 module 字段...');
      await connection.query(`ALTER TABLE prototypes ADD COLUMN \`module\` VARCHAR(100) DEFAULT NULL COMMENT '所属模块' AFTER \`requirement_id\``);
      console.log('✅ module 字段添加成功');
    } else {
      console.log('⏭️ module 字段已存在，跳过');
    }

    // 2. 添加 version 字段
    if (!existingCols.includes('version')) {
      console.log('➕ 添加 version 字段...');
      await connection.query(`ALTER TABLE prototypes ADD COLUMN \`version\` VARCHAR(50) DEFAULT 'v1.0' COMMENT '版本号' AFTER \`module\``);
      console.log('✅ version 字段添加成功');
    } else {
      console.log('⏭️ version 字段已存在，跳过');
    }

    // 3. 添加 iteration_id 字段
    if (!existingCols.includes('iteration_id')) {
      console.log('➕ 添加 iteration_id 字段...');
      await connection.query(`ALTER TABLE prototypes ADD COLUMN \`iteration_id\` INT UNSIGNED DEFAULT NULL COMMENT '所属迭代ID' AFTER \`version\``);
      try {
        await connection.query(`ALTER TABLE prototypes ADD CONSTRAINT \`fk_prototype_iteration\` FOREIGN KEY (\`iteration_id\`) REFERENCES \`iterations\`(\`id\`) ON DELETE SET NULL`);
      } catch (e) {
        console.log('⚠️ 外键约束可能已存在:', e.message);
      }
      console.log('✅ iteration_id 字段添加成功');
    } else {
      console.log('⏭️ iteration_id 字段已存在，跳过');
    }

    // 4. 添加 tags 字段
    if (!existingCols.includes('tags')) {
      console.log('➕ 添加 tags 字段...');
      await connection.query(`ALTER TABLE prototypes ADD COLUMN \`tags\` JSON DEFAULT NULL COMMENT '标签列表' AFTER \`iteration_id\``);
      console.log('✅ tags 字段添加成功');
    } else {
      console.log('⏭️ tags 字段已存在，跳过');
    }

    console.log('\n🎉 迁移完成!');
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
