import { LETTERS, getLetterById } from './letters'
import type { Lesson, LessonKind, LetterGroup, Unit, VocabCategory } from './types'
import { getVocabIdsByCategory } from './vocabulary'
import { ALL_LIVE_SITUATIONS, LIVE_UNIT_ID } from './live'
import { BTS_SITUATIONS, BTS_UNIT_ID } from './liveMedia'

export { getLetterById }

const XP_BY_KIND: Readonly<Record<LessonKind, number>> = {
  letter: 10,
  review: 20,
  syllable: 15,
  batchim: 15,
  vocab: 15,
  phrase: 20,
  reading: 25,
  live: 20,
  speak: 15,
}

export const SPEAK_UNIT_ID = 'unit-0'

const SPEAK_STARTER_VOCAB = ['vocab-keopi', 'vocab-mul', 'vocab-cha', 'vocab-ppang'] as const
const SPEAK_GREETING_VOCAB = ['vocab-annyeonghaseyo', 'vocab-ne', 'vocab-gamsahamnida'] as const

const SPEAK_CORE_LESSONS: Lesson[] = [
  {
    id: 'lesson-speak-01',
    unitId: SPEAK_UNIT_ID,
    title: 'S01D1 · Reconheça café, água e chá',
    kind: 'speak',
    vocabIds: [...SPEAK_STARTER_VOCAB.slice(0, 3)],
    xpReward: XP_BY_KIND.speak,
  },
  {
    id: 'lesson-speak-02',
    unitId: SPEAK_UNIT_ID,
    title: 'S01D2 · Palavras do café e pão',
    kind: 'speak',
    vocabIds: [...SPEAK_STARTER_VOCAB],
    xpReward: XP_BY_KIND.speak,
  },
  {
    id: 'lesson-speak-03',
    unitId: SPEAK_UNIT_ID,
    title: 'S01D3 · Cumprimente e peça com 주세요',
    kind: 'speak',
    vocabIds: [...SPEAK_GREETING_VOCAB, 'vocab-juseyo', 'vocab-mul', 'vocab-keopi', 'vocab-cha'],
    xpReward: XP_BY_KIND.speak,
  },
]

const S01_TRANSFER_LESSON: Lesson = {
  id: 'lesson-s01-d5',
  unitId: SPEAK_UNIT_ID,
  title: 'S01D5 · Pedido novo e bloco 나',
  kind: 'speak',
  vocabIds: ['vocab-mul', 'vocab-keopi', 'vocab-cha', 'vocab-juseyo'],
  xpReward: XP_BY_KIND.speak,
}

/** Unidade 0: D1–D3 + D5 (D4 fica em unit-1 como lesson-u1-00). */
const SPEAK_LESSONS: Lesson[] = [...SPEAK_CORE_LESSONS, S01_TRANSFER_LESSON]

const stage1Lesson = (id: string, title: string, kind: LessonKind, extra: Partial<Lesson> = {}): Lesson => ({
  id,
  unitId: SPEAK_UNIT_ID,
  title,
  kind,
  xpReward: XP_BY_KIND[kind],
  ...extra,
})

/** Semanas 2–4 da Etapa 1 (S02–S04), incluindo marco S04D5. */
const STAGE1_WEEK_LESSONS: Lesson[] = [
  stage1Lesson('lesson-s02-d1', 'S02D1 · Distinga 아/어 e 오/우', 'syllable'),
  stage1Lesson('lesson-s02-d2', 'S02D2 · Compare 가/고 e ㅡ/ㅣ', 'syllable'),
  stage1Lesson('lesson-s02-d3', 'S02D3 · Contrastes com i breve', 'speak', {
    vocabIds: ['vocab-ai'],
  }),
  stage1Lesson('lesson-s02-d4', 'S02D4 · Trace ㅏ ㅗ ㅁ e monte 마/모', 'syllable'),
  stage1Lesson('lesson-s02-d5', 'S02D5 · Identifique a vogal pelo som', 'syllable'),
  stage1Lesson('lesson-s03-d1', 'S03D1 · Aspiração 피/비 · 키/기 · 차/자', 'syllable'),
  stage1Lesson('lesson-s03-d2', 'S03D2 · Batchim em 물 · 빵 · 밥', 'batchim', {
    vocabIds: ['vocab-mul', 'vocab-ppang', 'vocab-bap'],
  }),
  stage1Lesson('lesson-s03-d3', 'S03D3 · Leia e repita palavras curtas', 'speak', {
    vocabIds: ['vocab-mul', 'vocab-ppang', 'vocab-bap', 'vocab-cha'],
  }),
  stage1Lesson('lesson-s03-d4', 'S03D4 · Monte e escreva com final', 'batchim'),
  stage1Lesson('lesson-s03-d5', 'S03D5 · Cardápio novo', 'speak', {
    vocabIds: ['vocab-mul', 'vocab-ppang', 'vocab-bap', 'vocab-juseyo'],
  }),
  stage1Lesson('lesson-s04-d1', 'S04D1 · Simples, aspirada e tensa', 'syllable'),
  stage1Lesson('lesson-s04-d2', 'S04D2 · Cardápio de quatro itens', 'vocab', {
    vocabIds: ['vocab-keopi', 'vocab-mul', 'vocab-cha', 'vocab-ppang'],
  }),
  stage1Lesson('lesson-s04-d3', 'S04D3 · Pedido e confirmação', 'speak', {
    vocabIds: ['vocab-annyeonghaseyo', 'vocab-keopi', 'vocab-ppang', 'vocab-ne', 'vocab-gamsahamnida', 'vocab-juseyo'],
  }),
  stage1Lesson('lesson-s04-d4', 'S04D4 · Monte o pedido completo', 'phrase', {
    phraseIds: [],
    vocabIds: ['vocab-cha', 'vocab-mul', 'vocab-juseyo', 'vocab-gamsahamnida'],
  }),
  stage1Lesson('lesson-s04-d5', 'S04D5 · Marco: pedido no café', 'speak', {
    vocabIds: ['vocab-uyu', 'vocab-keopi', 'vocab-mul', 'vocab-cha', 'vocab-ppang', 'vocab-juseyo', 'vocab-gamsahamnida'],
  }),
]

