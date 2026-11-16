import { useRef, useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { LessonLayout } from '../../components/LessonLayout'
import type { ListeningAnswer, SessionDraftPayload } from '../../lib/session'
import type { Step } from '../../lib/steps'
import { useNuri } from '../../state/useNuri'
import { LiveDialogueView, LiveListeningView } from './LiveViews'
import { CardView, ChoiceView, InfoView, PairsView, ReadView, TilesView, WriteView } from './StepViews'

export interface SessionSummary {
  gradedCount: number
  firstTryHits: number
}

interface SessionRunnerProps {
  title: string
  session: SessionDraftPayload
  onProgress: (progress: SessionDraftPayload) => void
  onExit: () => void
  onFinish: (summary: SessionSummary) => void
}

export function SessionRunner({ title, session, onProgress, onExit, onFinish }: SessionRunnerProps) {
  const { actions } = useNuri()
  const [index, setIndex] = useState(session.index)
  const [listeningAnswer, setListeningAnswer] = useState(session.listeningAnswer)
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false)
  const countsRef = useRef<SessionSummary>({ gradedCount: session.gradedCount, firstTryHits: session.firstTryHits })

  const step: Step = session.steps[index]

  const handleAttempt = (isCorrect: boolean, isFirstAttempt: boolean): void => {
    if (!isFirstAttempt) return
    countsRef.current = {
      gradedCount: countsRef.current.gradedCount + 1,
      firstTryHits: countsRef.current.firstTryHits + (isCorrect ? 1 : 0),
    }
    actions.recordSkillAttempt(step.skillId, isCorrect)
    if (!step.errorId) return
    if (isCorrect) {
      actions.clearError(step.errorId, session.sessionId)
      return
    }
    actions.queueError({ id: step.errorId, kind: step.errorId.split(':')[0], lastFailedSessionId: session.sessionId })
  }

  const handleListeningAnswer = (answer: ListeningAnswer): void => {
    if (step.kind !== 'live-listen' || !actions.recordListeningAnswer(session.sessionId, index, answer)) return
    if (answer.unaided) {
      countsRef.current.gradedCount++
      if (answer.option === step.answerIndex) countsRef.current.firstTryHits++
    }
    setListeningAnswer(answer)
  }

  const handleContinue = (): void => {
    const nextIndex = index + 1
    if (nextIndex >= session.steps.length) {
      onFinish(countsRef.current)
      return
    }
    setIndex(nextIndex)
    setListeningAnswer(undefined)
    onProgress({ ...session, index: nextIndex, ...countsRef.current, listeningAnswer: undefined })
  }

  const renderStep = () => {
    switch (step.kind) {
      case 'live-listen':
        return <LiveListeningView step={step} answer={listeningAnswer} onAnswer={handleListeningAnswer} onContinue={handleContinue} />
      case 'live-read':
      case 'live-speak':
        return <LiveDialogueView step={step} onContinue={handleContinue} />
      case 'info':
        return <InfoView step={step} onContinue={handleContinue} />
      case 'read':
        return <ReadView step={step} onContinue={handleContinue} />
      case 'choice':
        return <ChoiceView step={step} onAttempt={handleAttempt} onContinue={handleContinue} />
      case 'tiles':
        return <TilesView step={step} onAttempt={handleAttempt} onContinue={handleContinue} />
      case 'write':
        return <WriteView step={step} onAttempt={handleAttempt} onContinue={handleContinue} />
      case 'pairs':
        return <PairsView step={step} onAttempt={handleAttempt} onContinue={handleContinue} />
      case 'card':
        return <CardView step={step} onAttempt={handleAttempt} onContinue={handleContinue} />
    }
  }

  return (
    <>
      <LessonLayout
        title={title}
        stepIndex={index}
        stepCount={session.steps.length}
        onExit={() => setIsExitDialogOpen(true)}
      >
        {/* A chave reinicia o estado local de cada passo. */}
        <div key={index} className="lesson__step">
          {renderStep()}
        </div>
      </LessonLayout>
      {isExitDialogOpen ? (
        <ConfirmDialog
          title="Sair da atividade?"
          confirmLabel="Sair e salvar"
          cancelLabel="Continuar atividade"
          onConfirm={onExit}
          onCancel={() => setIsExitDialogOpen(false)}
        >
          <p>
            Você está no passo {index + 1} de {session.steps.length}. Ele fica salvo e você pode retomar depois em
            Aprender.
          </p>
        </ConfirmDialog>
      ) : null}
    </>
  )
}
