import {
  CURRICULUM_SESSIONS,
  CURRICULUM_STAGES,
  CURRICULUM_WEEKS,
  formatWeekLabel,
  getSessionByLessonId,
  getSessionsOfWeek,
  getStageById,
  getWeekByNumber,
} from '../data/curriculum'
import type { CurriculumSession, CurriculumStage, CurriculumWeek } from '../data/curriculum'

export interface CurriculumPlacement {
  stageId: number
  weekNumber: number
  sessionId: string
  lessonId: string
  reason: string
}

export interface GuidedCurriculumPlan {
  stage: CurriculumStage
  week: CurriculumWeek
  sessions: CurriculumSession[]
  nextSession?: CurriculumSession
  weekLabel: string
  phaseLabel: string
  phaseHint: string
  weekProgress: { completed: number; total: number; playableDone: number; playableTotal: number }
}

const isSessionDone = (session: CurriculumSession, completedLessons: readonly string[]): boolean =>
  session.lessonId !== undefined && completedLessons.includes(session.lessonId)

/** Próxima sessão playable ainda não concluída, na ordem do currículo. */
export const findNextCurriculumSession = (completedLessons: readonly string[]): CurriculumSession | undefined =>
  CURRICULUM_SESSIONS.find((session) => session.status === 'playable' && session.lessonId && !completedLessons.includes(session.lessonId))

export const resolveActiveWeekNumber = (completedLessons: readonly string[], selectedWeek?: number | null): number => {
  if (selectedWeek && getWeekByNumber(selectedWeek)) return selectedWeek
  const next = findNextCurriculumSession(completedLessons)
  if (next) return next.weekNumber
  const lastPlayable = [...CURRICULUM_SESSIONS].reverse().find((session) => session.status === 'playable' && isSessionDone(session, completedLessons))
  return lastPlayable?.weekNumber ?? 1
}

export const summarizeWeekProgress = (
  weekNumber: number,
  completedLessons: readonly string[],
): GuidedCurriculumPlan['weekProgress'] => {
  const sessions = getSessionsOfWeek(weekNumber)
  const playable = sessions.filter((session) => session.status === 'playable')
  return {
    completed: sessions.filter((session) => isSessionDone(session, completedLessons)).length,
    total: sessions.length,
    playableDone: playable.filter((session) => isSessionDone(session, completedLessons)).length,
    playableTotal: playable.length,
  }
}

export const buildGuidedCurriculumPlan = (
  completedLessons: readonly string[],
  selectedWeek?: number | null,
): GuidedCurriculumPlan => {
  const weekNumber = resolveActiveWeekNumber(completedLessons, selectedWeek)
  const week = getWeekByNumber(weekNumber) ?? CURRICULUM_WEEKS[0]
  const stage = getStageById(week.stageId) ?? CURRICULUM_STAGES[0]
  const sessions = getSessionsOfWeek(week.number)
  const nextSession = findNextCurriculumSession(completedLessons)

  return {
    stage,
    week,
    sessions,
    nextSession,
    weekLabel: formatWeekLabel(week),
    phaseLabel: `Etapa ${stage.id} · ${stage.title}`,
    phaseHint: stage.outcome,
    weekProgress: summarizeWeekProgress(week.number, completedLessons),
  }
}

/**
 * Diagnóstico curto (orientação atual): iniciante → S01; quem lê um pouco → ainda etapa 1/semana 2–4 outline;
 * quem já lê → etapa 2 como sugestão de exploração (conteúdo ainda outline).
 */
export const recommendCurriculumPlacement = (hits: number, familiarity?: string): CurriculumPlacement => {
  const s01 = CURRICULUM_SESSIONS.find((session) => session.id === 'S01D1')!
  if (familiarity === 'Nunca vi hangul' || hits <= 1) {
    return {
      stageId: 1,
      weekNumber: 1,
      sessionId: s01.id,
      lessonId: s01.lessonId!,
      reason: 'Você está começando do zero: a Semana 1 ensina a ouvir e pedir uma bebida antes de aprofundar o hangul.',
    }
  }
  if (hits <= 3 || familiarity === 'Reconheço algumas letras') {
    return {
      stageId: 1,
      weekNumber: 1,
      sessionId: s01.id,
      lessonId: s01.lessonId!,
      reason: 'Ainda vale fechar a Semana 1 (pedido + primeiros blocos). Depois o Nuri abre o roteiro das semanas 2–4.',
    }
  }
  // Leitores: sugerem explorar etapa 2, mas a primeira sessão jogável continua S01 até existir conteúdo.
  return {
    stageId: 2,
    weekNumber: 5,
    sessionId: s01.id,
    lessonId: s01.lessonId!,
    reason:
      'Você já lê um pouco: o alvo de médio prazo é a Etapa 2 (cotidiano). Enquanto o conteúdo avançado está em roteiro, comece pela Semana 1 jogável para calibrar escuta e fala.',
  }
}

export const countCurriculumEvidence = (
  sessionEvidence: Readonly<Record<string, { outcome: string }>>,
): { unsupported: number; supported: number; skipped: number } => {
  let unsupported = 0
  let supported = 0
  let skipped = 0
  for (const entry of Object.values(sessionEvidence)) {
    if (entry.outcome === 'unsupported') unsupported += 1
    else if (entry.outcome === 'supported') supported += 1
    else if (entry.outcome === 'skipped') skipped += 1
  }
  return { unsupported, supported, skipped }
}

export const listPlayableLessonIds = (): string[] =>
  CURRICULUM_SESSIONS.flatMap((session) => (session.lessonId ? [session.lessonId] : []))

export const curriculumSessionForLesson = (lessonId: string): CurriculumSession | undefined => getSessionByLessonId(lessonId)
