import type { ReactNode } from 'react'

export type FeedbackTone = 'success' | 'error' | 'info'

interface FeedbackBannerProps {
  tone: FeedbackTone
  title: string
  children?: ReactNode
}

const TONE_ICON: Readonly<Record<FeedbackTone, string>> = { success: '✓', error: '!', info: 'i' }

export function FeedbackBanner({ tone, title, children }: FeedbackBannerProps) {
  return (
    <div className={`feedback feedback--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="feedback__icon" aria-hidden="true">
        {TONE_ICON[tone]}
      </span>
      <div className="feedback__body">
        <p className="feedback__title">{title}</p>
        {children ? <div className="feedback__text">{children}</div> : null}
      </div>
    </div>
  )
}
