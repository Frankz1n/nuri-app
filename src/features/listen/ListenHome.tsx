import { useMemo, useState } from 'react'
import { LETTERS, PHRASES, VOCABULARY } from '../../data'
import { AppHeader } from '../../components/AppHeader'
import { ListenButton } from '../../components/ListenButton'
import { letterAudioKey, phraseAudioKey, vocabAudioKey } from '../../lib/audio'

type ListenTab = 'letters' | 'words' | 'phrases'

export function ListenHome() {
  const [tab, setTab] = useState<ListenTab>('letters')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const items = useMemo(() => {
    if (tab === 'letters') {
      return LETTERS.slice(0, 16).map((letter) => ({
        id: letter.id,
        audioKey: letterAudioKey(letter),
        primary: letter.char,
        secondary: `${letter.name} · ${letter.romanization}`,
        lang: 'ko' as const,
      }))
    }
    if (tab === 'words') {
      return VOCABULARY.slice(0, 16).map((vocab) => ({
        id: vocab.id,
        audioKey: vocabAudioKey(vocab),
        primary: vocab.hangul,
        secondary: vocab.translation,
        lang: 'ko' as const,
      }))
    }
    return PHRASES.map((phrase) => ({
      id: phrase.id,
      audioKey: phraseAudioKey(phrase),
      primary: phrase.pieces.join(' '),
      secondary: phrase.translation,
      lang: 'ko' as const,
    }))
  }, [tab])

  const selected = items.find((item) => item.audioKey === selectedKey) ?? items[0]

  return (
    <div className="screen">
      <AppHeader
        title="Escuta guiada"
        subtitle="Treine a sonoridade. O áudio modelo chega com a biblioteca de vozes."
        backHref="#/practice"
        backLabel="Voltar para Praticar"
      />

      <section className="card card--muted">
        <p className="card__text">
          Percurso completo: <strong>escrever</strong>, <strong>ouvir</strong> e <strong>ler</strong>. Esta tela prepara a
          escuta; o botão Ouvir fica pronto para o provider de áudio (ex.: ElevenLabs).
        </p>
      </section>

      <div className="chip-row" role="tablist" aria-label="Tipo de conteúdo">
        {(
          [
            { id: 'letters', label: 'Letras' },
            { id: 'words', label: 'Palavras' },
            { id: 'phrases', label: 'Frases' },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={tab === option.id}
            className={`filter-chip${tab === option.id ? ' is-active' : ''}`}
            onClick={() => {
              setTab(option.id)
              setSelectedKey(null)
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {selected ? (
        <section className="card listen-player" aria-labelledby="listen-selected">
          <h2 id="listen-selected" className="card__title">
            Ouça e acompanhe
          </h2>
          <p className="listen-player__ko" lang={selected.lang}>
            {selected.primary}
          </p>
          <p className="card__text">{selected.secondary}</p>
          <ListenButton audioKey={selected.audioKey} />
        </section>
      ) : null}

      <ul className="practice-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`practice-item${selected?.id === item.id ? ' is-active' : ''}`}
              onClick={() => setSelectedKey(item.audioKey)}
            >
              <span className="practice-item__text">
                <span className="practice-item__title" lang="ko">
                  {item.primary}
                </span>
                <span className="practice-item__description">{item.secondary}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
