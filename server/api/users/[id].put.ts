import { query } from '~/server/utils/mysql';
import { authorize } from '~/server/utils/permissions';
import { isOnline } from '~/server/utils/presence';
import { assertRoleExists } from '~/server/utils/roles';

export default defineEventHandler(async (event) => {
  try {
    // 鉴权：只有管理员可以更新用户信息
    await authorize(event, 'user', 'update');

    const id = getRouterParam(event, 'id');
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户ID不能为空'
      });
    }

    const body = await readBody(event);
    const { nickname, username, role, email, status } = body;

    // 检查用户是否存在
    const existingUsers = await query(
      'SELECT id FROM users WHERE id = ?',
      [parseInt(id)]
    ) as any[];

    if (existingUsers.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      });
    }

    // 构建更新字段
    const updates: string[] = [];
    const values: any[] = [];

    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (role !== undefined) {
      await assertRoleExists(role);
      updates.push('role = ?');
      values.push(role);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有要更新的字段'
      });
    }

    // 执行更新
    values.push(parseInt(id));
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // 返回更新后的用户信息
    const updatedUsers = await query(
      'SELECT id, username, nickname, email, role, avatar, status, created_at FROM users WHERE id = ?',
      [parseInt(id)]
    ) as any[];

    const u = updatedUsers[0];
    return {
      id: u.id,
      name: u.nickname || u.username,
      nickname: u.nickname,
      username: u.username,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      status: u.status,
      online: isOnline(u.id),
      created_at: u.created_at
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '更新用户失败'
    });
  }
});
