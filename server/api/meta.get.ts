import { query } from '~/server/utils/mysql';
import { getCurrentUser } from '~/server/utils/auth';
import { canViewAllProjects } from '~/server/utils/projectAccess';

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: '未登录' });
    }
    const queryParams = getQuery(event);
    const { projectId } = queryParams;

    const pid = projectId ? parseInt(projectId as string) : null;

    // 需求池角标：不含已完成
    let reqCountSql = "SELECT COUNT(*) as count FROM requirements r WHERE r.status != 'completed'";
    const reqCountParams: any[] = [];
    if (pid !== null) {
      reqCountSql += ' AND r.project_id = ?';
      reqCountParams.push(pid);
    }
    const [reqResult] = await query(reqCountSql, reqCountParams) as any[];

    let bugCountSql = `SELECT COUNT(*) as count FROM bugs b
      WHERE b.assignee_id = ? AND b.status NOT IN (?, ?, ?)`;
    const bugCountParams: any[] = [currentUser.id, 'fixed', 'verified', 'closed'];
    if (pid !== null) {
      bugCountSql += ' AND b.project_id = ?';
      bugCountParams.push(pid);
    }
    const [bugResult] = await query(bugCountSql, bugCountParams) as any[];

    let taskCountSql = `SELECT COUNT(*) as count FROM tasks t
      WHERE t.assignee_id = ? AND t.status != ?`;
    const taskCountParams: any[] = [currentUser.id, 'done'];
    if (pid !== null) {
      taskCountSql += ' AND t.project_id = ?';
      taskCountParams.push(pid);
    }
    const [taskResult] = await query(taskCountSql, taskCountParams) as any[];

    // 获取状态统计
    let statusSql = 'SELECT status, COUNT(*) as count FROM requirements r WHERE 1=1';
    const statusParams: any[] = [];
    if (pid !== null) {
      statusSql += ' AND r.project_id = ?';
      statusParams.push(pid);
    }
    statusSql += ' GROUP BY status';
    const statusRows = await query(statusSql, statusParams) as any[];
    const statusCounts: Record<string, number> = {};
    for (const row of statusRows) {
      statusCounts[row.status] = row.count;
    }

    // 获取用户列表（projectId 存在时按项目成员过滤）
    let usersSql: string;
    let usersParams: any[] = [];
    if (pid !== null) {
      usersSql = `SELECT DISTINCT u.id, u.nickname as name, u.nickname, u.avatar, u.role
        FROM users u
        INNER JOIN project_members pm ON u.id = pm.user_id
        WHERE u.status = 1 AND pm.project_id = ?`;
      usersParams = [pid];
    } else {
      usersSql = 'SELECT id, nickname as name, nickname, avatar, role FROM users WHERE status = 1';
    }
    const users = await query(usersSql, usersParams);

    let projectsSql = 'SELECT id, name, description, status, color FROM projects WHERE status IN (?, ?)';
    const projectsParams: any[] = ['active', 'planning'];
    if (!canViewAllProjects(currentUser)) {
      projectsSql += ` AND (owner_id = ? OR id IN (SELECT project_id FROM project_members WHERE user_id = ?))`;
      projectsParams.push(currentUser.id, currentUser.id);
    }
    const projects = await query(projectsSql, projectsParams);

    // 获取迭代列表（projectId 存在时按项目过滤）
    let iterSql = 'SELECT id, name, status, start_date, end_date FROM iterations i WHERE i.status IN (?, ?)';
    const iterParams: any[] = ['planning', 'active'];
    if (pid !== null) {
      iterSql += ' AND i.project_id = ?';
      iterParams.push(pid);
    }
    const iterations = await query(iterSql, iterParams);

    // 获取模块列表（从 requirements 表去重，projectId 存在时按项目过滤）
    let moduleSql = 'SELECT DISTINCT module as name FROM requirements r WHERE r.module IS NOT NULL AND r.module != ""';
    const moduleParams: any[] = [];
    if (pid !== null) {
      moduleSql += ' AND r.project_id = ?';
      moduleParams.push(pid);
    }
    const moduleRows = await query(moduleSql, moduleParams) as any[];
    const modules = moduleRows.map((m: any, i: number) => ({ id: String(i + 1), name: m.name }));

    return {
      totalCount: reqResult.count,
      myBugCount: bugResult?.count || 0,
      myTaskCount: taskResult?.count || 0,
      users,
      projects,
      iterations,
      modules,
      statusCounts
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取元数据失败'
    });
  }
});
