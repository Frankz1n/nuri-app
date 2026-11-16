import { LESSONS, LETTERS, UNITS, VOCABULARY } from '../data'
import type { Lesson, Letter, Unit } from '../data'
import type { CatalogIds, NuriState } from '../core'

export const CATALOG_IDS: CatalogIds = {
  lessonIds: LESSONS.map((lesson) => lesson.id),
  vocabIds: VOCABULARY.map((vocab) => vocab.id),
}

export const getLessonForLetter = (letter: Letter): Lesson | undefined =>
  LESSONS.find((lesson) => lesson.letterId === letter.id)

export const getLessonsOfUnit = (unit: Unit): Lesson[] =>
  unit.lessonIds.flatMap((lessonId) => LESSONS.find((lesson) => lesson.id === lessonId) ?? [])

export interface UnitProgressSummary {
  completed: number
  total: number
}

export const summarizeUnit = (unit: Unit, completedLessons: readonly string[]): UnitProgressSummary => ({
  completed: unit.lessonIds.filter((lessonId) => completedLessons.includes(lessonId)).length,
  total: unit.lessonIds.length,
})

/** Ordem da trilha: fala primeiro → hangul → live. Preserva IDs antigos já concluídos. */
export const findNextLesson = (completedLessons: readonly string[]): Lesson | undefined =>
  LESSONS.find((lesson) => !completedLessons.includes(lesson.id))

export const getUnitOfLesson = (lesson: Lesson): Unit | undefined => UNITS.find((unit) => unit.id === lesson.unitId)

export const getTodayXp = (state: NuriState, today: string): number =>
  state.progress.history.find((entry) => entry.day === today)?.xp ?? 0

export const LESSON_KIND_LABELS: Readonly<Record<Lesson['kind'], string>> = {
  letter: 'Letra',
  review: 'Revisão',
  syllable: 'Sílabas',
  batchim: 'Batchim',
  vocab: 'Vocabulário',
  phrase: 'Frases',
  reading: 'Leitura',
  live: 'Escuta e fala',
  speak: 'Ouvir e falar',
}

export const getLettersUnlockedByProgress = (completedLessons: readonly string[]): Letter[] => {
  const completedLetterIds = new Set(
    LESSONS.filter((lesson) => lesson.letterId !== undefined && completedLessons.includes(lesson.id)).map((lesson) => lesson.letterId),
  )
  return LETTERS.filter((letter) => completedLetterIds.has(letter.id))
}
