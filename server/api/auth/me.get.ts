import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await getCurrentUser(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '未登录'
      });
    }
    return user;
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取用户信息失败'
    });
  }
});
