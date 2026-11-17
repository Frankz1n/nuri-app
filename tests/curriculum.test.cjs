'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { loadCore, loadCatalog, loadTsModule } = require('./helpers/load-ts.cjs')

const core = loadCore()
const catalog = loadCatalog()
const { createSessionRandom } = loadTsModule('src/lib/random.ts')
const { buildLessonSteps } = loadTsModule('src/lib/lessonPlans.ts')
const curriculumPath = loadTsModule('src/lib/curriculumPath.ts')

const {
  CURRICULUM_STAGES,
  CURRICULUM_WEEKS,
  CURRICULUM_SESSIONS,
  CURRICULUM_STATS,
  CATALOG_STATS,
  getSessionByLessonId,
} = catalog

test('currículo: 6 etapas, 52 semanas, 260 sessões', () => {
  assert.equal(CURRICULUM_STAGES.length, 6)
  assert.equal(CURRICULUM_WEEKS.length, 52)
  assert.equal(CURRICULUM_SESSIONS.length, 260)
  assert.equal(CURRICULUM_STATS.stages, 6)
  assert.equal(CURRICULUM_STATS.weeks, 52)
  assert.equal(CURRICULUM_STATS.sessions, 260)
  assert.equal(CURRICULUM_STATS.playableSessions, 20)
  assert.equal(CATALOG_STATS.curriculumSessions, 260)
  assert.equal(CATALOG_STATS.curriculumPlayable, 20)
})

test('currículo: S01–S04 playable com lessonIds no catálogo', () => {
  const playable = CURRICULUM_SESSIONS.filter((session) => session.status === 'playable')
  assert.equal(playable.length, 20)
  assert.deepEqual(
    playable.slice(0, 5).map((session) => session.id),
    ['S01D1', 'S01D2', 'S01D3', 'S01D4', 'S01D5'],
  )
  assert.deepEqual(
    playable.slice(15, 20).map((session) => session.id),
    ['S04D1', 'S04D2', 'S04D3', 'S04D4', 'S04D5'],
  )
  for (const session of playable) {
    assert.ok(session.lessonId, session.id)
    assert.ok(catalog.getLessonById(session.lessonId), `${session.id} → ${session.lessonId}`)
  }
  assert.equal(getSessionByLessonId('lesson-speak-01')?.id, 'S01D1')
  assert.equal(getSessionByLessonId('lesson-u1-00')?.id, 'S01D4')
  assert.equal(getSessionByLessonId('lesson-s01-d5')?.id, 'S01D5')
  assert.equal(getSessionByLessonId('lesson-s04-d5')?.id, 'S04D5')
})

test('currículo: ordem S01 no LESSONS é D1–D5', () => {
  const ids = catalog.LESSONS.map((lesson) => lesson.id)
  const order = ['lesson-speak-01', 'lesson-speak-02', 'lesson-speak-03', 'lesson-u1-00', 'lesson-s01-d5']
  let last = -1
  for (const id of order) {
    const index = ids.indexOf(id)
    assert.ok(index > last, id)
    last = index
  }
})

test('S01 planos geram escuta, pedido 주세요, 가/나 e transferência', () => {
  const random = createSessionRandom('s01-seed')
  const d1 = buildLessonSteps(catalog.getLessonById('lesson-speak-01'), random)
  assert.ok(d1.some((step) => step.kind === 'listen-choice' && step.revealHangul === '물'))
  assert.ok(d1.some((step) => step.kind === 'word-repeat'))

  const d3 = buildLessonSteps(catalog.getLessonById('lesson-speak-03'), random)
  assert.ok(d3.some((step) => step.kind === 'tiles' && step.answer.join(' ') === '물 주세요'))
  assert.ok(catalog.getVocabById('vocab-juseyo'))

  const d4 = buildLessonSteps(catalog.getLessonById('lesson-u1-00'), random)
  assert.ok(d4.some((step) => step.kind === 'tiles' && step.composed === '가'))
  assert.ok(d4.some((step) => step.kind === 'tiles' && step.composed === '나'))

  const d5 = buildLessonSteps(catalog.getLessonById('lesson-s01-d5'), random)
  assert.ok(d5.some((step) => step.kind === 'listen-choice' && step.skillId === 'listening-transfer'))
  assert.ok(d5.some((step) => step.kind === 'tiles' && step.composed === '나' && step.helpLevel === 'apply'))
})

test('S02–S04 planos geram contrastes, batchim e marco S04', () => {
  const random = createSessionRandom('s02-s04')
  const s02d1 = buildLessonSteps(catalog.getLessonById('lesson-s02-d1'), random)
  assert.ok(s02d1.some((step) => step.kind === 'listen-choice' && step.revealHangul === '아'))

  const s02d4 = buildLessonSteps(catalog.getLessonById('lesson-s02-d4'), random)
  assert.ok(s02d4.some((step) => step.kind === 'tiles' && step.composed === '마'))
  assert.ok(s02d4.some((step) => step.kind === 'tiles' && step.composed === '모'))

  const s03d2 = buildLessonSteps(catalog.getLessonById('lesson-s03-d2'), random)
  assert.ok(s03d2.some((step) => step.kind === 'choice' && step.big === '물'))
  assert.ok(s03d2.some((step) => step.kind === 'choice' && step.big === '밥'))

  const s04d5 = buildLessonSteps(catalog.getLessonById('lesson-s04-d5'), random)
  assert.ok(s04d5.some((step) => step.kind === 'listen-choice' && step.revealHangul === '우유'))
  assert.ok(s04d5.some((step) => step.kind === 'tiles' && step.answer.join(' ') === '우유 주세요'))
  assert.ok(s04d5.some((step) => step.kind === 'tiles' && step.composed === '나' && step.helpLevel === 'apply'))
})

test('migração: estado antigo sem sessionEvidence carrega limpo', () => {
  const legacy = {
    version: 3,
    profile: { onboardingDone: true, dailyGoalMinutes: 10, xpGoal: 50 },
    progress: {
      xp: 15,
      streak: 1,
      lastStudyDay: '2026-11-15',
      completedLessons: ['lesson-speak-01'],
      lessonCompletions: { 'lesson-speak-01': '2026-11-15' },
      unitProgress: {},
      favorites: [],
      reviewCards: [],
      errorQueue: [],
      skillFirstTry: {},
      dailyXpAwards: {},
      achievements: [],
      history: [{ day: '2026-11-15', xp: 15, lessons: 1 }],
    },
  }
  const migrated = core.migrateState(legacy)
  assert.deepEqual(migrated.progress.sessionEvidence, {})
  assert.equal(migrated.progress.xp, 15)
  assert.deepEqual(migrated.progress.completedLessons, ['lesson-speak-01'])
})

test('currículo: findNext e placement para iniciante', () => {
  const next = curriculumPath.findNextCurriculumSession([])
  assert.equal(next?.id, 'S01D1')
  const placement = curriculumPath.recommendCurriculumPlacement(0, 'Nunca vi hangul')
  assert.equal(placement.weekNumber, 1)
  assert.equal(placement.lessonId, 'lesson-speak-01')
  assert.match(placement.reason, /Semana 1/)
})
