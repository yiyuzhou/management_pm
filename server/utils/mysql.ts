import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || '101.126.91.130',
  port: parseInt(process.env.DB_PORT || '4005'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sGq0EqkU0yAwlYEW',
  database: process.env.DB_NAME || 'voice_rdm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(config);

export async function query(sql: string, values?: any[]) {
  const [rows] = await pool.execute(sql, values);
  return rows;
}

export async function transaction<T>(callback: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export { pool };
