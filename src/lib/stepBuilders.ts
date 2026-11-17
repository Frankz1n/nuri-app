import {
  LETTERS,
  VOCABULARY,
  getLetterById,
  getLiveSituation,
  getPhraseById,
  getReadingById,
  getVocabById,
} from '../data'
import type { Letter, Phrase, Reading, VocabItem } from '../data'
import { composeSyllable, decomposeSyllable, isHangulSyllable } from './hangul'
import { sample, shuffle, shuffleDifferent } from './random'
import { buildLiveListeningStep } from './liveListening'
import type { Random } from './random'
import type {
  AssembleHelpLevel,
  CardStep,
  ChoiceStep,
  InfoStep,
  PairsStep,
  ReadStep,
  Step,
  TilesStep,
  WriteStep,
} from './steps'
import { layoutForSyllable } from './syllableFeedback'

export const SKILL_LABELS: Readonly<Record<string, string>> = {
  'letter-sound': 'Romanização das letras',
  listening: 'Compreensão oral',
  'listening-transfer': 'Escuta em outro contexto',
  'speaking-practice': 'Prática de fala',
  'letter-char': 'Reconhecer letras',
  'letter-block': 'Letras em blocos',
  write: 'Escrita',
  syllable: 'Sílabas',
  'word-blocks': 'Palavras por blocos',
  vocab: 'Vocabulário',
  phrase: 'Frases',
  reading: 'Leitura',
  match: 'Pares',
  cards: 'Cartões',
}

const isVowelLetter = (letter: Letter): boolean => letter.group.startsWith('vowel')

const CONSONANT_CHARS = LETTERS.filter((letter) => !isVowelLetter(letter)).map((letter) => letter.char)
const VOWEL_CHARS = LETTERS.filter((letter) => isVowelLetter(letter)).map((letter) => letter.char)

const pickLetterDistractors = (letter: Letter, random: Random): Letter[] => {
  const sameGroup = LETTERS.filter((candidate) => candidate.group === letter.group && candidate.id !== letter.id)
  const pool = sameGroup.length >= 3 ? sameGroup : LETTERS.filter((candidate) => candidate.id !== letter.id)
  return sample(pool, 3, random)
}

export const buildLetterSoundStep = (letter: Letter, random: Random): ChoiceStep => {
  const options = shuffle([letter, ...pickLetterDistractors(letter, random)], random)
  return {
    kind: 'choice',
    skillId: 'letter-sound',
    errorId: `letter:${letter.id}`,
    prompt: 'Qual é a romanização desta letra?',
    big: letter.char,
    bigLanguage: 'ko',
    options: options.map((option) => ({ text: option.romanization, language: 'pt' })),
    answerIndex: options.findIndex((option) => option.id === letter.id),
    explanation: `${letter.char} (${letter.name}) aparece como "${letter.romanization}" na romanização.`,
  }
}

export const buildLetterCharStep = (letter: Letter, random: Random): ChoiceStep => {
  const options = shuffle([letter, ...pickLetterDistractors(letter, random)], random)
  return {
    kind: 'choice',
    skillId: 'letter-char',
    errorId: `letter:${letter.id}`,
    prompt: `Qual letra tem o som "${letter.romanization}"?`,
    options: options.map((option) => ({ text: option.char, language: 'ko' })),
    answerIndex: options.findIndex((option) => option.id === letter.id),
    explanation: `O som "${letter.romanization}" é escrito ${letter.char} (${letter.name}).`,
  }
}

const buildLetterBlock = (letter: Letter): string | null =>
  isVowelLetter(letter) ? composeSyllable('ㅇ', letter.char) : composeSyllable(letter.char, 'ㅏ')

export const buildLetterBlockStep = (letter: Letter, random: Random): ChoiceStep | null => {
  const correctBlock = buildLetterBlock(letter)
  if (!correctBlock) return null
  const isVowel = isVowelLetter(letter)
  const siblings = LETTERS.filter((candidate) => candidate.id !== letter.id && isVowelLetter(candidate) === isVowel)
  const distractorBlocks = sample(siblings, siblings.length, random)
    .flatMap((candidate) => buildLetterBlock(candidate) ?? [])
    .filter((block) => block !== correctBlock)
    .slice(0, 3)
  const options = shuffle([correctBlock, ...distractorBlocks], random)
  return {
    kind: 'choice',
    skillId: 'letter-block',
    errorId: `letter:${letter.id}`,
    prompt: 'Em qual bloco aparece esta letra?',
    big: letter.char,
    bigLanguage: 'ko',
    options: options.map((text) => ({ text, language: 'ko' })),
    answerIndex: options.indexOf(correctBlock),
    explanation: isVowel
      ? `${correctBlock} = ㅇ (sem som no início) + ${letter.char}.`
      : `${correctBlock} = ${letter.char} + ㅏ.`,
  }
}