const buildLessonId = (unitNumber: number, position: number): string =>
  `lesson-u${unitNumber}-${String(position).padStart(2, '0')}`

const buildLetterLessons = (unitNumber: number, group: LetterGroup, startPosition: number, titlePrefix: string): Lesson[] =>
  LETTERS.filter((letter) => letter.group === group).map((letter, index) => ({
    id: buildLessonId(unitNumber, startPosition + index),
    unitId: `unit-${unitNumber}`,
    title: `${titlePrefix} ${letter.char} (${letter.name})`,
    kind: 'letter',
    letterId: letter.id,
    xpReward: XP_BY_KIND.letter,
  }))

const buildVocabLesson = (
  unitNumber: number,
  position: number,
  title: string,
  vocabIds: string[],
): Lesson => ({
  id: buildLessonId(unitNumber, position),
  unitId: `unit-${unitNumber}`,
  title,
  kind: 'vocab',
  vocabIds,
  xpReward: XP_BY_KIND.vocab,
})

const idsOf = (...categories: VocabCategory[]): string[] =>
  categories.flatMap((category) => getVocabIdsByCategory(category))

const greetingIds = idsOf('saudacoes')

const UNIT_1_LESSONS: Lesson[] = [
  {
    id: 'lesson-u1-00',
    unitId: 'unit-1',
    title: 'S01D4 · Monte 가 e 나',
    kind: 'syllable',
    xpReward: XP_BY_KIND.syllable,
  },
  ...buildLetterLessons(1, 'vowel-basic', 1, 'Vogal'),
]

const UNIT_2_LESSONS: Lesson[] = [
  ...buildLetterLessons(2, 'consonant-basic', 1, 'Consoante'),
  {
    id: buildLessonId(2, 15),
    unitId: 'unit-2',
    title: 'Revisão: vogais e consoantes',
    kind: 'review',
    xpReward: XP_BY_KIND.review,
  },
  {
    id: 'lesson-u2-16',
    unitId: 'unit-2',
    title: 'ㅣ, 피 e 키',
    kind: 'syllable',
    xpReward: XP_BY_KIND.syllable,
  },
]

const UNIT_3_LESSONS: Lesson[] = [
  ...buildLetterLessons(3, 'vowel-compound', 1, 'Vogal composta'),
  ...buildLetterLessons(3, 'consonant-double', 12, 'Consoante dupla'),
]

const UNIT_4_LESSONS: Lesson[] = [
  {
    id: buildLessonId(4, 1),
    unitId: 'unit-4',
    title: 'Formando sílabas: consoante + vogal',
    kind: 'syllable',
    xpReward: XP_BY_KIND.syllable,
  },
  {
    id: buildLessonId(4, 2),
    unitId: 'unit-4',
    title: 'Vogais verticais e horizontais',
    kind: 'syllable',
    xpReward: XP_BY_KIND.syllable,
  },
  {
    id: buildLessonId(4, 3),
    unitId: 'unit-4',
    title: 'Batchim: a consoante final',
    kind: 'batchim',
    xpReward: XP_BY_KIND.batchim,
  },
]

const UNIT_5_LESSONS: Lesson[] = [
  buildVocabLesson(5, 1, 'Cumprimentos essenciais', greetingIds.slice(0, 5)),
  buildVocabLesson(5, 2, 'Desculpas e despedidas', greetingIds.slice(5)),
  buildVocabLesson(5, 3, 'Pessoas ao seu redor', idsOf('pessoas')),
]

const UNIT_6_LESSONS: Lesson[] = [
  buildVocabLesson(6, 1, 'Objetos do cotidiano', idsOf('cotidiano')),
  buildVocabLesson(6, 2, 'Comida e números', idsOf('alimentacao', 'numeros')),
]

const UNIT_7_LESSONS: Lesson[] = [
  buildVocabLesson(7, 1, 'K-pop, dramas e cultura', idsOf('cultura')),
  buildVocabLesson(7, 2, 'Viagem e tempo', idsOf('viagem', 'tempo')),
]

