import { useState } from 'react'
import { dailyXpAmount, getDueCards, todayKey } from '../../core'
import { AppHeader } from '../../components/AppHeader'
import { PRACTICE_MODES } from '../../lib/practicePlans'
import type { PracticeMode } from '../../lib/session'
import { describeOrigin, originRoute, parseSessionDraft } from '../../lib/session'
import {
  PRACTICE_PILLARS,
  buildGuidedStudyPlan,
  pillarForSuggestedHref,
  type PracticePillarId,
} from '../../lib/studyPath'
import { useNuri } from '../../state/useNuri'

function ModeList({
  modes,
  today,
  dueCount,
  errorCount,
  dailyXpAwards,
}: {
  modes: readonly PracticeMode[]
  today: string
  dueCount: number
  errorCount: number
  dailyXpAwards: Record<string, string>
}) {
  return (
    <ul className="practice-list">
      {modes.map((modeId) => {
        const mode = PRACTICE_MODES.find((item) => item.id === modeId)
        if (!mode) return null
        const hasReward = mode.rewardKey !== undefined
        const isRewardClaimed = mode.rewardKey !== undefined && dailyXpAwards[mode.rewardKey] === today
        const badge = !hasReward
          ? null
          : isRewardClaimed
            ? 'XP de hoje ok'
            : `+${dailyXpAmount(mode.rewardKey ?? '')} XP`
        const extra =
          mode.id === 'cards' && dueCount > 0
            ? `${dueCount} hoje`
            : mode.id === 'errors' && errorCount > 0
              ? `${errorCount} erros`
              : null
        return (
          <li key={mode.id}>
            <a className="practice-item" href={`#/practice/${mode.id}`}>
              <span className="practice-item__text">
                <span className="practice-item__title">{mode.title}</span>
                <span className="practice-item__description">{mode.description}</span>
                {badge || extra ? (
                  <span className="practice-item__badges">
                    {extra ? <span className="chip chip--accent">{extra}</span> : null}
                    {badge ? <span className={`chip${isRewardClaimed ? ' chip--done' : ''}`}>{badge}</span> : null}
                  </span>
                ) : null}
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function PracticeHome() {
  const { state, actions } = useNuri()
  const today = todayKey()
  const draft = parseSessionDraft(state.activityDraft)
  const dueCount = getDueCards(state.progress.reviewCards, today).length
  const errorCount = state.progress.errorQueue.length
  const hasReviewWork = dueCount > 0 || errorCount > 0
  const plan = buildGuidedStudyPlan(state.progress.completedLessons)
  const [openPillar, setOpenPillar] = useState<PracticePillarId | null>(() =>
    pillarForSuggestedHref(plan.suggestedPractice.href),
  )

  return (
    <div className="screen screen--guided">
      <AppHeader title="Praticar" subtitle="Reforce o que a trilha já abriu." />

      {hasReviewWork ? (
        <a className="path-review" href="#/review">
          <span className="path-review__label">Revisar agora</span>
          <span className="path-review__meta">
            {dueCount > 0 ? `${dueCount} cartões` : null}
            {dueCount > 0 && errorCount > 0 ? ' · ' : null}
            {errorCount > 0 ? `${errorCount} erros` : null}
          </span>
        </a>
      ) : null}

      {draft ? (
        <section className="path-hero" aria-labelledby="continue-practice">
          <h2 id="continue-practice" className="path-hero__title">
            Continuar exercício
          </h2>
          <p className="path-hero__meta">
            {describeOrigin(draft.origin)} — passo {draft.index + 1} de {draft.steps.length}
          </p>
          <div className="path-hero__actions">
            <a className="button button--primary button--block" href={originRoute(draft.origin)}>
              Continuar
            </a>
            <button type="button" className="button button--ghost button--block" onClick={actions.clearDraft}>
              Descartar
            </button>
          </div>
        </section>
      ) : (
        <section className="path-hero" aria-labelledby="suggest-title">
          <p className="path-hero__unit">Sugestão de hoje</p>
          <h2 id="suggest-title" className="path-hero__title">
            {plan.suggestedPractice.title}
          </h2>
          <p className="path-hero__meta">{plan.suggestedPractice.reason}</p>
          <div className="path-hero__actions">
            <a className="button button--primary button--block" href={plan.suggestedPractice.href}>
              Praticar isso
            </a>
          </div>
        </section>
      )}

      <section aria-labelledby="pillars-title">
        <h2 id="pillars-title" className="section-title">
          Modalidades
        </h2>
        <div className="pillar-accordion">
          {PRACTICE_PILLARS.map((pillar) => {
            const isOpen = openPillar === pillar.id
            return (
              <section key={pillar.id} className={`pillar-panel${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="pillar-panel__toggle"
                  aria-expanded={isOpen}
                  onClick={() => setOpenPillar(isOpen ? null : pillar.id)}
                >
                  <span>
                    <span className="pillar-panel__title">{pillar.title}</span>
                    <span className="pillar-panel__text">{pillar.text}</span>
                  </span>
                  <span className="pillar-panel__chevron" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen ? (
                  <div className="pillar-panel__body">
                    {pillar.modes ? (
                      <ModeList
                        modes={pillar.modes}
                        today={today}
                        dueCount={dueCount}
                        errorCount={errorCount}
                        dailyXpAwards={state.progress.dailyXpAwards}
                      />
                    ) : null}
                    {pillar.links ? (
                      <ul className="practice-list">
                        {pillar.links.map((item) => (
                          <li key={item.href}>
                            <a className="practice-item" href={item.href}>
                              <span className="practice-item__text">
                                <span className="practice-item__title">{item.title}</span>
                                <span className="practice-item__description">{item.description}</span>
                                {item.chip ? (
                                  <span className="practice-item__badges">
                                    <span className="chip">{item.chip}</span>
                                  </span>
                                ) : null}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      </section>
    </div>
  )
}
