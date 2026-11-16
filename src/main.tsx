import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { NuriProvider } from './state/NuriProvider.tsx'
import { markOfflineReady, markUpdateReady, registerUpdateHandler } from './pwa/pwaStore.ts'
import './pwa/installStore.ts'

registerUpdateHandler(
  registerSW({
    immediate: true,
    onNeedRefresh: markUpdateReady,
    onOfflineReady: markOfflineReady,
  }),
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <NuriProvider>
        <App />
      </NuriProvider>
    </ErrorBoundary>
  </StrictMode>,
)
