import { createContext, useContext } from 'react'
import type {
  ErrorItemInput,
  NuriProfile,
  NuriState,
  ReviewResult,
  SaveStateFailureReason,
  StoredStateStatus,
} from '../core'
import type { TransitionOutcome } from './transitions'

export interface NuriActions {
  completeLesson: (lessonId: string) => TransitionOutcome
  awardDailyXp: (rewardKey: string) => TransitionOutcome
  toggleFavorite: (vocabId: string) => void
  reviewCard: (vocabId: string, result: ReviewResult) => void
  queueError: (item: ErrorItemInput) => void
  clearError: (itemId: string, sessionId: string) => void
  recordSkillAttempt: (skillId: string, isHit: boolean) => void
  setProfile: (patch: Partial<NuriProfile>) => void
  setDraft: (type: string, payload: unknown) => void
  clearDraft: () => void
  setRoute: (route: string) => void
  importState: (nextState: NuriState) => void
  /** Apaga todo o progresso. A tela deve pedir confirmação antes de chamar. */
  resetAll: () => void
  /** Confirma descartar dados ilegíveis (a cópia de segurança continua guardada). */
  confirmOverwriteCorruptStorage: () => void
  /** Grava imediatamente o estado atual (usado antes de aplicar uma atualização do app). */
  flush: () => void
}

export interface NuriContextValue {
  state: NuriState
  actions: NuriActions
  storageStatus: StoredStateStatus
  saveFailure: SaveStateFailureReason | null
}

export const NuriContext = createContext<NuriContextValue | null>(null)

export const useNuri = (): NuriContextValue => {
  const context = useContext(NuriContext)
  if (!context) throw new Error('useNuri precisa estar dentro de <NuriProvider>.')
  return context
}
