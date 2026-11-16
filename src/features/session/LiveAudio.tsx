import { useEffect, useRef, useState } from 'react'
import type { LiveClipRole, LiveSituation } from '../../data/live'

const bundledClips = import.meta.glob<string>('../../assets/live-audio/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
})

function getLocalKoreanVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis?.getVoices().find((voice) =>
    voice.localService && /^ko(?:-|_|$)/i.test(voice.lang),
  )
}

interface LiveAudioProps {
  situation: LiveSituation
  role: LiveClipRole
  label: string
  onHeard?: () => void
}

export function LiveAudio({ situation, role, label, onHeard }: LiveAudioProps) {
  const clip = bundledClips[`../../assets/live-audio/${situation.id}-${role}.mp3`]
  const player = useRef<HTMLAudioElement | null>(null)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const [hasVoice, setHasVoice] = useState(() => !!getLocalKoreanVoice())
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const speech = window.speechSynthesis
    const refresh = () => setHasVoice(!!getLocalKoreanVoice())
    refresh()
    speech?.addEventListener('voiceschanged', refresh)
    return () => {
      speech?.removeEventListener('voiceschanged', refresh)
      if (player.current) {
        player.current.onended = null
        player.current.onerror = null
        player.current.pause()
        player.current = null
      }
      if (utterance.current) {
        utterance.current.onend = null
        utterance.current.onerror = null
        utterance.current = null
        speech?.cancel()
      }
    }
  }, [])

  const play = () => {
    setError('')
    const voice = clip ? undefined : getLocalKoreanVoice()
    if (!clip && !voice) {
      setHasVoice(false)
      return
    }
    setPlaying(true)

    if (clip) {
      const audio = new Audio(clip)
      player.current = audio
      const finish = (ok: boolean) => {
        if (player.current !== audio) return
        player.current = null
        setPlaying(false)
        if (ok) onHeard?.()
        else setError('Não deu pra tocar o áudio. Tente novamente.')
      }
      audio.onended = () => finish(true)
      audio.onerror = () => finish(false)
      void audio.play().catch(() => finish(false))
    } else if (voice) {
      try {
        const speech = new SpeechSynthesisUtterance(situation[role].ko)
        utterance.current = speech
        speech.voice = voice
        speech.lang = voice.lang
        speech.rate = 0.92
        const finish = (ok: boolean) => {
          if (utterance.current !== speech) return
          utterance.current = null
          setPlaying(false)
          if (ok) onHeard?.()
          else setError('A voz do aparelho não conseguiu tocar a frase.')
        }
        speech.onend = () => finish(true)
        speech.onerror = () => finish(false)
        window.speechSynthesis.speak(speech)
      } catch {
        utterance.current = null
        setPlaying(false)
        setError('A voz do aparelho não conseguiu tocar a frase.')
      }
    }
  }

  return (
    <div className="live-audio">
      <button type="button" className="button button--primary button--block" onClick={play} disabled={playing || (!clip && !hasVoice)}>
        {playing ? 'Tocando…' : label}
      </button>
      <p className="field__hint" role="status">
        {error || (clip ? '' : hasVoice ? 'Voz sintetizada pelo aparelho.' : 'O navegador ainda não encontrou uma voz coreana local. Confira as vozes instaladas no aparelho.')}
      </p>
    </div>
  )
}
