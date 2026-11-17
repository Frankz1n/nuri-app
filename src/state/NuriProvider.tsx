import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createEmptyState, loadStateResult, saveState, todayKey } from '../core'
import type { NuriState, SaveStateFailureReason, StoredStateStatus } from '../core'
import {
  awardDailyXpTransition,
  clearErrorTransition,
  completeLessonTransition,
  queueErrorTransition,
  recordSkillAttemptTransition,
  recordSessionEvidenceTransition,
  recordListeningAnswerTransition,
  reviewCardTransition,
  setProfileTransition,
  toggleFavoriteTransition,
} from './transitions'
import type { TransitionOutcome } from './transitions'
import { NuriContext } from './useNuri'
import type { NuriActions, NuriContextValue } from './useNuri'

const CLASS_BY_PROFILE_FLAG = [
  ['dark', 'darkMode'],
  ['large-text', 'largeText'],
  ['reduce-motion', 'reduceMotion'],
] as const

const THEME_COLOR_LIGHT = '#184834'
const THEME_COLOR_DARK = '#14231c'

export function NuriProvider({ children }: { children: ReactNode }) {
  const [initialLoad] = useState(() => loadStateResult())
  const [state, setState] = useState<NuriState>(initialLoad.state)
  const [storageStatus, setStorageStatus] = useState<StoredStateStatus>(initialLoad.status)
  const [saveFailure, setSaveFailure] = useState<SaveStateFailureReason | null>(null)
  const stateRef = useRef<NuriState>(initialLoad.state)
  const hasConfirmedOverwriteRef = useRef(false)

  const persist = useCallback((nextState: NuriState) => {
    const result = saveState(nextState, { confirmOverwriteCorrupt: hasConfirmedOverwriteRef.current })
    setSaveFailure(result.ok ? null : result.reason)
  }, [])

  const commit = useCallback(
    (nextState: NuriState) => {
      if (nextState === stateRef.current) return
      stateRef.current = nextState
      setState(nextState)
      persist(nextState)
    },
    [persist],
  )

  const actions = useMemo<NuriActions>(() => {
    const applyOutcome = (transition: (current: NuriState) => TransitionOutcome): TransitionOutcome => {
      const outcome = transition(stateRef.current)
      commit(outcome.state)
      return outcome
    }
    const apply = (transition: (current: NuriState) => NuriState): void => commit(transition(stateRef.current))

    return {
      completeLesson: (lessonId) => applyOutcome((current) => completeLessonTransition(current, { lessonId, today: todayKey() })),
      awardDailyXp: (rewardKey) => applyOutcome((current) => awardDailyXpTransition(current, rewardKey, todayKey())),
      toggleFavorite: (vocabId) => apply((current) => toggleFavoriteTransition(current, vocabId)),
      reviewCard: (vocabId, result) => apply((current) => reviewCardTransition(current, vocabId, result, todayKey())),
      queueError: (item) => apply((current) => queueErrorTransition(current, item)),
      clearError: (itemId, sessionId) => apply((current) => clearErrorTransition(current, itemId, sessionId)),
      recordSkillAttempt: (skillId, isHit) => apply((current) => recordSkillAttemptTransition(current, skillId, isHit)),
      recordSessionEvidence: (sessionId, outcome, details) =>
        apply((current) => recordSessionEvidenceTransition(current, sessionId, outcome, details)),
      setProfile: (patch) => apply((current) => setProfileTransition(current, patch)),
      recordListeningAnswer: (sessionId, index, answer) => {
        const nextState = recordListeningAnswerTransition(stateRef.current, sessionId, index, answer)
        if (nextState === stateRef.current) return false
        commit(nextState)
        return true
      },
      setDraft: (type, payload) =>
        apply((current) => ({ ...current, activityDraft: { type, payload, updatedAt: new Date().toISOString() } })),
      clearDraft: () => apply((current) => (current.activityDraft === null ? current : { ...current, activityDraft: null })),
      setRoute: (route) => apply((current) => (current.lastRoute === route ? current : { ...current, lastRoute: route })),
      importState: (nextState) => {
        hasConfirmedOverwriteRef.current = true
        setStorageStatus('valid')
        commit(nextState)
      },
      resetAll: () => {
        hasConfirmedOverwriteRef.current = true
        setStorageStatus('valid')
        commit(createEmptyState())
      },
      confirmOverwriteCorruptStorage: () => {
        hasConfirmedOverwriteRef.current = true
        setStorageStatus('empty')
        persist(stateRef.current)
      },
      flush: () => persist(stateRef.current),
    }
  }, [commit, persist])

  useEffect(() => {
    const root = document.documentElement
    for (const [className, flag] of CLASS_BY_PROFILE_FLAG) root.classList.toggle(className, state.profile[flag])
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', state.profile.darkMode ? THEME_COLOR_DARK : THEME_COLOR_LIGHT)
  }, [state.profile])

  const value = useMemo<NuriContextValue>(
    () => ({ state, actions, storageStatus, saveFailure }),
    [state, actions, storageStatus, saveFailure],
  )

  return <NuriContext.Provider value={value}>{children}</NuriContext.Provider>
}

