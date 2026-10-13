import { query } from '~/server/utils/mysql';
import { verifyPassword, setAuthCookie } from '~/server/utils/auth';
import { touchPresence } from '~/server/utils/presence';
import { attachRoleContext } from '~/server/utils/roles';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, password } = body;

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户名和密码不能为空'
      });
    }

    const users = await query(
      `SELECT id, username, nickname, email, role, avatar, password_hash
       FROM users
       WHERE username = ? AND status = 1`,
      [username]
    ) as any[];

    if (users.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误'
      });
    }

    const user = users[0];

    if (!verifyPassword(password, user.password_hash)) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户名或密码错误'
      });
    }

    // 设置签名 cookie
    setAuthCookie(event, user.id);
    touchPresence(user.id);

    // 返回用户信息（不包含密码）
    const { password_hash, ...userInfo } = user;
    return await attachRoleContext(userInfo);
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '登录失败'
    });
  }
});
