import { useEffect, useRef, useState } from 'react'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { createSessionId } from '../../lib/random'
import { SESSION_DRAFT_TYPE, describeOrigin, isSameOrigin, originRoute, parseSessionDraft } from '../../lib/session'
import type { SessionDraftPayload, SessionOrigin } from '../../lib/session'
import type { Step } from '../../lib/steps'
import { ACHIEVEMENTS } from '../../state/achievements'
import { useNuri } from '../../state/useNuri'
import { navigateTo } from '../../state/router'
import { SessionRunner } from './SessionRunner'
import type { SessionSummary } from './SessionRunner'

export interface SessionPlan {
  steps: Step[]
  emptyMessage?: string
}

export interface SessionResult {
  xpGained: number
  newAchievementIds: string[]
  message?: string
  nextHref?: string
  nextLabel?: string
}

interface SessionGateProps {
  origin: SessionOrigin
  title: string
  exitHref: string
  buildPlan: () => SessionPlan
  complete: (summary: SessionSummary) => SessionResult
}

type GatePhase =
  | { kind: 'conflict'; existing: SessionDraftPayload }
  | { kind: 'empty'; message: string }
  | { kind: 'running'; session: SessionDraftPayload }
  | { kind: 'finished'; summary: SessionSummary; result: SessionResult }

/**
 * Decide entre retomar o rascunho salvo, avisar que outra atividade seria substituída
 * ou começar uma sessão nova. O progresso do passo atual é gravado a cada avanço.
 */
export function SessionGate({ origin, title, exitHref, buildPlan, complete }: SessionGateProps) {
  const { state, actions } = useNuri()

  const startNewSession = (): GatePhase => {
    const plan = buildPlan()
    if (plan.steps.length === 0) return { kind: 'empty', message: plan.emptyMessage ?? 'Nada para praticar agora.' }
    return {
      kind: 'running',
      session: { origin, sessionId: createSessionId(), steps: plan.steps, index: 0, gradedCount: 0, firstTryHits: 0 },
    }
  }

  const [phase, setPhase] = useState<GatePhase>(() => {
    const existing = parseSessionDraft(state.activityDraft)
    if (!existing) return startNewSession()
    if (isSameOrigin(existing.origin, origin)) return { kind: 'running', session: existing }
    return { kind: 'conflict', existing }
  })

  const initialSessionRef = useRef(phase.kind === 'running' ? phase.session : null)
  useEffect(() => {
    // Só na montagem: grava o ponto de partida para sobreviver a um recarregamento.
    if (initialSessionRef.current) actions.setDraft(SESSION_DRAFT_TYPE, initialSessionRef.current)
    initialSessionRef.current = null
  }, [actions])

  const handleProgress = (progress: SessionDraftPayload): void => {
    actions.setDraft(SESSION_DRAFT_TYPE, progress)
  }

  const handleFinish = (summary: SessionSummary): void => {
    const result = complete(summary)
    actions.clearDraft()
    setPhase({ kind: 'finished', summary, result })
  }

  const handleReplace = (): void => {
    const nextPhase = startNewSession()
    if (nextPhase.kind === 'running') actions.setDraft(SESSION_DRAFT_TYPE, nextPhase.session)
    else actions.clearDraft()
    setPhase(nextPhase)
  }

  if (phase.kind === 'conflict') {
    return (
      <div className="screen">
        <h1 className="screen__title">Atividade em andamento</h1>
        <FeedbackBanner tone="info" title={`Você ainda não terminou: ${describeOrigin(phase.existing.origin)}`}>
          Começar &ldquo;{title}&rdquo; vai substituir o progresso dessa atividade (passo {phase.existing.index + 1} de{' '}
          {phase.existing.steps.length}).
        </FeedbackBanner>
        <div className="stack">
          <button
            type="button"
            className="button button--primary button--block"
            onClick={() => navigateTo(originRoute(phase.existing.origin), { replace: true })}
          >
            Retomar a anterior
          </button>
          <button type="button" className="button button--secondary button--block" onClick={handleReplace}>
            Substituir e começar esta
          </button>
          <a className="button button--ghost button--block" href={exitHref}>
            Voltar
          </a>
        </div>
      </div>
    )
  }

  if (phase.kind === 'empty') {
    return (
      <div className="screen">
        <h1 className="screen__title">{title}</h1>
        <FeedbackBanner tone="info" title="Nada por aqui ainda">
          {phase.message}
        </FeedbackBanner>
        <a className="button button--primary button--block" href={exitHref}>
          Voltar
        </a>
      </div>
    )
  }

  if (phase.kind === 'finished') {
    const { summary, result } = phase
    const achievementTitles = result.newAchievementIds.flatMap(
      (achievementId) => ACHIEVEMENTS.find((achievement) => achievement.id === achievementId)?.title ?? [],
    )
    const backLabel = exitHref === '#/learn' ? 'Voltar à trilha' : 'Voltar'
    return (
      <div className="screen finish">
        <p className="finish__mascot" lang="ko" aria-hidden="true">
          늘
        </p>
        <h1 className="screen__title">{result.message ?? 'Atividade concluída'}</h1>
        <p className="finish__score">
          {summary.gradedCount > 0
            ? `${summary.firstTryHits} de ${summary.gradedCount} acertos de primeira`
            : 'Você completou todos os passos.'}
        </p>
        <p className="finish__xp">{result.xpGained > 0 ? `+${result.xpGained} XP` : 'Sem XP novo desta vez'}</p>
        {achievementTitles.length > 0 ? (
          <FeedbackBanner tone="success" title="Nova conquista!">
            {achievementTitles.join(', ')}
          </FeedbackBanner>
        ) : null}
        <div className="stack">
          <a className="button button--primary button--block" href={exitHref}>
            {backLabel}
          </a>
          {result.nextHref ? (
            <a className="button button--secondary button--block" href={result.nextHref}>
              {result.nextLabel ?? 'Próxima aula'}
            </a>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <SessionRunner
      title={title}
      session={phase.session}
      onProgress={handleProgress}
      onExit={() => navigateTo(exitHref)}
      onFinish={handleFinish}
    />
  )
}
