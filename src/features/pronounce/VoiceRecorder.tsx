import { useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 20

type RecorderPhase = 'idle' | 'requesting' | 'recording' | 'ready' | 'denied' | 'unsupported'

interface VoiceRecorderProps {
  promptLabel?: string
  practiceMode?: boolean
}

/**
 * Autoescuta local: grava até 20s, reproduz no aparelho e não persiste.
 * Microfone só é pedido após o toque. Ao desmontar, a captura encerra.
 */
export function VoiceRecorder({ promptLabel, practiceMode = false }: VoiceRecorderProps) {
  const [phase, setPhase] = useState<RecorderPhase>(() =>
    typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia ? 'unsupported' : 'idle',
  )
  const [playbackError, setPlaybackError] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const mounted = useRef(false)
  const playbackRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const cleanupStream = (): void => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const revokeUrl = (): void => {
    playbackRef.current?.pause()
    playbackRef.current = null
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  const clearRecording = (): void => {
    revokeUrl()
    setPlaybackError(false)
    setObjectUrl(null)
    setElapsed(0)
    chunksRef.current = []
  }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      const recorder = mediaRecorderRef.current
      if (recorder) {
        recorder.onstop = null
        recorder.ondataavailable = null
      }
      cleanupStream()
      revokeUrl()
    }
  }, [])

  const stopRecording = (): void => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = async (): Promise<void> => {
    if (phase === 'unsupported' || phase === 'requesting') return
    clearRecording()
    setPhase('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mounted.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        objectUrlRef.current = url
        setObjectUrl(url)
        setPhase('ready')
        cleanupStream()
      }

      recorder.start()
      setPhase('recording')
      setElapsed(0)
      let seconds = 0
      timerRef.current = window.setInterval(() => {
        setElapsed(++seconds)
        if (seconds >= MAX_SECONDS) stopRecording()
      }, 1000)
    } catch {
      cleanupStream()
      if (mounted.current) setPhase('denied')
    }
  }

  if (phase === 'unsupported') {
    return (
      <p className="field__hint" role="status">
        Este navegador não permite gravar áudio. Você ainda pode praticar a resposta em voz alta.
      </p>
    )
  }

  return (
    <section className="voice-recorder card" aria-label="Autoescuta">
      <h3 className="card__title">Sua vez</h3>
      <p className="card__text">
        {promptLabel ? <>Grave até {MAX_SECONDS}s dizendo <strong lang="ko">{promptLabel}</strong>.</> : 'Grave sua resposta e ouça como ficou.'}
        {' '}A gravação fica só nesta tela.
      </p>

      {phase === 'denied' ? (
        <p className="field__hint" role="status">
          Permissão de microfone negada. Você pode liberar nas configurações do navegador e tentar de novo.
        </p>
      ) : null}

      <div className="button-row">
        {phase === 'recording' ? (
          <button type="button" className="button button--danger" onClick={stopRecording}>
            Parar ({elapsed}s)
          </button>
        ) : (
          <button
            type="button"
            className="button button--primary"
            disabled={phase === 'requesting'}
            onClick={() => {
              void startRecording()
            }}
          >
            {phase === 'requesting' ? 'Aguardando microfone…' : phase === 'ready' ? 'Gravar de novo' : 'Gravar'}
          </button>
        )}
        {objectUrl ? (
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setPlaybackError(false)
              playbackRef.current?.pause()
              const audio = new Audio(objectUrl)
              playbackRef.current = audio
              void audio.play().catch(() => setPlaybackError(true))
            }}
          >
            Ouvir minha voz
          </button>
        ) : null}
        {objectUrl ? (
          <button type="button" className="button button--ghost" onClick={clearRecording}>
            Apagar
          </button>
        ) : null}
      </div>

      {playbackError ? <p className="field__hint" role="status">Não foi possível reproduzir sua gravação.</p> : null}
      <p className="field__hint">
        {practiceMode ? 'Compare com o modelo quando estiver pronto. Esta prática não tem nota.' : 'Ouça sua gravação para praticar por conta própria. Esta prática não tem nota.'}
      </p>
    </section>
  )
}