const UNIT_8_LESSONS: Lesson[] = [
  {
    id: buildLessonId(8, 1),
    unitId: 'unit-8',
    title: 'Montando frases: o básico',
    kind: 'phrase',
    phraseIds: ['phrase-1', 'phrase-2', 'phrase-3', 'phrase-4'],
    xpReward: XP_BY_KIND.phrase,
  },
  {
    id: buildLessonId(8, 2),
    unitId: 'unit-8',
    title: 'Montando frases: dia a dia',
    kind: 'phrase',
    phraseIds: ['phrase-5', 'phrase-6', 'phrase-7', 'phrase-8'],
    xpReward: XP_BY_KIND.phrase,
  },
  {
    id: buildLessonId(8, 3),
    unitId: 'unit-8',
    title: 'Leitura: Uma nova amizade',
    kind: 'reading',
    readingId: 'reading-nova-amizade',
    xpReward: XP_BY_KIND.reading,
  },
  {
    id: buildLessonId(8, 4),
    unitId: 'unit-8',
    title: 'Leitura: Uma pausa no café',
    kind: 'reading',
    readingId: 'reading-pausa-cafe',
    xpReward: XP_BY_KIND.reading,
  },
  {
    id: buildLessonId(8, 5),
    unitId: 'unit-8',
    title: 'Leitura: Um interesse em comum',
    kind: 'reading',
    readingId: 'reading-interesse-comum',
    xpReward: XP_BY_KIND.reading,
  },
]

const btsIds = new Set(BTS_SITUATIONS.map((situation) => situation.id))

const UNIT_1_WITHOUT_PILOT = UNIT_1_LESSONS.filter((lesson) => lesson.id !== 'lesson-u1-00')
const UNIT_1_PILOT = UNIT_1_LESSONS.find((lesson) => lesson.id === 'lesson-u1-00')!

/** Ordem canônica: S01 → S02–S04 → alfabeto legado → … */
export const LESSONS: readonly Lesson[] = [
  ...SPEAK_CORE_LESSONS,
  UNIT_1_PILOT,
  S01_TRANSFER_LESSON,
  ...STAGE1_WEEK_LESSONS,
  ...UNIT_1_WITHOUT_PILOT,
  ...UNIT_2_LESSONS,
  ...UNIT_3_LESSONS,
  ...UNIT_4_LESSONS,
  ...UNIT_5_LESSONS,
  ...UNIT_6_LESSONS,
  ...UNIT_7_LESSONS,
  ...UNIT_8_LESSONS,
  ...ALL_LIVE_SITUATIONS.map((situation): Lesson => ({
    id: situation.id,
    unitId: btsIds.has(situation.id) ? BTS_UNIT_ID : LIVE_UNIT_ID,
    title: situation.title,
    kind: 'live',
    xpReward: XP_BY_KIND.live,
  })),
]

const collectLessonIds = (unitId: string): string[] =>
  LESSONS.filter((lesson) => lesson.unitId === unitId).map((lesson) => lesson.id)

const defineUnit = (number: number, title: string, description: string): Unit => {
  const id = `unit-${number}`
  return { id, number, title, description, lessonIds: collectLessonIds(id) }
}

export const UNITS: readonly Unit[] = [
  {
    id: SPEAK_UNIT_ID,
    number: 0,
    title: 'Etapa 1 · Primeiros sons',
    description: 'Semanas 1–4: bebidas, blocos, batchim e o marco do pedido no café.',
    lessonIds: [...SPEAK_LESSONS, ...STAGE1_WEEK_LESSONS].map((lesson) => lesson.id),
  },
  defineUnit(1, 'Primeiros blocos', 'S01D4 monta 가 e 나; depois siga as vogais do alfabeto.'),
  defineUnit(2, 'Novas conexões', 'Consoantes básicas, revisão e a sequência ㅣ → 피 → 키.'),
  defineUnit(3, 'Ampliando o hangul', 'Domine as vogais compostas e as consoantes duplas.'),
  defineUnit(4, 'Monte seus primeiros blocos', 'Monte sílabas completas e descubra o batchim.'),
  defineUnit(5, 'Primeiras conversas', 'Cumprimente, agradeça, peça desculpas e fale sobre pessoas.'),
  defineUnit(6, 'No seu dia a dia', 'Vocabulário de objetos, comida e números do cotidiano.'),
  defineUnit(7, 'Seu mundo em coreano', 'Palavras de K-pop, dramas, viagem e tempo.'),
  defineUnit(8, 'Além das palavras', 'Monte frases e leia pequenos textos em coreano.'),
  defineUnit(9, 'A live começou', 'Ouça uma expressão, acompanhe o hangul e responda em voz alta.'),
  ...(BTS_SITUATIONS.length ? [defineUnit(10, 'Trechos do BTS', 'Entenda expressões em falas reais e pratique suas respostas.')] : []),
]

export const getLessonById = (lessonId: string): Lesson | undefined =>
  LESSONS.find((lesson) => lesson.id === lessonId)

export const getUnitById = (unitId: string): Unit | undefined =>
  UNITS.find((unit) => unit.id === unitId)
