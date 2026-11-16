'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTsModule } = require('./helpers/load-ts.cjs')

const { getLessonById, getLetterById, ALL_LIVE_SITUATIONS, LESSONS } = loadTsModule('src/data/index.ts')
const { findNextLesson } = loadTsModule('src/lib/catalog.ts')
const { buildLessonSteps } = loadTsModule('src/lib/lessonPlans.ts')
const { buildStepForErrorId } = loadTsModule('src/lib/stepBuilders.ts')
const { createSessionRandom } = loadTsModule('src/lib/random.ts')
const { parseSessionDraft } = loadTsModule('src/lib/session.ts')
const { createEmptyState } = loadTsModule('src/core/index.ts')
const { recordListeningAnswerTransition } = loadTsModule('src/state/transitions.ts')

test('a trilha começa pela fala, depois hangul, e live fica depois do núcleo escrito', () => {
  assert.equal(findNextLesson([]).id, 'lesson-speak-01')
  assert.equal(findNextLesson(['lesson-speak-01', 'lesson-speak-02', 'lesson-speak-03']).id, 'lesson-u1-00')
  assert.equal(
    findNextLesson(['lesson-speak-01', 'lesson-speak-02', 'lesson-speak-03', 'lesson-u1-00']).id,
    'lesson-u1-01',
  )

  const untilLive = LESSONS.filter((lesson) => lesson.kind !== 'live').map((lesson) => lesson.id)
  assert.equal(findNextLesson(untilLive).kind, 'live')
})

test('cada situação começa com áudio, tem leitura e fala, testa nova fala e termina em escrita', () => {
  const random = createSessionRandom('live')
  for (const situation of ALL_LIVE_SITUATIONS) {
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

test('a unidade de clipes reflete o catálogo e cada mídia declarada cabe no cache do PWA', () => {
  const fs = require('node:fs')
  const path = require('node:path')
  const { BTS_SITUATIONS, BTS_UNIT_ID, getUnitById } = loadTsModule('src/data/index.ts')
  const root = path.resolve(__dirname, '../src/assets/live-media')
  const unit = getUnitById(BTS_UNIT_ID)
  assert.equal(Boolean(unit), BTS_SITUATIONS.length > 0)
  assert.deepEqual(unit?.lessonIds ?? [], BTS_SITUATIONS.map((item) => item.id))

  function assertFile(file, pattern) {
    assert.match(file, pattern)
    const stat = fs.statSync(path.join(root, file))
    assert.ok(stat.isFile() && stat.size > 0 && stat.size <= 2_000_000, 'Arquivo vazio ou maior que 2 MB: ' + file)
  }

  const imagePattern = /^[\w-]+\.(png|jpe?g|webp)$/
  for (const item of BTS_SITUATIONS) {
    assert.match(item.id, /^live-bts-[a-z0-9-]+$/)
    assert.ok(item.opening.video, 'Adicione um clipe ao primeiro exercício')
    for (const { ko, pt, video } of [item.opening, item.reply, item.transfer]) {
      assert.ok(ko.trim() && pt.trim())
      if (!video) continue
      assertFile(video.file, /^[\w-]+\.mp4$/)
      assert.ok(video.credit.trim())
      if (video.poster) assertFile(video.poster, imagePattern)
    }
    assert.equal(new Set([item.opening.pt, ...item.distractors]).size, 3)
    assert.equal(new Set([item.transfer.pt, ...item.distractors]).size, 3)
    if (item.picture) {
      assertFile(item.picture.file, imagePattern)
      assert.ok(item.picture.alt.trim() && item.picture.credit.trim())
    }
  }
})
