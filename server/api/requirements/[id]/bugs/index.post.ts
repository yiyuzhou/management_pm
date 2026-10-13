import { query } from '~/server/utils/mysql'
import { authorize } from '~/server/utils/permissions'
import { insertRequirementHistory } from '~/server/utils/requirementHistory'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authorize(event, 'requirement', 'update')
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const bugKey = body?.bug_id ?? body?.id

    if (bugKey == null || bugKey === '') {
      throw createError({ statusCode: 400, statusMessage: '请选择要关联的 Bug' })
    }

    const requirements = await query(
      'SELECT id, iteration_id FROM requirements WHERE req_no = ? OR id = ?',
      [id, id]
    ) as any[]
    if (requirements.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '需求不存在' })
    }
    const reqId = requirements[0].id

    const bugs = await query(
      'SELECT id, bug_no, title, requirement_id FROM bugs WHERE bug_no = ? OR id = ?',
      [bugKey, bugKey]
    ) as any[]
    if (bugs.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Bug不存在' })
    }
    const bug = bugs[0]
    if (String(bug.requirement_id || '') === String(reqId)) {
      return { success: true, id: bug.bug_no, bug_id: bug.id }
    }

    const fields = ['requirement_id = ?']
    const values: any[] = [reqId]
    if (requirements[0].iteration_id) {
      fields.push('iteration_id = COALESCE(iteration_id, ?)')
      values.push(requirements[0].iteration_id)
    }
    values.push(bug.id)
    await query(`UPDATE bugs SET ${fields.join(', ')} WHERE id = ?`, values)
    await insertRequirementHistory(reqId, '关联 Bug', null, bug.title || bug.bug_no, currentUser.id)

    return { success: true, id: bug.bug_no, bug_id: bug.id }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || '关联 Bug 失败' })
  }
})
