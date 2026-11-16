import { useState } from 'react'
import { applyImport, exportProgress, previewImport, todayKey } from '../../core'
import type { IdMatchGroups, ImportPreview } from '../../core'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { CATALOG_IDS } from '../../lib/catalog'
import { useNuri } from '../../state/useNuri'

interface ImportCandidate {
  fileName: string
  raw: unknown
  preview: ImportPreview
}

const UNMATCHED_LABELS: Readonly<Record<keyof IdMatchGroups, string>> = {
  lessons: 'Aulas',
  vocabulary: 'Palavras',
  reviews: 'Cartões de revisão',
  favorites: 'Favoritas',
}

const MAX_LISTED_IDS = 8

const downloadJson = (fileName: string, content: unknown): void => {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function BackupSection() {
  const { state, actions } = useNuri()
  const [candidate, setCandidate] = useState<ImportCandidate | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [hasAcknowledgedUnmatched, setHasAcknowledgedUnmatched] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [importMessage, setImportMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const handleExport = (): void => {
    downloadJson(`nuri-backup-${todayKey()}.json`, exportProgress(state))
    setImportMessage({ tone: 'success', text: 'Backup exportado. Guarde o arquivo em um lugar seguro.' })
  }

  const handleFileSelected = async (file: File | undefined): Promise<void> => {
    setCandidate(null)
    setReadError(null)
    setImportMessage(null)
    setHasAcknowledgedUnmatched(false)
    if (!file) return
    try {
      const raw: unknown = JSON.parse(await file.text())
      const preview = previewImport(raw, CATALOG_IDS)
      if (!preview.canImport) {
        setReadError(preview.message ?? 'Não foi possível ler este backup.')
        return
      }
      setCandidate({ fileName: file.name, raw, preview })
    } catch {
      setReadError('O arquivo não é um JSON válido. Escolha um backup exportado pelo Nuri.')
    }
  }

  const handleConfirmImport = (): void => {
    if (!candidate) return
    const result = applyImport(state, candidate.raw, { acknowledgeUnmatched: hasAcknowledgedUnmatched, catalogIds: CATALOG_IDS })
    setIsConfirmOpen(false)
    if (!result.ok) {
      setImportMessage({ tone: 'error', text: result.message })
      return
    }
    actions.importState(result.state)
    setCandidate(null)
    setImportMessage({ tone: 'success', text: 'Progresso restaurado com sucesso.' })
  }

  const preview = candidate?.preview
  const isImportBlocked = !preview || (preview.hasUnmatched && !hasAcknowledgedUnmatched)

  return (
    <section className="card" aria-labelledby="backup-title">
      <h2 id="backup-title" className="card__title">
        Backup e restauração
      </h2>
      <p className="card__text">
        Seus dados ficam só neste aparelho e neste endereço do app. Exporte um backup para guardar ou levar para outro lugar.
      </p>
      <p className="card__text card__text--muted">
        O backup guarda perfil, XP, sequência, aulas, favoritas, revisões e conquistas. Não inclui gravações de voz, perguntas
        pendentes (fila de erros) nem atividades em andamento.
      </p>

      <div className="button-row">
        <button type="button" className="button button--secondary" onClick={handleExport}>
          Exportar backup
        </button>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="backup-file">
          Restaurar de um arquivo
        </label>
        <input
          id="backup-file"
          className="input"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            void handleFileSelected(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </div>

      {readError ? <FeedbackBanner tone="error" title="Backup inválido">{readError}</FeedbackBanner> : null}
      {importMessage ? (
        <FeedbackBanner tone={importMessage.tone} title={importMessage.tone === 'success' ? 'Pronto' : 'Não foi possível importar'}>
          {importMessage.text}
        </FeedbackBanner>
      ) : null}

      {candidate && preview ? (
        <div className="import-preview">
          <h3 className="card__title">Prévia: {candidate.fileName}</h3>
          <p className="card__text">
            Exportado em {preview.exportedAt ? new Date(preview.exportedAt).toLocaleString('pt-BR') : 'data desconhecida'} (versão{' '}
            {preview.sourceVersion ?? '?'}).
          </p>
          <table className="history-table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Atual</th>
                <th scope="col">Backup</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>XP</td>
                <td>{state.progress.xp}</td>
                <td>{preview.summary.xp}</td>
              </tr>
              <tr>
                <td>Sequência</td>
                <td>{state.progress.streak}</td>
                <td>{preview.summary.streak}</td>
              </tr>
              <tr>
                <td>Aulas concluídas</td>
                <td>{state.progress.completedLessons.length}</td>
                <td>{preview.summary.completedLessons}</td>
              </tr>
              <tr>
                <td>Favoritas</td>
                <td>{state.progress.favorites.length}</td>
                <td>{preview.summary.favorites}</td>
              </tr>
              <tr>
                <td>Cartões de revisão</td>
                <td>{state.progress.reviewCards.length}</td>
                <td>{preview.summary.reviewCards}</td>
              </tr>
            </tbody>
          </table>

          {preview.hasUnmatched ? (
            <FeedbackBanner tone="error" title="Itens do backup que não existem nesta versão">
              <p>
                O conteúdo do Nuri pode ter mudado. Estes itens serão ignorados na restauração (o restante é importado):
              </p>
              <ul className="plain-list">
                {(Object.keys(UNMATCHED_LABELS) as (keyof IdMatchGroups)[]).flatMap((group) => {
                  const ids = preview.unmatched[group]
                  if (ids.length === 0) return []
                  return [
                    <li key={group}>
                      <strong>
                        {UNMATCHED_LABELS[group]} ({ids.length}):
                      </strong>{' '}
                      {ids.slice(0, MAX_LISTED_IDS).join(', ')}
                      {ids.length > MAX_LISTED_IDS ? ` e mais ${ids.length - MAX_LISTED_IDS}…` : ''}
                    </li>,
                  ]
                })}
              </ul>
            </FeedbackBanner>
          ) : (
            <FeedbackBanner tone="success" title="Todos os itens do backup foram reconhecidos." />
          )}

          {preview.hasUnmatched ? (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={hasAcknowledgedUnmatched}
                onChange={(event) => setHasAcknowledgedUnmatched(event.target.checked)}
              />
              <span>Entendo que os itens acima serão ignorados.</span>
            </label>
          ) : null}

          <div className="button-row">
            <button type="button" className="button button--danger" disabled={isImportBlocked} onClick={() => setIsConfirmOpen(true)}>
              Substituir meu progresso
            </button>
            <button type="button" className="button button--ghost" onClick={() => setCandidate(null)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {isConfirmOpen && preview ? (
        <ConfirmDialog
          title="Substituir progresso atual?"
          confirmLabel="Substituir"
          isDestructive
          onConfirm={handleConfirmImport}
          onCancel={() => setIsConfirmOpen(false)}
        >
          <p>
            Seu perfil e progresso atuais ({state.progress.xp} XP, {state.progress.completedLessons.length} aulas) serão trocados pelos
            do backup ({preview.summary.xp} XP, {preview.summary.completedLessons} aulas). Atividade em andamento e erros pendentes
            serão limpos. Isso não pode ser desfeito.
          </p>
        </ConfirmDialog>
      ) : null}
    </section>
  )
}
