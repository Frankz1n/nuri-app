import { UNITS, getLessonById } from '../data'
import {
  awardDailyXp,
  canAwardDailyXp,
  clearErrorOnFirstTry,
  createReviewCard,
  dailyXpAmount,
  daysBetween,
  lessonXpAward,
  queueError,
  reviewForgotten,
  reviewRemembered,
  upsertReviewCard,
} from '../core'
import type { ErrorItemInput, HistoryEntry, NuriProfile, NuriProgress, NuriState, ReviewCard, ReviewResult } from '../core'
import { findNewAchievementIds } from './achievements'
import { SESSION_DRAFT_TYPE, parseSessionDraft } from '../lib/session'
import type { ListeningAnswer } from '../lib/session'

const HISTORY_LIMIT_DAYS = 120

const withProgress = (state: NuriState, progress: NuriProgress): NuriState => ({ ...state, progress })

const bumpHistory = (history: readonly HistoryEntry[], day: string, xpDelta: number, lessonsDelta: number): HistoryEntry[] => {
  const existing = history.find((entry) => entry.day === day)
  const updated: HistoryEntry = {
    day,
    xp: (existing?.xp ?? 0) + xpDelta,
    lessons: (existing?.lessons ?? 0) + lessonsDelta,
  }
  const others = history.filter((entry) => entry.day !== day)
  return [...others, updated].toSorted((a, b) => a.day.localeCompare(b.day)).slice(-HISTORY_LIMIT_DAYS)
}

const computeStreak = (progress: NuriProgress, today: string): number => {
  if (progress.lastStudyDay === today) return Math.max(1, progress.streak)
  if (progress.lastStudyDay !== null && daysBetween(progress.lastStudyDay, today) === 1) return progress.streak + 1
  return 1
}

const registerStudyDay = (progress: NuriProgress, today: string): NuriProgress => ({
  ...progress,
  streak: computeStreak(progress, today),
  lastStudyDay: today,
})

const withAchievements = (progress: NuriProgress): { progress: NuriProgress; newAchievements: string[] } => {
  const newAchievements = findNewAchievementIds(progress)
  return {
    progress: newAchievements.length > 0 ? { ...progress, achievements: [...progress.achievements, ...newAchievements] } : progress,
    newAchievements,
  }
}

/** Streak exibido: zera se passou mais de um dia sem estudar. */
export const getDisplayedStreak = (progress: NuriProgress, today: string): number => {
  if (progress.lastStudyDay === null) return 0
  return daysBetween(progress.lastStudyDay, today) <= 1 ? progress.streak : 0
}

export interface CompleteLessonInput {
  lessonId: string
  today: string
}

export interface TransitionOutcome {
  state: NuriState
  xpGained: number
  newAchievements: string[]
}

export const completeLessonTransition = (state: NuriState, { lessonId, today }: CompleteLessonInput): TransitionOutcome => {
  const lesson = getLessonById(lessonId)
  if (!lesson) return { state, xpGained: 0, newAchievements: [] }

  const { progress } = state
  const xpGained = lessonXpAward(progress.completedLessons, lessonId)
  const completedLessons = progress.completedLessons.includes(lessonId) ? progress.completedLessons : [...progress.completedLessons, lessonId]
  const trackedVocabIds = new Set(progress.reviewCards.map((card) => card.vocabId))
  const newCards = (lesson.vocabIds ?? []).filter((vocabId) => !trackedVocabIds.has(vocabId)).map((vocabId) => createReviewCard(vocabId, today))

  const unitProgress = Object.fromEntries(
    UNITS.map((unit) => [
      unit.id,
      Math.round((unit.lessonIds.filter((id) => completedLessons.includes(id)).length / Math.max(1, unit.lessonIds.length)) * 100),
    ]),
  )

  const base = registerStudyDay(
    {
      ...progress,
      xp: progress.xp + xpGained,
      completedLessons,
      lessonCompletions: { ...progress.lessonCompletions, [lessonId]: today },
      unitProgress,
      reviewCards: [...progress.reviewCards, ...newCards],
      history: bumpHistory(progress.history, today, xpGained, 1),
    },
    today,
  )
  const { progress: nextProgress, newAchievements } = withAchievements(base)
  return { state: { ...withProgress(state, nextProgress), activityDraft: null }, xpGained, newAchievements }
}

