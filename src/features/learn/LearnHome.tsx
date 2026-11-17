import { useEffect, useRef, useState } from 'react'
import { MASCOT_POSES } from '../../assets/mascot/poses'
import { CURRICULUM_STAGES, CURRICULUM_WEEKS, getWeekByNumber } from '../../data'
import type { CurriculumSession } from '../../data'
import { getDueCards, todayKey } from '../../core'
import { AppHeader } from '../../components/AppHeader'
import { PathStep } from '../../components/PathStep'
import type { PathStepStatus } from '../../components/PathStep'
import { ChevronIcon, FlameIcon, SkillIcon } from '../../components/icons'
import type { SkillGlyph } from '../../components/icons'
import { ProgressBar } from '../../components/ProgressBar'
import { buildGuidedCurriculumPlan } from '../../lib/curriculumPath'
import { describeOrigin, originRoute, parseSessionDraft } from '../../lib/session'
import { useNuri } from '../../state/useNuri'
import { getDisplayedStreak } from '../../state/transitions'

const SKILL_GLYPHS: Record<CurriculumSession['skillFocus'], SkillGlyph> = {
  listen: 'listen',
  read: 'read',
  speak: 'speak',
  write: 'write',
  transfer: 'review',
}

const DAY_SHORT = ['D1', 'D2', 'D3', 'D4', 'D5'] as const

function WeekBanner({
  phaseLabel,
  weekLabel,
  phaseHint,
  completed,
  total,
}: {
  phaseLabel: string
  weekLabel: string
  phaseHint: string
  completed: number
  total: number
}) {
  return (
    <section className="study-unit study-unit--horangi" aria-labelledby="study-unit-title">
      <div className="study-unit__copy">
        <p className="study-unit__category">{phaseLabel}</p>
        <h2 id="study-unit-title">{weekLabel}</h2>
        <p className="study-unit__hint">{phaseHint}</p>
        <div className="study-unit__progress">
          <ProgressBar value={completed} max={Math.max(1, total)} label="Sessões da semana" isCompact />
          <span aria-hidden="true">
            {completed}/{total}
          </span>
        </div>
      </div>
      <img
        className="study-unit__mascot"
        src={completed === total && total > 0 ? MASCOT_POSES.jump : MASCOT_POSES.wave}
        alt=""
        width={320}
        height={320}
      />
    </section>
  )
}

