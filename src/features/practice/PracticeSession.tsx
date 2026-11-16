import { todayKey } from '../../core'
import { READINGS } from '../../data'
import { AppHeader } from '../../components/AppHeader'
import { buildPracticePlan, getPracticeModeInfo } from '../../lib/practicePlans'
import { createRandom, createSessionRandom, hashSeed } from '../../lib/random'
import { PRACTICE_MODE_TITLES } from '../../lib/session'
import type { PracticeMode } from '../../lib/session'
import { useNuri } from '../../state/useNuri'
import { SessionGate } from '../session/SessionGate'
import type { SessionResult } from '../session/SessionGate'

interface PracticeSessionProps {
  mode: PracticeMode
  argument?: string
}

function ReadingChooser() {
  return (
    <div className="screen">
      <AppHeader title="Leitura guiada" subtitle="Escolha um texto." backHref="#/practice" backLabel="Voltar para Praticar" />
      <ul className="practice-list">
        {READINGS.map((reading) => (
          <li key={reading.id}>
            <a className="practice-item" href={`#/practice/reading/${reading.id}`}>
              <span className="practice-item__text">
                <span className="practice-item__title">{reading.title}</span>
                <span className="practice-item__description">
                  {reading.lines.length} linhas · {reading.questions.length} perguntas
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PracticeSession({ mode, argument }: PracticeSessionProps) {
  const { state, actions } = useNuri()

  if (mode === 'reading' && !argument) return <ReadingChooser />

  const info = getPracticeModeInfo(mode)

  const buildPlan = () => {
    const today = todayKey()
    const random = mode === 'daily' ? createRandom(hashSeed(`nuri-daily-${today}`)) : createSessionRandom()
    return buildPracticePlan(mode, { state, today, random, argument })
  }

  const complete = (): SessionResult => {
    if (!info.rewardKey) return { xpGained: 0, newAchievementIds: [], message: 'Este exercício é livre: pratique quantas vezes quiser.' }
    const outcome = actions.awardDailyXp(info.rewardKey)
    return {
      xpGained: outcome.xpGained,
      newAchievementIds: outcome.newAchievements,
      message: outcome.xpGained === 0 ? 'O XP deste exercício já foi recebido hoje. Volte amanhã para mais.' : undefined,
    }
  }

  return (
    <SessionGate
      origin={{ type: 'practice', mode, ...(argument ? { argument } : {}) }}
      title={PRACTICE_MODE_TITLES[mode]}
      exitHref="#/practice"
      buildPlan={buildPlan}
      complete={complete}
    />
  )
}
