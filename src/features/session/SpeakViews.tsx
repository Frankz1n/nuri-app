import { useState } from 'react'
import { AnswerSheet } from '../../components/AnswerSheet'
import { ExplainPanel } from '../../components/ExplainPanel'
import { KoreanText } from '../../components/KoreanText'
import { MascotPrompt } from '../../components/MascotPrompt'
import { getVocabById } from '../../data'
import { speakKorean } from '../../lib/audio/tts'
import type { ListeningAnswer } from '../../lib/session'
import type { ListenChoiceStep, WordListenStep, WordRepeatStep } from '../../lib/steps'
import { getSessionByLessonId } from '../../data/curriculum'
import { parseSessionDraft } from '../../lib/session'
import { useNuri } from '../../state/useNuri'
import { VoiceRecorder } from '../pronounce/VoiceRecorder'

interface ContinueProps<T> {
  step: T
  onContinue: () => void
}

export function WordListenView({ step, onContinue }: ContinueProps<WordListenStep>) {
  const [heard, setHeard] = useState(false)
  const vocab = getVocabById(step.vocabId)
  if (!vocab) {
    return (
      <button type="button" className="button button--primary" onClick={onContinue}>
        Continuar
      </button>
    )
  }

  return (
    <div className="step step--coach">
      <MascotPrompt title={step.prompt} pose="confident">
        <KoreanText
          hangul={vocab.hangul}
          romanization={vocab.romanization}
          size="lg"
          onHeard={() => setHeard(true)}
        />
        <p className="step__caption">{vocab.translation}</p>
        <p className="step__text step__text--muted">Toque no 🔊, ouça com atenção e depois continue.</p>
      </MascotPrompt>
      <div className="step-footer">
        <button type="button" className="button button--primary button--block" disabled={!heard} onClick={onContinue}>
          {heard ? 'Continuar' : 'Ouça a palavra para continuar'}
        </button>
        {!heard ? (
          <button type="button" className="button button--ghost" onClick={() => setHeard(true)}>
            Não posso ouvir agora
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function WordRepeatView({ step, onContinue }: ContinueProps<WordRepeatStep>) {
  const { state, actions } = useNuri()
  const [skipped, setSkipped] = useState(false)
  const vocab = getVocabById(step.vocabId)
  if (!vocab) {
    return (
      <button type="button" className="button button--primary" onClick={onContinue}>
        Continuar
      </button>
    )
  }

  const markSkippedSpeech = (): void => {
    setSkipped(true)
    const draft = parseSessionDraft(state.activityDraft)
    const draftLessonId = draft?.origin.type === 'lesson' ? draft.origin.lessonId : undefined
    const curriculumSession = draftLessonId ? getSessionByLessonId(draftLessonId) : undefined
    if (curriculumSession) actions.recordSessionEvidence(curriculumSession.id, 'skipped')
  }

  return (
    <div className="step step--coach">
      <MascotPrompt
        title={step.prompt}
        pose={skipped ? 'nervous' : 'wave'}
        hangul={vocab.hangul}
        romanization={vocab.romanization}
      >
        <p className="step__caption">{vocab.translation}</p>
        {!skipped ? (
          <>
            <p className="step__text">Ouça de novo se precisar e depois grave a sua fala.</p>
            <VoiceRecorder practiceMode promptLabel={vocab.hangul} />
          </>
        ) : null}
      </MascotPrompt>
      <div className="step-footer">
        {skipped ? (
          <AnswerSheet
            tone="skip"
            title="Vamos pular a fala deste passo."
            secondaryLabel="Desfazer"
            onSecondary={() => setSkipped(false)}
            primaryLabel="Continuar"
            onPrimary={onContinue}
          />
        ) : (
          <>
            <button type="button" className="button button--ghost" onClick={markSkippedSpeech}>
              Não posso falar agora
            </button>
            <button type="button" className="button button--primary button--block" onClick={onContinue}>
              Continuar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

interface ListenChoiceViewProps {
  step: ListenChoiceStep
  answer?: ListeningAnswer
  onAnswer: (answer: ListeningAnswer) => void
  onContinue: () => void
}

export function ListenChoiceView({ step, answer, onAnswer, onContinue }: ListenChoiceViewProps) {
  const [heard, setHeard] = useState(false)
  const [showText, setShowText] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [isExplainOpen, setIsExplainOpen] = useState(false)
  const [skippedAudio, setSkippedAudio] = useState(false)
  const [audioHint, setAudioHint] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const correct = answer?.option === step.answerIndex

  const playAudio = async (): Promise<void> => {
    setIsPlaying(true)
    const result = await speakKorean(step.speakText)
    setIsPlaying(false)
    if (result.ok) {
      setHeard(true)
      setAudioHint('Voz coreana do aparelho')
      return
    }
    setAudioHint(result.message ?? 'Sem voz coreana neste aparelho.')
    setShowText(true)
  }

  if (isExplainOpen) {
    return (
      <ExplainPanel
        prompt={step.revealHangul}
        promptLanguage="ko"
        explanation={step.explanation}
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
        title={step.prompt}
        pose={answer ? (correct ? 'cheer' : 'worried') : skippedAudio ? 'nervous' : 'confident'}
        hangul={showText || answer ? step.revealHangul : undefined}
        audioSlot={
          skippedAudio ? undefined : (
            <button type="button" className="button button--secondary" disabled={isPlaying} onClick={() => void playAudio()}>
              {isPlaying ? 'Tocando…' : heard || answer?.unaided ? 'Ouvir de novo' : 'Ouvir'}
            </button>
          )
        }
      >
        {audioHint ? <p className="field__hint">{audioHint}</p> : null}
        {!answer && !showText && !skippedAudio ? (
          <button type="button" className="button button--ghost" onClick={() => setShowText(true)}>
            Ver em hangul
          </button>
        ) : null}
        {showText && !answer ? <p className="field__hint">Esta tentativa é com apoio de leitura.</p> : null}
      </MascotPrompt>

      {heard || showText || answer || skippedAudio ? (
        <div className="live-options" role="group" aria-label="O que você ouviu?">
          {step.options.map((option, optionIndex) => (
            <button
              key={option}
              type="button"
              aria-pressed={(answer?.option ?? selected) === optionIndex}
              className={`choice${(answer?.option ?? selected) === optionIndex ? ' is-selected' : ''}${answer && step.answerIndex === optionIndex ? ' is-correct' : ''}`}
              onClick={() => setSelected(optionIndex)}
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
                {step.explanation}
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
            ) : null}
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
