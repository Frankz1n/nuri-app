import type { ReactNode } from 'react'
import { ProgressBar } from './ProgressBar'
import { SkillIcon } from './icons'
import type { SkillGlyph } from './icons'

interface LessonLayoutProps {
  title: string
  stepIndex: number
  stepCount: number
  activity: { glyph: SkillGlyph; label: string }
  onExit: () => void
  children: ReactNode
}

/** Layout em tela cheia: X + barra de progresso (como no vídeo), sem abas. */
export function LessonLayout({ title, stepIndex, stepCount, activity, onExit, children }: LessonLayoutProps) {
  return (
    <div className="lesson">
      <header className="lesson__header lesson__header--compact">
        <button type="button" className="lesson__close" onClick={onExit} aria-label={`Sair de ${title}`}>
          ✕
        </button>
        <div className="lesson__progress">
          <ProgressBar value={stepIndex} max={stepCount} label={`Progresso: passo ${stepIndex + 1} de ${stepCount}`} />
          <span className="lesson__step-count" aria-hidden="true">{stepIndex + 1}/{stepCount}</span>
        </div>
      </header>
      <div className={`lesson-mode lesson-mode--${activity.glyph}`}>
        <SkillIcon kind={activity.glyph} size={17} /> {activity.label}
      </div>
      <div className="lesson__body">{children}</div>
    </div>
  )
}
