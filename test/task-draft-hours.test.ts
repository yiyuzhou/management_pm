import { describe, expect, it } from 'vitest'
import { estimatedHoursFromDates, isDueBeforeStart } from '~/utils/task-draft'

describe('estimatedHoursFromDates', () => {
  it('counts the same day as 8 hours', () => {
    expect(estimatedHoursFromDates('2026-10-22', '2026-10-22')).toBe(8)
  })

  it('counts inclusive calendar days times 8', () => {
    expect(estimatedHoursFromDates('2026-10-22', '2026-10-24')).toBe(24)
  })

  it('returns null for missing or inverted dates', () => {
    expect(estimatedHoursFromDates('', '2026-10-22')).toBeNull()
    expect(estimatedHoursFromDates('2026-10-24', '2026-10-22')).toBeNull()
  })

  it('flags due date before start date', () => {
    expect(isDueBeforeStart('2026-10-24', '2026-10-22')).toBe(true)
    expect(isDueBeforeStart('2026-10-22', '2026-10-22')).toBe(false)
    expect(isDueBeforeStart('2026-10-22', '')).toBe(false)
  })
})
