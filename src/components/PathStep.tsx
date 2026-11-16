import { CheckIcon, ChevronIcon, SkillIcon } from './icons'
import type { SkillGlyph } from './icons'

export type PathStepStatus = 'done' | 'current' | 'upcoming' | 'draft'

interface PathStepProps {
  label: string
  meta: string
  glyph: SkillGlyph
  status: PathStepStatus
  href: string
}

export function PathStep({ label, meta, glyph, status, href }: PathStepProps) {
  const active = status === 'current' || status === 'draft'
  return (
    <a
      className={`study-node study-node--${status} study-node--${glyph}`}
      href={href}
      aria-current={active ? 'step' : undefined}
    >
      <span className="study-node__icon" aria-hidden="true">
        {status === 'done' ? <CheckIcon size={27} /> : <SkillIcon kind={glyph} size={27} />}
      </span>
      <span className="study-node__copy">
        <span className="study-node__label">{label}</span>
        <span className="study-node__meta">{meta}</span>
        {active ? (
          <span className="study-node__action">
            {status === 'draft' ? 'Continuar' : 'Começar'} <ChevronIcon size={15} />
          </span>
        ) : null}
      </span>
    </a>
  )
}
