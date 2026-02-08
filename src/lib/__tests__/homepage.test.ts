import { describe, it, expect } from 'vitest'
import { computeOverdue } from '../overdue'
import type { Task } from '@/types/database'
import type { TaskWithCompany, TodayTask } from '../homepage'
import { filterTodayTasks, sortTodayTasks } from '../homepage'

/** Helper: create a minimal TaskWithCompany fixture */
function makeTask(overrides: Partial<Task> & { title: string; deadline: string }): TaskWithCompany {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title,
    deadline: overrides.deadline,
    is_completed: overrides.is_completed ?? false,
    is_urgent: overrides.is_urgent ?? false,
    is_date_editable: overrides.is_date_editable ?? true,
    company_id: overrides.company_id ?? 'company-1',
    notes: overrides.notes ?? null,
    created_at: overrides.created_at ?? '2025-01-01T00:00:00Z',
    company_name: 'Test BV',
  }
}

/** Helper: create a TodayTask from a TaskWithCompany and a reference date */
function makeTodayTask(task: TaskWithCompany, today: string): TodayTask {
  return {
    task,
    companyName: task.company_name,
    overdue: computeOverdue(task.deadline, today, task.is_completed),
  }
}

const TODAY = '2025-02-10'

describe('sortTodayTasks', () => {
  it('returns empty array for empty input', () => {
    expect(sortTodayTasks([])).toEqual([])
  })

  it('sorts incomplete tasks above completed tasks', () => {
    const completed = makeTodayTask(
      makeTask({ title: 'AAA Completed', deadline: TODAY, is_completed: true }),
      TODAY
    )
    const incomplete = makeTodayTask(
      makeTask({ title: 'ZZZ Incomplete', deadline: TODAY, is_completed: false }),
      TODAY
    )
    const result = sortTodayTasks([completed, incomplete])
    expect(result[0].task.is_completed).toBe(false)
    expect(result[1].task.is_completed).toBe(true)
  })

  it('sorts urgent incomplete tasks above non-urgent incomplete tasks', () => {
    const nonUrgent = makeTodayTask(
      makeTask({ title: 'AAA Non-urgent', deadline: TODAY, is_urgent: false }),
      TODAY
    )
    const urgent = makeTodayTask(
      makeTask({ title: 'ZZZ Urgent', deadline: TODAY, is_urgent: true }),
      TODAY
    )
    const result = sortTodayTasks([nonUrgent, urgent])
    expect(result[0].task.is_urgent).toBe(true)
    expect(result[1].task.is_urgent).toBe(false)
  })

  it('sorts most overdue first among non-urgent incomplete tasks', () => {
    const lessOverdue = makeTodayTask(
      makeTask({ title: 'AAA Less overdue', deadline: '2025-02-08' }),
      TODAY
    )
    const moreOverdue = makeTodayTask(
      makeTask({ title: 'ZZZ More overdue', deadline: '2025-02-05' }),
      TODAY
    )
    const result = sortTodayTasks([lessOverdue, moreOverdue])
    expect(result[0].task.title).toBe('ZZZ More overdue')
    expect(result[1].task.title).toBe('AAA Less overdue')
  })

  it('sorts alphabetically by title when urgency and overdue days are equal', () => {
    const taskB = makeTodayTask(
      makeTask({ title: 'Bravo taak', deadline: TODAY }),
      TODAY
    )
    const taskA = makeTodayTask(
      makeTask({ title: 'Alpha taak', deadline: TODAY }),
      TODAY
    )
    const taskC = makeTodayTask(
      makeTask({ title: 'Charlie taak', deadline: TODAY }),
      TODAY
    )
    const result = sortTodayTasks([taskC, taskA, taskB])
    expect(result.map((t) => t.task.title)).toEqual([
      'Alpha taak',
      'Bravo taak',
      'Charlie taak',
    ])
  })

  it('does not mutate the input array', () => {
    const tasks = [
      makeTodayTask(makeTask({ title: 'B', deadline: TODAY }), TODAY),
      makeTodayTask(makeTask({ title: 'A', deadline: TODAY }), TODAY),
    ]
    const original = [...tasks]
    sortTodayTasks(tasks)
    expect(tasks[0].task.title).toBe(original[0].task.title)
    expect(tasks[1].task.title).toBe(original[1].task.title)
  })

  it('applies full 4-tier sort with mixed tasks', () => {
    const completedUrgent = makeTodayTask(
      makeTask({ title: 'Completed urgent', deadline: TODAY, is_completed: true, is_urgent: true }),
      TODAY
    )
    const incompleteNonUrgentOverdue = makeTodayTask(
      makeTask({ title: 'Overdue 3 days', deadline: '2025-02-07' }),
      TODAY
    )
    const incompleteNonUrgentToday = makeTodayTask(
      makeTask({ title: 'Due today', deadline: TODAY }),
      TODAY
    )
    const incompleteUrgent = makeTodayTask(
      makeTask({ title: 'Urgent today', deadline: TODAY, is_urgent: true }),
      TODAY
    )

    const result = sortTodayTasks([
      completedUrgent,
      incompleteNonUrgentToday,
      incompleteNonUrgentOverdue,
      incompleteUrgent,
    ])

    expect(result.map((t) => t.task.title)).toEqual([
      'Urgent today',             // incomplete + urgent
      'Overdue 3 days',           // incomplete + non-urgent + 3 days overdue
      'Due today',                // incomplete + non-urgent + 0 days overdue
      'Completed urgent',         // completed (always last, even if urgent)
    ])
  })
})

