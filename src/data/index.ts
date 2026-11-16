import { BTS_SITUATIONS } from './liveMedia'

export * from './types'
export * from './letters'
export * from './vocabulary'
export * from './readings'
export * from './phrases'
export * from './glossary'
export * from './live'
export * from './liveMedia'
export { LESSONS, UNITS, getLessonById, getUnitById } from './lessons'

export const CATALOG_STATS = {
  lessons: 61 + BTS_SITUATIONS.length,
  units: 9 + Number(BTS_SITUATIONS.length > 0),
  letters: 40,
  vocabulary: 70,
  readings: 3,
} as const
