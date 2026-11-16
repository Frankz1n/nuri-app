import { useState } from 'react'
import { dailyXpAmount, getDueCards, todayKey } from '../../core'
import { AppHeader } from '../../components/AppHeader'
import { ChevronIcon, SkillIcon } from '../../components/icons'
import type { SkillGlyph } from '../../components/icons'
import { PRACTICE_MODES } from '../../lib/practicePlans'
import type { PracticeMode } from '../../lib/session'
import { describeOrigin, originRoute, parseSessionDraft } from '../../lib/session'
import { PRACTICE_PILLARS } from '../../lib/studyPath'
import type { PracticePillarId } from '../../lib/studyPath'
import { useNuri } from '../../state/useNuri'

const PILLAR_GLYPHS: Record<PracticePillarId, SkillGlyph> = { sound: 'listen', write: 'write', read: 'read' }
const MODE_GLYPHS: Record<PracticeMode, SkillGlyph> = {
  write: 'write', syllables: 'blocks', pairs: 'blocks', cards: 'review', daily: 'review',
  phrases: 'read', reading: 'read', blocks: 'blocks', errors: 'review',
}

export function PracticeHome() {
  const { state } = useNuri()
  const today = todayKey()
  const draft = parseSessionDraft(state.activityDraft)
  const pending = getDueCards(state.progress.reviewCards, today).length + state.progress.errorQueue.length
  const [selected, setSelected] = useState<PracticePillarId>('sound')
  const pillar = PRACTICE_PILLARS.find((item) => item.id === selected) ?? PRACTICE_PILLARS[0]
  const actions = pillar.links?.map((item) => ({
    href: item.href, title: item.title, description: item.description,
    glyph: 'listen' as const, detail: item.chip,
  })) ?? PRACTICE_MODES.filter((mode) => pillar.modes?.includes(mode.id)).map((mode) => ({
    href: `#/practice/${mode.id}`,
    title: mode.title,
    description: mode.description,
    glyph: MODE_GLYPHS[mode.id],
    detail: mode.rewardKey && state.progress.dailyXpAwards[mode.rewardKey] !== today
      ? `+${dailyXpAmount(mode.rewardKey)} XP` : undefined,
  }))

  return (
    <div className="screen screen--study">
      <AppHeader title="Praticar" />
      {draft ? (
        <a className="study-quick" href={originRoute(draft.origin)}>
          <span className="study-quick__symbol"><SkillIcon kind="review" size={21} /></span>
          <span><strong>Continuar atividade</strong><small>{describeOrigin(draft.origin)} · passo {draft.index + 1}</small></span>
          <ChevronIcon size={19} />
        </a>
      ) : null}
      <div className="practice-picker" role="group" aria-label="Escolha uma habilidade">
        {PRACTICE_PILLARS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`practice-category practice-category--${item.id}`}
            aria-pressed={selected === item.id}
            onClick={() => setSelected(item.id)}
          >
            <SkillIcon kind={PILLAR_GLYPHS[item.id]} size={26} />
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>

      {pending > 0 ? (
        <a className="study-quick study-quick--coral" href="#/review">
          <span className="study-quick__symbol"><SkillIcon kind="review" size={21} /></span>
          <span><strong>Revisar agora</strong><small>{pending} {pending === 1 ? 'item pendente' : 'itens pendentes'}</small></span>
          <ChevronIcon size={19} />
        </a>
      ) : null}

      <section className="practice-work" aria-labelledby="practice-work-title">
        <h2 id="practice-work-title">{pillar.title}</h2>
        <ul className="practice-list">
          {actions.map((action) => (
            <li key={action.href}>
              <a className={`study-quick practice-activity practice-activity--${selected}`} href={action.href}>
                <span className="study-quick__symbol"><SkillIcon kind={action.glyph} size={22} /></span>
                <span><strong>{action.title}</strong><small>{action.description}</small></span>
                {action.detail ? <span className="practice-activity__detail">{action.detail}</span> : <ChevronIcon size={19} />}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
