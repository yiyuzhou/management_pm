import { describe, expect, it } from 'vitest'
import { niceMax } from '~/utils/dashboard-chart'

describe('dashboard chart scale', () => {
  it('rounds empty and typical maxima to readable ticks', () => {
    expect(niceMax(0)).toBe(4)
    expect(niceMax(3)).toBeGreaterThanOrEqual(3)
    expect(niceMax(12)).toBeGreaterThanOrEqual(12)
  })
})
