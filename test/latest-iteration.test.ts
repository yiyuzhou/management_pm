import { describe, expect, it } from 'vitest'
import { pickLatestIteration } from '~/utils/latest-iteration'

describe('pickLatestIteration', () => {
  it('returns the newest by start_date then id', () => {
    const latest = pickLatestIteration([
      { id: 1, start_date: '2026-01-01' },
      { id: 3, start_date: '2026-09-01' },
      { id: 2, start_date: '2026-06-01' },
    ])
    expect(latest?.id).toBe(3)
  })

  it('returns null for empty lists', () => {
    expect(pickLatestIteration([])).toBeNull()
  })
})
