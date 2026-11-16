import { MASCOT_POSES } from '../assets/mascot/poses'

interface ExplainPanelProps {
  prompt?: string
  promptLanguage?: 'ko' | 'pt'
  romanization?: string
  explanation: string
  onContinue: () => void
  continueLabel?: string
  onClose: () => void
}

/** Tela “Explique minha resposta” com o Horangi. */
export function ExplainPanel({
  prompt,
  promptLanguage,
  romanization,
  explanation,
  onContinue,
  continueLabel = 'Continuar lição',
  onClose,
}: ExplainPanelProps) {
  return (
    <div className="explain-panel" role="dialog" aria-modal="true" aria-labelledby="explain-panel-title">
      <header className="explain-panel__header">
        <button type="button" className="explain-panel__back" onClick={onClose} aria-label="Fechar explicação">
          ←
        </button>
        <h2 id="explain-panel-title">Explique minha resposta</h2>
      </header>

      <div className="explain-panel__body">
        {prompt ? (
          <div className="explain-panel__prompt">
            {romanization ? <span className="explain-panel__roma">{romanization}</span> : null}
            <p lang={promptLanguage === 'ko' ? 'ko' : undefined}>{prompt}</p>
          </div>
        ) : null}

        <div className="explain-panel__card">
          <img className="explain-panel__mascot" src={MASCOT_POSES.idea} alt="" width={120} height={120} />
          <p className="explain-panel__text">{explanation}</p>
        </div>
      </div>

      <div className="explain-panel__footer">
        <button type="button" className="button button--primary button--block" onClick={onContinue}>
          {continueLabel}
        </button>
      </div>
    </div>
  )
}
