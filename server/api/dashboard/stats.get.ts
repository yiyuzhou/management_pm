import { query } from '~/server/utils/mysql';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: '未登录' });
    }
    const queryParams = getQuery(event);
    const { projectId } = queryParams;

    // 构建 project 过滤条件
    const reqProjectFilter = projectId ? 'AND r.project_id = ?' : '';
    const taskProjectFilter = projectId ? 'AND t.project_id = ?' : '';
    const bugProjectFilter = projectId ? 'AND b.project_id = ?' : '';
    const iterProjectFilter = projectId ? 'AND i.project_id = ?' : '';
    const params: any[] = [];

    // 统计数据
    let reqStatsSql = 'SELECT COUNT(*) as count FROM requirements r WHERE 1=1';
    let taskStatsSql = 'SELECT COUNT(*) as count FROM tasks t WHERE t.status != ?';
    let doneTaskStatsSql = 'SELECT COUNT(*) as count FROM tasks t WHERE t.status = ?';
    let bugStatsSql = 'SELECT COUNT(*) as count FROM bugs b WHERE b.status NOT IN (?, ?, ?)';

    if (projectId) {
      reqStatsSql += ` AND r.project_id = ?`;
      taskStatsSql += ` AND t.project_id = ?`;
      doneTaskStatsSql += ` AND t.project_id = ?`;
      bugStatsSql += ` AND b.project_id = ?`;
    }

    const [reqStats] = await query(reqStatsSql, projectId ? [parseInt(projectId as string)] : []) as any[];
    const [taskStats] = await query(taskStatsSql, projectId ? ['done', parseInt(projectId as string)] : ['done']) as any[];
    const [doneTaskStats] = await query(doneTaskStatsSql, projectId ? ['done', parseInt(projectId as string)] : ['done']) as any[];
    const [bugStats] = await query(bugStatsSql, projectId ? ['fixed', 'verified', 'closed', parseInt(projectId as string)] : ['fixed', 'verified', 'closed']) as any[];

    // 需求状态分布
    let reqStatusSql = `SELECT status, COUNT(*) as count FROM requirements r WHERE 1=1`;
    if (projectId) {
      reqStatusSql += ` AND r.project_id = ?`;
    }
    reqStatusSql += ` GROUP BY status`;
    const reqStatusDistribution = await query(reqStatusSql, projectId ? [parseInt(projectId as string)] : []) as any[];

    // 最新一次迭代的需求完成进度
    let iterationProgress = null;
    let iterSql = `SELECT id, name, status, start_date, end_date FROM iterations i WHERE 1=1`;
    if (projectId) {
      iterSql += ` AND i.project_id = ?`;
    }
    iterSql += ` ORDER BY COALESCE(i.start_date, i.created_at) DESC, i.id DESC LIMIT 1`;
    const iterations = await query(iterSql, projectId ? [parseInt(projectId as string)] : []) as any[];
    if (iterations.length > 0) {
      const iter = iterations[0];
      let iterReqsSql = `SELECT COUNT(*) as total, SUM(CASE WHEN status IN (?, ?) THEN 1 ELSE 0 END) as done FROM requirements WHERE iteration_id = ?`;
      const iterReqsParams: any[] = ['completed', 'closed', iter.id];
      if (projectId) {
        iterReqsSql += ' AND project_id = ?';
        iterReqsParams.push(parseInt(projectId as string));
      }
      const [iterReqs] = await query(iterReqsSql, iterReqsParams) as any[];
      const total = Number(iterReqs?.total) || 0;
      const done = Number(iterReqs?.done) || 0;
      iterationProgress = {
        name: iter.name,
        startDate: iter.start_date,
        endDate: iter.end_date,
        total,
        done,
        progress: total > 0 ? Math.round((done / total) * 100) : 0
      };
    }

    // 最近动态（需求 + 任务 + Bug，取最近10条）
    let reqActivitySql = `SELECT 'requirement' as type, r.title, r.created_at, u.nickname as user_name, '创建了需求' as action
       FROM requirements r
       LEFT JOIN users u ON r.creator_id = u.id
       WHERE 1=1`;
    let taskActivitySql = `SELECT 'task' as type, t.title, t.created_at, u.nickname as user_name, '完成了任务' as action
       FROM tasks t
       LEFT JOIN users u ON t.creator_id = u.id
       WHERE 1=1`;
    let bugActivitySql = `SELECT 'bug' as type, b.title, b.created_at, u.nickname as user_name, '提交了Bug' as action
       FROM bugs b
       LEFT JOIN users u ON b.reporter_id = u.id
       WHERE 1=1`;

    if (projectId) {
      reqActivitySql += ` AND r.project_id = ?`;
      taskActivitySql += ` AND t.project_id = ?`;
      bugActivitySql += ` AND b.project_id = ?`;
    }

    const pid = projectId ? parseInt(projectId as string) : null;
    const recentActivities = await query(`
      (${reqActivitySql} ORDER BY r.created_at DESC LIMIT 5)
      UNION ALL
      (${taskActivitySql} ORDER BY t.created_at DESC LIMIT 5)
      UNION ALL
      (${bugActivitySql} ORDER BY b.created_at DESC LIMIT 5)
      ORDER BY created_at DESC
      LIMIT 10
    `, pid !== null ? [pid, pid, pid] : []) as any[];

    let iterationReqSql = `SELECT i.id, i.name, i.start_date, i.created_at,
              COUNT(r.id) AS total,
              SUM(CASE WHEN r.status IN ('completed', 'closed') THEN 1 ELSE 0 END) AS done
         FROM iterations i
         LEFT JOIN requirements r ON r.iteration_id = i.id`
    const iterationReqParams: any[] = []
    if (projectId) {
      iterationReqSql += ' WHERE i.project_id = ?'
      iterationReqParams.push(parseInt(projectId as string))
    }
    iterationReqSql += ` GROUP BY i.id, i.name, i.start_date, i.created_at
       ORDER BY COALESCE(i.start_date, i.created_at) DESC, i.id DESC
       LIMIT 8`
    const iterationRows = await query(iterationReqSql, iterationReqParams) as any[]
    const iterationRequirements = [...iterationRows].reverse().map(row => ({
      id: row.id,
      name: row.name,
      total: Number(row.total) || 0,
      done: Number(row.done) || 0
    }))

    // 当前用户待办：未完成任务 + 未修复/未验证/未关闭 Bug
    let todos: any[] = [];
    if (currentUser) {
      const pidVal = projectId ? parseInt(projectId as string) : null;
      let todoSql = `SELECT t.id, t.task_no, t.title, t.status, t.priority, t.type, t.due_date, t.created_at, t.requirement_id
         FROM tasks t
         WHERE t.assignee_id = ? AND t.status != 'done'`;
      const todoParams: any[] = [currentUser.id];
      if (pidVal !== null) {
        todoSql += ` AND t.project_id = ?`;
        todoParams.push(pidVal);
      }
      todoSql += ` ORDER BY t.created_at ASC`;
      const taskTodos = await query(todoSql, todoParams) as any[];

      let bugTodoSql = `SELECT b.id, b.bug_no, b.title, b.status, b.priority, b.created_at
         FROM bugs b
         WHERE b.assignee_id = ? AND b.status NOT IN (?, ?, ?)`;
      const bugTodoParams: any[] = [currentUser.id, 'fixed', 'verified', 'closed'];
      if (pidVal !== null) {
        bugTodoSql += ` AND b.project_id = ?`;
        bugTodoParams.push(pidVal);
      }
      bugTodoSql += ` ORDER BY b.created_at ASC`;
      const bugTodos = await query(bugTodoSql, bugTodoParams) as any[];

      const bugPriorityToTask: Record<string, string> = {
        p0: 'urgent',
        p1: 'high',
        p2: 'medium',
        p3: 'low'
      };
      const rank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

      todos = [
        ...taskTodos.map(t => ({
          id: t.task_no,
          task_id: t.id,
          requirement_id: t.requirement_id || null,
          title: t.title,
          priority: t.priority,
          type: t.type,
          time: t.due_date || t.created_at,
          kind: 'task'
        })),
        ...bugTodos.map(b => ({
          id: b.bug_no,
          task_id: b.id,
          requirement_id: null,
          title: b.title,
          priority: bugPriorityToTask[b.priority] || 'medium',
          type: 'bug',
          time: b.created_at,
          kind: 'bug'
        }))
      ].sort((a, b) => {
        const ra = rank[a.priority] ?? 4;
        const rb = rank[b.priority] ?? 4;
        if (ra !== rb) return ra - rb;
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      }).slice(0, 8);
    }

    return {
      stats: {
        requirements: reqStats?.count || 0,
        pendingTasks: taskStats?.count || 0,
        doneTasks: doneTaskStats?.count || 0,
        openBugs: bugStats?.count || 0
      },
      requirementStatus: reqStatusDistribution,
      iterationProgress,
      iterationRequirements,
      recentActivities: recentActivities.map(a => ({
        type: a.type,
        user: a.user_name || '系统',
        action: a.action || '',
        target: a.title || '',
        time: a.created_at
      })),
      todos
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取统计数据失败'
    });
  }
});
