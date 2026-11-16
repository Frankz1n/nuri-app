import { useMemo, useSyncExternalStore } from 'react'
import { isPracticeMode } from '../lib/session'
import type { PracticeMode } from '../lib/session'

export type TabId = 'learn' | 'practice' | 'alphabet' | 'words' | 'profile'

export type Route =
  | { name: 'learn' }
  | { name: 'practice' }
  | { name: 'practice-session'; mode: PracticeMode; argument?: string }
  | { name: 'listen' }
  | { name: 'pronounce' }
  | { name: 'converse' }
  | { name: 'alphabet' }
  | { name: 'letter'; letterId: string }
  | { name: 'words' }
  | { name: 'profile' }
  | { name: 'progress' }
  | { name: 'glossary' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'review' }
  | { name: 'onboarding' }

export const TAB_ROUTES: readonly TabId[] = ['learn', 'practice', 'alphabet', 'words', 'profile']

export const parseHash = (hash: string): Route => {
  const segments = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const [first, second, third] = segments
  switch (first) {
    case 'practice':
      return second && isPracticeMode(second)
        ? { name: 'practice-session', mode: second, ...(third ? { argument: third } : {}) }
        : { name: 'practice' }
    case 'listen':
      return { name: 'listen' }
    case 'pronounce':
      return { name: 'pronounce' }
    case 'converse':
      return { name: 'converse' }
    case 'alphabet':
      return second ? { name: 'letter', letterId: second } : { name: 'alphabet' }
    case 'words':
      return { name: 'words' }
    case 'profile':
      return second === 'progress' ? { name: 'progress' } : { name: 'profile' }
    case 'glossary':
      return { name: 'glossary' }
    case 'lesson':
      return second ? { name: 'lesson', lessonId: second } : { name: 'learn' }
    case 'review':
      return { name: 'review' }
    case 'onboarding':
      return { name: 'onboarding' }
    default:
      return { name: 'learn' }
  }
}

export const getRouteTab = (route: Route): TabId | null => {
  switch (route.name) {
    case 'learn':
    case 'lesson':
    case 'review':
      return 'learn'
    case 'practice':
    case 'practice-session':
    case 'listen':
    case 'pronounce':
    case 'converse':
      return 'practice'
    case 'alphabet':
    case 'letter':
      return 'alphabet'
    case 'words':
      return 'words'
    case 'profile':
    case 'progress':
    case 'glossary':
      return 'profile'
    case 'onboarding':
      return null
  }
}

/** Telas de foco (aula, sessão, onboarding) escondem a navegação inferior. */
export const isFocusRoute = (route: Route): boolean =>
  route.name === 'lesson' || route.name === 'practice-session' || route.name === 'onboarding'

const subscribeToHash = (callback: () => void): (() => void) => {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const getHashSnapshot = (): string => window.location.hash

export const useHashRoute = (): Route => {
  const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot, () => '')
  return useMemo(() => parseHash(hash), [hash])
}

export const navigateTo = (hash: string, options: { replace?: boolean } = {}): void => {
  if (options.replace) {
    window.location.replace(hash)
    return
  }
  window.location.hash = hash
}
