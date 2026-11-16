'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { loadTsModule } = require('./helpers/load-ts.cjs')

const hangul = loadTsModule('src/lib/hangul.ts')
const feedback = loadTsModule('src/lib/syllableFeedback.ts')
const { createSessionRandom } = loadTsModule('src/lib/random.ts')
const { buildLessonSteps } = loadTsModule('src/lib/lessonPlans.ts')
const catalog = loadTsModule('src/data/index.ts')

test('composição Unicode: piloto e vídeo', () => {
  assert.equal(hangul.composeSyllable('ㅍ', 'ㅣ'), '피')
  assert.equal(hangul.composeSyllable('ㅋ', 'ㅣ'), '키')
  assert.equal(hangul.composeSyllable('ㄱ', 'ㅏ'), '가')
  assert.equal(hangul.composeSyllable('ㄴ', 'ㅏ'), '나')
  assert.equal(hangul.composeSyllable('ㄱ', 'ㅗ'), '고')
  assert.equal(hangul.composeSyllable('ㄴ', 'ㅗ'), '노')
  assert.equal(hangul.composeSyllable('ㅎ', 'ㅏ', 'ㄴ'), '한')
  assert.equal(hangul.composeFromJamo(['ㅍ', 'ㅣ']), '피')
  assert.notEqual(hangul.composeFromJamo(['ㅍ', 'ㅣ']), 'ㅍㅣ')
})

test('layout e feedback de posição', () => {
  assert.equal(feedback.layoutForSyllable('피'), 'vertical-right')
  assert.equal(feedback.layoutForSyllable('노'), 'horizontal-below')
  assert.equal(feedback.layoutForSyllable('한'), 'batchim')
  assert.match(feedback.explainAssembleMistake(['ㅣ', 'ㅍ'], ['ㅍ', 'ㅣ']), /direita/)
  assert.match(feedback.explainAssembleMistake(['ㅗ', 'ㄴ'], ['ㄴ', 'ㅗ']), /embaixo/)
})

test('piloto e sequência 피/키 geram etapas jogáveis', () => {
  const random = createSessionRandom('test-seed')
  const pilot = catalog.getLessonById('lesson-u1-00')
  const demo = catalog.getLessonById('lesson-u2-16')
  assert.ok(pilot)
  assert.ok(demo)

  const pilotSteps = buildLessonSteps(pilot, random)
  assert.ok(pilotSteps.some((step) => step.kind === 'write' && step.letterId === 'letter-a'))
  assert.ok(pilotSteps.some((step) => step.kind === 'tiles' && step.composed === '가'))
  assert.ok(pilotSteps.some((step) => step.kind === 'tiles' && step.composed === '나'))
  assert.ok(pilotSteps.some((step) => step.kind === 'tiles' && step.composed === '노' && step.helpLevel === 'apply'))

  const demoSteps = buildLessonSteps(demo, random)
  assert.ok(demoSteps.some((step) => step.kind === 'write' && step.letterId === 'letter-i'))
  assert.ok(demoSteps.some((step) => step.kind === 'tiles' && step.composed === '피' && step.hideTarget === true))
  assert.ok(demoSteps.some((step) => step.kind === 'tiles' && step.composed === '키'))
})

test('catálogo inclui as duas aulas novas', () => {
  assert.equal(catalog.CATALOG_STATS.lessons, 58)
  assert.ok(catalog.LESSONS.some((lesson) => lesson.id === 'lesson-u1-00'))
  assert.ok(catalog.LESSONS.some((lesson) => lesson.id === 'lesson-u2-16'))
})