export const buildWriteStep = (
  letterId: string,
  options: { guide?: WriteStep['guide']; prompt?: string } = {},
): WriteStep => ({
  kind: 'write',
  skillId: 'write',
  errorId: `write:${letterId}`,
  letterId,
  guide: options.guide ?? 'guided',
  prompt: options.prompt,
})

/** Escrita guiada seguida de tentativa sem contorno (mesma letra). */
export const buildWritePracticePair = (letterId: string, _letterChar: string): WriteStep[] => [
  buildWriteStep(letterId, {
    guide: 'guided',
    prompt: 'Desenhe o caractere:',
  }),
  buildWriteStep(letterId, {
    guide: 'free',
    prompt: 'Desenhe o caractere:',
  }),
]

const SYLLABLE_HINT: Readonly<Record<string, string>> = {
  가: 'ga',
  나: 'na',
  고: 'go',
  노: 'no',
  피: 'pi',
  키: 'ki',
  한: 'han',
  다: 'da',
  마: 'ma',
  사: 'sa',
  아: 'a',
  기: 'gi',
  구: 'gu',
  비: 'bi',
  소: 'so',
  누: 'nu',
  말: 'mal',
  산: 'san',
  글: 'geul',
  밤: 'bam',
  밥: 'bap',
  물: 'mul',
}

export const buildAssembleDemoInfo = (syllable: string): InfoStep | null => {
  const parts = decomposeSyllable(syllable)
  if (!parts) return null
  const pieces = parts.final ? [parts.initial, parts.medial, parts.final] : [parts.initial, parts.medial]
  return {
    kind: 'info',
    skillId: 'syllable',
    title: 'Como o bloco se forma',
    big: `${pieces.join(' + ')} → ${syllable}`,
    bigLanguage: 'ko',
    lines: [
      `${pieces.join(' + ')} forma o bloco ${syllable}.`,
      parts.final
        ? `${parts.final} fica embaixo como consoante final (batchim).`
        : layoutForSyllable(syllable) === 'horizontal-below'
          ? `A vogal ${parts.medial} fica embaixo da consoante ${parts.initial}.`
          : `A vogal ${parts.medial} fica à direita da consoante ${parts.initial}.`,
    ],
  }
}

export const buildSyllableAssembleStep = (
  syllable: string,
  random: Random,
  options: {
    helpLevel?: AssembleHelpLevel
    distractors?: readonly string[]
    prompt?: string
  } = {},
): TilesStep | null => {
  const parts = decomposeSyllable(syllable)
  if (!parts) return null
  const answer = parts.final ? [parts.initial, parts.medial, parts.final] : [parts.initial, parts.medial]
  const helpLevel = options.helpLevel ?? 'guided'
  const hasExplicitDistractors = options.distractors !== undefined
  const knownDistractors = (options.distractors ?? []).filter((char) => !answer.includes(char))
  const extraConsonant = hasExplicitDistractors
    ? knownDistractors.slice(0, 1)
    : sample(
        CONSONANT_CHARS.filter((char) => !answer.includes(char)),
        helpLevel === 'guided' || helpLevel === 'apply' ? 1 : 0,
        random,
      )
  const bankPieces =
    helpLevel === 'demo'
      ? [...answer]
      : shuffleDifferent([...answer, ...extraConsonant], random)

  return {
    kind: 'tiles',
    skillId: 'syllable',
    errorId: `syllable:${syllable}`,
    prompt: options.prompt ?? 'Monte o caractere:',
    bank: bankPieces,
    answer,
    join: 'jamo',
    tileLanguage: 'ko',
    layout: helpLevel === 'apply' ? 'neutral' : layoutForSyllable(syllable),
    helpLevel,
    composed: syllable,
    hideTarget: true,
    promptHint: SYLLABLE_HINT[syllable],
    explanation: `${answer.join(' + ')} = ${syllable}.`,
  }
}

export const buildVocabChoiceStep = (vocab: VocabItem, direction: 'ko-pt' | 'pt-ko', random: Random): ChoiceStep => {
  const others = VOCABULARY.filter(
    (candidate) => candidate.id !== vocab.id && candidate.translation !== vocab.translation && candidate.hangul !== vocab.hangul,
  )
  const sameCategory = shuffle(
    others.filter((candidate) => candidate.category === vocab.category),
    random,
  )
  const otherCategories = shuffle(
    others.filter((candidate) => candidate.category !== vocab.category),
    random,
  )
  const options = shuffle([vocab, ...[...sameCategory, ...otherCategories].slice(0, 3)], random)
  const romanizationSuffix = vocab.romanization ? ` (${vocab.romanization})` : ''
  const explanation = `${vocab.hangul}${romanizationSuffix} = ${vocab.translation}.${vocab.note ? ` ${vocab.note}` : ''}`

  if (direction === 'ko-pt') {
    return {
      kind: 'choice',
      skillId: 'vocab',
      errorId: `vocab:${vocab.id}`,
      prompt: 'O que significa?',
      big: vocab.hangul,
      bigLanguage: 'ko',
      options: options.map((option) => ({ text: option.translation, language: 'pt' })),
      answerIndex: options.findIndex((option) => option.id === vocab.id),
      explanation,
    }
  }
  return {
    kind: 'choice',
    skillId: 'vocab',
    errorId: `vocab:${vocab.id}`,
    prompt: `Como se diz "${vocab.translation}" em coreano?`,
    options: options.map((option) => ({ text: option.hangul, language: 'ko' })),
    answerIndex: options.findIndex((option) => option.id === vocab.id),
    explanation,
  }
}

