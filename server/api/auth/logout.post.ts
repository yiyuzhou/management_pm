import { clearAuthCookie, getCurrentUser } from '~/server/utils/auth';
import { clearPresence } from '~/server/utils/presence';

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event);
  if (user?.id) clearPresence(user.id);
  clearAuthCookie(event);
  return { message: '已退出登录' };
});
