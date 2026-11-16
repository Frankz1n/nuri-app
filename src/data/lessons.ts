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
}

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
    title: 'Monte 가 e 나',
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

export const LESSONS: readonly Lesson[] = [
  ...ALL_LIVE_SITUATIONS.map((situation): Lesson => ({
    id: situation.id,
    unitId: btsIds.has(situation.id) ? BTS_UNIT_ID : LIVE_UNIT_ID,
    title: situation.title,
    kind: 'live',
    xpReward: XP_BY_KIND.live,
  })),
  ...UNIT_1_LESSONS,
  ...UNIT_2_LESSONS,
  ...UNIT_3_LESSONS,
  ...UNIT_4_LESSONS,
  ...UNIT_5_LESSONS,
  ...UNIT_6_LESSONS,
  ...UNIT_7_LESSONS,
  ...UNIT_8_LESSONS,
]

const collectLessonIds = (unitId: string): string[] =>
  LESSONS.filter((lesson) => lesson.unitId === unitId).map((lesson) => lesson.id)

const defineUnit = (number: number, title: string, description: string): Unit => {
  const id = `unit-${number}`
  return { id, number, title, description, lessonIds: collectLessonIds(id) }
}

export const UNITS: readonly Unit[] = [
  defineUnit(9, 'A live começou', 'Ouça uma expressão, acompanhe o hangul e responda em voz alta.'),
  ...(BTS_SITUATIONS.length ? [defineUnit(10, 'Trechos do BTS', 'Entenda expressões em falas reais e pratique suas respostas.')] : []),
  defineUnit(1, 'Primeiros blocos', 'Comece com ㄱ, ㄴ e ㅏ; monte 가 e 나. Depois siga as vogais.'),
  defineUnit(2, 'Novas conexões', 'Consoantes básicas, revisão e a sequência ㅣ → 피 → 키.'),
  defineUnit(3, 'Ampliando o hangul', 'Domine as vogais compostas e as consoantes duplas.'),
  defineUnit(4, 'Monte seus primeiros blocos', 'Monte sílabas completas e descubra o batchim.'),
  defineUnit(5, 'Primeiras conversas', 'Cumprimente, agradeça, peça desculpas e fale sobre pessoas.'),
  defineUnit(6, 'No seu dia a dia', 'Vocabulário de objetos, comida e números do cotidiano.'),
  defineUnit(7, 'Seu mundo em coreano', 'Palavras de K-pop, dramas, viagem e tempo.'),
  defineUnit(8, 'Além das palavras', 'Monte frases e leia pequenos textos em coreano.'),
]

export const getLessonById = (lessonId: string): Lesson | undefined =>
  LESSONS.find((lesson) => lesson.id === lessonId)

export const getUnitById = (unitId: string): Unit | undefined =>
  UNITS.find((unit) => unit.id === unitId)
