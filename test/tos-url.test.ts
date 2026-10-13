import { describe, expect, it } from 'vitest'
import { stripTosProtocol, tosPublicBaseUrl } from '~/utils/tos-url'

describe('tos url helpers', () => {
  it('strips http(s) so the SDK never receives a protocol in endpoint', () => {
    expect(stripTosProtocol('http://tos-cn-guangzhou.volces.com')).toBe('tos-cn-guangzhou.volces.com')
    expect(stripTosProtocol('https://tos-cn-guangzhou.volces.com/')).toBe('tos-cn-guangzhou.volces.com')
    expect(stripTosProtocol('tos-cn-guangzhou.volces.com')).toBe('tos-cn-guangzhou.volces.com')
  })

  it('always builds https public URLs', () => {
    expect(tosPublicBaseUrl('http://dev-1321001571.tos-cn-guangzhou.volces.com')).toBe(
      'https://dev-1321001571.tos-cn-guangzhou.volces.com'
    )
  })
})
