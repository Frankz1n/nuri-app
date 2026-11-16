import type { ReactNode } from 'react'
import { MASCOT_POSES } from '../assets/mascot/poses'
import type { MascotPose } from '../assets/mascot/poses'

interface MascotPromptProps {
  title: string
  pose?: MascotPose
  speech?: ReactNode
  speechLanguage?: 'ko' | 'pt'
  romanization?: string
  audioSlot?: ReactNode
  children?: ReactNode
}

/** Prompt de exercício no estilo personagem + balão, com o Horangi. */
export function MascotPrompt({
  title,
  pose = 'wave',
  speech,
  speechLanguage,
  romanization,
  audioSlot,
  children,
}: MascotPromptProps) {
  return (
    <div className="mascot-prompt">
      <h2 className="mascot-prompt__title">{title}</h2>
      <div className="mascot-prompt__row">
        <img
          className="mascot-prompt__avatar"
          src={MASCOT_POSES[pose]}
          alt=""
          width={160}
          height={160}
          decoding="async"
        />
        {speech || audioSlot ? (
          <div className="mascot-prompt__bubble">
            {audioSlot}
            {romanization ? <span className="mascot-prompt__roma">{romanization}</span> : null}
            {speech ? (
              <p className="mascot-prompt__speech" lang={speechLanguage === 'ko' ? 'ko' : undefined}>
                {speech}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  )
}
