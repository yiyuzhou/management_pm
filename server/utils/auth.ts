import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '~/server/utils/mysql';
import { touchPresence } from '~/server/utils/presence';
import { attachRoleContext } from '~/server/utils/roles';

const COOKIE_NAME = 'rdm_session';
const SECRET = process.env.AUTH_SECRET || 'rdm-dev-secret-key-change-in-production';

/**
 * 签名 user_id：HMAC-SHA256
 * 返回 "userId.signature" 格式的 token
 */
export function signUserId(userId: number): string {
  const payload = String(userId);
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

/**
 * 验签 token，返回 user_id 或 null
 */
export function verifyToken(token: string): number | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  if (sig !== expectedSig) return null;
  const userId = parseInt(payload);
  return isNaN(userId) ? null : userId;
}

/**
 * 从 event 的 cookie 中获取当前用户，返回用户信息或 null
 */
export async function getCurrentUser(event: any): Promise<any | null> {
  const token = getCookie(event, COOKIE_NAME);
  if (!token) return null;
  const userId = verifyToken(token);
  if (!userId) return null;

  const users = await query(
    'SELECT id, username, nickname, email, role, avatar FROM users WHERE id = ? AND status = 1',
    [userId]
  ) as any[];
  if (users.length === 0) return null;
  touchPresence(users[0].id);
  return await attachRoleContext(users[0]);
}

export const DEFAULT_RESET_PASSWORD = '123456'

/**
 * 验证密码
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * 设置 auth cookie
 */
export function setAuthCookie(event: any, userId: number) {
  const token = signUserId(userId);
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/'
  });
}

/**
 * 清除 auth cookie
 */
export function clearAuthCookie(event: any) {
  deleteCookie(event, COOKIE_NAME, { path: '/' });
}

export { COOKIE_NAME };
