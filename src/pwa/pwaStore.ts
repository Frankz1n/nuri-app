import { useSyncExternalStore } from 'react'

export interface PwaSnapshot {
  isUpdateReady: boolean
  isOfflineReady: boolean
}

type UpdateServiceWorker = (shouldReloadPage?: boolean) => Promise<void>

let snapshot: PwaSnapshot = { isUpdateReady: false, isOfflineReady: false }
let updateServiceWorker: UpdateServiceWorker | null = null
const listeners = new Set<() => void>()

const publish = (next: PwaSnapshot): void => {
  snapshot = next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const registerUpdateHandler = (handler: UpdateServiceWorker): void => {
  updateServiceWorker = handler
}

export const markUpdateReady = (): void => publish({ ...snapshot, isUpdateReady: true })
export const markOfflineReady = (): void => publish({ ...snapshot, isOfflineReady: true })
export const dismissUpdate = (): void => publish({ ...snapshot, isUpdateReady: false })
export const dismissOfflineReady = (): void => publish({ ...snapshot, isOfflineReady: false })

/** Ativa o service worker em espera e recarrega a página. O localStorage (nuri-state) nunca é tocado. */
export const applyPendingUpdate = async (): Promise<void> => {
  let hasReloaded = false
  const reloadOnce = (): void => {
    if (hasReloaded) return
    hasReloaded = true
    window.location.reload()
  }
  // Rede de segurança: o reload do workbox depende de um evento que alguns navegadores não emitem.
  navigator.serviceWorker?.addEventListener('controllerchange', reloadOnce, { once: true })
  await updateServiceWorker?.(true)
  window.setTimeout(reloadOnce, 4000)
}

export const usePwaStatus = (): PwaSnapshot => useSyncExternalStore(subscribe, () => snapshot)
