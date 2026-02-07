import { describe, it, expect } from 'vitest'
import { computeOverdue } from '../overdue'

describe('computeOverdue', () => {
  it('returns overdue result when task is incomplete and past deadline', () => {
    const result = computeOverdue('2025-01-10', '2025-01-15', false)
    expect(result).toEqual({
      effectiveDeadline: '2025-01-15',
      originalDeadline: '2025-01-10',
      daysOverdue: 5,
      isOverdue: true,
    })
  })

  it('returns non-overdue when deadline is today', () => {
    const result = computeOverdue('2025-01-15', '2025-01-15', false)
    expect(result).toEqual({
      effectiveDeadline: '2025-01-15',
      originalDeadline: '2025-01-15',
      daysOverdue: 0,
      isOverdue: false,
    })
  })

  it('returns non-overdue when deadline is in the future', () => {
    const result = computeOverdue('2025-01-20', '2025-01-15', false)
    expect(result).toEqual({
      effectiveDeadline: '2025-01-20',
      originalDeadline: '2025-01-20',
      daysOverdue: 0,
      isOverdue: false,
    })
  })

  it('returns non-overdue for completed task with past deadline', () => {
    const result = computeOverdue('2025-01-10', '2025-01-15', true)
    expect(result).toEqual({
      effectiveDeadline: '2025-01-10',
      originalDeadline: '2025-01-10',
      daysOverdue: 0,
      isOverdue: false,
    })
  })

  it('returns non-overdue for completed task with future deadline', () => {
    const result = computeOverdue('2025-01-20', '2025-01-15', true)
    expect(result).toEqual({
      effectiveDeadline: '2025-01-20',
      originalDeadline: '2025-01-20',
      daysOverdue: 0,
      isOverdue: false,
    })
  })

  it('handles 1-day overdue boundary correctly', () => {
    const result = computeOverdue('2025-01-14', '2025-01-15', false)
    expect(result).toEqual({
      effectiveDeadline: '2025-01-15',
      originalDeadline: '2025-01-14',
      daysOverdue: 1,
      isOverdue: true,
    })
  })

  it('handles large overdue amounts correctly', () => {
    const result = computeOverdue('2025-01-01', '2025-02-01', false)
    expect(result).toEqual({
      effectiveDeadline: '2025-02-01',
      originalDeadline: '2025-01-01',
      daysOverdue: 31,
      isOverdue: true,
    })
  })
})
