import { migrateState, STATE_VERSION } from './state.ts'
import type { NuriProfile, NuriProgress, NuriState } from './state.ts'

export const BACKUP_FORMAT = 'nuri-progress'
export const BACKUP_VERSION = 3

/** Backup contém só perfil e progresso; rascunhos, gravações e perguntas pendentes ficam de fora. */
export interface BackupState {
  profile: NuriProfile
  progress: Omit<NuriProgress, 'errorQueue'>
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  exportedAt: string
  state: BackupState
}

export interface CatalogIds {
  lessonIds: readonly string[]
  vocabIds: readonly string[]
}

export interface IdMatchGroups {
  lessons: string[]
  vocabulary: string[]
  reviews: string[]
  favorites: string[]
}

export interface ImportSummary {
  xp: number
  streak: number
  completedLessons: number
  favorites: number
  reviewCards: number
}

export type ImportFailureReason =
  | 'invalid-structure'
  | 'invalid-format'
  | 'unsupported-version'
  | 'unmatched-not-acknowledged'
  | 'catalog-missing'

export interface ImportPreview {
  canImport: boolean
  reason?: ImportFailureReason
  message?: string
  sourceVersion: number | null
  exportedAt: string | null
  summary: ImportSummary
  matched: IdMatchGroups
  unmatched: IdMatchGroups
  hasUnmatched: boolean
}

export interface ApplyImportOptions {
  acknowledgeUnmatched: boolean
  catalogIds: CatalogIds
}

export type ApplyImportResult =
  | { ok: true; state: NuriState }
  | { ok: false; reason: ImportFailureReason; message: string }

const EMPTY_SUMMARY: ImportSummary = { xp: 0, streak: 0, completedLessons: 0, favorites: 0, reviewCards: 0 }

const emptyGroups = (): IdMatchGroups => ({ lessons: [], vocabulary: [], reviews: [], favorites: [] })

export const exportProgress = (state: NuriState, now: Date = new Date()): BackupFile => {
  // migrateState descarta chaves desconhecidas (ex.: gravações); errorQueue são perguntas pendentes.
  const sanitized = migrateState({ version: STATE_VERSION, profile: state.profile, progress: state.progress })
  const { errorQueue: _pendingQuestions, ...portableProgress } = sanitized.progress

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    state: { profile: sanitized.profile, progress: portableProgress },
  }
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

type NormalizedBackup =
  | { ok: true; state: NuriState; sourceVersion: number; exportedAt: string }
  | { ok: false; reason: ImportFailureReason; message: string }

const invalid = (reason: ImportFailureReason, message: string): NormalizedBackup => ({ ok: false, reason, message })

const hasValidCurrentShape = (state: UnknownRecord): boolean => {
  const { profile, progress } = state
  if (!isRecord(profile) || !isRecord(progress)) return false
  const hasValidXp = typeof progress.xp === 'number' && Number.isFinite(progress.xp) && progress.xp >= 0
  return (
    hasValidXp &&
    Array.isArray(progress.completedLessons) &&
    Array.isArray(progress.favorites) &&
    Array.isArray(progress.reviewCards)
  )
}

const normalizeBackup = (raw: unknown): NormalizedBackup => {
  if (!isRecord(raw)) return invalid('invalid-structure', 'O arquivo não contém um backup do Nuri.')
  if (raw.format !== BACKUP_FORMAT) return invalid('invalid-format', 'Este arquivo não é um backup de progresso do Nuri.')

  const { version, exportedAt, state } = raw
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1 || version > BACKUP_VERSION) {
    return invalid('unsupported-version', 'Versão de backup não suportada por este app.')
  }
  if (typeof exportedAt !== 'string' || !isRecord(state)) {
    return invalid('invalid-structure', 'O backup está incompleto ou corrompido.')
  }

  if (version === BACKUP_VERSION) {
    if (!hasValidCurrentShape(state)) return invalid('invalid-structure', 'O backup está incompleto ou corrompido.')
    return { ok: true, state: migrateState({ version: STATE_VERSION, profile: state.profile, progress: state.progress }), sourceVersion: version, exportedAt }
  }

  return { ok: true, state: migrateState({ ...state, version }), sourceVersion: version, exportedAt }
}

const partitionByCatalog = (ids: readonly string[], catalog: ReadonlySet<string>): { matched: string[]; unmatched: string[] } => ({
  matched: ids.filter((id) => catalog.has(id)),
  unmatched: ids.filter((id) => !catalog.has(id)),
})

const uniqueValues = (values: readonly string[]): string[] => [...new Set(values)]

