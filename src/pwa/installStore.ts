import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface InstallSnapshot {
  canPrompt: boolean
  isStandalone: boolean
  isIos: boolean
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean }

const detectStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as NavigatorWithStandalone).standalone === true

const detectIos = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

let deferredPrompt: BeforeInstallPromptEvent | null = null
let snapshot: InstallSnapshot = { canPrompt: false, isStandalone: detectStandalone(), isIos: detectIos() }
const listeners = new Set<() => void>()

const publish = (next: InstallSnapshot): void => {
  snapshot = next
  listeners.forEach((listener) => listener())
}

// O evento dispara uma vez e cedo: precisa ser capturado fora de qualquer componente.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferredPrompt = event as BeforeInstallPromptEvent
  publish({ ...snapshot, canPrompt: true })
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  publish({ ...snapshot, canPrompt: false, isStandalone: true })
})

window.matchMedia('(display-mode: standalone)').addEventListener('change', () => {
  publish({ ...snapshot, isStandalone: detectStandalone() })
})

export const promptInstall = async (): Promise<void> => {
  if (!deferredPrompt) return
  const promptEvent = deferredPrompt
  deferredPrompt = null
  publish({ ...snapshot, canPrompt: false })
  await promptEvent.prompt()
  await promptEvent.userChoice
}

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useInstallState = (): InstallSnapshot => useSyncExternalStore(subscribe, () => snapshot)
