import { query } from '~/server/utils/mysql';
import { getCurrentUser } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    if (!await getCurrentUser(event)) {
      throw createError({ statusCode: 401, statusMessage: '未登录' });
    }
    const queryParams = getQuery(event);
    const { userId, weekStart } = queryParams;

    let sql = `
      SELECT wr.*,
             u.nickname as user_name,
             u.avatar as user_avatar,
             u.role as user_role
      FROM weekly_reports wr
      LEFT JOIN users u ON wr.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      sql += ' AND wr.user_id = ?';
      params.push(userId);
    }

    if (weekStart) {
      sql += ' AND wr.week_start = ?';
      params.push(weekStart);
    }

    sql += ' ORDER BY wr.week_start DESC, wr.created_at DESC';

    // When no specific week is requested, limit to recent 8 weeks
    // so the "历史周报" sidebar renders a bounded list.
    if (!weekStart) {
      sql += ' LIMIT 8';
    }

    const reports = await query(sql, params) as any[];

    return reports.map(r => {
      let completedWork: any[] = [];
      let nextWeekPlan: any[] = [];
      try { completedWork = r.completed_work ? (typeof r.completed_work === 'string' ? JSON.parse(r.completed_work) : r.completed_work) : []; } catch { completedWork = []; }
      try { nextWeekPlan = r.next_week_plan ? (typeof r.next_week_plan === 'string' ? JSON.parse(r.next_week_plan) : r.next_week_plan) : []; } catch { nextWeekPlan = []; }
      return {
        id: r.id,
        userId: r.user_id,
        userName: r.user_name || '未知',
        userAvatar: r.user_avatar,
        role: r.user_role,
        weekStart: r.week_start,
        weekEnd: r.week_end,
        completedWork,
        nextWeekPlan,
        summary: r.summary || '',
        hours: Number(r.hours) || 0,
        status: r.status,
        submittedAt: r.submitted_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };
    });
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '获取周报列表失败'
    });
  }
});
