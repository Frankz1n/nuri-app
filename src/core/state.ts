import { isValidDateKey, todayKey } from './dates.ts'
import { SCHEDULE_DAYS } from './review.ts'
import type { ErrorItem, ReviewCard, ReviewResult } from './review.ts'

export const STORAGE_KEY = 'nuri-state'
export const CORRUPT_BACKUP_STORAGE_KEY = 'nuri-state-corrupt-backup'
export const STATE_VERSION = 3
export const DAILY_GOAL_OPTIONS = [10, 30, 60, 120] as const
export const DEFAULT_XP_GOAL = 50

export type DailyGoalMinutes = (typeof DAILY_GOAL_OPTIONS)[number]

/** Rótulos curtos para chips (evitam quebra em telas estreitas). */
export const formatDailyGoalLabel = (minutes: number): string => {
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? '1 h' : `${hours} h`
  }
  return `${minutes} min`
}

/** Aceita metas atuais e aproxima valores legados (5/15/20) para a opção mais próxima. */
export const coerceDailyGoalMinutes = (value: unknown): DailyGoalMinutes => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const exact = DAILY_GOAL_OPTIONS.find((option) => option === value)
    if (exact !== undefined) return exact

    return DAILY_GOAL_OPTIONS.reduce((best, option) => {
      const bestDistance = Math.abs(best - value)
      const nextDistance = Math.abs(option - value)
      if (nextDistance < bestDistance) return option
      if (nextDistance === bestDistance && option > best) return option
      return best
    }, DAILY_GOAL_OPTIONS[0])
  }
  return DAILY_GOAL_OPTIONS[0]
}

export interface NuriProfile {
  name?: string
  interest?: string
  familiarity?: string
  dailyGoalMinutes: DailyGoalMinutes
  xpGoal: number
  showRomanization: boolean
  darkMode: boolean
  largeText: boolean
  reduceMotion: boolean
  onboardingDone: boolean
}

export interface SkillFirstTryStats {
  hits: number
  total: number
}

export interface HistoryEntry {
  day: string
  xp: number
  lessons: number
}

export interface NuriProgress {
  xp: number
  streak: number
  lastStudyDay: string | null
  completedLessons: string[]
  lessonCompletions: Record<string, string>
  unitProgress: Record<string, number>
  favorites: string[]
  reviewCards: ReviewCard[]
  errorQueue: ErrorItem[]
  skillFirstTry: Record<string, SkillFirstTryStats>
  dailyXpAwards: Record<string, string>
  achievements: string[]
  history: HistoryEntry[]
}

export interface ActivityDraft {
  type: string
  payload: unknown
  updatedAt: string
}

export interface NuriState {
  version: 3
  profile: NuriProfile
  progress: NuriProgress
  activityDraft: ActivityDraft | null
  lastRoute: string | null
}

/** Subconjunto de `Storage` usado pelo core (permite injetar fakes em testes). */
export interface StateStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const createEmptyState = (): NuriState => ({
  version: STATE_VERSION,
  profile: {
    dailyGoalMinutes: 10,
    xpGoal: DEFAULT_XP_GOAL,
    showRomanization: true,
    darkMode: false,
    largeText: false,
    reduceMotion: false,
    onboardingDone: false,
  },
  progress: {
    xp: 0,
    streak: 0,
    lastStudyDay: null,
    completedLessons: [],
    lessonCompletions: {},
    unitProgress: {},
    favorites: [],
    reviewCards: [],
    errorQueue: [],
    skillFirstTry: {},
    dailyXpAwards: {},
    achievements: [],
    history: [],
  },
  activityDraft: null,
  lastRoute: null,
})

// ---------------------------------------------------------------------------
// Sanitização / migração (função total: nunca lança, nunca devolve formato inválido)
// ---------------------------------------------------------------------------

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asNonNegativeNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback

const asBoolean = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const asOptionalText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined

const asUniqueStrings = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string' && item !== ''))] : []

const asStringRecord = (value: unknown, isValidValue: (candidate: string) => boolean = () => true): Record<string, string> =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string' && isValidValue(entry[1]),
        ),
      )
    : {}

const firstDefined = (sources: readonly (UnknownRecord | undefined)[], keys: readonly string[]): unknown => {
  for (const source of sources) {
    if (!source) continue
    for (const key of keys) {
      if (source[key] !== undefined) return source[key]
    }
  }
  return undefined
}

const LAST_INTERVAL_INDEX = SCHEDULE_DAYS.length - 1

