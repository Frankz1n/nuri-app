import { LESSONS, getLessonById } from '../../data'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { buildLessonSteps } from '../../lib/lessonPlans'
import { createSessionRandom } from '../../lib/random'
import { useNuri } from '../../state/useNuri'
import { SessionGate } from '../session/SessionGate'
import type { SessionResult } from '../session/SessionGate'

export function LessonPlayer({ lessonId }: { lessonId: string }) {
  const { actions } = useNuri()
  const lesson = getLessonById(lessonId)

  if (!lesson) {
    return (
      <div className="screen">
        <FeedbackBanner tone="error" title="Aula não encontrada" />
        <a className="button button--primary button--block" href="#/learn">
          Voltar para Aprender
        </a>
      </div>
    )
  }

  const nextLesson = LESSONS[LESSONS.findIndex((candidate) => candidate.id === lesson.id) + 1]

  const complete = (): SessionResult => {
    const outcome = actions.completeLesson(lesson.id)
    const isFirstBlockLesson = lesson.kind === 'syllable' || lesson.kind === 'batchim'
    const celebration =
      outcome.xpGained === 0
        ? 'Você já tinha concluído esta aula, então ela não rende XP de novo.'
        : isFirstBlockLesson
          ? 'Você montou seus primeiros blocos'
          : lesson.kind === 'letter'
            ? 'Você praticou uma nova letra'
            : lesson.kind === 'live' ? 'Situação da live praticada!' : 'Aula concluída'
    return {
      xpGained: outcome.xpGained,
      newAchievementIds: outcome.newAchievements,
      message: celebration,
      nextHref: nextLesson ? `#/lesson/${nextLesson.id}` : undefined,
      nextLabel: nextLesson ? 'Próxima aula' : undefined,
    }
  }

  return (
    <SessionGate
      origin={{ type: 'lesson', lessonId: lesson.id }}
      title={lesson.title}
      exitHref="#/learn"
      buildPlan={() => ({ steps: buildLessonSteps(lesson, createSessionRandom()) })}
      complete={complete}
    />
  )
}
