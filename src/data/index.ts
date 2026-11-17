import { BTS_SITUATIONS } from './liveMedia'
import { CURRICULUM_STATS } from './curriculum'

export * from './types'
export * from './letters'
export * from './vocabulary'
export * from './readings'
export * from './phrases'
export * from './glossary'
export * from './live'
export * from './liveMedia'
export * from './curriculum'
export { LESSONS, UNITS, getLessonById, getUnitById } from './lessons'

export const CATALOG_STATS = {
  lessons: 80 + BTS_SITUATIONS.length,
  units: 10 + Number(BTS_SITUATIONS.length > 0),
  letters: 40,
  vocabulary: 73,
  readings: 3,
  curriculumStages: CURRICULUM_STATS.stages,
  curriculumWeeks: CURRICULUM_STATS.weeks,
  curriculumSessions: CURRICULUM_STATS.sessions,
  curriculumPlayable: CURRICULUM_STATS.playableSessions,
} as const