export const awardDailyXpTransition = (state: NuriState, rewardKey: string, today: string): TransitionOutcome => {
  const { progress } = state
  if (!canAwardDailyXp(progress.dailyXpAwards, rewardKey, today)) return { state, xpGained: 0, newAchievements: [] }

  const xpGained = dailyXpAmount(rewardKey)
  const base = registerStudyDay(
    {
      ...progress,
      xp: progress.xp + xpGained,
      dailyXpAwards: awardDailyXp(progress.dailyXpAwards, rewardKey, today),
      history: bumpHistory(progress.history, today, xpGained, 0),
    },
    today,
  )
  const { progress: nextProgress, newAchievements } = withAchievements(base)
  return { state: withProgress(state, nextProgress), xpGained, newAchievements }
}

export const toggleFavoriteTransition = (state: NuriState, vocabId: string): NuriState => {
  const { favorites } = state.progress
  const nextFavorites = favorites.includes(vocabId) ? favorites.filter((id) => id !== vocabId) : [...favorites, vocabId]
  return withProgress(state, withAchievements({ ...state.progress, favorites: nextFavorites }).progress)
}

export const reviewCardTransition = (state: NuriState, vocabId: string, result: ReviewResult, today: string): NuriState => {
  const existing = state.progress.reviewCards.find((card) => card.vocabId === vocabId)
  const card: ReviewCard = existing ?? createReviewCard(vocabId, today)
  const reviewed = result === 'remembered' ? reviewRemembered(card, today) : reviewForgotten(card, today)
  const reviewCards = upsertReviewCard(state.progress.reviewCards, reviewed)
  return withProgress(state, withAchievements({ ...state.progress, reviewCards }).progress)
}

export const queueErrorTransition = (state: NuriState, item: ErrorItemInput): NuriState =>
  withProgress(state, { ...state.progress, errorQueue: queueError(state.progress.errorQueue, item) })

export const clearErrorTransition = (state: NuriState, itemId: string, sessionId: string): NuriState => {
  const errorQueue = clearErrorOnFirstTry(state.progress.errorQueue, itemId, sessionId, true)
  return errorQueue.length === state.progress.errorQueue.length ? state : withProgress(state, { ...state.progress, errorQueue })
}

export const recordSkillAttemptTransition = (state: NuriState, skillId: string, isHit: boolean): NuriState => {
  const current = state.progress.skillFirstTry[skillId] ?? { hits: 0, total: 0 }
  const next = { hits: current.hits + (isHit ? 1 : 0), total: current.total + 1 }
  return withProgress(state, { ...state.progress, skillFirstTry: { ...state.progress.skillFirstTry, [skillId]: next } })
}

export const recordListeningAnswerTransition = (
  state: NuriState,
  sessionId: string,
  index: number,
  answer: ListeningAnswer,
): NuriState => {
  const draft = parseSessionDraft(state.activityDraft)
  if (!draft || draft.sessionId !== sessionId || draft.index !== index || draft.listeningAnswer) return state
  const step = draft.steps[index]
  if (step.kind !== 'live-listen' || !Number.isInteger(answer.option) || answer.option < 0 || answer.option >= step.options.length) return state

  const correct = answer.option === step.answerIndex
  let nextState = state
  if (answer.unaided) {
    nextState = recordSkillAttemptTransition(nextState, step.skillId, correct)
    if (step.errorId) {
      nextState = correct
        ? clearErrorTransition(nextState, step.errorId, sessionId)
        : queueErrorTransition(nextState, { id: step.errorId, kind: 'live-listen', lastFailedSessionId: sessionId })
    }
  }
  return {
    ...nextState,
    activityDraft: {
      type: SESSION_DRAFT_TYPE,
      updatedAt: new Date().toISOString(),
      payload: {
        ...draft,
        listeningAnswer: answer,
        gradedCount: draft.gradedCount + Number(answer.unaided),
        firstTryHits: draft.firstTryHits + Number(answer.unaided && correct),
      },
    },
  }
}

export const setProfileTransition = (state: NuriState, patch: Partial<NuriProfile>): NuriState => ({
  ...state,
  profile: { ...state.profile, ...patch },
})

export const nextDueLabel = (card: ReviewCard, today: string): string => {
  const days = daysBetween(today, card.dueDate)
  if (days <= 0) return 'hoje'
  return days === 1 ? 'amanhã' : `em ${days} dias`
}