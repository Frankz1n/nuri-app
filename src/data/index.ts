export * from './types'
export * from './letters'
export * from './vocabulary'
export * from './readings'
export * from './phrases'
export * from './glossary'
export { LESSONS, UNITS, getLessonById, getUnitById } from './lessons'

export const CATALOG_STATS = {
  lessons: 58,
  units: 8,
  letters: 40,
  vocabulary: 70,
  readings: 3,
} as const