export const buildPhraseStep = (phrase: Phrase, random: Random): TilesStep => ({
  kind: 'tiles',
  skillId: 'phrase',
  errorId: `phrase:${phrase.id}`,
  prompt: `Monte a frase: "${phrase.translation}"`,
  bank: shuffleDifferent(phrase.pieces, random),
  answer: [...phrase.pieces],
  join: ' ',
  tileLanguage: 'ko',
  patternHint: 'Padrão praticado: ordem básica do coreano, com o verbo no final da frase.',
  explanation: `${phrase.pieces.join(' ')} = ${phrase.translation}${phrase.patternNote ? `. ${phrase.patternNote}` : ''}`,
})

export const buildSyllableDecomposeStep = (syllable: string, random: Random): TilesStep | null => {
  const parts = decomposeSyllable(syllable)
  if (!parts) return null
  const answer = parts.final ? [parts.initial, parts.medial, parts.final] : [parts.initial, parts.medial]
  const extraConsonant = sample(
    CONSONANT_CHARS.filter((char) => !answer.includes(char)),
    1,
    random,
  )
  const extraVowel = sample(
    VOWEL_CHARS.filter((char) => !answer.includes(char)),
    1,
    random,
  )
  return {
    kind: 'tiles',
    skillId: 'syllable',
    errorId: `syllable:${syllable}`,
    prompt: parts.final
      ? 'Toque nas peças deste bloco, na ordem: consoante, vogal e consoante final (batchim).'
      : 'Toque nas peças deste bloco, na ordem: consoante e vogal.',
    big: syllable,
    bigLanguage: 'ko',
    bank: shuffleDifferent([...answer, ...extraConsonant, ...extraVowel], random),
    answer,
    join: 'jamo',
    tileLanguage: 'ko',
    layout: layoutForSyllable(syllable),
    helpLevel: 'guided',
    composed: syllable,
    hideTarget: false,
    explanation: `${syllable} = ${answer.join(' + ')}.`,
  }
}

export const buildSyllableComposeStep = (syllable: string, random: Random): ChoiceStep | null => {
  const parts = decomposeSyllable(syllable)
  if (!parts) return null
  const siblingBlocks = (): string[] => {
    const alternativeInitials = sample(CONSONANT_CHARS.filter((char) => char !== parts.initial), 2, random)
    const alternativeVowels = sample(VOWEL_CHARS.filter((char) => char !== parts.medial), 2, random)
    return [
      ...alternativeInitials.flatMap((initial) => composeSyllable(initial, parts.medial, parts.final) ?? []),
      ...alternativeVowels.flatMap((medial) => composeSyllable(parts.initial, medial, parts.final) ?? []),
    ]
  }
  const distractors = [...new Set(siblingBlocks())].filter((block) => block !== syllable).slice(0, 3)
  const options = shuffle([syllable, ...distractors], random)
  const pieces = [parts.initial, parts.medial, ...(parts.final ? [parts.final] : [])]
  return {
    kind: 'choice',
    skillId: 'syllable',
    errorId: `syllable:${syllable}`,
    prompt: 'Que bloco se forma juntando estas peças?',
    big: pieces.join(' + '),
    bigLanguage: 'ko',
    options: options.map((text) => ({ text, language: 'ko' })),
    answerIndex: options.indexOf(syllable),
    explanation: `${pieces.join(' + ')} = ${syllable}.`,
  }
}

export const isBlockWord = (vocab: VocabItem): boolean => {
  const characters = [...vocab.hangul]
  return characters.length >= 2 && characters.length <= 4 && characters.every(isHangulSyllable)
}

