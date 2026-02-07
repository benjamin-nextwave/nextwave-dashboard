import { describe, it, expect } from 'vitest'
import { generateDefaultTasks, DEFAULT_TASKS } from '../default-tasks'

describe('DEFAULT_TASKS', () => {
  it('contains exactly 6 task definitions', () => {
    expect(DEFAULT_TASKS).toHaveLength(6)
  })

  it('has sequential dayOffset values 0 through 5', () => {
    const offsets = DEFAULT_TASKS.map((t) => t.dayOffset)
    expect(offsets).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('only the onboarding call task (index 1) has is_date_editable true', () => {
    DEFAULT_TASKS.forEach((task, index) => {
      if (index === 1) {
        expect(task.is_date_editable).toBe(true)
      } else {
        expect(task.is_date_editable).toBe(false)
      }
    })
  })

  it('has the correct titles in order', () => {
    const titles = DEFAULT_TASKS.map((t) => t.title)
    expect(titles).toEqual([
      'Create email templates',
      'Have an onboarding call',
      'Buy custom domains and mailboxes, place in warmup tool',
      'Create an RLM',
      'Create follow-up mails',
      'Create a dashboard',
    ])
  })
})

describe('generateDefaultTasks', () => {
  const companyId = 'abc-123'
  const warmupStartDate = '2026-03-01'

  it('returns exactly 6 tasks', () => {
    const tasks = generateDefaultTasks(companyId, warmupStartDate)
    expect(tasks).toHaveLength(6)
  })

  it('assigns the correct company_id to all tasks', () => {
    const tasks = generateDefaultTasks(companyId, warmupStartDate)
    tasks.forEach((task) => {
      expect(task.company_id).toBe('abc-123')
    })
  })

  it('generates correct titles in order', () => {
    const tasks = generateDefaultTasks(companyId, warmupStartDate)
    expect(tasks.map((t) => t.title)).toEqual([
      'Create email templates',
      'Have an onboarding call',
      'Buy custom domains and mailboxes, place in warmup tool',
      'Create an RLM',
      'Create follow-up mails',
      'Create a dashboard',
    ])
  })

  it('generates deadlines starting at warmup_start_date with 1-day increments', () => {
    const tasks = generateDefaultTasks(companyId, warmupStartDate)
    expect(tasks.map((t) => t.deadline)).toEqual([
      '2026-03-01',
      '2026-03-02',
      '2026-03-03',
      '2026-03-04',
      '2026-03-05',
      '2026-03-06',
    ])
  })

  it('sets all tasks as not completed', () => {
    const tasks = generateDefaultTasks(companyId, warmupStartDate)
    tasks.forEach((task) => {
      expect(task.is_completed).toBe(false)
    })
  })

  it('sets all tasks as not urgent', () => {
    const tasks = generateDefaultTasks(companyId, warmupStartDate)
    tasks.forEach((task) => {
      expect(task.is_urgent).toBe(false)
    })
  })

  it('sets notes to null for all tasks', () => {
    const tasks = generateDefaultTasks(companyId, warmupStartDate)
    tasks.forEach((task) => {
      expect(task.notes).toBeNull()
    })
  })

  it('only the onboarding call (index 1) has is_date_editable true', () => {
    const tasks = generateDefaultTasks(companyId, warmupStartDate)
    tasks.forEach((task, index) => {
      if (index === 1) {
        expect(task.is_date_editable).toBe(true)
      } else {
        expect(task.is_date_editable).toBe(false)
      }
    })
  })

  it('handles month boundary correctly (Jan 30 spans into Feb)', () => {
    const tasks = generateDefaultTasks('test-co', '2026-01-30')
    expect(tasks.map((t) => t.deadline)).toEqual([
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
      '2026-02-02',
      '2026-02-03',
      '2026-02-04',
    ])
  })

  it('handles year boundary correctly (Dec 29 spans into next year)', () => {
    const tasks = generateDefaultTasks('test-co', '2025-12-29')
    expect(tasks.map((t) => t.deadline)).toEqual([
      '2025-12-29',
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ])
  })

  it('produces the exact expected output for the reference case', () => {
    const tasks = generateDefaultTasks('abc-123', '2026-03-01')
    expect(tasks).toEqual([
      {
        company_id: 'abc-123',
        title: 'Create email templates',
        deadline: '2026-03-01',
        is_completed: false,
        is_urgent: false,
        is_date_editable: false,
        notes: null,
      },
      {
        company_id: 'abc-123',
        title: 'Have an onboarding call',
        deadline: '2026-03-02',
        is_completed: false,
        is_urgent: false,
        is_date_editable: true,
        notes: null,
      },
      {
        company_id: 'abc-123',
        title: 'Buy custom domains and mailboxes, place in warmup tool',
        deadline: '2026-03-03',
        is_completed: false,
        is_urgent: false,
        is_date_editable: false,
        notes: null,
      },
      {
        company_id: 'abc-123',
        title: 'Create an RLM',
        deadline: '2026-03-04',
        is_completed: false,
        is_urgent: false,
        is_date_editable: false,
        notes: null,
      },
      {
        company_id: 'abc-123',
        title: 'Create follow-up mails',
        deadline: '2026-03-05',
        is_completed: false,
        is_urgent: false,
        is_date_editable: false,
        notes: null,
      },
      {
        company_id: 'abc-123',
        title: 'Create a dashboard',
        deadline: '2026-03-06',
        is_completed: false,
        is_urgent: false,
        is_date_editable: false,
        notes: null,
      },
    ])
  })
})
