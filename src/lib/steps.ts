export type TextLanguage = 'ko' | 'pt'

interface StepBase {
  /** Habilidade usada nas estatísticas de acerto de primeira. */
  skillId: string
  /** Identificador estável para a fila de erros (ex.: `vocab:vocab-ne`). */
  errorId?: string
}

export interface InfoStep extends StepBase {
  kind: 'info'
  title: string
  big?: string
  bigLanguage?: TextLanguage
  caption?: string
  lines: string[]
  vocabId?: string
}

export interface ChoiceOption {
  text: string
  language: TextLanguage
}

export interface ContextLine {
  ko: string
  pt: string
}

export interface ChoiceStep extends StepBase {
  kind: 'choice'
  prompt: string
  big?: string
  bigLanguage?: TextLanguage
  options: ChoiceOption[]
  answerIndex: number
  explanation: string
  context?: ContextLine[]
}

/** Arranjo visual dos espaços no quadro de montagem silábica. */
export type SyllableLayout = 'vertical-right' | 'horizontal-below' | 'batchim' | 'neutral'

/** Nível de ajuda da montagem: demo mostra exemplo; guided usa layout; apply não revela o arranjo. */
export type AssembleHelpLevel = 'demo' | 'guided' | 'apply'

export interface TilesStep extends StepBase {
  kind: 'tiles'
  prompt: string
  big?: string
  bigLanguage?: TextLanguage
  bank: string[]
  answer: string[]
  /** Como juntar as peças na prévia e na comparação: '' (blocos), ' ' (frase) ou 'jamo' (compõe sílaba). */
  join: '' | ' ' | 'jamo'
  tileLanguage: TextLanguage
  /** Padrão gramatical praticado (mostrado antes de responder). */
  patternHint?: string
  explanation: string
  /** Layout dos espaços; só usado em montagem jamo. */
  layout?: SyllableLayout
  helpLevel?: AssembleHelpLevel
  /** Síaba pré-composta esperada (Unicode). Se ausente, deriva de `answer` via compositor. */
  composed?: string
  /** Quando true, não mostra a sílaba pronta no enunciado antes de verificar. */
  hideTarget?: boolean
  /** Dica fonética curta (ex.: "pi") no enunciado, sem revelar o hangul. */
  promptHint?: string
}

export interface WriteStep extends StepBase {
  kind: 'write'
  letterId: string
  /** Contorno e seta: guided mostra ajuda; free só grade neutra. */
  guide?: 'guided' | 'free'
  prompt?: string
}

export interface PairItem {
  id: string
  ko: string
  pt: string
}

export interface PairsStep extends StepBase {
  kind: 'pairs'
  pairs: PairItem[]
  koOrder: string[]
  ptOrder: string[]
}

export interface CardStep extends StepBase {
  kind: 'card'
  vocabId: string
}

export interface ReadStep extends StepBase {
  kind: 'read'
  readingId: string
}

export interface LiveListeningStep extends StepBase {
  kind: 'live-listen'
  situationId: string
  take: 'opening' | 'transfer'
  options: string[]
  answerIndex: number
}

export interface LiveDialogueStep extends StepBase {
  kind: 'live-read' | 'live-speak'
  situationId: string
}

export type Step =
  | InfoStep | ChoiceStep | TilesStep | WriteStep | PairsStep | CardStep | ReadStep
  | LiveListeningStep | LiveDialogueStep

export const isGradedStep = (step: Step): boolean => step.kind !== 'info' && step.kind !== 'read' && step.kind !== 'live-read' && step.kind !== 'live-speak'
