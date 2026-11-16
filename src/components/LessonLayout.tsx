import type { ReactNode } from 'react'
import { ProgressBar } from './ProgressBar'

interface LessonLayoutProps {
  title: string
  stepIndex: number
  stepCount: number
  onExit: () => void
  children: ReactNode
}

/** Layout em tela cheia: X + barra de progresso (como no vídeo), sem abas. */
export function LessonLayout({ title, stepIndex, stepCount, onExit, children }: LessonLayoutProps) {
  return (
    <div className="lesson">
      <header className="lesson__header lesson__header--compact">
        <button type="button" className="lesson__close" onClick={onExit} aria-label={`Sair de ${title}`}>
          ✕
        </button>
        <div className="lesson__progress">
          <ProgressBar value={stepIndex} max={stepCount} label={`Progresso: passo ${stepIndex + 1} de ${stepCount}`} />
        </div>
      </header>
      <div className="lesson__body">{children}</div>
    </div>
  )
}
