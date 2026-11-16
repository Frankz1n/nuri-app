import { useEffect, useRef } from 'react'
import { BottomNav } from './components/BottomNav'
import { OfflineReadyToast } from './components/OfflineReadyToast'
import { StorageNotice } from './components/StorageNotice'
import { UpdateBanner } from './components/UpdateBanner'
import { Alphabet } from './features/alphabet/Alphabet'
import { ConverseHome } from './features/converse/ConverseHome'
import { LearnHome } from './features/learn/LearnHome'
import { LessonPlayer } from './features/learn/LessonPlayer'
import { ListenHome } from './features/listen/ListenHome'
import { Onboarding } from './features/onboarding/Onboarding'
import { PracticeHome } from './features/practice/PracticeHome'
import { PracticeSession } from './features/practice/PracticeSession'
import { Glossary } from './features/profile/Glossary'
import { Profile } from './features/profile/Profile'
import { ProgressView } from './features/profile/ProgressView'
import { PronounceHome } from './features/pronounce/PronounceHome'
import { ReviewHub } from './features/review/ReviewHub'
import { Words } from './features/words/Words'
import { useNuri } from './state/useNuri'
import { getRouteTab, isFocusRoute, navigateTo, useHashRoute } from './state/router'
import type { Route } from './state/router'

const ROUTE_TITLES: Readonly<Record<Route['name'], string>> = {
  learn: 'Aprender',
  practice: 'Praticar',
  'practice-session': 'Exercício',
  listen: 'Escuta',
  pronounce: 'Grave e ouça',
  converse: 'Conversar',
  alphabet: 'Alfabeto',
  letter: 'Letra',
  words: 'Palavras',
  profile: 'Perfil',
  progress: 'Progresso',
  glossary: 'Glossário',
  lesson: 'Aula',
  review: 'Revisão',
  onboarding: 'Boas-vindas',
}

function renderRoute(route: Route) {
  switch (route.name) {
    case 'learn':
      return <LearnHome />
    case 'lesson':
      return <LessonPlayer key={route.lessonId} lessonId={route.lessonId} />
    case 'review':
      return <ReviewHub />
    case 'practice':
      return <PracticeHome />
    case 'practice-session':
      return <PracticeSession key={`${route.mode}/${route.argument ?? ''}`} mode={route.mode} argument={route.argument} />
    case 'listen':
      return <ListenHome />
    case 'pronounce':
      return <PronounceHome />
    case 'converse':
      return <ConverseHome />
    case 'alphabet':
      return <Alphabet />
    case 'letter':
      return <Alphabet letterId={route.letterId} />
    case 'words':
      return <Words />
    case 'profile':
      return <Profile />
    case 'progress':
      return <ProgressView />
    case 'glossary':
      return <Glossary />
    case 'onboarding':
      return <Onboarding />
  }
}

const PERSISTED_TAB_ROUTES: readonly Route['name'][] = ['learn', 'practice', 'alphabet', 'words', 'profile']

export default function App() {
  const route = useHashRoute()
  const { state, actions } = useNuri()
  const mainRef = useRef<HTMLElement>(null)
  const isOnboardingDone = state.profile.onboardingDone
  const initialLastRouteRef = useRef(state.lastRoute)

  useEffect(() => {
    const lastRoute = initialLastRouteRef.current
    if (!window.location.hash && lastRoute) navigateTo(lastRoute, { replace: true })
  }, [])

  useEffect(() => {
    const isAllowedBeforeOnboarding = route.name === 'onboarding' || route.name === 'glossary'
    if (!isOnboardingDone && !isAllowedBeforeOnboarding) navigateTo('#/onboarding', { replace: true })
    if (isOnboardingDone && route.name === 'onboarding') navigateTo('#/learn', { replace: true })
  }, [isOnboardingDone, route.name])

  useEffect(() => {
    if (PERSISTED_TAB_ROUTES.includes(route.name)) actions.setRoute(window.location.hash)
    document.title = `${ROUTE_TITLES[route.name]} · Nuri`
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [route.name, actions])

  const isFocusMode = isFocusRoute(route)

  return (
    <div className="app">
      <button type="button" className="skip-link" onClick={() => mainRef.current?.focus()}>
        Pular para o conteúdo
      </button>
      <StorageNotice />
      <main id="main" ref={mainRef} tabIndex={-1} className={`app__main${isFocusMode ? ' app__main--focus' : ''}`}>
        {renderRoute(route)}
      </main>
      <UpdateBanner />
      <OfflineReadyToast />
      {isFocusMode ? null : <BottomNav activeTab={getRouteTab(route)} />}
    </div>
  )
}
