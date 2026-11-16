import { useState } from 'react'
import type { ReactNode } from 'react'
import { daysBetween, todayKey } from '../../core'
import type { WritingResult } from '../../core'
import { getLetterById, getReadingById, getVocabById } from '../../data'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { StarIcon } from '../../components/icons'
import { SyllableBoard } from '../../components/SyllableBoard'
import { TileBoard } from '../../components/TileBoard'
import { WritingCanvas } from '../../components/WritingCanvas'
import { composeFromJamo } from '../../lib/hangul'
import { explainAssembleMistake } from '../../lib/syllableFeedback'
import { areTilesEqual, joinTiles } from '../../lib/tiles'
import type { CardStep, ChoiceStep, InfoStep, PairsStep, ReadStep, TilesStep, WriteStep } from '../../lib/steps'
import { useNuri } from '../../state/useNuri'

interface GradedViewProps<TStep> {
  step: TStep
  /** `isFirstAttempt` indica se é a primeira resposta desta pergunta (conta para estatísticas). */
  onAttempt: (isCorrect: boolean, isFirstAttempt: boolean) => void
  onContinue: () => void
}

interface ContinueViewProps<TStep> {
  step: TStep
  onContinue: () => void
}

const languageOf = (language: 'ko' | 'pt' | undefined): 'ko' | undefined => (language === 'ko' ? 'ko' : undefined)

function StepFooter({ children }: { children: ReactNode }) {
  return <div className="step-footer">{children}</div>
}

export function InfoView({ step, onContinue }: ContinueViewProps<InfoStep>) {
  const { state, actions } = useNuri()
  const vocab = step.vocabId ? getVocabById(step.vocabId) : undefined
  const isFavorite = vocab ? state.progress.favorites.includes(vocab.id) : false

  return (
    <div className="step">
      <h2 className="step__title">{step.title}</h2>
      {step.big ? (
        <p className="step__big" lang={languageOf(step.bigLanguage)}>
          {step.big}
        </p>
      ) : null}
      {step.caption ? <p className="step__caption">{step.caption}</p> : null}
      {vocab?.romanization && state.profile.showRomanization ? <p className="step__romanization">{vocab.romanization}</p> : null}
      {step.lines.map((line) => (
        <p key={line} className="step__text">
          {line}
        </p>
      ))}
      {vocab ? (
        <button
          type="button"
          className="button button--ghost"
          aria-pressed={isFavorite}
          onClick={() => actions.toggleFavorite(vocab.id)}
        >
          <StarIcon size={20} isFilled={isFavorite} /> {isFavorite ? 'Favorita' : 'Favoritar palavra'}
        </button>
      ) : null}
      <StepFooter>
        <button type="button" className="button button--primary button--block" onClick={onContinue}>
          Continuar
        </button>
      </StepFooter>
    </div>
  )
}

export function ReadView({ step, onContinue }: ContinueViewProps<ReadStep>) {
  const [isTranslationVisible, setIsTranslationVisible] = useState(false)
  const reading = getReadingById(step.readingId)
  if (!reading) return <FeedbackBanner tone="error" title="Texto não encontrado." />

  return (
    <div className="step">
      <h2 className="step__title">{reading.title}</h2>
      <p className="step__text">Leia o texto. Depois vêm perguntas de compreensão.</p>
      <ul className="reading-lines">
        {reading.lines.map((line) => (
          <li key={line.ko} className="reading-line">
            <span className="reading-line__ko" lang="ko">
              {line.ko}
            </span>
            {isTranslationVisible ? <span className="reading-line__pt">{line.pt}</span> : null}
          </li>
        ))}
      </ul>
      <p className="step__text step__text--muted">Dica: tente ler primeiro e use a tradução só para conferir.</p>
      <button
        type="button"
        className="button button--ghost"
        aria-pressed={isTranslationVisible}
        onClick={() => setIsTranslationVisible((current) => !current)}
      >
        {isTranslationVisible ? 'Esconder tradução' : 'Mostrar tradução'}
      </button>
      <StepFooter>
        <button type="button" className="button button--primary button--block" onClick={onContinue}>
          Ir para as perguntas
        </button>
      </StepFooter>
    </div>
  )
}

