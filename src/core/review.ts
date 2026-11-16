import { addDays } from './dates.ts'

/** Intervalos (em dias) da repetição espaçada: 1 → 3 → 7 → 14 → 30. */
export const SCHEDULE_DAYS = [1, 3, 7, 14, 30] as const

export type ReviewResult = 'remembered' | 'forgotten'

export interface ReviewCard {
  vocabId: string
  intervalIndex: number
  dueDate: string
  lastResult?: ReviewResult
}

export interface ErrorItem {
  id: string
  kind?: string
  lastFailedSessionId: string
  failCount: number
}

export interface ErrorItemInput {
  id: string
  kind?: string
  lastFailedSessionId: string
}

const LAST_INTERVAL_INDEX = SCHEDULE_DAYS.length - 1

/** Cartão novo: primeira revisão após SCHEDULE_DAYS[0] dia. */
export const createReviewCard = (vocabId: string, today: string): ReviewCard => ({
  vocabId,
  intervalIndex: 0,
  dueDate: addDays(today, SCHEDULE_DAYS[0]),
})

export const reviewRemembered = (card: ReviewCard, todayKey: string): ReviewCard => {
  const nextIntervalIndex = Math.min(card.intervalIndex + 1, LAST_INTERVAL_INDEX)
  return {
    ...card,
    intervalIndex: nextIntervalIndex,
    dueDate: addDays(todayKey, SCHEDULE_DAYS[nextIntervalIndex]),
    lastResult: 'remembered',
  }
}

export const reviewForgotten = (card: ReviewCard, todayKey: string): ReviewCard => ({
  ...card,
  intervalIndex: 0,
  dueDate: todayKey,
  lastResult: 'forgotten',
})

export const isReviewDue = (card: ReviewCard, today: string): boolean => card.dueDate <= today

export const getDueCards = (cards: readonly ReviewCard[], today: string): ReviewCard[] =>
  cards.filter((card) => isReviewDue(card, today)).toSorted((a, b) => a.dueDate.localeCompare(b.dueDate))

export const upsertReviewCard = (cards: readonly ReviewCard[], nextCard: ReviewCard): ReviewCard[] =>
  cards.some((card) => card.vocabId === nextCard.vocabId)
    ? cards.map((card) => (card.vocabId === nextCard.vocabId ? nextCard : card))
    : [...cards, nextCard]

export const queueError = (errors: readonly ErrorItem[], item: ErrorItemInput): ErrorItem[] => {
  const existing = errors.find((error) => error.id === item.id)
  if (!existing) return [...errors, { ...item, failCount: 1 }]

  return errors.map((error) =>
    error.id === item.id
      ? { ...error, ...item, failCount: error.failCount + 1 }
      : error,
  )
}

/**
 * Remove o erro apenas quando o acerto de primeira acontece em uma sessão
 * diferente da que registrou a última falha.
 */
export const clearErrorOnFirstTry = (
  errors: readonly ErrorItem[],
  itemId: string,
  sessionId: string,
  isFirstTry: boolean = true,
): ErrorItem[] => {
  if (!isFirstTry) return [...errors]
  return errors.filter((error) => error.id !== itemId || error.lastFailedSessionId === sessionId)
}
