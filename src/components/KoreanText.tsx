import { useEffect, useState } from 'react'
import { speakKorean, stopKoreanSpeech } from '../lib/audio/tts'
import { useNuri } from '../state/useNuri'

interface KoreanTextProps {
  hangul: string
  romanization?: string
  size?: 'sm' | 'md' | 'lg'
  /** Se false, esconde romanização mesmo com preferência ligada. */
  showRomanization?: boolean
  className?: string
  onHeard?: () => void
}

/** Hangul com romanização embaixo e botão para ouvir a pronúncia. */
export function KoreanText({
  hangul,
  romanization,
  size = 'md',
  showRomanization,
  className = '',
  onHeard,
}: KoreanTextProps) {
  const { state } = useNuri()
  const [isPlaying, setIsPlaying] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const shouldShowRoma = (showRomanization ?? state.profile.showRomanization) && Boolean(romanization)

  useEffect(() => () => stopKoreanSpeech(), [])

  const play = async (): Promise<void> => {
    setHint(null)
    setIsPlaying(true)
    const result = await speakKorean(hangul)
    setIsPlaying(false)
    if (result.ok) onHeard?.()
    else setHint(result.message ?? 'Não foi possível ouvir agora.')
  }

  return (
    <div className={`korean-text korean-text--${size}${className ? ` ${className}` : ''}`}>
      <div className="korean-text__row">
        <span
          className={`korean-text__listen${isPlaying ? ' is-playing' : ''}`}
          role="button"
          tabIndex={isPlaying ? -1 : 0}
          aria-disabled={isPlaying}
          aria-label={isPlaying ? 'Tocando pronúncia' : `Ouvir ${hangul}`}
          onClick={(event) => {
            event.stopPropagation()
            if (!isPlaying) void play()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              event.stopPropagation()
              if (!isPlaying) void play()
            }
          }}
        >
          {isPlaying ? '…' : '🔊'}
        </span>
        <span className="korean-text__hangul" lang="ko">
          {hangul}
        </span>
      </div>
      {shouldShowRoma ? <span className="korean-text__roma">{romanization}</span> : null}
      {hint ? (
        <p className="korean-text__hint" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
