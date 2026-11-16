import { useNuri } from '../state/useNuri'

export function StorageNotice() {
  const { storageStatus, saveFailure, actions } = useNuri()

  if (storageStatus === 'corrupt') {
    return (
      <div className="notice notice--error" role="alert">
        <p>
          Não conseguimos ler o progresso salvo neste aparelho. Uma cópia dele foi guardada em segurança e nada será sobrescrito até
          você decidir.
        </p>
        <div className="button-row">
          <button type="button" className="button button--secondary" onClick={actions.confirmOverwriteCorruptStorage}>
            Começar um novo progresso
          </button>
          <a className="button button--ghost" href="#/profile">
            Restaurar um backup
          </a>
        </div>
      </div>
    )
  }

  if (storageStatus === 'unreadable' || saveFailure === 'storage-unavailable') {
    return (
      <p className="notice notice--error" role="alert">
        O armazenamento local está indisponível (modo privado?). Seu progresso não será salvo ao fechar o app.
      </p>
    )
  }

  if (saveFailure === 'write-failed') {
    return (
      <p className="notice notice--error" role="alert">
        Não foi possível salvar agora (armazenamento cheio ou bloqueado). Exporte um backup em Perfil.
      </p>
    )
  }

  return null
}
