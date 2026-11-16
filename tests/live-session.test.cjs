'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTsModule } = require('./helpers/load-ts.cjs')

const { getLessonById, getLetterById, LIVE_SITUATIONS } = loadTsModule('src/data/index.ts')
const { findNextLesson } = loadTsModule('src/lib/catalog.ts')
const { buildLessonSteps } = loadTsModule('src/lib/lessonPlans.ts')
const { buildStepForErrorId } = loadTsModule('src/lib/stepBuilders.ts')
const { createSessionRandom } = loadTsModule('src/lib/random.ts')
const { parseSessionDraft } = loadTsModule('src/lib/session.ts')
const { createEmptyState } = loadTsModule('src/core/index.ts')
const { recordListeningAnswerTransition } = loadTsModule('src/state/transitions.ts')

test('a trilha entra na live e preserva o caminho para hangul após as três situações', () => {
  const completed = []
  for (const situation of LIVE_SITUATIONS) {
    assert.equal(findNextLesson(completed).id, situation.id)
    completed.push(situation.id)
  }
  assert.equal(findNextLesson(completed).id, 'lesson-u1-00')
  assert.equal(findNextLesson([...completed, 'lesson-u1-00']).id, 'lesson-u1-01')
})

test('cada situação começa com áudio, tem leitura e fala, testa nova fala e termina em escrita', () => {
  const random = createSessionRandom('live')
  for (const situation of LIVE_SITUATIONS) {
    const steps = buildLessonSteps(getLessonById(situation.id), random)
    assert.deepEqual(steps.map((step) => step.kind), ['live-listen', 'live-read', 'live-speak', 'live-listen', 'write'])
    assert.equal(steps[0].options[steps[0].answerIndex], situation.opening.pt)
    assert.equal(steps[3].options[steps[3].answerIndex], situation.transfer.pt)
    assert.notEqual(situation.opening.ko, situation.transfer.ko)
    assert.notEqual(steps[0].skillId, steps[3].skillId)
    assert.equal(getLetterById(steps[4].letterId).id, situation.letterId)
    const review = buildStepForErrorId(steps[3].errorId, random)
    assert.equal(review.situationId, situation.id)
    assert.equal(review.take, 'transfer')
  }
})

function firstListeningDraft() {
  const lesson = getLessonById('live-som')
  const steps = buildLessonSteps(lesson, createSessionRandom('escuta'))
  return {
    origin: { type: 'lesson', lessonId: lesson.id },
    sessionId: 'test-1',
    steps,
    index: 0,
    gradedCount: 0,
    firstTryHits: 0,
  }
}

test('salva resposta e estatística juntas e impede repetição após retomar do armazenamento', () => {
  const draft = firstListeningDraft()
  const state = { ...createEmptyState(), activityDraft: { type: 'session', payload: draft } }
  const step = draft.steps[0]
  const answer = { option: step.answerIndex, unaided: true }
  assert.equal(recordListeningAnswerTransition(state, 'test-1', 0, { ...answer, option: 99 }), state)
  const next = recordListeningAnswerTransition(state, 'test-1', 0, answer)
  const reloaded = JSON.parse(JSON.stringify(next))
  const restored = parseSessionDraft(reloaded.activityDraft)
  assert.deepEqual(restored.listeningAnswer, answer)
  assert.equal(restored.firstTryHits, 1)
  assert.equal(restored.gradedCount, 1)
  assert.deepEqual(reloaded.progress.skillFirstTry.listening, { hits: 1, total: 1 })
  assert.equal(recordListeningAnswerTransition(reloaded, 'test-1', 0, answer), reloaded)
})

test('consulta ao texto não pontua escuta e erro de áudio entra na revisão', () => {
  const draft = firstListeningDraft()
  const state = { ...createEmptyState(), activityDraft: { type: 'session', payload: draft } }
  const step = draft.steps[0]
  const aided = recordListeningAnswerTransition(state, 'test-1', 0, { option: step.answerIndex, unaided: false })
  assert.equal(aided.progress.skillFirstTry.listening, undefined)
  assert.equal(parseSessionDraft(aided.activityDraft).gradedCount, 0)
  assert.equal(aided.progress.errorQueue.length, 0)
  const wrong = recordListeningAnswerTransition(state, 'test-1', 0, { option: (step.answerIndex + 1) % step.options.length, unaided: true })
  assert.equal(wrong.progress.errorQueue[0].id, step.errorId)
  assert.deepEqual(wrong.progress.skillFirstTry.listening, { hits: 0, total: 1 })
})
