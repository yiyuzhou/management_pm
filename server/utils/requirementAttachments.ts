export const LINK_ATTACHMENT_TYPE = 'link'

export type RequirementAttachment = {
  url: string
  filename: string
  size: number
  type: string
}

export type RequirementLink = {
  url: string
  title: string
}

export function parseAttachmentsJson(raw: any): RequirementAttachment[] {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (!raw || raw === 'null') return []
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
      return []
    }
  }
  return []
}

export function splitStoredAttachments(raw: any): { attachments: RequirementAttachment[]; links: RequirementLink[] } {
  const attachments: RequirementAttachment[] = []
  const links: RequirementLink[] = []
  for (const item of parseAttachmentsJson(raw)) {
    if (!item?.url) continue
    if (item.type === LINK_ATTACHMENT_TYPE) {
      links.push({ url: item.url, title: item.filename || item.url })
    } else {
      attachments.push(item)
    }
  }
  return { attachments, links }
}

export function mergeStoredAttachments(
  attachments?: RequirementAttachment[] | null,
  links?: RequirementLink[] | null
): RequirementAttachment[] {
  const files = (attachments || []).filter(item => item?.url && item.type !== LINK_ATTACHMENT_TYPE)
  const linkItems = (links || [])
    .filter(item => item?.url)
    .map(item => ({
      url: item.url,
      filename: item.title || item.url,
      size: 0,
      type: LINK_ATTACHMENT_TYPE
    }))
  return [...files, ...linkItems]
}
