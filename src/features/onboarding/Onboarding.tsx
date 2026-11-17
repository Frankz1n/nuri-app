import { useState } from 'react'
import { DAILY_GOAL_OPTIONS, formatDailyGoalLabel } from '../../core'
import type { DailyGoalMinutes } from '../../core'
import { getLetterById, getStageById, getVocabById, getWeekByNumber } from '../../data'
import { BrandMark } from '../../components/AppHeader'
import { ProgressBar } from '../../components/ProgressBar'
import { recommendCurriculumPlacement } from '../../lib/curriculumPath'
import { createSessionRandom } from '../../lib/random'
import type { ChoiceStep } from '../../lib/steps'
import {
  buildLetterBlockStep,
  buildLetterSoundStep,
  buildSyllableComposeStep,
  buildVocabChoiceStep,
} from '../../lib/stepBuilders'
import { useNuri } from '../../state/useNuri'
import { navigateTo } from '../../state/router'
import { ChoiceView } from '../session/StepViews'
import { GlossaryList } from '../profile/Glossary'

const INTERESTS = ['K-pop', 'Dramas', 'Viagem', 'Cultura', 'Só curiosidade'] as const

const parseInterests = (value: string | undefined): string[] => {
  if (!value) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => (INTERESTS as readonly string[]).includes(part))
}

const FAMILIARITY_OPTIONS = [
  { id: 'Nunca vi hangul', hint: 'Começo do zero.' },
  { id: 'Reconheço algumas letras', hint: 'Já vi um pouco.' },
  { id: 'Leio devagar', hint: 'Sei ler com esforço.' },
] as const

type Phase = 'profile' | 'goal' | 'offer' | 'orientation' | 'result'

const buildOrientationSteps = (): ChoiceStep[] => {
  const random = createSessionRandom()
  const letterA = getLetterById('letter-a')
  const letterG = getLetterById('letter-g')
  const letterEu = getLetterById('letter-eu')
  const vocabHello = getVocabById('vocab-annyeonghaseyo')
  const vocabThanks = getVocabById('vocab-gamsahamnida')
  return [
    letterA ? buildLetterSoundStep(letterA, random) : null,
    letterG ? buildLetterSoundStep(letterG, random) : null,
    letterEu ? buildLetterBlockStep(letterEu, random) : null,
    buildSyllableComposeStep('한', random),
    vocabHello ? buildVocabChoiceStep(vocabHello, 'ko-pt', random) : null,
    vocabThanks ? buildVocabChoiceStep(vocabThanks, 'pt-ko', random) : null,
  ].flatMap((step) => step ?? [])
}

