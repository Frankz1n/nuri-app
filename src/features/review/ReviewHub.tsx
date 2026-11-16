import { SCHEDULE_DAYS, getDueCards, todayKey } from '../../core'
import { getVocabById } from '../../data'
import { AppHeader } from '../../components/AppHeader'
import { describeErrorId } from '../../lib/stepBuilders'
import { useNuri } from '../../state/useNuri'
import { nextDueLabel } from '../../state/transitions'

export function ReviewHub() {
  const { state } = useNuri()
  const today = todayKey()
  const { reviewCards, errorQueue, favorites } = state.progress
  const dueCards = getDueCards(reviewCards, today)
  const upcomingCards = reviewCards
    .filter((card) => card.dueDate > today)
    .toSorted((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)
  const newFavoritesCount = favorites.filter((vocabId) => !reviewCards.some((card) => card.vocabId === vocabId)).length
  const cardsAvailable = dueCards.length + newFavoritesCount

  return (
    <div className="screen">
      <AppHeader title="Revisão" subtitle="Repetição espaçada: 1, 3, 7, 14 e 30 dias." backHref="#/learn" backLabel="Voltar para Aprender" />

      <section className="card">
        <h2 className="card__title">Cartões de hoje</h2>
        <p className="card__text">
          {cardsAvailable > 0
            ? `${dueCards.length} para revisar${newFavoritesCount > 0 ? ` e ${newFavoritesCount} favorita(s) ainda sem cartão` : ''}.`
            : 'Nada para revisar agora. Aulas de vocabulário e palavras favoritas criam novos cartões.'}
        </p>
        <a className="button button--primary" href="#/practice/cards" aria-disabled={cardsAvailable === 0}>
          Revisar cartões
        </a>
      </section>

      <section className="card">
        <h2 className="card__title">Erros para refazer</h2>
        {errorQueue.length === 0 ? (
          <p className="card__text">Sem erros pendentes.</p>
        ) : (
          <>
            <ul className="plain-list">
              {errorQueue.slice(0, 8).map((error) => (
                <li key={error.id} className="plain-list__item">
                  <span>{describeErrorId(error.id)}</span>
                  <span className="chip">{error.failCount}×</span>
                </li>
              ))}
            </ul>
            {errorQueue.length > 8 ? <p className="card__text">E mais {errorQueue.length - 8}…</p> : null}
            <a className="button button--primary" href="#/practice/errors">
              Revisar erros
            </a>
          </>
        )}
      </section>

      {upcomingCards.length > 0 ? (
        <section className="card">
          <h2 className="card__title">Próximas revisões</h2>
          <ul className="plain-list">
            {upcomingCards.map((card) => {
              const vocab = getVocabById(card.vocabId)
              return (
                <li key={card.vocabId} className="plain-list__item">
                  <span>
                    <span lang="ko">{vocab?.hangul ?? card.vocabId}</span> · {vocab?.translation}
                  </span>
                  <span className="chip">
                    {nextDueLabel(card, today)} · nível {card.intervalIndex + 1}/{SCHEDULE_DAYS.length}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