const sanitizeReviewCard = (value: unknown, fallbackDay: string): ReviewCard | null => {
  if (!isRecord(value)) return null
  const vocabId = firstDefined([value], ['vocabId', 'vocab', 'id'])
  if (typeof vocabId !== 'string' || vocabId === '') return null

  const rawIndex = firstDefined([value], ['intervalIndex', 'level', 'box'])
  const intervalIndex =
    typeof rawIndex === 'number' && Number.isFinite(rawIndex)
      ? Math.min(LAST_INTERVAL_INDEX, Math.max(0, Math.trunc(rawIndex)))
      : 0
  const rawDueDate = firstDefined([value], ['dueDate', 'due', 'nextReview'])
  const dueDate = isValidDateKey(rawDueDate) ? rawDueDate : fallbackDay
  const lastResult: ReviewResult | undefined =
    value.lastResult === 'remembered' || value.lastResult === 'forgotten' ? value.lastResult : undefined

  return { vocabId, intervalIndex, dueDate, ...(lastResult ? { lastResult } : {}) }
}

const sanitizeReviewCards = (value: unknown, fallbackDay: string): ReviewCard[] => {
  if (!Array.isArray(value)) return []
  const cardsByVocabId = new Map<string, ReviewCard>()
  for (const candidate of value) {
    const card = sanitizeReviewCard(candidate, fallbackDay)
    if (card && !cardsByVocabId.has(card.vocabId)) cardsByVocabId.set(card.vocabId, card)
  }
  return [...cardsByVocabId.values()]
}

const sanitizeErrorQueue = (value: unknown): ErrorItem[] => {
  if (!Array.isArray(value)) return []
  const itemsById = new Map<string, ErrorItem>()
  for (const candidate of value) {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || candidate.id === '') continue
    if (itemsById.has(candidate.id)) continue
    itemsById.set(candidate.id, {
      id: candidate.id,
      ...(typeof candidate.kind === 'string' ? { kind: candidate.kind } : {}),
      lastFailedSessionId: typeof candidate.lastFailedSessionId === 'string' ? candidate.lastFailedSessionId : '',
      failCount: Math.max(1, Math.trunc(asNonNegativeNumber(candidate.failCount, 1))),
    })
  }
  return [...itemsById.values()]
}

const sanitizeSkillFirstTry = (value: unknown): Record<string, SkillFirstTryStats> => {
  if (!isRecord(value)) return {}
  const entries = Object.entries(value).flatMap(([skillId, stats]): [string, SkillFirstTryStats][] => {
    if (!isRecord(stats)) return []
    const total = Math.trunc(asNonNegativeNumber(stats.total))
    const hits = Math.min(total, Math.trunc(asNonNegativeNumber(stats.hits)))
    return [[skillId, { hits, total }]]
  })
  return Object.fromEntries(entries)
}

const sanitizeUnitProgress = (value: unknown): Record<string, number> =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= 0),
      )
    : {}

const sanitizeHistory = (value: unknown): HistoryEntry[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry): HistoryEntry[] =>
    isRecord(entry) && isValidDateKey(entry.day)
      ? [{ day: entry.day, xp: asNonNegativeNumber(entry.xp), lessons: Math.trunc(asNonNegativeNumber(entry.lessons)) }]
      : [],
  )
}

const sanitizeProfile = (value: unknown): NuriProfile => {
  const defaults = createEmptyState().profile
  const source = isRecord(value) ? value : {}
  const dailyGoalMinutes = coerceDailyGoalMinutes(source.dailyGoalMinutes)
  const xpGoal = typeof source.xpGoal === 'number' && Number.isFinite(source.xpGoal) && source.xpGoal > 0 ? source.xpGoal : defaults.xpGoal
  const name = asOptionalText(source.name)
  const interest = asOptionalText(source.interest)
  const familiarity = asOptionalText(source.familiarity)

  return {
    ...(name ? { name } : {}),
    ...(interest ? { interest } : {}),
    ...(familiarity ? { familiarity } : {}),
    dailyGoalMinutes,
    xpGoal,
    showRomanization: asBoolean(source.showRomanization, defaults.showRomanization),
    darkMode: asBoolean(source.darkMode, defaults.darkMode),
    largeText: asBoolean(source.largeText, defaults.largeText),
    reduceMotion: asBoolean(source.reduceMotion, defaults.reduceMotion),
    onboardingDone: asBoolean(source.onboardingDone, defaults.onboardingDone),
  }
}

