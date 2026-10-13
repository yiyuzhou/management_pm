import { describe, expect, it } from 'vitest'
import { parseStoredProjectId } from '~/utils/selected-project'

describe('parseStoredProjectId', () => {
  it('accepts a positive integer', () => {
    expect(parseStoredProjectId('12')).toBe(12)
  })

  it('rejects empty or invalid values', () => {
    expect(parseStoredProjectId(null)).toBeNull()
    expect(parseStoredProjectId('')).toBeNull()
    expect(parseStoredProjectId('all')).toBeNull()
    expect(parseStoredProjectId('0')).toBeNull()
  })
})
