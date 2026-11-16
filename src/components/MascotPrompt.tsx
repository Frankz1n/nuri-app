import type { ReactNode } from 'react'
import { MASCOT_POSES } from '../assets/mascot/poses'
import type { MascotPose } from '../assets/mascot/poses'
import { KoreanText } from './KoreanText'

interface MascotPromptProps {
  title: string
  pose?: MascotPose
  speech?: ReactNode
  speechLanguage?: 'ko' | 'pt'
  romanization?: string
  hangul?: string
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
  hangul,
  audioSlot,
  children,
}: MascotPromptProps) {
  const koreanBubble = hangul ? (
    <KoreanText hangul={hangul} romanization={romanization} size="md" />
  ) : speechLanguage === 'ko' && typeof speech === 'string' ? (
    <KoreanText hangul={speech} romanization={romanization} size="md" />
  ) : speech ? (
    <div className="mascot-prompt__speech">{speech}</div>
  ) : null

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
        {koreanBubble || audioSlot ? (
          <div className="mascot-prompt__bubble">
            {audioSlot}
            {koreanBubble}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  )
}
