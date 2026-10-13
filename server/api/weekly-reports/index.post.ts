import { query } from '~/server/utils/mysql';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser) {
      throw createError({ statusCode: 401, statusMessage: '未登录' });
    }

    const body = await readBody(event);
    const { completed_work, next_week_plan, summary, hours } = body;

    // 归一化日期为 YYYY-MM-DD，防止 ISO 字符串导致 MySQL 报错
    const normalizeDate = (d: any): string => {
      if (!d) return '';
      const date = new Date(d);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const week_start = normalizeDate(body.week_start);
    const week_end = normalizeDate(body.week_end);

    if (!week_start || !week_end) {
      throw createError({
        statusCode: 400,
        statusMessage: '周开始/结束日期不能为空'
      });
    }

    const user_id = currentUser.id;

    // 检查是否已存在
    const existing = await query(
      'SELECT id FROM weekly_reports WHERE user_id = ? AND week_start = ?',
      [user_id, week_start]
    ) as any[];

    let reportId: number;
    if (existing.length > 0) {
      await query(
        `UPDATE weekly_reports
         SET week_end = ?, completed_work = ?, next_week_plan = ?, summary = ?, hours = ?, status = 'submitted', submitted_at = NOW()
         WHERE id = ?`,
        [week_end, JSON.stringify(completed_work || []), JSON.stringify(next_week_plan || []), summary || '', hours || 0, existing[0].id]
      );
      reportId = existing[0].id;
    } else {
      const result = await query(
        `INSERT INTO weekly_reports (user_id, week_start, week_end, completed_work, next_week_plan, summary, hours, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())`,
        [user_id, week_start, week_end, JSON.stringify(completed_work || []), JSON.stringify(next_week_plan || []), summary || '', hours || 0]
      ) as any;
      reportId = result.insertId;
    }

    const rows = await query(
      `SELECT wr.*, u.nickname as user_name, u.avatar as user_avatar, u.role as user_role
       FROM weekly_reports wr
       LEFT JOIN users u ON wr.user_id = u.id
       WHERE wr.id = ?`,
      [reportId]
    ) as any[];

    const r = rows[0];
    let completedWork: any[] = [];
    let nextWeekPlan: any[] = [];
    try { completedWork = r.completed_work ? (typeof r.completed_work === 'string' ? JSON.parse(r.completed_work) : r.completed_work) : []; } catch { completedWork = []; }
    try { nextWeekPlan = r.next_week_plan ? (typeof r.next_week_plan === 'string' ? JSON.parse(r.next_week_plan) : r.next_week_plan) : []; } catch { nextWeekPlan = []; }

    return {
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      role: r.user_role,
      weekStart: r.week_start,
      weekEnd: r.week_end,
      completedWork,
      nextWeekPlan,
      summary: r.summary || '',
      hours: Number(r.hours) || 0,
      status: r.status,
      submittedAt: r.submitted_at
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '提交周报失败'
    });
  }
});
