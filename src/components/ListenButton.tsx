import { useEffect, useState } from 'react'
import { getAudioProvider } from '../lib/audio'
import type { AudioAvailability } from '../lib/audio'

interface ListenButtonProps {
  audioKey: string
  label?: string
  className?: string
}

/**
 * Botão de ouvir ligado ao AudioProvider.
 * Com o provider null fica desabilitado (“Áudio em breve”), sem áudio inventado.
 */
export function ListenButton({ audioKey, label = 'Ouvir', className = '' }: ListenButtonProps) {
  const [status, setStatus] = useState<AudioAvailability>('unavailable')
  const [hint, setHint] = useState('Áudio em breve.')
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getAudioProvider()
      .getClip(audioKey)
      .then((clip) => {
        if (cancelled) return
        setStatus(clip.status)
        if (clip.message) setHint(clip.message)
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('unavailable')
          setHint('Áudio em breve.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [audioKey])

  const isReady = status === 'ready'
  const hintId = `${audioKey}-listen-hint`

  const handleClick = async (): Promise<void> => {
    if (!isReady) return
    setIsBusy(true)
    try {
      const clip = (await getAudioProvider().play?.(audioKey)) ?? (await getAudioProvider().getClip(audioKey))
      if (clip.status !== 'ready' || !clip.url) {
        setStatus(clip.status)
        setHint(clip.message ?? 'Áudio em breve.')
        return
      }
      const audio = new Audio(clip.url)
      await audio.play()
    } catch {
      setHint('Não foi possível tocar o áudio agora.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className={`listen-button${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="button button--secondary"
        onClick={() => {
          void handleClick()
        }}
        disabled={!isReady || isBusy}
        aria-describedby={hintId}
      >
        {isBusy ? 'Tocando…' : label}
      </button>
      {!isReady ? <span className="chip">Áudio em breve</span> : null}
      <p id={hintId} className="field__hint" role="status">
        {isReady ? 'Toque para ouvir a pronúncia modelo.' : hint}
      </p>
    </div>
  )
}
