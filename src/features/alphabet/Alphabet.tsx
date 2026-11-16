import { useState } from 'react'
import { LETTERS, getLetterById } from '../../data'
import type { LetterGroup } from '../../data'
import type { WritingResult } from '../../core'
import { AppHeader } from '../../components/AppHeader'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { WritingCanvas } from '../../components/WritingCanvas'
import { getLessonForLetter } from '../../lib/catalog'
import { normalizeSearchText } from '../../lib/text'

const GROUP_LABELS: Readonly<Record<LetterGroup, string>> = {
  'vowel-basic': 'Vogais básicas',
  'consonant-basic': 'Consoantes básicas',
  'vowel-compound': 'Vogais compostas',
  'consonant-double': 'Consoantes duplas',
}

type GroupFilter = LetterGroup | 'all'

const FILTERS: readonly { id: GroupFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  ...(Object.keys(GROUP_LABELS) as LetterGroup[]).map((group) => ({ id: group, label: GROUP_LABELS[group] })),
]

function LetterDetail({ letterId }: { letterId: string }) {
  const letter = getLetterById(letterId)
  const [result, setResult] = useState<WritingResult | null>(null)
  const [canvasKey, setCanvasKey] = useState(0)

  if (!letter) {
    return (
      <div className="screen">
        <AppHeader title="Letra não encontrada" backHref="#/alphabet" backLabel="Voltar ao alfabeto" />
        <FeedbackBanner tone="error" title="Não achamos essa letra." />
      </div>
    )
  }

  const index = LETTERS.findIndex((candidate) => candidate.id === letter.id)
  const previous = LETTERS[index - 1]
  const next = LETTERS[index + 1]
  const lesson = getLessonForLetter(letter)

  return (
    <div className="screen">
      <AppHeader title={letter.name} subtitle={GROUP_LABELS[letter.group]} backHref="#/alphabet" backLabel="Voltar ao alfabeto" />

      <section className="letter-detail" aria-labelledby="letter-heading">
        <p id="letter-heading" className="step__big" lang="ko">
          {letter.char}
        </p>
        <p className="step__caption">
          Exemplo: <span lang="ko">{letter.example.hangul}</span> — {letter.example.translation}
        </p>
        <p className="screen__text">Som: {letter.romanization}</p>
        {lesson ? (
          <a className="button button--secondary button--block" href={`#/lesson/${lesson.id}`}>
            Ir para a aula desta letra
          </a>
        ) : null}
      </section>

      <section className="letter-train" aria-labelledby="train-title">
        <h2 id="train-title" className="section-title">
          Treinar escrita
        </h2>
        <WritingCanvas key={`${letter.id}-${canvasKey}`} models={letter.strokes} onChecked={setResult} />
        {result ? (
          <>
            <FeedbackBanner tone={result.ok ? 'success' : 'error'} title={result.ok ? 'Muito bem!' : 'Quase lá.'}>
              {result.message}
            </FeedbackBanner>
            <button
              type="button"
              className="button button--secondary button--block"
              onClick={() => {
                setResult(null)
                setCanvasKey((key) => key + 1)
              }}
            >
              Tentar de novo
            </button>
          </>
        ) : null}
      </section>

      <nav className="button-row" aria-label="Letras vizinhas">
        {previous ? (
          <a className="button button--ghost" href={`#/alphabet/${previous.id}`}>
            ‹ <span lang="ko">{previous.char}</span>
          </a>
        ) : null}
        {next ? (
          <a className="button button--ghost" href={`#/alphabet/${next.id}`}>
            <span lang="ko">{next.char}</span> ›
          </a>
        ) : null}
      </nav>
    </div>
  )
}

export function Alphabet({ letterId }: { letterId?: string }) {
  const [filter, setFilter] = useState<GroupFilter>('all')
  const [query, setQuery] = useState('')

  if (letterId) return <LetterDetail key={letterId} letterId={letterId} />

  const normalizedQuery = normalizeSearchText(query)
  const visibleLetters = LETTERS.filter((letter) => {
    if (filter !== 'all' && letter.group !== filter) return false
    if (normalizedQuery === '') return true
    return [letter.char, letter.name, letter.romanization].some((field) => normalizeSearchText(field).includes(normalizedQuery))
  })

  return (
    <div className="screen">
      <AppHeader title="Alfabeto" subtitle="Toque numa letra para ver e treinar." />

      <div className="toolbar-compact">
        <div className="field field--compact">
          <label className="field__label" htmlFor="alphabet-search">
            Buscar
          </label>
          <input
            id="alphabet-search"
            className="input"
            type="search"
            value={query}
            placeholder="ㄱ, giyeok…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="chip-row chip-row--scroll" role="group" aria-label="Filtrar por grupo">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`filter-chip${filter === option.id ? ' is-active' : ''}`}
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="screen__text" aria-live="polite">
        {visibleLetters.length} {visibleLetters.length === 1 ? 'letra' : 'letras'}
      </p>

      <ul className="letter-grid">
        {visibleLetters.map((letter) => (
          <li key={letter.id}>
            <a className="letter-tile" href={`#/alphabet/${letter.id}`} aria-label={`Letra ${letter.name}, som ${letter.romanization}`}>
              <span className="letter-tile__char" lang="ko">
                {letter.char}
              </span>
              <span className="letter-tile__name">{letter.name}</span>
            </a>
          </li>
        ))}
      </ul>
      {visibleLetters.length === 0 ? <FeedbackBanner tone="info" title="Nenhuma letra encontrada" /> : null}
    </div>
  )
}