const sanitizeProgress = (value: unknown, fallbackDay: string): NuriProgress => {
  const source = isRecord(value) ? value : {}
  const completedLessons = asUniqueStrings(source.completedLessons)
  const lessonCompletions = asStringRecord(source.lessonCompletions, isValidDateKey)

  return {
    xp: asNonNegativeNumber(source.xp),
    streak: Math.trunc(asNonNegativeNumber(source.streak)),
    lastStudyDay: isValidDateKey(source.lastStudyDay) ? source.lastStudyDay : null,
    completedLessons,
    lessonCompletions,
    unitProgress: sanitizeUnitProgress(source.unitProgress),
    favorites: asUniqueStrings(source.favorites),
    reviewCards: sanitizeReviewCards(source.reviewCards, fallbackDay),
    errorQueue: sanitizeErrorQueue(source.errorQueue),
    skillFirstTry: sanitizeSkillFirstTry(source.skillFirstTry),
    dailyXpAwards: asStringRecord(source.dailyXpAwards, isValidDateKey),
    achievements: asUniqueStrings(source.achievements),
    history: sanitizeHistory(source.history),
  }
}

const sanitizeActivityDraft = (value: unknown): ActivityDraft | null => {
  if (!isRecord(value) || typeof value.type !== 'string' || typeof value.updatedAt !== 'string') return null
  return { type: value.type, payload: value.payload, updatedAt: value.updatedAt }
}

const readVersion = (raw: UnknownRecord): number | null =>
  typeof raw.version === 'number' && Number.isInteger(raw.version) ? raw.version : null

/**
 * Formatos legados (campos soltos ou aninhados, com nomes variados) são
 * normalizados para a forma v3 sem perder aulas concluídas, XP, favoritos e revisões.
 */
const flattenLegacyProgress = (raw: UnknownRecord): UnknownRecord => {
  const progress = isRecord(raw.progress) ? raw.progress : undefined
  const sources = [progress, raw]
  const completedLessons = firstDefined(sources, ['completedLessons', 'completed', 'lessonsDone', 'doneLessons'])
  const lessonCompletions = firstDefined(sources, ['lessonCompletions', 'completionDates'])
  const legacyCompletedDay = asStringRecord(lessonCompletions, isValidDateKey)

  return {
    xp: firstDefined(sources, ['xp', 'totalXp']),
    streak: firstDefined(sources, ['streak', 'currentStreak']),
    lastStudyDay: firstDefined(sources, ['lastStudyDay', 'lastStudy', 'lastDay']),
    completedLessons: [
      ...asUniqueStrings(completedLessons),
      ...Object.keys(legacyCompletedDay),
    ],
    lessonCompletions: legacyCompletedDay,
    unitProgress: firstDefined(sources, ['unitProgress']),
    favorites: firstDefined(sources, ['favorites', 'favoriteVocab', 'favs']),
    reviewCards: firstDefined(sources, ['reviewCards', 'reviews', 'srs', 'cards']),
    errorQueue: firstDefined(sources, ['errorQueue', 'errors']),
    skillFirstTry: firstDefined(sources, ['skillFirstTry']),
    dailyXpAwards: firstDefined(sources, ['dailyXpAwards', 'dailyAwards']),
    achievements: firstDefined(sources, ['achievements', 'badges']),
    history: firstDefined(sources, ['history']),
  }
}

const flattenLegacyProfile = (raw: UnknownRecord): UnknownRecord => {
  const profile = isRecord(raw.profile) ? raw.profile : undefined
  const settings = isRecord(raw.settings) ? raw.settings : undefined
  const sources = [profile, settings, raw]
  return {
    name: firstDefined(sources, ['name', 'userName']),
    interest: firstDefined(sources, ['interest']),
    familiarity: firstDefined(sources, ['familiarity']),
    dailyGoalMinutes: firstDefined(sources, ['dailyGoalMinutes', 'dailyGoal']),
    xpGoal: firstDefined(sources, ['xpGoal']),
    showRomanization: firstDefined(sources, ['showRomanization', 'romanization']),
    darkMode: firstDefined(sources, ['darkMode', 'dark']),
    largeText: firstDefined(sources, ['largeText']),
    reduceMotion: firstDefined(sources, ['reduceMotion']),
    onboardingDone: firstDefined(sources, ['onboardingDone', 'onboarded']),
  }
}

/** Versões suportadas para leitura: 1, 2 (legado) e 3 (atual). */
export const isSupportedStateVersion = (version: number | null): boolean =>
  version !== null && version >= 1 && version <= STATE_VERSION

