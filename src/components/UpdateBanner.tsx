import { useState } from 'react'
import { applyPendingUpdate, dismissUpdate, usePwaStatus } from '../pwa/pwaStore'
import { useNuri } from '../state/useNuri'

export function UpdateBanner() {
  const { isUpdateReady } = usePwaStatus()
  const { actions } = useNuri()
  const [isApplying, setIsApplying] = useState(false)

  if (!isUpdateReady) return null

  const handleApply = async (): Promise<void> => {
    setIsApplying(true)
    // Rascunho da atividade e progresso já estão no localStorage; gravamos de novo antes de recarregar.
    actions.flush()
    await applyPendingUpdate()
  }

  return (
    <div className="toast toast--update" role="status">
      <div>
        <p className="toast__title">Atualização pronta</p>
        <p className="toast__text">Seu progresso e a atividade em andamento serão salvos antes de atualizar.</p>
      </div>
      <div className="toast__actions">
        <button type="button" className="button button--primary" onClick={() => void handleApply()} disabled={isApplying}>
          {isApplying ? 'Atualizando…' : 'Atualizar agora'}
        </button>
        <button type="button" className="button button--ghost" onClick={dismissUpdate} disabled={isApplying}>
          Depois
        </button>
      </div>
    </div>
  )
}
