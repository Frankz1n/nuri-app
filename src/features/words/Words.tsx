import { useState } from 'react'
import { VOCABULARY, VOCAB_CATEGORY_LABELS } from '../../data'
import type { VocabCategory } from '../../data'
import { AppHeader } from '../../components/AppHeader'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { StarIcon } from '../../components/icons'
import { normalizeSearchText } from '../../lib/text'
import { useNuri } from '../../state/useNuri'

type CategoryFilter = VocabCategory | 'all' | 'favorites'

const CATEGORY_IDS = Object.keys(VOCAB_CATEGORY_LABELS) as VocabCategory[]

export function Words() {
  const { state, actions } = useNuri()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { favorites } = state.progress
  const selectedVocab = VOCABULARY.find((vocab) => vocab.id === selectedId) ?? null

  const normalizedQuery = normalizeSearchText(query)
  const visibleWords = VOCABULARY.filter((vocab) => {
    if (category === 'favorites' && !favorites.includes(vocab.id)) return false
    if (category !== 'all' && category !== 'favorites' && vocab.category !== category) return false
    if (normalizedQuery === '') return true
    return [vocab.translation, vocab.hangul, vocab.romanization ?? ''].some((field) => normalizeSearchText(field).includes(normalizedQuery))
  })

  const filters: readonly { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'favorites', label: `Favoritas (${favorites.length})` },
    ...CATEGORY_IDS.map((id) => ({ id, label: VOCAB_CATEGORY_LABELS[id] })),
  ]

  return (
    <div className="screen">
      <AppHeader title="Palavras" subtitle="Hangul, tradução e favoritos para revisão." />

      <div className="toolbar-compact">
        <div className="field field--compact">
          <label className="field__label" htmlFor="words-search">
            Buscar
          </label>
          <input
            id="words-search"
            className="input"
            type="search"
            value={query}
            placeholder="Português ou hangul"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="chip-row chip-row--scroll" role="group" aria-label="Filtrar por categoria">
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`filter-chip${category === option.id ? ' is-active' : ''}`}
              aria-pressed={category === option.id}
              onClick={() => setCategory(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="screen__text" aria-live="polite">
        {visibleWords.length} {visibleWords.length === 1 ? 'palavra' : 'palavras'}
      </p>

      {selectedVocab ? (
        <section className="path-hero" aria-labelledby="word-detail-title">
          <h2 id="word-detail-title" className="path-hero__title" lang="ko">
            {selectedVocab.hangul}
          </h2>
          <p className="path-hero__meta">{selectedVocab.translation}</p>
          {selectedVocab.romanization && state.profile.showRomanization ? (
            <p className="field__hint">{selectedVocab.romanization}</p>
          ) : null}
          {selectedVocab.note ? <p className="field__hint">{selectedVocab.note}</p> : null}
          <p className="field__hint">Áudio de referência em breve.</p>
        </section>
      ) : null}

      <ul className="word-list">
        {visibleWords.map((vocab) => {
          const isFavorite = favorites.includes(vocab.id)
          const isSelected = selectedId === vocab.id
          return (
            <li key={vocab.id} className={`word-item${isSelected ? ' is-selected' : ''}`}>
              <button type="button" className="word-item__text word-item__select" onClick={() => setSelectedId(vocab.id)}>
                <span className="word-item__hangul" lang="ko">
                  {vocab.hangul}
                </span>
                <span className="word-item__translation">{vocab.translation}</span>
                {vocab.romanization && state.profile.showRomanization ? (
                  <span className="word-item__romanization">{vocab.romanization}</span>
                ) : null}
                {vocab.note ? <span className="word-item__note">{vocab.note}</span> : null}
                <span className="chip">{VOCAB_CATEGORY_LABELS[vocab.category]}</span>
              </button>
              <button
                type="button"
                className={`icon-button${isFavorite ? ' is-active' : ''}`}
                aria-pressed={isFavorite}
                aria-label={`${isFavorite ? 'Remover dos favoritos' : 'Favoritar'}: ${vocab.translation}`}
                onClick={() => actions.toggleFavorite(vocab.id)}
              >
                <StarIcon isFilled={isFavorite} />
              </button>
            </li>
          )
        })}
      </ul>
      {visibleWords.length === 0 ? <FeedbackBanner tone="info" title="Nenhuma palavra encontrada" /> : null}
    </div>
  )
}