export function Onboarding() {
  const { state, actions } = useNuri()
  const [phase, setPhase] = useState<Phase>('profile')
  const [name, setName] = useState(state.profile.name ?? '')
  const [interests, setInterests] = useState<string[]>(() => parseInterests(state.profile.interest))
  const [familiarity, setFamiliarity] = useState<string | undefined>(state.profile.familiarity)
  const [goalMinutes, setGoalMinutes] = useState<DailyGoalMinutes>(state.profile.dailyGoalMinutes)
  const [orientationSteps] = useState(buildOrientationSteps)
  const [orientationIndex, setOrientationIndex] = useState(0)
  const [orientationHits, setOrientationHits] = useState(0)
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false)

  const toggleInterest = (option: string): void => {
    setInterests((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    )
  }

  const saveProfile = (): void => {
    const trimmedName = name.trim()
    actions.setProfile({
      name: trimmedName === '' ? undefined : trimmedName,
      interest: interests.length > 0 ? interests.join(', ') : undefined,
      familiarity,
      dailyGoalMinutes: goalMinutes,
      onboardingDone: true,
    })
  }

  const finish = (hash: string): void => {
    saveProfile()
    navigateTo(hash, { replace: true })
  }

  const placement = recommendCurriculumPlacement(orientationHits, familiarity)
  const recommendedStage = getStageById(placement.stageId)
  const recommendedWeek = getWeekByNumber(placement.weekNumber)
  const starterHref = `#/lesson/${placement.lessonId}`
  const zeroHref = '#/lesson/lesson-speak-01'

  return (
    <div className="screen onboarding">
      <header className="onboarding__header">
        <BrandMark />
        <h1 className="screen__title">Bem-vindo ao Nuri</h1>
        <p className="screen__text">
          Começamos falando: você ouve palavras curtas, repete em voz alta e só depois aprofunda o hangul escrito.
        </p>
      </header>

      {phase === 'profile' ? (
        <section className="card" aria-labelledby="ob-profile">
          <h2 id="ob-profile" className="card__title">
            Sobre você
          </h2>
          <div className="field">
            <label className="field__label" htmlFor="ob-name">
              Como podemos te chamar? (opcional)
            </label>
            <input
              id="ob-name"
              className="input"
              type="text"
              autoComplete="given-name"
              maxLength={40}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <fieldset className="field">
            <legend className="field__label">O que mais te interessa?</legend>
            <p className="field__hint" id="ob-interests-hint">
              Pode marcar mais de um.
            </p>
            <div className="chip-row" role="group" aria-describedby="ob-interests-hint">
              {INTERESTS.map((option) => {
                const isSelected = interests.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    className={`filter-chip${isSelected ? ' is-active' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => toggleInterest(option)}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <fieldset className="field">
            <legend className="field__label">Quanto você conhece do hangul?</legend>
            <div className="choice-list" role="radiogroup">
              {FAMILIARITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={familiarity === option.id}
                  className={`choice${familiarity === option.id ? ' is-selected' : ''}`}
                  onClick={() => setFamiliarity(option.id)}
                >
                  {option.id} <span className="choice__hint">— {option.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <button type="button" className="button button--primary button--block" onClick={() => setPhase('goal')}>
            Continuar
          </button>
        </section>
      ) : null}

      {phase === 'goal' ? (
        <section className="card" aria-labelledby="ob-goal">
          <h2 id="ob-goal" className="card__title">
            Quanto tempo por dia?
          </h2>
          <div className="segmented segmented--goals" role="radiogroup" aria-label="Meta diária de estudo">
            {DAILY_GOAL_OPTIONS.map((minutes) => (
              <label key={minutes} className={`segmented__option${goalMinutes === minutes ? ' is-active' : ''}`}>
                <input type="radio" name="ob-goal" checked={goalMinutes === minutes} onChange={() => setGoalMinutes(minutes)} />
                <span className="segmented__label">{formatDailyGoalLabel(minutes)}</span>
              </label>
            ))}
          </div>
          <div className="button-row">
            <button type="button" className="button button--ghost" onClick={() => setPhase('profile')}>
              Voltar
            </button>
            <button type="button" className="button button--primary" onClick={() => setPhase('offer')}>
              Continuar
            </button>
          </div>
        </section>
      ) : null}

      {phase === 'offer' ? (
        <section className="card" aria-labelledby="ob-offer">
          <h2 id="ob-offer" className="card__title">
            Por onde começar?
          </h2>
          <p className="card__text">
            Iniciante absoluto começa na Semana 1 (pedir uma bebida). Se você já estuda, a orientação curta sugere a etapa
            — o conteúdo avançado aparece como roteiro até os próximos lotes.
          </p>
          <div className="stack">
            <button type="button" className="button button--secondary button--block" onClick={() => setPhase('orientation')}>
              Fazer orientação (6 perguntas)
            </button>
            <button
              type="button"
              className="button button--primary button--block"
              onClick={() => finish(familiarity === 'Nunca vi hangul' || !familiarity ? zeroHref : '#/learn')}
            >
              Começar do zero (falar primeiro)
            </button>
          </div>
        </section>
      ) : null}

      {phase === 'orientation' ? (
        <section aria-label="Orientação">
          <p className="session__position" aria-live="polite">
            Pergunta {orientationIndex + 1} de {orientationSteps.length}
          </p>
          <ProgressBar value={orientationIndex} max={orientationSteps.length} label="Progresso da orientação" isCompact />
          <div key={orientationIndex}>
            <ChoiceView
              step={orientationSteps[orientationIndex]}
              onAttempt={(isCorrect, isFirstAttempt) => {
                if (isCorrect && isFirstAttempt) setOrientationHits((hits) => hits + 1)
              }}
              onContinue={() => {
                if (orientationIndex + 1 >= orientationSteps.length) setPhase('result')
                else setOrientationIndex((index) => index + 1)
              }}
            />
          </div>
        </section>
      ) : null}

      {phase === 'result' ? (
        <section className="card" aria-labelledby="ob-result">
          <h2 id="ob-result" className="card__title">
            Sugestão de início
          </h2>
          <p className="card__text">
            Você acertou {orientationHits} de {orientationSteps.length} de primeira. O Nuri recomenda{' '}
            <strong>
              Etapa {placement.stageId}
              {recommendedStage ? ` · ${recommendedStage.title}` : ''}
            </strong>
            {recommendedWeek ? (
              <>
                , semana {String(recommendedWeek.number).padStart(2, '0')} · {recommendedWeek.mission}
              </>
            ) : null}
            .
          </p>
          <p className="card__text">{placement.reason}</p>
          <div className="stack">
            <button type="button" className="button button--primary button--block" onClick={() => finish(starterHref)}>
              Começar por aí
            </button>
            <button type="button" className="button button--secondary button--block" onClick={() => finish(zeroHref)}>
              Prefiro começar do zero (Semana 1)
            </button>
            <button type="button" className="button button--ghost button--block" onClick={() => finish('#/learn')}>
              Ver a trilha anual
            </button>
          </div>
        </section>
      ) : null}

      <section className="card card--muted">
        <button
          type="button"
          className="button button--ghost"
          aria-expanded={isGlossaryOpen}
          onClick={() => setIsGlossaryOpen((isOpen) => !isOpen)}
        >
          {isGlossaryOpen ? 'Esconder glossário' : 'Ver glossário (hangul, jamo, batchim…)'}
        </button>
        {isGlossaryOpen ? <GlossaryList /> : null}
      </section>

      {phase !== 'result' ? (
        <button type="button" className="button button--ghost button--block" onClick={() => finish(zeroHref)}>
          Pular e começar do zero
        </button>
      ) : null}
    </div>
  )
}
