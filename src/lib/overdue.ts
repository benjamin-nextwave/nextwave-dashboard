import { differenceInCalendarDays, parseISO } from 'date-fns'

export interface OverdueResult {
  effectiveDeadline: string
  originalDeadline: string
  daysOverdue: number
  isOverdue: boolean
}

export function computeOverdue(
  deadline: string,
  today: string,
  isCompleted: boolean
): OverdueResult {
  const isOverdue = !isCompleted && deadline < today

  return {
    effectiveDeadline: isOverdue ? today : deadline,
    originalDeadline: deadline,
    daysOverdue: isOverdue
      ? differenceInCalendarDays(parseISO(today), parseISO(deadline))
      : 0,
    isOverdue,
  }
}