describe('filterTodayTasks', () => {
  it('includes incomplete task with deadline in the past (overdue, effective deadline = today)', () => {
    const overdueTask = makeTask({ title: 'Overdue task', deadline: '2025-02-05' })
    const result = filterTodayTasks([overdueTask], TODAY)
    expect(result).toHaveLength(1)
    expect(result[0].task.title).toBe('Overdue task')
    expect(result[0].overdue.effectiveDeadline).toBe(TODAY)
  })

  it('includes incomplete task with deadline = today', () => {
    const todayTask = makeTask({ title: 'Today task', deadline: TODAY })
    const result = filterTodayTasks([todayTask], TODAY)
    expect(result).toHaveLength(1)
    expect(result[0].task.title).toBe('Today task')
  })

  it('excludes incomplete task with deadline in the future', () => {
    const futureTask = makeTask({ title: 'Future task', deadline: '2025-02-15' })
    const result = filterTodayTasks([futureTask], TODAY)
    expect(result).toHaveLength(0)
  })

  it('includes completed task with deadline = today', () => {
    const completedToday = makeTask({
      title: 'Completed today',
      deadline: TODAY,
      is_completed: true,
    })
    const result = filterTodayTasks([completedToday], TODAY)
    expect(result).toHaveLength(1)
    expect(result[0].task.title).toBe('Completed today')
  })

  it('excludes completed task with deadline in the past', () => {
    const completedPast = makeTask({
      title: 'Completed past',
      deadline: '2025-02-05',
      is_completed: true,
    })
    const result = filterTodayTasks([completedPast], TODAY)
    expect(result).toHaveLength(0)
  })

  it('returns correct TodayTask shape with companyName and overdue info', () => {
    const task = makeTask({ title: 'Shape check', deadline: '2025-02-08' })
    const result = filterTodayTasks([task], TODAY)
    expect(result[0]).toEqual({
      task,
      companyName: 'Test BV',
      overdue: {
        effectiveDeadline: TODAY,
        originalDeadline: '2025-02-08',
        daysOverdue: 2,
        isOverdue: true,
      },
    })
  })

  it('handles mixed batch correctly', () => {
    const tasks = [
      makeTask({ title: 'Overdue', deadline: '2025-02-01' }),
      makeTask({ title: 'Today', deadline: TODAY }),
      makeTask({ title: 'Future', deadline: '2025-03-01' }),
      makeTask({ title: 'Completed today', deadline: TODAY, is_completed: true }),
      makeTask({ title: 'Completed past', deadline: '2025-01-15', is_completed: true }),
    ]
    const result = filterTodayTasks(tasks, TODAY)
    expect(result).toHaveLength(3)
    expect(result.map((t) => t.task.title).sort()).toEqual([
      'Completed today',
      'Overdue',
      'Today',
    ])
  })
})
