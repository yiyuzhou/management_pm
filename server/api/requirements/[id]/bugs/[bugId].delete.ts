import { query } from '~/server/utils/mysql'
import { authorize } from '~/server/utils/permissions'
import { insertRequirementHistory } from '~/server/utils/requirementHistory'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authorize(event, 'requirement', 'update')
    const id = getRouterParam(event, 'id')
    const bugId = getRouterParam(event, 'bugId')

    const requirements = await query(
      'SELECT id FROM requirements WHERE req_no = ? OR id = ?',
      [id, id]
    ) as any[]
    if (requirements.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '需求不存在' })
    }
    const reqId = requirements[0].id

    const bugs = await query(
      'SELECT id, bug_no, title FROM bugs WHERE (bug_no = ? OR id = ?) AND requirement_id = ?',
      [bugId, bugId, reqId]
    ) as any[]
    if (bugs.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '该 Bug 未关联此需求' })
    }

    await query(
      'UPDATE bugs SET requirement_id = NULL WHERE id = ? AND requirement_id = ?',
      [bugs[0].id, reqId]
    )
    await insertRequirementHistory(reqId, '取消关联 Bug', bugs[0].title || bugs[0].bug_no, null, currentUser.id)

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error.message || '取消关联失败' })
  }
})
