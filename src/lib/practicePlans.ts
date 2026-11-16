import { LESSONS, LETTERS, PHRASES, READINGS, VOCABULARY, getReadingById, getVocabById } from '../data'
import type { VocabItem } from '../data'
import { getDueCards } from '../core'
import type { DailyRewardKey, NuriState } from '../core'
import { getLettersUnlockedByProgress } from './catalog'
import { composeSyllable } from './hangul'
import { sample, shuffle } from './random'
import type { Random } from './random'
import type { PracticeMode } from './session'
import type { Step } from './steps'
import {
  buildCardStep,
  buildLetterBlockStep,
  buildLetterSoundStep,
  buildPairsStep,
  buildPhraseStep,
  buildReadStep,
  buildReadingQuestionSteps,
  buildStepForErrorId,
  buildSyllableComposeStep,
  buildSyllableDecomposeStep,
  buildVocabChoiceStep,
  buildWordBlocksStep,
  buildWriteStep,
  isBlockWord,
} from './stepBuilders'

export interface PracticeModeInfo {
  id: PracticeMode
  title: string
  description: string
  rewardKey?: DailyRewardKey
}

export const PRACTICE_MODES: readonly PracticeModeInfo[] = [
  { id: 'write', title: 'Escrita guiada', description: 'Desenhe letras traço a traço, com guia animado.', rewardKey: 'practice-write' },
  { id: 'syllables', title: 'Montar sílabas', description: 'Una consoantes e vogais para formar blocos.', rewardKey: 'practice-syllables' },
  { id: 'pairs', title: 'Encontrar pares', description: 'Ligue palavras em coreano às traduções.', rewardKey: 'practice-match' },
  { id: 'cards', title: 'Cartões de revisão', description: 'Lembrei ou não lembrei: repetição espaçada.', rewardKey: 'practice-cards' },
  { id: 'daily', title: 'Desafio diário', description: '5 perguntas novas todos os dias.', rewardKey: 'practice-daily' },
  { id: 'phrases', title: 'Organizar frases', description: 'Toque nas peças para montar frases.', rewardKey: 'practice-phrases' },
  { id: 'reading', title: 'Leitura guiada', description: 'Leia pequenos textos e responda perguntas.', rewardKey: 'practice-reading' },
  { id: 'blocks', title: 'Completar palavras por blocos', description: 'Monte palavras juntando os blocos de sílaba.', rewardKey: 'practice-blocks' },
  { id: 'errors', title: 'Revisar erros', description: 'Refaça o que você errou antes.', rewardKey: 'practice-errors' },
]

export const getPracticeModeInfo = (mode: PracticeMode): PracticeModeInfo =>
  PRACTICE_MODES.find((info) => info.id === mode) ?? PRACTICE_MODES[0]

export interface PracticePlan {
  steps: Step[]
  emptyMessage?: string
}

export interface PracticeContext {
  state: NuriState
  today: string
  random: Random
  argument?: string
}

const compact = <T>(items: readonly (T | null | undefined)[]): T[] => items.flatMap((item) => (item ? [item] : []))

const getKnownVocabulary = (state: NuriState): VocabItem[] => {
  const knownIds = new Set(
    LESSONS.filter((lesson) => state.progress.completedLessons.includes(lesson.id)).flatMap((lesson) => lesson.vocabIds ?? []),
  )
  const known = VOCABULARY.filter((vocab) => knownIds.has(vocab.id))
  return known.length >= 6 ? known : [...VOCABULARY]
}

const getKnownLetters = (state: NuriState) => {
  const unlocked = getLettersUnlockedByProgress(state.progress.completedLessons)
  return unlocked.length >= 4 ? unlocked : [...LETTERS]
}

const BASIC_CONSONANTS = [...'ㄱㄴㄷㄹㅁㅂㅅㅈㅊㅋㅌㅍㅎㅇ']
const BASIC_VOWELS = [...'ㅏㅓㅗㅜㅡㅣㅑㅕㅛㅠ']
const FINAL_CONSONANTS = [...'ㄴㄹㅁㅇㅂ']

