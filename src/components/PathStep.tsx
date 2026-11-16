import type { ReactNode } from 'react'
import { CheckIcon } from './icons'

export type PathStepStatus = 'done' | 'current' | 'upcoming' | 'draft'

interface PathStepProps {
  index: number
  label: string
  meta?: string
  status: PathStepStatus
  href: string
  offset?: 'left' | 'center' | 'right'
}

const STATUS_LABEL: Record<PathStepStatus, string> = {
  done: 'Concluída',
  current: 'Próxima',
  upcoming: 'Em breve',
  draft: 'Em andamento',
}

export function PathStep({ index, label, meta, status, href, offset = 'center' }: PathStepProps) {
  const content: ReactNode = (
    <>
      <span className={`path-node path-node--${status}`} aria-hidden="true">
        {status === 'done' ? <CheckIcon size={22} /> : index}
      </span>
      <span className="path-node__copy">
        <span className="path-node__label">{label}</span>
        <span className="path-node__meta">{meta ?? STATUS_LABEL[status]}</span>
      </span>
    </>
  )

  return (
    <div className={`path-step path-step--${offset} path-step--${status}`}>
      <a
        className="path-step__hit"
        href={href}
        aria-current={status === 'current' || status === 'draft' ? 'step' : undefined}
      >
        {content}
      </a>
    </div>
  )
}
