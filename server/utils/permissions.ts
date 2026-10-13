import { getCurrentUser } from '~/server/utils/auth';
import { query } from '~/server/utils/mysql';
import { permissionRoleOf } from '~/server/utils/roles';
import { scopesFromStaticMatrix, type PermissionMap } from '~/utils/permission-matrix';
import { isTaskAssignee } from '~/server/utils/taskAssignees';

export type Role = 'admin' | 'pm' | 'project_manager' | 'developer' | 'tester';

export type Resource = 'project' | 'requirement' | 'task' | 'bug' | 'iteration' | 'prototype' | 'weekly_report' | 'user';
export type Action = 'create' | 'read' | 'update' | 'delete';

/**
 * Own Resource 的资源类型 → 数据库表和 owner 字段映射
 */
const OWN_RESOURCE_CONFIG: Record<string, { table: string; ownerFields: string[] }> = {
  task:          { table: 'tasks',          ownerFields: ['creator_id', 'assignee_id'] },
  bug:           { table: 'bugs',           ownerFields: ['reporter_id', 'assignee_id'] },
  weekly_report: { table: 'weekly_reports', ownerFields: ['user_id'] },
};

/**
 * 后端鉴权：检查当前用户角色是否在允许列表中
 * 未登录抛 401，角色不匹配抛 403
 */
export async function requireRole(event: any, allowedRoles: Role[]): Promise<any> {
  const user = await getCurrentUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: '未登录'
    });
  }
  if (!allowedRoles.includes(permissionRoleOf(user))) {
    throw createError({
      statusCode: 403,
      statusMessage: '无权限执行此操作'
    });
  }
  return user;
}

/**
 * 检查用户是否是某个资源的创建者或负责人
 */
export async function isOwnResource(
  userId: number,
  resource: string,
  resourceId: string | number
): Promise<boolean> {
  const config = OWN_RESOURCE_CONFIG[resource];
  if (!config) return false;

  const rows = await query(
    `SELECT ${config.ownerFields.join(', ')} FROM ${config.table} WHERE id = ?`,
    [resourceId]
  ) as any[];

  if (rows.length === 0) return false;
  const row = rows[0];
  if (config.ownerFields.some(field => row[field] === userId)) return true;
  if (resource === 'task') return await isTaskAssignee(Number(resourceId), userId);
  return false;
}

/**
 * 综合鉴权：先检查全局角色权限，不通过则检查 own resource 权限
 * 用于 task/bug/weekly_report 等有 own 权限的 update 操作
 */
function resolveScope(user: any, resource: Resource, action: Action): 'all' | 'own' | undefined {
  const key = `${resource}:${action}`;
  const stored: PermissionMap | undefined = user?.permissions;
  if (stored) return stored[key];
  return scopesFromStaticMatrix(permissionRoleOf(user))[key];
}

export async function authorize(
  event: any,
  resource: Resource,
  action: Action,
  resourceId?: string | number
): Promise<any> {
  const user = await getCurrentUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未登录' });
  }

  const scope = resolveScope(user, resource, action);
  if (scope === 'all') return user;
  if (scope === 'own' && resourceId) {
    const isOwn = await isOwnResource(user.id, resource, resourceId);
    if (isOwn) return user;
  }

  throw createError({
    statusCode: 403,
    statusMessage: '无权限执行此操作'
  });
}