const buildRandomSyllables = (count: number, random: Random): string[] =>
  Array.from({ length: count }, (_, index) => {
    const initial = sample(BASIC_CONSONANTS, 1, random)[0]
    const medial = sample(BASIC_VOWELS, 1, random)[0]
    const final = index % 3 === 2 ? sample(FINAL_CONSONANTS, 1, random)[0] : ''
    return composeSyllable(initial, medial, final)
  }).flatMap((syllable) => syllable ?? [])

const buildDailySteps = ({ state, random }: PracticeContext): Step[] => {
  const letters = getKnownLetters(state)
  const vocabulary = getKnownVocabulary(state)
  const [first, second, third] = sample(vocabulary, 3, random)
  return compact<Step>([
    buildLetterSoundStep(sample(letters, 1, random)[0], random),
    buildVocabChoiceStep(first, 'ko-pt', random),
    buildVocabChoiceStep(second, 'pt-ko', random),
    buildPhraseStep(sample(PHRASES, 1, random)[0], random),
    random() < 0.5
      ? buildLetterBlockStep(sample(letters, 1, random)[0], random)
      : buildWordBlocksStep(sample(vocabulary.filter(isBlockWord), 1, random)[0] ?? third, random),
  ])
}

const buildCardSteps = ({ state, today }: PracticeContext): Step[] => {
  const dueVocabIds = getDueCards(state.progress.reviewCards, today).map((card) => card.vocabId)
  const trackedIds = new Set(state.progress.reviewCards.map((card) => card.vocabId))
  const newFavoriteIds = state.progress.favorites.filter((vocabId) => !trackedIds.has(vocabId))
  return [...dueVocabIds, ...newFavoriteIds]
    .filter((vocabId) => getVocabById(vocabId) !== undefined)
    .slice(0, 10)
    .map(buildCardStep)
}

const buildErrorSteps = ({ state, random }: PracticeContext): Step[] =>
  state.progress.errorQueue
    .toSorted((a, b) => b.failCount - a.failCount)
    .slice(0, 8)
    .flatMap((error) => buildStepForErrorId(error.id, random) ?? [])

export const buildPracticePlan = (mode: PracticeMode, context: PracticeContext): PracticePlan => {
  const { state, random } = context
  switch (mode) {
    case 'write': {
      const letters = sample(getKnownLetters(state), 5, random)
      return { steps: letters.map((letter) => buildWriteStep(letter.id)) }
    }
    case 'syllables': {
      const syllables = buildRandomSyllables(6, random)
      return {
        steps: compact<Step>(
          syllables.map((syllable, index) =>
            index % 2 === 0 ? buildSyllableDecomposeStep(syllable, random) : buildSyllableComposeStep(syllable, random),
          ),
        ),
      }
    }
    case 'pairs': {
      const vocabulary = shuffle(getKnownVocabulary(state), random)
      return { steps: [buildPairsStep(vocabulary.slice(0, 5), random), buildPairsStep(vocabulary.slice(5, 10), random)] }
    }
    case 'cards': {
      const steps = buildCardSteps(context)
      return {
        steps,
        emptyMessage:
          'Nenhum cartão para revisar agora. Conclua aulas de vocabulário ou favorite palavras em "Palavras" para criar cartões.',
      }
    }
    case 'daily':
      return { steps: buildDailySteps(context) }
    case 'phrases':
      return { steps: sample(PHRASES, 5, random).map((phrase) => buildPhraseStep(phrase, random)) }
    case 'reading': {
      const reading = context.argument ? getReadingById(context.argument) : undefined
      return reading
        ? { steps: [buildReadStep(reading.id), ...buildReadingQuestionSteps(reading)] }
        : { steps: [], emptyMessage: 'Escolha um texto para começar.' }
    }
    case 'blocks': {
      const words = sample(VOCABULARY.filter(isBlockWord), 6, random)
      return { steps: compact<Step>(words.map((word) => buildWordBlocksStep(word, random))) }
    }
    case 'errors':
      return {
        steps: buildErrorSteps(context),
        emptyMessage: 'Sem erros pendentes. Continue praticando — erros novos aparecem aqui para você refazer.',
      }
  }
}

export const READING_OPTIONS = READINGS.map((reading) => ({ id: reading.id, title: reading.title }))