export function ChoiceView({ step, onAttempt, onContinue }: GradedViewProps<ChoiceStep>) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [outcome, setOutcome] = useState<'correct' | 'wrong' | null>(null)
  const [isContextVisible, setIsContextVisible] = useState(false)

  const check = (): void => {
    if (selectedIndex === null) return
    const isCorrect = selectedIndex === step.answerIndex
    onAttempt(isCorrect, attemptCount === 0)
    setAttemptCount((count) => count + 1)
    setOutcome(isCorrect ? 'correct' : 'wrong')
  }

  const retry = (): void => {
    setSelectedIndex(null)
    setOutcome(null)
  }

  const isLocked = outcome !== null

  return (
    <div className="step">
      <h2 className="step__title">{step.prompt}</h2>
      {step.context ? (
        <div className="reading-context">
          <ul className="reading-lines reading-lines--compact">
            {step.context.map((line) => (
              <li key={line.ko} className="reading-line">
                <span className="reading-line__ko" lang="ko">
                  {line.ko}
                </span>
                {isContextVisible ? <span className="reading-line__pt">{line.pt}</span> : null}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="button button--ghost"
            aria-pressed={isContextVisible}
            onClick={() => setIsContextVisible((current) => !current)}
          >
            {isContextVisible ? 'Esconder tradução' : 'Mostrar tradução'}
          </button>
        </div>
      ) : null}
      {step.big ? (
        <p className="step__big" lang={languageOf(step.bigLanguage)}>
          {step.big}
        </p>
      ) : null}
      <div className="choice-list" role="radiogroup" aria-label="Alternativas">
        {step.options.map((option, index) => {
          const isSelected = selectedIndex === index
          const stateClass =
            outcome === 'correct' && isSelected ? ' is-correct' : outcome === 'wrong' && isSelected ? ' is-wrong' : isSelected ? ' is-selected' : ''
          return (
            <button
              key={`${option.text}-${index}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`choice${stateClass}${option.language === 'ko' ? ' choice--korean' : ''}`}
              lang={languageOf(option.language)}
              disabled={isLocked}
              onClick={() => setSelectedIndex(index)}
            >
              {option.text}
            </button>
          )
        })}
      </div>
      <StepFooter>
        {outcome === 'correct' ? (
          <FeedbackBanner tone="success" title="Correto!">
            {step.explanation}
          </FeedbackBanner>
        ) : null}
        {outcome === 'wrong' ? (
          <FeedbackBanner tone="error" title="Ainda não.">
            {step.explanation}
          </FeedbackBanner>
        ) : null}
        {outcome === null ? (
          <button type="button" className="button button--primary button--block" disabled={selectedIndex === null} onClick={check}>
            Verificar
          </button>
        ) : (
          <div className="button-row">
            {outcome === 'wrong' ? (
              <button type="button" className="button button--secondary" onClick={retry}>
                Tentar de novo
              </button>
            ) : null}
            <button type="button" className="button button--primary" onClick={onContinue}>
              Continuar
            </button>
          </div>
        )}
      </StepFooter>
    </div>
  )
}

export function TilesView({ step, onAttempt, onContinue }: GradedViewProps<TilesStep>) {
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [attemptCount, setAttemptCount] = useState(0)
  const [usedHint, setUsedHint] = useState(false)
  const [outcome, setOutcome] = useState<'correct' | 'wrong' | null>(null)
  const [boardKey, setBoardKey] = useState(0)

  const isJamoAssemble = step.join === 'jamo'
  const composed = step.composed ?? (isJamoAssemble ? composeFromJamo(step.answer) : joinTiles(step.answer, step.join))
  const requiredCount = step.answer.length
  const isFillComplete = selectedValues.length >= requiredCount

  const check = (): void => {
    if (!isFillComplete) return
    const isCorrect = areTilesEqual(selectedValues, step.answer)
    const isFirstUnaided = attemptCount === 0 && !usedHint
    onAttempt(isCorrect, isFirstUnaided)
    setAttemptCount((count) => count + 1)
    setOutcome(isCorrect ? 'correct' : 'wrong')
  }

  const retry = (): void => {
    setSelectedValues([])
    setOutcome(null)
    setBoardKey((key) => key + 1)
  }

  return (
    <div className={`step${isJamoAssemble ? ' step--assemble' : ''}${outcome === 'correct' ? ' step--solved' : ''}`}>
      <h2 className="step__title">{step.prompt}</h2>
      {isJamoAssemble && step.promptHint ? (
        <p className="step__target-hint">
          <span className="step__target-mark" aria-hidden="true" lang="ko">
            한
          </span>
          <span className="step__target-roma">{step.promptHint}</span>
        </p>
      ) : null}
      {step.big && !step.hideTarget ? (
        <p className="step__big" lang={languageOf(step.bigLanguage)}>
          {step.big}
        </p>
      ) : null}
      {step.patternHint ? <p className="step__hint">{step.patternHint}</p> : null}
      {isJamoAssemble ? (
        <SyllableBoard
          key={boardKey}
          bank={step.bank}
          slotCount={requiredCount}
          layout={step.layout ?? 'neutral'}
          isDisabled={outcome === 'correct'}
          isSolved={outcome === 'correct'}
          composed={composed}
          onChange={setSelectedValues}
        />
      ) : (
        <TileBoard
          key={boardKey}
          bank={step.bank}
          tileLanguage={step.tileLanguage}
          join={step.join}
          isDisabled={outcome !== null}
          onChange={setSelectedValues}
        />
      )}
      <StepFooter>
        {outcome === 'correct' ? (
          <FeedbackBanner tone="success" title="Isso mesmo!">
            Você montou {composed}. {step.explanation}
          </FeedbackBanner>
        ) : null}
        {outcome === 'wrong' ? (
          <FeedbackBanner tone="error" title="Ainda não.">
            {isJamoAssemble
              ? explainAssembleMistake(selectedValues, step.answer)
              : `Você montou “${joinTiles(selectedValues, step.join)}”. ${step.explanation}`}
          </FeedbackBanner>
        ) : null}
        {outcome === null ? (
          <>
            {isJamoAssemble && step.helpLevel !== 'demo' ? (
              <button type="button" className="button button--ghost" onClick={() => setUsedHint(true)}>
                {usedHint ? `Dica: ${step.answer.join(' → ')}` : 'Ver dica'}
              </button>
            ) : null}
            <button
              type="button"
              className="button button--primary button--block"
              disabled={!isFillComplete}
              onClick={check}
            >
              Verificar
            </button>
          </>
        ) : outcome === 'correct' ? (
          <button type="button" className="button button--primary button--block" onClick={onContinue}>
            Continuar
          </button>
        ) : (
          <div className="button-row">
            <button type="button" className="button button--secondary" onClick={retry}>
              Tentar de novo
            </button>
            <button type="button" className="button button--primary" onClick={onContinue}>
              Continuar
            </button>
          </div>
        )}
      </StepFooter>
    </div>
  )
}

export function WriteView({ step, onAttempt, onContinue }: GradedViewProps<WriteStep>) {
  const letter = getLetterById(step.letterId)
  const [result, setResult] = useState<WritingResult | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [usedHint, setUsedHint] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)
  const isGuided = (step.guide ?? 'guided') === 'guided'

  if (!letter) return <FeedbackBanner tone="error" title="Letra não encontrada." />

  const handleChecked = (nextResult: WritingResult): void => {
    if (nextResult.code === 'no-strokes') {
      setResult(nextResult)
      return
    }
    const isFirstUnaided = attemptCount === 0 && !usedHint
    onAttempt(nextResult.ok, isFirstUnaided)
    setAttemptCount((count) => count + 1)
    setResult(nextResult)
  }

  const retry = (): void => {
    setResult(null)
    setCanvasKey((key) => key + 1)
  }

  const directionHint =
    letter.char === 'ㅣ'
      ? 'Comece pelo ponto de cima e deslize pra baixo.'
      : `Siga o ponto 1 e a direção do modelo de ${letter.char}.`

  return (
    <div className={`step step--write${result?.ok ? ' step--solved' : ''}`}>
      <h2 className="step__title">{step.prompt ?? 'Desenhe o caractere:'}</h2>
      <p className="step__target-hint">
        <span className="step__target-mark" lang="ko">
          {letter.char}
        </span>
        <span className="step__caption">{letter.name} · {letter.romanization}</span>
      </p>
      <WritingCanvas
        key={canvasKey}
        models={letter.strokes}
        showOutline={isGuided || usedHint}
        isLocked={result?.ok === true}
        onChecked={handleChecked}
      />
      <StepFooter>
        {result ? (
          <FeedbackBanner tone={result.ok ? 'success' : 'error'} title={result.ok ? 'Isso mesmo!' : 'Quase lá.'}>
            {result.ok
              ? result.message
              : result.code === 'wrong-direction' || result.code === 'wrong-start'
                ? directionHint
                : result.message}
          </FeedbackBanner>
        ) : null}
        {result?.ok ? (
          <button type="button" className="button button--primary button--block" onClick={onContinue}>
            Continuar
          </button>
        ) : (
          <div className="button-row button-row--write">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setUsedHint(true)
                setCanvasKey((key) => key + 1)
                setResult(null)
              }}
            >
              Ver dica
            </button>
            {result && !result.ok ? (
              <button type="button" className="button button--secondary" onClick={retry}>
                Tentar de novo
              </button>
            ) : null}
          </div>
        )}
      </StepFooter>
    </div>
  )
}

export function PairsView({ step, onAttempt, onContinue }: GradedViewProps<PairsStep>) {
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [selectedKoId, setSelectedKoId] = useState<string | null>(null)
  const [selectedPtId, setSelectedPtId] = useState<string | null>(null)
  const [mistakeCount, setMistakeCount] = useState(0)
  const [hasMismatch, setHasMismatch] = useState(false)
  const isComplete = matchedIds.length === step.pairs.length

  const tryMatch = (koId: string | null, ptId: string | null): void => {
    if (koId === null || ptId === null) {
      setSelectedKoId(koId)
      setSelectedPtId(ptId)
      return
    }
    setSelectedKoId(null)
    setSelectedPtId(null)
    if (koId === ptId) {
      setHasMismatch(false)
      setMatchedIds((current) => [...current, koId])
      if (matchedIds.length + 1 === step.pairs.length) onAttempt(mistakeCount === 0, true)
      return
    }
    setHasMismatch(true)
    setMistakeCount((count) => count + 1)
  }

  const pairById = (pairId: string) => step.pairs.find((pair) => pair.id === pairId)

  return (
    <div className="step">
      <h2 className="step__title">Encontre os pares</h2>
      <p className="step__text">Toque em uma palavra em coreano e depois na tradução correspondente.</p>
      <div className="pairs">
        <div className="pairs__column" role="group" aria-label="Coreano">
          {step.koOrder.map((pairId) => {
            const isMatched = matchedIds.includes(pairId)
            return (
              <button
                key={pairId}
                type="button"
                lang="ko"
                className={`choice choice--korean${isMatched ? ' is-correct' : selectedKoId === pairId ? ' is-selected' : ''}`}
                aria-pressed={selectedKoId === pairId}
                disabled={isMatched}
                onClick={() => {
                  setHasMismatch(false)
                  tryMatch(pairId, selectedPtId)
                }}
              >
                {pairById(pairId)?.ko}
              </button>
            )
          })}
        </div>
        <div className="pairs__column" role="group" aria-label="Português">
          {step.ptOrder.map((pairId) => {
            const isMatched = matchedIds.includes(pairId)
            return (
              <button
                key={pairId}
                type="button"
                className={`choice${isMatched ? ' is-correct' : selectedPtId === pairId ? ' is-selected' : ''}`}
                aria-pressed={selectedPtId === pairId}
                disabled={isMatched}
                onClick={() => {
                  setHasMismatch(false)
                  tryMatch(selectedKoId, pairId)
                }}
              >
                {pairById(pairId)?.pt}
              </button>
            )
          })}
        </div>
      </div>
      <StepFooter>
        {hasMismatch && !isComplete ? (
          <FeedbackBanner tone="error" title="Esse par não combina.">
            Tente outra combinação.
          </FeedbackBanner>
        ) : null}
        {isComplete ? (
          <>
            <FeedbackBanner tone="success" title="Todos os pares encontrados!">
              {mistakeCount === 0 ? 'Sem nenhum erro.' : `Tentativas erradas: ${mistakeCount}.`}
            </FeedbackBanner>
            <button type="button" className="button button--primary button--block" onClick={onContinue}>
              Continuar
            </button>
          </>
        ) : null}
      </StepFooter>
    </div>
  )
}

export function CardView({ step, onAttempt, onContinue }: GradedViewProps<CardStep>) {
  const { state, actions } = useNuri()
  const [isRevealed, setIsRevealed] = useState(false)
  const [result, setResult] = useState<'remembered' | 'forgotten' | null>(null)
  const vocab = getVocabById(step.vocabId)
  if (!vocab) return <FeedbackBanner tone="error" title="Palavra não encontrada." />

  const answer = (nextResult: 'remembered' | 'forgotten'): void => {
    actions.reviewCard(vocab.id, nextResult)
    onAttempt(nextResult === 'remembered', true)
    setResult(nextResult)
  }

  const card = state.progress.reviewCards.find((candidate) => candidate.vocabId === vocab.id)
  const daysUntilDue = card ? daysBetween(todayKey(), card.dueDate) : 0
  const dueLabel = daysUntilDue <= 0 ? 'ainda hoje' : daysUntilDue === 1 ? 'amanhã' : `em ${daysUntilDue} dias`

  return (
    <div className="step">
      <h2 className="step__title">Você lembra o que significa?</h2>
      <div className="flashcard">
        <p className="step__big" lang="ko">
          {vocab.hangul}
        </p>
        {isRevealed ? (
          <>
            <p className="flashcard__answer">{vocab.translation}</p>
            {vocab.romanization && state.profile.showRomanization ? <p className="step__romanization">{vocab.romanization}</p> : null}
            {vocab.note ? <p className="step__text step__text--muted">{vocab.note}</p> : null}
          </>
        ) : null}
      </div>
      <StepFooter>
        {result ? (
          <FeedbackBanner
            tone={result === 'remembered' ? 'success' : 'info'}
            title={result === 'remembered' ? 'Boa! Você lembrou.' : 'Sem problema, ela volta logo.'}
          >
            Próxima revisão: {dueLabel}.
          </FeedbackBanner>
        ) : null}
        {!isRevealed ? (
          <button type="button" className="button button--primary button--block" onClick={() => setIsRevealed(true)}>
            Mostrar resposta
          </button>
        ) : result === null ? (
          <div className="button-row">
            <button type="button" className="button button--secondary" onClick={() => answer('forgotten')}>
              Não lembrei
            </button>
            <button type="button" className="button button--primary" onClick={() => answer('remembered')}>
              Lembrei
            </button>
          </div>
        ) : (
          <button type="button" className="button button--primary button--block" onClick={onContinue}>
            Continuar
          </button>
        )}
      </StepFooter>
    </div>
  )
}
