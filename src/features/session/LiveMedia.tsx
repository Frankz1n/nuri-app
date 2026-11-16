import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { LiveClipRole, LivePicture, LiveSituation, LiveVideoClip } from '../../data/live'
import { LiveAudio } from './LiveAudio'

const mediaFiles = import.meta.glob<string>('../../assets/live-media/*.{mp4,jpg,jpeg,webp,png}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const urlFor = (file: string): string | undefined => mediaFiles[`../../assets/live-media/${file}`]

interface LivePlaybackProps {
  situation: LiveSituation
  role: LiveClipRole
  label: string
  onHeard?: () => void
}

export function LivePlayback(props: LivePlaybackProps) {
  const { situation, role, onHeard } = props
  const clip = situation[role].video
  const src = clip ? urlFor(clip.file) : undefined
  if (!src || !clip) return <LiveAudio {...props} />
  return <LiveVideo key={src} clip={clip} src={src} onHeard={onHeard} fallback={<LiveAudio {...props} />} />
}

function LiveVideo({ src, clip, onHeard, fallback }: {
  src: string
  clip: LiveVideoClip
  onHeard?: () => void
  fallback: ReactNode
}) {
  const [videoUrl, setVideoUrl] = useState('')
  const [failed, setFailed] = useState(false)
  const [needsSound, setNeedsSound] = useState(false)
  const playedWithoutSound = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    let objectUrl = ''
    // Busca o clipe inteiro para poder tocar em modo avião a partir do precache,
    // sem depender de respostas Range do servidor ou do service worker.
    void fetch(src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Clipe indisponível')
        return response.blob()
      })
      .then((blob) => {
        if (controller.signal.aborted) return
        if (blob.type.startsWith('video/')) {
          objectUrl = URL.createObjectURL(blob)
        } else if (!blob.type || blob.type === 'application/octet-stream') {
          objectUrl = URL.createObjectURL(new Blob([blob], { type: 'video/mp4' }))
        } else {
          throw new Error('Formato de clipe inválido')
        }
        setVideoUrl(objectUrl)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (failed) return (
    <div className="live-audio">
      <p className="field__hint" role="status">O vídeo não carregou. Você pode ouvir a frase separadamente.</p>
      {fallback}
    </div>
  )

  return (
    <figure className="live-media">
      {videoUrl ? (
        <video
          src={videoUrl}
          poster={clip.poster ? urlFor(clip.poster) : undefined}
          controls
          playsInline
          preload="metadata"
          aria-label="Trecho em coreano"
          onPlay={(event) => {
            const video = event.currentTarget
            if (video.currentTime < 0.1) playedWithoutSound.current = false
            playedWithoutSound.current ||= video.muted || video.volume === 0
            setNeedsSound(false)
          }}
          onVolumeChange={(event) => {
            const video = event.currentTarget
            if (!video.paused && (video.muted || video.volume === 0)) playedWithoutSound.current = true
          }}
          onEnded={(event) => {
            if (playedWithoutSound.current || event.currentTarget.muted || event.currentTarget.volume === 0) {
              if (onHeard) setNeedsSound(true)
            } else {
              onHeard?.()
            }
          }}
          onError={() => setFailed(true)}
        />
      ) : <p className="field__hint" role="status">Preparando o trecho…</p>}
      <figcaption>{clip.credit}</figcaption>
      {needsSound ? <p className="field__hint" role="status">Reproduza o trecho com som ou abra a frase em hangul.</p> : null}
    </figure>
  )
}

export function LiveContextPicture({ picture }: { picture: LivePicture }) {
  const src = urlFor(picture.file)
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null
  return (
    <figure className="live-media">
      <img src={src} alt={picture.alt} loading="lazy" onError={() => setFailed(true)} />
      <figcaption>{picture.credit}</figcaption>
    </figure>
  )
}