export function LearnHome() {
  const { state } = useNuri()
  const today = todayKey()
  const { completedLessons } = state.progress
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const plan = buildGuidedCurriculumPlan(completedLessons, selectedWeek)
  const currentNode = useRef<HTMLLIElement>(null)
  const draft = parseSessionDraft(state.activityDraft)
  const draftLessonId = draft?.origin.type === 'lesson' ? draft.origin.lessonId : undefined
  const dueCount = getDueCards(state.progress.reviewCards, today).length
  const errorCount = state.progress.errorQueue.length
  const streak = getDisplayedStreak(state.progress, today)
  const pendingReviews = dueCount + errorCount
  const nextId = plan.nextSession?.lessonId
  const currentIndex = plan.sessions.findIndex((session) =>
    draftLessonId ? session.lessonId === draftLessonId : session.lessonId === nextId,
  )
  const weeksForStage = CURRICULUM_WEEKS.filter((week) =>
    selectedStageId ? week.stageId === selectedStageId : true,
  )

  useEffect(() => {
    if (currentIndex >= 0) currentNode.current?.scrollIntoView({ block: 'nearest' })
  }, [plan.week.number, currentIndex])

  const playableTotal = plan.weekProgress.playableTotal
  const progressValue = playableTotal > 0 ? plan.weekProgress.playableDone : plan.weekProgress.completed
  const progressMax = playableTotal > 0 ? playableTotal : plan.weekProgress.total

  return (
    <div className="screen screen--study">
      <AppHeader
        showBrand
        title="Nuri"
        subtitle="Trilha anual"
        actions={
          streak > 0 ? (
            <a
              className="study-streak"
              href="#/profile/progress"
              aria-label={`Sequência de ${streak} ${streak === 1 ? 'dia' : 'dias'}`}
            >
              <FlameIcon size={20} /> {streak}
            </a>
          ) : undefined
        }
      />
      <WeekBanner
        phaseLabel={plan.phaseLabel}
        weekLabel={plan.weekLabel}
        phaseHint={plan.phaseHint}
        completed={progressValue}
        total={progressMax}
      />

      {draft ? (
        <a className="study-quick" href={originRoute(draft.origin)}>
          <span className="study-quick__symbol">
            <SkillIcon kind="review" size={21} />
          </span>
          <span>
            <strong>Continuar atividade</strong>
            <small>
              {describeOrigin(draft.origin)} · passo {draft.index + 1}
            </small>
          </span>
          <ChevronIcon size={19} />
        </a>
      ) : null}

      <section className="study-path" aria-labelledby="study-path-title">
        <div className="study-path__header">
          <h2 id="study-path-title">Semana · D1 a D5</h2>
          <div className="study-unit-pickers">
            <label className="study-unit-picker">
              <span className="visually-hidden">Etapa</span>
              <select
                value={selectedStageId ?? ''}
                onChange={(event) => {
                  const stageId = event.target.value ? Number(event.target.value) : null
                  setSelectedStageId(stageId)
                  if (stageId) {
                    const firstWeek = CURRICULUM_WEEKS.find((week) => week.stageId === stageId)
                    setSelectedWeek(firstWeek?.number ?? null)
                  }
                }}
              >
                <option value="">Todas as etapas</option>
                {CURRICULUM_STAGES.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    Etapa {stage.id} · {stage.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="study-unit-picker">
              <span className="visually-hidden">Semana</span>
              <select
                value={selectedWeek ?? plan.week.number}
                onChange={(event) => setSelectedWeek(Number(event.target.value))}
              >
                {weeksForStage.map((week) => (
                  <option key={week.number} value={week.number}>
                    {String(week.number).padStart(2, '0')} · {week.mission}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {plan.weekProgress.playableTotal === 0 ? (
          <section className="card card--muted curriculum-outline" aria-labelledby="outline-title">
            <h3 id="outline-title" className="card__title">
              Roteiro desta semana
            </h3>
            <p className="card__text">
              <strong>Coreano-alvo:</strong> {plan.week.targetKorean}
            </p>
            <p className="card__text">{plan.week.daysSummary.d1to3}</p>
            <p className="card__text">{plan.week.daysSummary.d4to5}</p>
            <p className="field__hint">
              As sessões jogáveis cobrem as semanas 1–4 (até o marco do pedido no café). Esta semana já está no
              calendário anual e recebe conteúdo nos próximos lotes.
            </p>
            <a className="button button--secondary" href="#/lesson/lesson-speak-01">
              Ir para Semana 1 jogável
            </a>
          </section>
        ) : null}

        <ol className="study-path__steps">
          {plan.sessions.map((session, index) => {
            const isDone = session.lessonId ? completedLessons.includes(session.lessonId) : false
            const isDraft = draftLessonId !== undefined && session.lessonId === draftLessonId
            const isNext = !draft && session.lessonId === nextId && !isDone
            const isOutline = session.status === 'outline'
            const status: PathStepStatus = isOutline
              ? 'upcoming'
              : isDraft
                ? 'draft'
                : isDone
                  ? 'done'
                  : isNext
                    ? 'current'
                    : 'upcoming'
            const meta = isOutline
              ? 'Roteiro · em breve'
              : isDraft && draft
                ? `Passo ${draft.index + 1} de ${draft.steps.length}`
                : isDone
                  ? 'Concluída · revisar'
                  : `${DAY_SHORT[session.day - 1]} · ${session.skillFocus}`
            return (
              <li key={session.id} ref={index === currentIndex ? currentNode : undefined}>
                <PathStep
                  label={`${DAY_SHORT[session.day - 1]} · ${session.title}`}
                  meta={meta}
                  glyph={SKILL_GLYPHS[session.skillFocus]}
                  status={status}
                  href={session.lessonId && !isOutline ? `#/lesson/${session.lessonId}` : undefined}
                />
              </li>
            )
          })}
        </ol>
      </section>

      {pendingReviews > 0 ? (
        <a className="study-quick study-quick--coral" href="#/review">
          <span className="study-quick__symbol">
            <SkillIcon kind="review" size={21} />
          </span>
          <span>
            <strong>Revisar agora</strong>
            <small>
              {pendingReviews} {pendingReviews === 1 ? 'item pendente' : 'itens pendentes'}
            </small>
          </span>
          <ChevronIcon size={19} />
        </a>
      ) : null}

      {!plan.nextSession ? (
        <a className="button button--primary button--block" href="#/practice">
          Reforçar o que aprendi
        </a>
      ) : null}

      {selectedWeek && selectedWeek !== 1 && getWeekByNumber(1) ? (
        <button type="button" className="button button--ghost button--block" onClick={() => setSelectedWeek(1)}>
          Voltar à Semana 1
        </button>
      ) : null}
    </div>
  )
}
