export type LetterGroup = 'vowel-basic' | 'consonant-basic' | 'vowel-compound' | 'consonant-double'

export interface StrokePoint {
  x: number
  y: number
}

/** Pontos normalizados (0-1) usados na prática de escrita. */
export interface StrokeModel {
  points: StrokePoint[]
  closed?: boolean
}

export interface LetterExample {
  hangul: string
  romanization: string
  translation: string
}

export interface Letter {
  id: string
  char: string
  name: string
  romanization: string
  group: LetterGroup
  example: LetterExample
  strokes: StrokeModel[]
  /** Chave estável para TTS/arquivo futuro (ex.: letter:letter-a). */
  audioKey?: string
}

export type VocabCategory =
  | 'saudacoes'
  | 'cotidiano'
  | 'cultura'
  | 'alimentacao'
  | 'viagem'
  | 'pessoas'
  | 'tempo'
  | 'numeros'

export interface VocabItem {
  id: string
  hangul: string
  translation: string
  romanization?: string
  category: VocabCategory
  note?: string
  /** Chave estável para TTS/arquivo futuro (ex.: vocab:vocab-mul). */
  audioKey?: string
}

export type LessonKind = 'letter' | 'review' | 'syllable' | 'batchim' | 'vocab' | 'phrase' | 'reading' | 'live' | 'speak'

export interface Lesson {
  id: string
  unitId: string
  title: string
  kind: LessonKind
  letterId?: string
  vocabIds?: string[]
  phraseIds?: string[]
  readingId?: string
  xpReward: number
}

export interface Unit {
  id: string
  number: number
  title: string
  description: string
  lessonIds: string[]
}

export interface ReadingLine {
  ko: string
  pt: string
  /** Chave estável por linha (ex.: reading:reading-nova-amizade:0). */
  audioKey?: string
}

export interface ReadingQuestion {
  prompt: string
  options: string[]
  answerIndex: number
}

export interface Reading {
  id: string
  title: string
  lines: ReadingLine[]
  questions: ReadingQuestion[]
}

export interface Phrase {
  id: string
  pieces: string[]
  translation: string
  patternNote?: string
  /** Chave estável para TTS/arquivo futuro (ex.: phrase:phrase-1). */
  audioKey?: string
}

export interface GlossaryTerm {
  id: string
  term: string
  definition: string
}
