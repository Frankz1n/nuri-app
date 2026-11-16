import type { ReactNode } from 'react'

export type AnswerSheetTone = 'correct' | 'wrong' | 'skip'

interface AnswerSheetProps {
  tone: AnswerSheetTone
  title: string
  detail?: ReactNode
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  onExplain?: () => void
  explainLabel?: string
}

const TONE_CHECK: Record<AnswerSheetTone, string> = {
  correct: '✓',
  wrong: '✕',
  skip: '→',
}

/** Painel inferior de acerto/erro no fluxo da lição. */
export function AnswerSheet({
  tone,
  title,
  detail,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onExplain,
  explainLabel = 'Explique minha resposta',
}: AnswerSheetProps) {
  return (
    <div className={`answer-sheet answer-sheet--${tone}`} role={tone === 'wrong' ? 'alert' : 'status'}>
      <div className="answer-sheet__head">
        <span className="answer-sheet__mark" aria-hidden="true">
          {TONE_CHECK[tone]}
        </span>
        <p className="answer-sheet__title">{title}</p>
      </div>
      {detail ? <div className="answer-sheet__detail">{detail}</div> : null}
      <div className="answer-sheet__actions">
        {onExplain ? (
          <button type="button" className="button button--ghost answer-sheet__explain" onClick={onExplain}>
            {explainLabel}
          </button>
        ) : null}
        {secondaryLabel && onSecondary ? (
          <button type="button" className="button button--secondary button--block" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        ) : null}
        <button type="button" className={`button button--block answer-sheet__primary answer-sheet__primary--${tone}`} onClick={onPrimary}>
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}
