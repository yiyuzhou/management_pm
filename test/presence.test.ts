import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/server/utils/mysql', () => ({
  query: vi.fn(async () => []),
}))

import { clearPresence, isOnline, PRESENCE_TTL_MS, resetPresence, touchPresence } from '~/server/utils/presence'

describe('presence', () => {
  afterEach(() => {
    resetPresence()
  })

  it('is offline until the user is touched', () => {
    expect(isOnline(1)).toBe(false)
  })

  it('is online after touch, and offline after logout or TTL', () => {
    const now = 1_700_000_000_000
    touchPresence(1, now)
    touchPresence(2, now)

    expect(isOnline(1, now)).toBe(true)
    expect(isOnline(2, now)).toBe(true)

    clearPresence(1)
    expect(isOnline(1, now)).toBe(false)
    expect(isOnline(2, now)).toBe(true)

    expect(isOnline(2, now + PRESENCE_TTL_MS)).toBe(false)
  })
})
