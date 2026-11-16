import { useState } from 'react'
import { AnswerSheet } from '../../components/AnswerSheet'
import { ExplainPanel } from '../../components/ExplainPanel'
import { FeedbackBanner } from '../../components/FeedbackBanner'
import { MascotPrompt } from '../../components/MascotPrompt'
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
  const [isExplainOpen, setIsExplainOpen] = useState(false)
  const [skippedAudio, setSkippedAudio] = useState(false)
  const situation = getLiveSituation(step.situationId)
  if (!situation) {
    return (
      <button type="button" className="button" onClick={onContinue}>
        Continuar
      </button>
    )
  }

  const line = situation[step.take]
  const correct = answer?.option === step.answerIndex
  const title =
    step.take === 'transfer'
      ? 'Toque no que escutar:'
      : line.video
        ? 'Assista e escolha o sentido'
        : 'Toque no que escutar:'

  if (isExplainOpen) {
    return (
      <ExplainPanel
        prompt={line.ko}
        promptLanguage="ko"
        explanation={`${line.pt}. ${situation.context}`}
        onClose={() => setIsExplainOpen(false)}
        onContinue={() => {
          setIsExplainOpen(false)
          onContinue()
        }}
      />
    )
  }

  return (
    <div className={`step live-step step--coach${answer ? (correct ? ' step--correct' : ' step--wrong') : ''}`}>
      <MascotPrompt
        title={title}
        pose={answer ? (correct ? 'cheer' : 'worried') : skippedAudio ? 'nervous' : 'confident'}
        hangul={showText || answer ? line.ko : undefined}
        audioSlot={
          skippedAudio ? undefined : (
            <LivePlayback
              situation={situation}
              role={step.take}
              label={heard || answer?.unaided ? 'Ouvir de novo' : 'Ouvir'}
              onHeard={() => setHeard(true)}
            />
          )
        }
      >
        {!answer && !showText && !skippedAudio ? (
          <button type="button" className="button button--ghost" onClick={() => setShowText(true)}>
            Ver frase em hangul
          </button>
        ) : null}
        {showText && !answer ? <p className="field__hint">Esta tentativa é com apoio de leitura.</p> : null}
      </MascotPrompt>

      {heard || showText || answer || skippedAudio ? (
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
          <AnswerSheet
            tone={correct ? 'correct' : 'wrong'}
            title={correct ? 'Isso mesmo!' : 'Confira o sentido'}
            detail={
              <>
                {line.pt}
                {!answer.unaided ? ' Prática com apoio de leitura.' : ''}
              </>
            }
            onExplain={() => setIsExplainOpen(true)}
            primaryLabel="Continuar"
            onPrimary={onContinue}
          />
        ) : (
          <>
            {!skippedAudio ? (
              <button type="button" className="button button--ghost" onClick={() => setSkippedAudio(true)}>
                Não posso ouvir agora
              </button>
            ) : (
              <FeedbackBanner tone="info" title="Vamos pular o áudio deste passo.">
                Você ainda pode responder pela leitura.
              </FeedbackBanner>
            )}
            <button
              type="button"
              className="button button--primary button--block"
              disabled={selected === null}
              onClick={() => {
                if (selected !== null) onAnswer({ option: selected, unaided: heard && !showText && !skippedAudio })
              }}
            >
              Verificar
            </button>
          </>
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
  const [skippedSpeech, setSkippedSpeech] = useState(false)
  const situation = getLiveSituation(step.situationId)
  if (!situation) {
    return (
      <button type="button" className="button" onClick={onContinue}>
        Continuar
      </button>
    )
  }

  const isReading = step.kind === 'live-read'
  const line = isReading ? situation.opening : situation.reply

  return (
    <div className="step live-step step--coach">
      {isReading ? (
        <>
          <MascotPrompt
            title="Leia e acompanhe a fala"
            pose="wave"
            hangul={situation.opening.ko}
            audioSlot={<LivePlayback situation={situation} role="opening" label="Ouvir enquanto leio" />}
          >
            {situation.picture ? <LiveContextPicture picture={situation.picture} /> : null}
            <p>
              Procure <strong lang="ko">{situation.focus}</strong> dentro da frase.
            </p>
          </MascotPrompt>
          <div className="live-dialogue live-dialogue--reply">
            <p className="live-line" lang="ko">
              {situation.reply.ko}
            </p>
            <p>{situation.reply.pt}</p>
          </div>
          <LivePlayback situation={situation} role="reply" label="Ouvir a resposta" />
        </>
      ) : skippedSpeech ? (
        <MascotPrompt title="Repita o que o Horangi disse:" pose="nervous" hangul={line.ko} />
      ) : (
        <MascotPrompt
          title="Repita o que o Horangi disse:"
          pose="confident"
          hangul={line.ko}
          audioSlot={<LivePlayback situation={situation} role="reply" label="Ouvir o modelo" />}
        >
          <p className="step__text">{situation.context}</p>
          <VoiceRecorder practiceMode />
          {showModel ? (
            <div className="live-dialogue live-dialogue--reply">
              <p className="live-line" lang="ko">
                {situation.reply.ko}
              </p>
              <p>{situation.reply.pt}</p>
            </div>
          ) : (
            <button type="button" className="button button--secondary" onClick={() => setShowModel(true)}>
              Ver resposta modelo
            </button>
          )}
        </MascotPrompt>
      )}

      <div className="step-footer">
        {skippedSpeech && !isReading ? (
          <AnswerSheet
            tone="skip"
            title="Vamos pular os exercícios de fala desta lição."
            secondaryLabel="Desfazer"
            onSecondary={() => setSkippedSpeech(false)}
            primaryLabel="Continuar"
            onPrimary={onContinue}
          />
        ) : (
          <>
            {!isReading ? (
              <button type="button" className="button button--ghost" onClick={() => setSkippedSpeech(true)}>
                Não posso falar agora
              </button>
            ) : null}
            <button type="button" className="button button--primary button--block" onClick={onContinue}>
              {isReading ? 'Agora vou responder' : 'Continuar'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
