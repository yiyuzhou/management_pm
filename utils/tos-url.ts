export function stripTosProtocol(host: string) {
  return String(host || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

export function tosPublicBaseUrl(domain: string) {
  const host = stripTosProtocol(domain)
  return host ? `https://${host}` : ''
}
