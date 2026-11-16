import { useEffect, useRef, useState } from 'react'
import { LIVE_UNIT_ID, UNITS } from '../../data'
import { XP_LESSON_FIRST, getDueCards, todayKey } from '../../core'
import { AppHeader } from '../../components/AppHeader'
import { PathStep } from '../../components/PathStep'
import type { PathStepStatus } from '../../components/PathStep'
import { FlameIcon } from '../../components/icons'
import { LESSON_KIND_LABELS } from '../../lib/catalog'
import { buildGuidedStudyPlan, getCurrentUnitLessons } from '../../lib/studyPath'
import { describeOrigin, originRoute, parseSessionDraft } from '../../lib/session'
import { useNuri } from '../../state/useNuri'
import { getDisplayedStreak } from '../../state/transitions'

export function LearnHome() {
  const { state, actions } = useNuri()
  const today = todayKey()
  const { completedLessons } = state.progress
  const plan = buildGuidedStudyPlan(completedLessons)
  const [isExploring, setIsExploring] = useState(false)
  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => plan.currentUnit?.id ?? UNITS[0].id)
  const currentNodeRef = useRef<HTMLLIElement | null>(null)

  const activeUnit = isExploring
    ? (UNITS.find((unit) => unit.id === selectedUnitId) ?? plan.currentUnit ?? UNITS[0])
    : (plan.currentUnit ?? UNITS[0])
  const isLiveUnit = activeUnit.id === LIVE_UNIT_ID
  const unitLessons = getCurrentUnitLessons(activeUnit)
  const draft = parseSessionDraft(state.activityDraft)
  const dueCount = getDueCards(state.progress.reviewCards, today).length
  const errorCount = state.progress.errorQueue.length
  const streak = getDisplayedStreak(state.progress, today)
  const hasReviewWork = dueCount > 0 || errorCount > 0
  const draftIsCurrentLesson =
    draft?.origin.type === 'lesson' && plan.nextLesson ? draft.origin.lessonId === plan.nextLesson.id : false

  useEffect(() => {
    if (isExploring) return
    currentNodeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeUnit.id, plan.nextLesson?.id, draft?.origin, isExploring])

  const primaryHref = draft ? originRoute(draft.origin) : plan.nextLesson ? `#/lesson/${plan.nextLesson.id}` : '#/practice'
  const primaryLabel = draft ? 'Continuar' : plan.nextLesson ? 'Começar' : 'Ir para Praticar'
  const primaryTitle = draft
    ? describeOrigin(draft.origin)
    : plan.nextLesson
      ? plan.nextLesson.title
      : 'Trilha concluída'
  const primaryMeta = draft
    ? `Em andamento · passo ${draft.index + 1} de ${draft.steps.length}`
    : plan.nextLesson
      ? plan.nextLesson.kind === 'live'
        ? 'Escute a fala, acompanhe o texto e pratique sua resposta.'
        : `${LESSON_KIND_LABELS[plan.nextLesson.kind]} · +${XP_LESSON_FIRST} XP na primeira vez`
      : 'Use Praticar para reforçar o que aprendeu.'

  return (
    <div className="screen screen--path">
      <AppHeader
        showBrand
        title="Nuri"
        subtitle={streak > 0 ? `Sequência · ${streak} ${streak === 1 ? 'dia' : 'dias'}` : 'Coreano para ouvir, falar, ler e escrever'}
        actions={
          streak > 0 ? (
            <span className="chip chip--accent" aria-hidden="true">
              <FlameIcon size={18} /> {streak}
            </span>
          ) : null
        }
      />

      <section className="path-hero" aria-labelledby="unit-objective">
        <p id="unit-objective" className="path-hero__unit">
          {isLiveUnit ? activeUnit.title : `Unidade ${activeUnit.number} · ${activeUnit.title}`}
        </p>
        <h2 className="path-hero__title">{primaryTitle}</h2>
        <p className="path-hero__meta">{primaryMeta}</p>
        <div className="path-hero__actions">
          <a className="button button--primary button--block" href={primaryHref}>
            {primaryLabel}
          </a>
          {draft ? (
            <button type="button" className="button button--ghost button--block" onClick={actions.clearDraft}>
              Descartar rascunho
            </button>
          ) : null}
        </div>
      </section>

      {hasReviewWork ? (
        <a className="path-review" href="#/review">
          <span className="path-review__label">Revisar</span>
          <span className="path-review__meta">
            {dueCount > 0 ? `${dueCount} ${dueCount === 1 ? 'cartão' : 'cartões'}` : null}
            {dueCount > 0 && errorCount > 0 ? ' · ' : null}
            {errorCount > 0 ? `${errorCount} ${errorCount === 1 ? 'erro' : 'erros'}` : null}
          </span>
        </a>
      ) : null}

      <section className="path-trail" aria-labelledby="path-title">
        <div className="path-trail__header">
          <div>
            <h2 id="path-title" className="path-trail__heading">
              {isExploring ? activeUnit.title : 'Sua trilha'}
            </h2>
            <p className="path-trail__sub">{activeUnit.description}</p>
          </div>
          <button type="button" className="button button--ghost" onClick={() => setIsExploring((value) => !value)}>
            {isExploring ? 'Voltar' : 'Explorar unidades'}
          </button>
        </div>

        {isExploring ? (
          <div className="unit-picker unit-picker--explore" role="tablist" aria-label="Unidades">
            {UNITS.map((unit) => {
              const summary = summarizeForChip(unit.id, completedLessons)
              const isSelected = unit.id === activeUnit.id
              return (
                <button
                  key={unit.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={unit.title}
                  className={`unit-chip${isSelected ? ' is-active' : ''}`}
                  onClick={() => setSelectedUnitId(unit.id)}
                >
                  <span className="unit-chip__number">{unit.id === LIVE_UNIT_ID ? 'Live' : unit.number}</span>
                  <span className="unit-chip__progress">
                    {summary.completed}/{summary.total}
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}

        <ol className="path-nodes">
          {unitLessons.map((lesson, index) => {
            const isDone = completedLessons.includes(lesson.id)
            const isDraftHere = draft?.origin.type === 'lesson' && draft.origin.lessonId === lesson.id
            const isNext = !isDone && plan.nextLesson?.id === lesson.id
            const status: PathStepStatus = isDraftHere ? 'draft' : isDone ? 'done' : isNext ? 'current' : 'upcoming'
            const offset = index % 3 === 0 ? 'left' : index % 3 === 1 ? 'center' : 'right'
            const isFocusNode = isDraftHere || (isNext && !draft) || (draftIsCurrentLesson && isNext)
            return (
              <li
                key={lesson.id}
                ref={isFocusNode ? currentNodeRef : undefined}
                className={`path-nodes__item path-nodes__item--${offset}`}
              >
                <PathStep
                  index={index + 1}
                  label={lesson.title}
                  meta={
                    isDraftHere
                      ? 'Em andamento'
                      : isDone
                        ? 'Concluída · revisar'
                        : isNext
                          ? 'Próxima'
                          : LESSON_KIND_LABELS[lesson.kind]
                  }
                  status={status}
                  href={`#/lesson/${lesson.id}`}
                  offset={offset}
                />
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

const summarizeForChip = (unitId: string, completedLessons: readonly string[]) => {
  const unit = UNITS.find((item) => item.id === unitId)
  if (!unit) return { completed: 0, total: 0 }
  return {
    completed: unit.lessonIds.filter((lessonId) => completedLessons.includes(lessonId)).length,
    total: unit.lessonIds.length,
  }
}