const isValidCatalogIds = (catalogIds: unknown): catalogIds is CatalogIds =>
  isRecord(catalogIds) && Array.isArray(catalogIds.lessonIds) && Array.isArray(catalogIds.vocabIds)

const failedPreview = (reason: ImportFailureReason, message: string, sourceVersion: number | null = null): ImportPreview => ({
  canImport: false,
  reason,
  message,
  sourceVersion,
  exportedAt: null,
  summary: { ...EMPTY_SUMMARY },
  matched: emptyGroups(),
  unmatched: emptyGroups(),
  hasUnmatched: false,
})

/** Função pura: nunca altera o estado atual do app nem o objeto recebido. */
export const previewImport = (raw: unknown, catalogIds: CatalogIds): ImportPreview => {
  if (!isValidCatalogIds(catalogIds)) return failedPreview('catalog-missing', 'Catálogo de conteúdo indisponível para validar o backup.')

  const normalized = normalizeBackup(raw)
  if (!normalized.ok) {
    const sourceVersion = isRecord(raw) && typeof raw.version === 'number' ? raw.version : null
    return failedPreview(normalized.reason, normalized.message, sourceVersion)
  }

  const { progress } = normalized.state
  const lessonCatalog = new Set(catalogIds.lessonIds)
  const vocabCatalog = new Set(catalogIds.vocabIds)

  const lessonIds = uniqueValues([...progress.completedLessons, ...Object.keys(progress.lessonCompletions)])
  const reviewVocabIds = progress.reviewCards.map((card) => card.vocabId)
  const lessons = partitionByCatalog(lessonIds, lessonCatalog)
  const reviews = partitionByCatalog(reviewVocabIds, vocabCatalog)
  const favorites = partitionByCatalog(progress.favorites, vocabCatalog)
  const vocabulary = partitionByCatalog(uniqueValues([...progress.favorites, ...reviewVocabIds]), vocabCatalog)

  const matched: IdMatchGroups = {
    lessons: lessons.matched,
    vocabulary: vocabulary.matched,
    reviews: reviews.matched,
    favorites: favorites.matched,
  }
  const unmatched: IdMatchGroups = {
    lessons: lessons.unmatched,
    vocabulary: vocabulary.unmatched,
    reviews: reviews.unmatched,
    favorites: favorites.unmatched,
  }

  return {
    canImport: true,
    sourceVersion: normalized.sourceVersion,
    exportedAt: normalized.exportedAt,
    summary: {
      xp: progress.xp,
      streak: progress.streak,
      completedLessons: progress.completedLessons.length,
      favorites: progress.favorites.length,
      reviewCards: progress.reviewCards.length,
    },
    matched,
    unmatched,
    hasUnmatched: Object.values(unmatched).some((ids) => ids.length > 0),
  }
}

/**
 * Substitui perfil e progresso pelo backup. Rascunho de atividade e fila de erros
 * (dados de sessão) são zerados; a última rota é mantida. Em caso de falha o estado
 * atual não é tocado (a função nunca muta `currentState`).
 */
export const applyImport = (currentState: NuriState, backup: unknown, options: ApplyImportOptions): ApplyImportResult => {
  const preview = previewImport(backup, options.catalogIds)
  if (!preview.canImport) {
    return { ok: false, reason: preview.reason ?? 'invalid-structure', message: preview.message ?? 'Backup inválido.' }
  }
  if (preview.hasUnmatched && !options.acknowledgeUnmatched) {
    return {
      ok: false,
      reason: 'unmatched-not-acknowledged',
      message: 'O backup contém itens que não existem nesta versão do app. Confirme para importar apenas o que for compatível.',
    }
  }

  const normalized = normalizeBackup(backup)
  if (!normalized.ok) return { ok: false, reason: normalized.reason, message: normalized.message }

  const lessonCatalog = new Set(options.catalogIds.lessonIds)
  const vocabCatalog = new Set(options.catalogIds.vocabIds)
  const { progress, profile } = normalized.state

  return {
    ok: true,
    state: {
      version: STATE_VERSION,
      profile,
      progress: {
        ...progress,
        completedLessons: progress.completedLessons.filter((lessonId) => lessonCatalog.has(lessonId)),
        lessonCompletions: Object.fromEntries(
          Object.entries(progress.lessonCompletions).filter(([lessonId]) => lessonCatalog.has(lessonId)),
        ),
        favorites: progress.favorites.filter((vocabId) => vocabCatalog.has(vocabId)),
        reviewCards: progress.reviewCards.filter((card) => vocabCatalog.has(card.vocabId)),
        errorQueue: [],
      },
      activityDraft: null,
      lastRoute: currentState.lastRoute,
    },
  }
}
