import { useState } from 'react'
import { AnswerSheet } from '../../components/AnswerSheet'
import { KoreanText } from '../../components/KoreanText'
import { MascotPrompt } from '../../components/MascotPrompt'
import { getVocabById } from '../../data'
import type { WordListenStep, WordRepeatStep } from '../../lib/steps'
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
  const [skipped, setSkipped] = useState(false)
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
            <button type="button" className="button button--ghost" onClick={() => setSkipped(true)}>
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
