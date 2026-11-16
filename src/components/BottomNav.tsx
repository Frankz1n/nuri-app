import type { ReactNode } from 'react'
import type { TabId } from '../state/router'
import { AlphabetIcon, LearnIcon, PracticeIcon, ProfileIcon, WordsIcon } from './icons'

interface TabDefinition {
  id: TabId
  label: string
  href: string
  icon: ReactNode
}

const TABS: readonly TabDefinition[] = [
  { id: 'learn', label: 'Aprender', href: '#/learn', icon: <LearnIcon /> },
  { id: 'practice', label: 'Praticar', href: '#/practice', icon: <PracticeIcon /> },
  { id: 'alphabet', label: 'Alfabeto', href: '#/alphabet', icon: <AlphabetIcon /> },
  { id: 'words', label: 'Palavras', href: '#/words', icon: <WordsIcon /> },
  { id: 'profile', label: 'Perfil', href: '#/profile', icon: <ProfileIcon /> },
]

export function BottomNav({ activeTab }: { activeTab: TabId | null }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      <ul className="bottom-nav__list">
        {TABS.map((tab) => (
          <li key={tab.id} className="bottom-nav__item">
            <a
              href={tab.href}
              className={`bottom-nav__link${tab.id === activeTab ? ' is-active' : ''}`}
              aria-current={tab.id === activeTab ? 'page' : undefined}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
