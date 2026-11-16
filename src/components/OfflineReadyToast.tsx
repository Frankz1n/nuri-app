import { useEffect } from 'react'
import { dismissOfflineReady, usePwaStatus } from '../pwa/pwaStore'

const AUTO_DISMISS_MS = 9000

export function OfflineReadyToast() {
  const { isOfflineReady } = usePwaStatus()

  useEffect(() => {
    if (!isOfflineReady) return
    const timeoutId = window.setTimeout(dismissOfflineReady, AUTO_DISMISS_MS)
    return () => window.clearTimeout(timeoutId)
  }, [isOfflineReady])

  if (!isOfflineReady) return null

  return (
    <div className="toast" role="status">
      <div>
        <p className="toast__title">Pronto para usar offline</p>
        <p className="toast__text">O Nuri foi salvo neste aparelho e abre mesmo sem internet.</p>
      </div>
      <div className="toast__actions">
        <button type="button" className="button button--ghost" onClick={dismissOfflineReady}>
          Ok
        </button>
      </div>
    </div>
  )
}
