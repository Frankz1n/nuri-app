import type { ReactNode } from 'react'
import { MASCOT_POSES } from '../assets/mascot/poses'

interface FinishStat {
  label: string
  value: string
  tone: 'xp' | 'accuracy' | 'time'
}

interface FinishCelebrationProps {
  title: string
  stats: readonly FinishStat[]
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
  children?: ReactNode
}

/** Tela de lição concluída com Horangi e cards de XP/acerto/tempo. */
export function FinishCelebration({
  title,
  stats,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  children,
}: FinishCelebrationProps) {
  return (
    <div className="finish finish--celebrate">
      <img className="finish__hero" src={MASCOT_POSES.jump} alt="" width={220} height={220} />
      <h1 className="finish__headline">{title}</h1>
      <ul className="finish__stats">
        {stats.map((stat) => (
          <li key={stat.label} className={`finish__stat finish__stat--${stat.tone}`}>
            <span className="finish__stat-label">{stat.label}</span>
            <strong className="finish__stat-value">{stat.value}</strong>
          </li>
        ))}
      </ul>
      {children}
      <div className="finish__actions">
        <a className="button button--primary button--block" href={primaryHref}>
          {primaryLabel}
        </a>
        {secondaryHref && secondaryLabel ? (
          <a className="button button--secondary button--block" href={secondaryHref}>
            {secondaryLabel}
          </a>
        ) : null}
      </div>
    </div>
  )
}
