export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isFeishuUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase()
    return host.includes('feishu.cn') || host.includes('larkoffice.com') || host.includes('larksuite.com')
  } catch {
    return false
  }
}

export function inferLinkTitle(url: string) {
  try {
    const parsed = new URL(url.trim())
    const path = parsed.pathname
    if (isFeishuUrl(url)) {
      if (path.includes('/docx/')) return '飞书文档'
      if (path.includes('/wiki/')) return '飞书知识库'
      if (path.includes('/sheets/')) return '飞书表格'
      if (path.includes('/base/')) return '飞书多维表格'
      if (path.includes('/file/')) return '飞书文件'
      if (path.includes('/drive/')) return '飞书云文档'
      return '飞书文档'
    }
    return parsed.hostname.replace(/^www\./, '') || url
  } catch {
    return url
  }
}
