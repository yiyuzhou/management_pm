import { query } from '~/server/utils/mysql';
import bcrypt from 'bcryptjs';
import { authorize } from '~/server/utils/permissions';
import { assertRoleExists } from '~/server/utils/roles';

export default defineEventHandler(async (event) => {
  try {
    await authorize(event, 'user', 'create');
    const body = await readBody(event);
    const { username, password, nickname, email, role } = body;

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名和密码不能为空'
      });
    }

    // 检查用户名是否已存在
    const existing = await query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    ) as any[];

    if (existing.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: '用户名已存在'
      });
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      ) as any[];

      if (existingEmail.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: '邮箱已存在'
        });
      }
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userRole = role || 'developer';
    await assertRoleExists(userRole);
    const userEmail = email || `${username}@team.com`;
    const userNickname = nickname || username;

    const result = await query(
      `INSERT INTO users (username, email, password_hash, nickname, role, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [username, userEmail, passwordHash, userNickname, userRole]
    ) as any;

    return {
      id: result.insertId,
      username,
      email: userEmail,
      nickname: userNickname,
      role: userRole,
      message: '成员添加成功'
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '添加成员失败'
    });
  }
});
