import { getLessonById, getLiveSituation } from '../data'
import type { ActivityDraft } from '../core'
import type { Step } from './steps'

export const PRACTICE_MODE_IDS = [
  'write',
  'syllables',
  'pairs',
  'cards',
  'daily',
  'phrases',
  'reading',
  'blocks',
  'errors',
] as const

export type PracticeMode = (typeof PRACTICE_MODE_IDS)[number]

export const isPracticeMode = (value: string): value is PracticeMode =>
  (PRACTICE_MODE_IDS as readonly string[]).includes(value)

export type SessionOrigin =
  | { type: 'lesson'; lessonId: string }
  | { type: 'practice'; mode: PracticeMode; argument?: string }

export interface ListeningAnswer {
  option: number
  unaided: boolean
}

export interface SessionDraftPayload {
  origin: SessionOrigin
  sessionId: string
  steps: Step[]
  index: number
  gradedCount: number
  firstTryHits: number
  listeningAnswer?: ListeningAnswer
}

export const SESSION_DRAFT_TYPE = 'session'

const STEP_KINDS: readonly string[] = [
  'info',
  'choice',
  'tiles',
  'write',
  'pairs',
  'card',
  'read',
  'live-listen',
  'live-read',
  'live-speak',
  'word-listen',
  'word-repeat',
  'listen-choice',
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseOrigin = (value: unknown): SessionOrigin | null => {
  if (!isRecord(value)) return null
  if (value.type === 'lesson' && typeof value.lessonId === 'string') return { type: 'lesson', lessonId: value.lessonId }
  if (value.type === 'practice' && typeof value.mode === 'string' && isPracticeMode(value.mode)) {
    return {
      type: 'practice',
      mode: value.mode,
      ...(typeof value.argument === 'string' ? { argument: value.argument } : {}),
    }
  }
  return null
}

const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0

/** Valida o rascunho salvo: qualquer formato inesperado é descartado em vez de quebrar a tela. */
export const parseSessionDraft = (draft: ActivityDraft | null): SessionDraftPayload | null => {
  if (!draft || draft.type !== SESSION_DRAFT_TYPE || !isRecord(draft.payload)) return null
  const { origin: rawOrigin, sessionId, steps, index, gradedCount, firstTryHits, listeningAnswer } = draft.payload
  const origin = parseOrigin(rawOrigin)
  if (!origin || typeof sessionId !== 'string' || !Array.isArray(steps) || steps.length === 0) return null
  const hasValidSteps = steps.every((step) => {
    if (!isRecord(step) || typeof step.kind !== 'string' || !STEP_KINDS.includes(step.kind)) return false
    if (step.kind === 'listen-choice') {
      return (
        typeof step.speakText === 'string' &&
        typeof step.revealHangul === 'string' &&
        Array.isArray(step.options) &&
        step.options.every((option) => typeof option === 'string') &&
        isCount(step.answerIndex) &&
        step.answerIndex < step.options.length
      )
    }
    if (!step.kind.startsWith('live-')) return true
    if (typeof step.situationId !== 'string' || !getLiveSituation(step.situationId)) return false
    if (step.kind !== 'live-listen') return true
    return (step.take === 'opening' || step.take === 'transfer') &&
      Array.isArray(step.options) && step.options.every((option) => typeof option === 'string') &&
      isCount(step.answerIndex) && step.answerIndex < step.options.length
  })
  if (!hasValidSteps || !isCount(index) || index >= steps.length) return null
  const step = steps[index] as Step
  const hasListeningAnswer =
    (step.kind === 'live-listen' || step.kind === 'listen-choice') &&
    isRecord(listeningAnswer) &&
    isCount(listeningAnswer.option) &&
    listeningAnswer.option < step.options.length &&
    typeof listeningAnswer.unaided === 'boolean'
  return {
    origin,
    sessionId,
    ...(hasListeningAnswer ? { listeningAnswer: listeningAnswer as unknown as ListeningAnswer } : {}),
    steps: steps as Step[],
    index,
    gradedCount: isCount(gradedCount) ? gradedCount : 0,
    firstTryHits: isCount(firstTryHits) ? firstTryHits : 0,
  }
}

export const isSameOrigin = (a: SessionOrigin, b: SessionOrigin): boolean => {
  if (a.type === 'lesson' && b.type === 'lesson') return a.lessonId === b.lessonId
  if (a.type === 'practice' && b.type === 'practice') return a.mode === b.mode && a.argument === b.argument
  return false
}

export const originRoute = (origin: SessionOrigin): string => {
  if (origin.type === 'lesson') return `#/lesson/${origin.lessonId}`
  return origin.argument ? `#/practice/${origin.mode}/${origin.argument}` : `#/practice/${origin.mode}`
}

export const PRACTICE_MODE_TITLES: Readonly<Record<PracticeMode, string>> = {
  write: 'Escrita guiada',
  syllables: 'Montar sílabas',
  pairs: 'Encontrar pares',
  cards: 'Cartões de revisão',
  daily: 'Desafio diário',
  phrases: 'Organizar frases',
  reading: 'Leitura guiada',
  blocks: 'Completar palavras por blocos',
  errors: 'Revisar erros',
}

export const describeOrigin = (origin: SessionOrigin): string => {
  if (origin.type === 'lesson') return getLessonById(origin.lessonId)?.title ?? 'Aula'
  return PRACTICE_MODE_TITLES[origin.mode]
}
