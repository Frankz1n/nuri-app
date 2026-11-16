import { useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 20

type RecorderPhase = 'idle' | 'recording' | 'ready' | 'denied' | 'unsupported'

interface VoiceRecorderProps {
  promptLabel: string
}

/**
 * Autoescuta local: grava até 20s, reproduz no aparelho e não persiste.
 * Microfone só é pedido após o toque. Ao desmontar, a captura encerra.
 */
export function VoiceRecorder({ promptLabel }: VoiceRecorderProps) {
  const [phase, setPhase] = useState<RecorderPhase>(() =>
    typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia ? 'unsupported' : 'idle',
  )
  const [elapsed, setElapsed] = useState(0)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
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
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  const clearRecording = (): void => {
    revokeUrl()
    setObjectUrl(null)
    setElapsed(0)
    chunksRef.current = []
  }

  useEffect(
    () => () => {
      cleanupStream()
      revokeUrl()
    },
    [],
  )

  const stopRecording = (): void => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = async (): Promise<void> => {
    if (phase === 'unsupported') return
    clearRecording()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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
      timerRef.current = window.setInterval(() => {
        setElapsed((seconds) => {
          const next = seconds + 1
          if (next >= MAX_SECONDS) stopRecording()
          return Math.min(next, MAX_SECONDS)
        })
      }, 1000)
    } catch {
      cleanupStream()
      setPhase('denied')
    }
  }

  if (phase === 'unsupported') {
    return (
      <p className="field__hint" role="status">
        Este navegador não permite gravar áudio. Você ainda pode estudar escrita e leitura.
      </p>
    )
  }

  return (
    <section className="voice-recorder card" aria-label="Autoescuta">
      <h3 className="card__title">Sua vez</h3>
      <p className="card__text">
        Grave até {MAX_SECONDS}s dizendo <strong lang="ko">{promptLabel}</strong>. Só você ouve — não enviamos nem salvamos a
        gravação.
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
            onClick={() => {
              void startRecording()
            }}
          >
            {phase === 'ready' ? 'Gravar de novo' : 'Gravar'}
          </button>
        )}
        {objectUrl ? (
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              const audio = new Audio(objectUrl)
              void audio.play()
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

      <p className="field__hint">Análise automática de pronúncia com IA em breve. Por enquanto é só autoescuta.</p>
    </section>
  )
}