export const buildWordBlocksStep = (vocab: VocabItem, random: Random): TilesStep | null => {
  if (!isBlockWord(vocab)) return null
  const syllables = [...vocab.hangul]
  const spareBlocks = VOCABULARY.filter((candidate) => candidate.id !== vocab.id && isBlockWord(candidate))
    .flatMap((candidate) => [...candidate.hangul])
    .filter((block) => !syllables.includes(block))
  const distractor = sample([...new Set(spareBlocks)], 1, random)
  return {
    kind: 'tiles',
    skillId: 'word-blocks',
    errorId: `word:${vocab.id}`,
    prompt: `Monte a palavra: "${vocab.translation}"`,
    bank: shuffleDifferent([...syllables, ...distractor], random),
    answer: syllables,
    join: '',
    tileLanguage: 'ko',
    explanation: `${vocab.hangul}${vocab.romanization ? ` (${vocab.romanization})` : ''} = ${vocab.translation}.`,
  }
}

export const buildReadingQuestionSteps = (reading: Reading): ChoiceStep[] =>
  reading.questions.map((question, questionIndex) => ({
    kind: 'choice',
    skillId: 'reading',
    errorId: `reading:${reading.id}:${questionIndex}`,
    prompt: question.prompt,
    options: question.options.map((text) => ({ text, language: 'pt' })),
    answerIndex: question.answerIndex,
    explanation: `Resposta: ${question.options[question.answerIndex]}. Releia o texto para conferir.`,
    context: reading.lines,
  }))

export const buildReadStep = (readingId: string): ReadStep => ({ kind: 'read', skillId: 'reading', readingId })

export const buildPairsStep = (vocabItems: readonly VocabItem[], random: Random): PairsStep => {
  const pairs = vocabItems.map((vocab) => ({ id: vocab.id, ko: vocab.hangul, pt: vocab.translation }))
  const ids = pairs.map((pair) => pair.id)
  return { kind: 'pairs', skillId: 'match', pairs, koOrder: shuffle(ids, random), ptOrder: shuffleDifferent(ids, random) }
}

export const buildCardStep = (vocabId: string): CardStep => ({ kind: 'card', skillId: 'cards', vocabId })

/** Reconstrói uma pergunta a partir do identificador guardado na fila de erros. */
export const buildStepForErrorId = (errorId: string, random: Random): Step | null => {
  const [kind, firstPart, secondPart] = errorId.split(':')
  switch (kind) {
    case 'live-listen': {
      const situation = getLiveSituation(firstPart ?? '')
      if (!situation || (secondPart !== 'opening' && secondPart !== 'transfer')) return null
      return buildLiveListeningStep(situation, secondPart, random)
    }
    case 'letter': {
      const letter = getLetterById(firstPart ?? '')
      if (!letter) return null
      const builders = [
        () => buildLetterSoundStep(letter, random),
        () => buildLetterCharStep(letter, random),
        () => buildLetterBlockStep(letter, random),
      ]
      return builders[Math.floor(random() * builders.length)]()
    }
    case 'write':
      return getLetterById(firstPart ?? '') ? buildWriteStep(firstPart) : null
    case 'vocab': {
      const vocab = getVocabById(firstPart ?? '')
      return vocab ? buildVocabChoiceStep(vocab, random() < 0.5 ? 'ko-pt' : 'pt-ko', random) : null
    }
    case 'phrase': {
      const phrase = getPhraseById(firstPart ?? '')
      return phrase ? buildPhraseStep(phrase, random) : null
    }
    case 'word': {
      const vocab = getVocabById(firstPart ?? '')
      return vocab ? buildWordBlocksStep(vocab, random) : null
    }
    case 'syllable':
      return firstPart ? (random() < 0.5 ? buildSyllableDecomposeStep(firstPart, random) : buildSyllableComposeStep(firstPart, random)) : null
    case 'reading': {
      const reading = getReadingById(firstPart ?? '')
      const questionIndex = Number(secondPart)
      return reading ? (buildReadingQuestionSteps(reading)[questionIndex] ?? null) : null
    }
    default:
      return null
  }
}

export const describeErrorId = (errorId: string): string => {
  const [kind, firstPart, secondPart] = errorId.split(':')
  switch (kind) {
    case 'live-listen': {
      const situation = getLiveSituation(firstPart ?? '')
      return situation ? `Escuta: ${situation.title}` : errorId
    }
    case 'letter':
    case 'write': {
      const letter = getLetterById(firstPart ?? '')
      return letter ? `Letra ${letter.char} (${letter.name})` : errorId
    }
    case 'vocab':
    case 'word': {
      const vocab = getVocabById(firstPart ?? '')
      return vocab ? `${vocab.hangul} — ${vocab.translation}` : errorId
    }
    case 'phrase': {
      const phrase = getPhraseById(firstPart ?? '')
      return phrase ? `Frase: ${phrase.translation}` : errorId
    }
    case 'syllable':
      return `Bloco ${firstPart}`
    case 'reading': {
      const reading = getReadingById(firstPart ?? '')
      return reading ? `Leitura "${reading.title}" (pergunta ${Number(secondPart) + 1})` : errorId
    }
    default:
      return errorId
  }
}