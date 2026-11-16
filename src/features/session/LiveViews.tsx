import { useState } from 'react'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { getLiveSituation } from '../../data/live'
import type { ListeningAnswer } from '../../lib/session'
import type { LiveDialogueStep, LiveListeningStep } from '../../lib/steps'
import { VoiceRecorder } from '../pronounce/VoiceRecorder'
import { LiveContextPicture, LivePlayback } from './LiveMedia'

interface ListeningViewProps {
  step: LiveListeningStep
  answer?: ListeningAnswer
  onAnswer: (answer: ListeningAnswer) => void
  onContinue: () => void
}

export function LiveListeningView({ step, answer, onAnswer, onContinue }: ListeningViewProps) {
  const [heard, setHeard] = useState(false)
  const [showText, setShowText] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const situation = getLiveSituation(step.situationId)
  if (!situation) return <button type="button" className="button" onClick={onContinue}>Continuar</button>

  const line = situation[step.take]
  const correct = answer?.option === step.answerIndex
  const title = step.take === 'transfer'
    ? 'Reconheça em outra fala'
    : line.video ? 'Assista e escolha o sentido' : 'Ouça e escolha o sentido'

  return (
    <div className="step live-step">
      <h2 className="step__title">{title}</h2>
      <p className="step__text">{step.take === 'opening' ? situation.context : 'Escute uma nova versão da expressão.'}</p>
      <LivePlayback situation={situation} role={step.take} label={heard || answer?.unaided ? 'Ouvir de novo' : 'Ouvir em coreano'} onHeard={() => setHeard(true)} />
      {!answer && !showText ? (
        <button type="button" className="button button--ghost" onClick={() => setShowText(true)}>Ver frase em hangul</button>
      ) : null}
      {showText || answer ? (
        <p className="live-line" lang="ko">{line.ko}</p>
      ) : null}
      {showText && !answer ? <p className="field__hint">Esta tentativa é com apoio de leitura.</p> : null}
      {heard || showText || answer ? (
        <div className="live-options" role="group" aria-label="O que a frase significa?">
          {step.options.map((option, index) => (
            <button
              key={option}
              type="button"
              aria-pressed={(answer?.option ?? selected) === index}
              className={`choice${(answer?.option ?? selected) === index ? ' is-selected' : ''}${answer && step.answerIndex === index ? ' is-correct' : ''}`}
              onClick={() => setSelected(index)}
              disabled={!!answer}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      <div className="step-footer">
        {answer ? (
          <>
            <FeedbackBanner tone={correct ? 'success' : 'info'} title={correct ? 'Isso mesmo!' : 'Confira o sentido'}>
              {line.pt} {!answer.unaided ? 'Prática com apoio de leitura.' : ''}
            </FeedbackBanner>
            <button type="button" className="button button--primary button--block" onClick={onContinue}>Continuar</button>
          </>
        ) : (
          <button
            type="button"
            className="button button--primary button--block"
            disabled={selected === null}
            onClick={() => {
              if (selected !== null) onAnswer({ option: selected, unaided: heard && !showText })
            }}
          >
            Conferir
          </button>
        )}
      </div>
    </div>
  )
}

interface DialogueViewProps {
  step: LiveDialogueStep
  onContinue: () => void
}

export function LiveDialogueView({ step, onContinue }: DialogueViewProps) {
  const [showModel, setShowModel] = useState(false)
  const situation = getLiveSituation(step.situationId)
  if (!situation) return <button type="button" className="button" onClick={onContinue}>Continuar</button>

  const isReading = step.kind === 'live-read'
  return (
    <div className="step live-step">
      <h2 className="step__title">{isReading ? 'Leia e acompanhe a fala' : 'Responda em voz alta'}</h2>
      {isReading ? (
        <>
          {situation.picture ? <LiveContextPicture picture={situation.picture} /> : null}
          <div className="live-dialogue">
            <p className="live-line" lang="ko">{situation.opening.ko}</p>
            <p>{situation.opening.pt}</p>
          </div>
          <LivePlayback situation={situation} role="opening" label="Ouvir enquanto leio" />
          <p>Procure <strong lang="ko">{situation.focus}</strong> dentro da frase.</p>
          <div className="live-dialogue live-dialogue--reply">
            <p className="live-line" lang="ko">{situation.reply.ko}</p>
            <p>{situation.reply.pt}</p>
          </div>
          <LivePlayback situation={situation} role="reply" label="Ouvir a resposta" />
        </>
      ) : (
        <>
          <p className="step__text">Ouça a fala da live e responda em coreano. {situation.context}</p>
          <LivePlayback situation={situation} role="opening" label="Ouvir a fala da live" />
          <VoiceRecorder practiceMode />
          {showModel ? (
            <>
              <div className="live-dialogue live-dialogue--reply">
                <p className="live-line" lang="ko">{situation.reply.ko}</p>
                <p>{situation.reply.pt}</p>
              </div>
              <LivePlayback situation={situation} role="reply" label="Ouvir o modelo" />
            </>
          ) : (
            <button type="button" className="button button--secondary" onClick={() => setShowModel(true)}>Ver resposta modelo</button>
          )}
        </>
      )}
      <div className="step-footer">
        <button type="button" className="button button--primary button--block" onClick={onContinue}>
          {isReading ? 'Agora vou responder' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}
