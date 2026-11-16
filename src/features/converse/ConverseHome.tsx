import { useState } from 'react'
import { AppHeader } from '../../components/AppHeader'
import { getConversationProvider } from '../../lib/audio'
import type { ConversationScenario } from '../../lib/audio'

export function ConverseHome() {
  const scenarios = getConversationProvider().listScenarios()
  const [selected, setSelected] = useState<ConversationScenario | null>(scenarios[0] ?? null)

  return (
    <div className="screen">
      <AppHeader
        title="Conversar"
        subtitle="Cenários para praticar diálogo. A IA entra em uma próxima fase."
        backHref="#/practice"
        backLabel="Voltar para Praticar"
      />

      <section className="card card--muted">
        <p className="card__text">
          Quando a conversação com IA estiver ligada, você escolhe um cenário, fala ou digita e recebe resposta em
          coreano com apoio em português. Por enquanto a interface já mostra o fluxo — sem respostas inventadas.
        </p>
        <span className="chip">Em breve com IA</span>
      </section>

      <ul className="practice-list">
        {scenarios.map((scenario) => (
          <li key={scenario.id}>
            <button
              type="button"
              className={`practice-item${selected?.id === scenario.id ? ' is-active' : ''}`}
              onClick={() => setSelected(scenario)}
            >
              <span className="practice-item__text">
                <span className="practice-item__title">{scenario.title}</span>
                <span className="practice-item__description">{scenario.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <section className="card converse-preview" aria-labelledby="converse-scenario">
          <h2 id="converse-scenario" className="card__title">
            {selected.title}
          </h2>
          <p className="card__text">{selected.prompt}</p>

          <div className="converse-thread" aria-label="Prévia do chat">
            <div className="converse-bubble converse-bubble--assistant">
              <p lang="ko">안녕하세요! 준비되면 이야기해요.</p>
              <p className="field__hint">Olá! Quando estiver pronto, conversamos.</p>
            </div>
            <div className="converse-bubble converse-bubble--user is-disabled">
              <p>Sua resposta aparecerá aqui.</p>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="converse-input">
              Escrever em coreano ou português
            </label>
            <textarea
              id="converse-input"
              className="input input--area"
              rows={3}
              disabled
              placeholder="Disponível quando a IA estiver conectada"
            />
          </div>
          <div className="button-row">
            <button type="button" className="button button--primary" disabled>
              Enviar
            </button>
            <button type="button" className="button button--secondary" disabled>
              Falar
            </button>
          </div>
          <p className="field__hint" role="status">
            Conversação com IA em breve. Nenhum crédito ou chamada de rede é feita nesta versão.
          </p>
        </section>
      ) : null}
    </div>
  )
}
