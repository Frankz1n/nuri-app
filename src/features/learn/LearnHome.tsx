import { useEffect, useRef, useState } from 'react'
import { MASCOT_POSES } from '../../assets/mascot/poses'
import { BTS_SITUATIONS, BTS_UNIT_ID, LIVE_UNIT_ID, UNITS } from '../../data'
import type { Lesson, Unit } from '../../data'
import { getDueCards, todayKey } from '../../core'
import { AppHeader } from '../../components/AppHeader'
import { PathStep } from '../../components/PathStep'
import type { PathStepStatus } from '../../components/PathStep'
import { ChevronIcon, FlameIcon, SkillIcon } from '../../components/icons'
import type { SkillGlyph } from '../../components/icons'
import { ProgressBar } from '../../components/ProgressBar'
import { LESSON_KIND_LABELS, summarizeUnit } from '../../lib/catalog'
import { buildGuidedStudyPlan, getCurrentUnitLessons } from '../../lib/studyPath'
import { describeOrigin, originRoute, parseSessionDraft } from '../../lib/session'
import { useNuri } from '../../state/useNuri'
import { getDisplayedStreak } from '../../state/transitions'

const LESSON_GLYPHS: Record<Lesson['kind'], SkillGlyph> = {
  live: 'listen', letter: 'write', review: 'review', syllable: 'blocks',
  batchim: 'blocks', vocab: 'read', phrase: 'read', reading: 'read',
}

function glyphForLesson(lesson: Lesson, isVideoUnit: boolean): SkillGlyph {
  if (isVideoUnit) return 'video'
  if (lesson.id === 'live-cumprimentar' || lesson.id === 'live-agradecer') return 'speak'
  return LESSON_GLYPHS[lesson.kind]
}

function UnitBanner({ unit, completed, total }: { unit: Unit; completed: number; total: number }) {
  const isBts = unit.id === BTS_UNIT_ID
  const isLive = unit.id === LIVE_UNIT_ID
  return (
    <section className="study-unit study-unit--horangi" aria-labelledby="study-unit-title">
      <div className="study-unit__copy">
        <p className="study-unit__category">
          {isBts ? 'Coreano em vídeo' : isLive ? 'Escuta e fala' : `Seção 1 · Unidade ${unit.number}`}
        </p>
        <h2 id="study-unit-title">{unit.title}</h2>
        <div className="study-unit__progress">
          <ProgressBar value={completed} max={total} label="Lições concluídas nesta unidade" isCompact />
          <span aria-hidden="true">{completed}/{total}</span>
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
  const plan = buildGuidedStudyPlan(completedLessons)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const currentNode = useRef<HTMLLIElement>(null)
  const activeUnit = UNITS.find((unit) => unit.id === selectedUnitId) ?? plan.currentUnit ?? UNITS[0]
  const showingOtherUnit = selectedUnitId !== null && activeUnit.id !== plan.currentUnit?.id
  const unitLessons = getCurrentUnitLessons(activeUnit)
  const unitProgress = summarizeUnit(activeUnit, completedLessons)
  const draft = parseSessionDraft(state.activityDraft)
  const draftLessonId = draft?.origin.type === 'lesson' ? draft.origin.lessonId : undefined
  const draftOnPath = unitLessons.some((lesson) => lesson.id === draftLessonId)
  const dueCount = getDueCards(state.progress.reviewCards, today).length
  const errorCount = state.progress.errorQueue.length
  const streak = getDisplayedStreak(state.progress, today)
  const pendingReviews = dueCount + errorCount
  const nextId = plan.nextLesson?.id
  const currentIndex = unitLessons.findIndex((lesson) => lesson.id === (draftOnPath ? draftLessonId : nextId))
  const btsLesson = BTS_SITUATIONS.find((situation) => !completedLessons.includes(situation.id)) ?? BTS_SITUATIONS[0]

  useEffect(() => {
    if (currentIndex >= 3 && !showingOtherUnit) currentNode.current?.scrollIntoView({ block: 'nearest' })
  }, [activeUnit.id, currentIndex, showingOtherUnit])

  return (
    <div className="screen screen--study">
      <AppHeader
        showBrand
        title="Nuri"
        subtitle="Coreano"
        actions={streak > 0 ? (
          <a className="study-streak" href="#/profile/progress" aria-label={`Sequência de ${streak} ${streak === 1 ? 'dia' : 'dias'}`}>
            <FlameIcon size={20} /> {streak}
          </a>
        ) : undefined}
      />
      <UnitBanner unit={activeUnit} completed={unitProgress.completed} total={unitProgress.total} />

      {draft && !draftOnPath ? (
        <a className="study-quick" href={originRoute(draft.origin)}>
          <span className="study-quick__symbol"><SkillIcon kind="review" size={21} /></span>
          <span><strong>Continuar atividade</strong><small>{describeOrigin(draft.origin)} · passo {draft.index + 1}</small></span>
          <ChevronIcon size={19} />
        </a>
      ) : null}

      <section className="study-path" aria-labelledby="study-path-title">
        <div className="study-path__header">
          <h2 id="study-path-title">Sua trilha</h2>
          <label className="study-unit-picker">
            <span className="visually-hidden">Explorar unidades</span>
            <select value={selectedUnitId ?? ''} onChange={(event) => setSelectedUnitId(event.target.value || null)}>
              <option value="">Explorar unidades</option>
              {UNITS.map((unit) => <option key={unit.id} value={unit.id}>{unit.title}</option>)}
            </select>
          </label>
        </div>
        <ol className="study-path__steps">
          {unitLessons.map((lesson, index) => {
            const isDone = completedLessons.includes(lesson.id)
            const isDraft = draftLessonId === lesson.id
            const isNext = !draft && lesson.id === nextId && !isDone
            const status: PathStepStatus = isDraft ? 'draft' : isDone ? 'done' : isNext ? 'current' : 'upcoming'
            const meta = isDraft && draft
              ? `Passo ${draft.index + 1} de ${draft.steps.length}`
              : isDone ? 'Concluída · revisar' : LESSON_KIND_LABELS[lesson.kind]
            return (
              <li key={lesson.id} ref={index === currentIndex ? currentNode : undefined}>
                <PathStep
                  label={lesson.title}
                  meta={meta}
                  glyph={glyphForLesson(lesson, activeUnit.id === BTS_UNIT_ID)}
                  status={status}
                  href={`#/lesson/${lesson.id}`}
                />
              </li>
            )
          })}
        </ol>
      </section>

      {pendingReviews > 0 ? (
        <a className="study-quick study-quick--coral" href="#/review">
          <span className="study-quick__symbol"><SkillIcon kind="review" size={21} /></span>
          <span><strong>Revisar agora</strong><small>{pendingReviews} {pendingReviews === 1 ? 'item pendente' : 'itens pendentes'}</small></span>
          <ChevronIcon size={19} />
        </a>
      ) : null}
      {btsLesson && activeUnit.id !== BTS_UNIT_ID ? (
        <a className="study-quick" href={`#/lesson/${btsLesson.id}`}>
          <span className="study-quick__symbol"><SkillIcon kind="video" size={21} /></span>
          <strong>Praticar com trechos do BTS</strong>
          <ChevronIcon size={19} />
        </a>
      ) : null}
      {!nextId ? <a className="button button--primary button--block" href="#/practice">Reforçar o que aprendi</a> : null}
    </div>
  )
}