export const migrateState = (raw: unknown): NuriState => {
  if (!isRecord(raw)) return createEmptyState()

  const fallbackDay = todayKey()
  const version = readVersion(raw)
  const isCurrentShape = version === STATE_VERSION
  const profileSource = isCurrentShape ? raw.profile : flattenLegacyProfile(raw)
  const progressSource = isCurrentShape ? raw.progress : flattenLegacyProgress(raw)

  return {
    version: STATE_VERSION,
    profile: sanitizeProfile(profileSource),
    progress: sanitizeProgress(progressSource, fallbackDay),
    activityDraft: isCurrentShape ? sanitizeActivityDraft(raw.activityDraft) : null,
    lastRoute: isCurrentShape && typeof raw.lastRoute === 'string' ? raw.lastRoute : null,
  }
}

// ---------------------------------------------------------------------------
// Persistência
// ---------------------------------------------------------------------------

export type StoredStateStatus = 'empty' | 'valid' | 'corrupt' | 'unreadable'

export interface LoadStateResult {
  state: NuriState
  status: StoredStateStatus
}

export type SaveStateFailureReason = 'storage-unavailable' | 'corrupt-storage-not-confirmed' | 'write-failed'

export type SaveStateResult = { ok: true } | { ok: false; reason: SaveStateFailureReason }

export interface StorageOptions {
  storage?: StateStorage | null
}

export interface SaveStateOptions extends StorageOptions {
  /** O usuário confirmou descartar o conteúdo ilegível atualmente armazenado. */
  confirmOverwriteCorrupt?: boolean
}

/** Último estado válido lido/gravado nesta sessão; devolvido se a leitura falhar depois. */
let lastKnownState: NuriState | null = null

const resolveStorage = (options: StorageOptions): StateStorage | null => {
  if (options.storage !== undefined) return options.storage
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/** v1 antigo não gravava `version`; reconhecemos pelo menos um campo típico. */
const LEGACY_STATE_KEYS = ['xp', 'completedLessons', 'completed', 'favorites', 'streak', 'reviewCards', 'reviews', 'progress', 'profile'] as const

const parseStoredState = (rawText: string): NuriState | null => {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return null
  }
  if (!isRecord(parsed)) return null
  const version = readVersion(parsed)
  const isUnversionedLegacy = version === null && LEGACY_STATE_KEYS.some((key) => key in parsed)
  if (!isUnversionedLegacy && !isSupportedStateVersion(version)) return null
  return migrateState(parsed)
}

const keepCorruptCopy = (storage: StateStorage, rawText: string): void => {
  try {
    if (storage.getItem(CORRUPT_BACKUP_STORAGE_KEY) !== rawText) storage.setItem(CORRUPT_BACKUP_STORAGE_KEY, rawText)
  } catch {
    // Cópia de segurança é best-effort; o dado original permanece intacto.
  }
}

export const loadStateResult = (options: StorageOptions = {}): LoadStateResult => {
  const storage = resolveStorage(options)
  const fallbackState = (): NuriState => lastKnownState ?? createEmptyState()
  if (!storage) return { state: fallbackState(), status: 'unreadable' }

  let rawText: string | null
  try {
    rawText = storage.getItem(STORAGE_KEY)
  } catch {
    return { state: fallbackState(), status: 'unreadable' }
  }

  if (rawText === null) return { state: createEmptyState(), status: 'empty' }

  const state = parseStoredState(rawText)
  if (!state) {
    keepCorruptCopy(storage, rawText)
    return { state: createEmptyState(), status: 'corrupt' }
  }

  lastKnownState = state
  return { state, status: 'valid' }
}

export const loadState = (options: StorageOptions = {}): NuriState => loadStateResult(options).state

export const saveState = (state: NuriState, options: SaveStateOptions = {}): SaveStateResult => {
  const storage = resolveStorage(options)
  if (!storage) return { ok: false, reason: 'storage-unavailable' }

  if (!options.confirmOverwriteCorrupt) {
    let existingText: string | null = null
    try {
      existingText = storage.getItem(STORAGE_KEY)
    } catch {
      existingText = null
    }
    if (existingText !== null && parseStoredState(existingText) === null) {
      keepCorruptCopy(storage, existingText)
      return { ok: false, reason: 'corrupt-storage-not-confirmed' }
    }
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    return { ok: false, reason: 'write-failed' }
  }
  lastKnownState = state
  return { ok: true }
}
