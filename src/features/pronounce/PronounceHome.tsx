import { useMemo, useState } from 'react'
import { LETTERS, VOCABULARY } from '../../data'
import { AppHeader } from '../../components/AppHeader'
import { VoiceRecorder } from './VoiceRecorder'

type PromptKind = 'letter' | 'word'

export function PronounceHome() {
  const [kind, setKind] = useState<PromptKind>('word')
  const prompts = useMemo(() => {
    if (kind === 'letter') {
      return LETTERS.slice(0, 12).map((letter) => ({
        id: letter.id,
        hangul: letter.char,
        hint: `${letter.name} (${letter.romanization})`,
      }))
    }
    return VOCABULARY.filter((item) => item.category === 'saudacoes' || item.category === 'cultura')
      .slice(0, 12)
      .map((vocab) => ({
        id: vocab.id,
        hangul: vocab.hangul,
        hint: vocab.translation,
      }))
  }, [kind])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = prompts.find((item) => item.id === selectedId) ?? prompts[0]

  return (
    <div className="screen">
      <AppHeader
        title="Grave e ouça sua voz"
        subtitle="Sem voz de referência por enquanto — pratique falando e ouvindo."
        backHref="#/practice"
        backLabel="Voltar para Praticar"
      />

      <div className="chip-row chip-row--scroll" role="tablist" aria-label="Tipo de prompt">
        {(
          [
            { id: 'word', label: 'Palavras' },
            { id: 'letter', label: 'Letras' },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={kind === option.id}
            className={`filter-chip${kind === option.id ? ' is-active' : ''}`}
            onClick={() => {
              setKind(option.id)
              setSelectedId(null)
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selected ? (
        <section className="path-hero" aria-labelledby="pronounce-prompt">
          <p id="pronounce-prompt" className="listen-player__ko" lang="ko">
            {selected.hangul}
          </p>
          <p className="path-hero__meta">{selected.hint}</p>
          <p className="field__hint">O microfone só é pedido quando você toca em Gravar.</p>
          <VoiceRecorder promptLabel={selected.hangul} />
        </section>
      ) : null}

      <ul className="practice-list">
        {prompts.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`practice-item${selected?.id === item.id ? ' is-active' : ''}`}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="practice-item__text">
                <span className="practice-item__title" lang="ko">
                  {item.hangul}
                </span>
                <span className="practice-item__description">{item.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
