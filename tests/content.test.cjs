'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { loadCore, loadCatalog } = require('./helpers/load-ts.cjs')

const core = loadCore()
const catalog = loadCatalog()
const { LESSONS, UNITS, LETTERS, VOCABULARY, READINGS, PHRASES, GLOSSARY, CATALOG_STATS } = catalog

const ids = (items) => items.map((item) => item.id)
const duplicatesOf = (values) => values.filter((value, index) => values.indexOf(value) !== index)

test('catálogo: contagens batem com CATALOG_STATS', () => {
  assert.equal(LESSONS.length, CATALOG_STATS.lessons)
  assert.equal(UNITS.length, CATALOG_STATS.units)
  assert.equal(LETTERS.length, CATALOG_STATS.letters)
  assert.equal(VOCABULARY.length, CATALOG_STATS.vocabulary)
  assert.equal(READINGS.length, CATALOG_STATS.readings)
})

test('catálogo: IDs são únicos em cada coleção', () => {
  for (const [label, items] of Object.entries({ LESSONS, UNITS, LETTERS, VOCABULARY, READINGS, PHRASES, GLOSSARY })) {
    assert.deepEqual(duplicatesOf(ids(items)), [], `IDs duplicados em ${label}`)
  }
})

test('catálogo: referências das aulas apontam para itens existentes', () => {
  const letterIds = new Set(ids(LETTERS))
  const vocabIds = new Set(ids(VOCABULARY))
  const phraseIds = new Set(ids(PHRASES))
  const readingIds = new Set(ids(READINGS))
  const unitIds = new Set(ids(UNITS))

  for (const lesson of LESSONS) {
    assert.ok(unitIds.has(lesson.unitId), `${lesson.id}: unidade ${lesson.unitId}`)
    assert.ok(lesson.xpReward > 0, `${lesson.id}: xpReward`)
    if (lesson.letterId) assert.ok(letterIds.has(lesson.letterId), `${lesson.id}: letra ${lesson.letterId}`)
    if (lesson.readingId) assert.ok(readingIds.has(lesson.readingId), `${lesson.id}: leitura ${lesson.readingId}`)
    for (const vocabId of lesson.vocabIds ?? []) assert.ok(vocabIds.has(vocabId), `${lesson.id}: vocab ${vocabId}`)
    for (const phraseId of lesson.phraseIds ?? []) assert.ok(phraseIds.has(phraseId), `${lesson.id}: frase ${phraseId}`)
  }
})

test('catálogo: cada aula pertence a exatamente uma unidade', () => {
  const lessonIds = new Set(ids(LESSONS))
  const listedInUnits = UNITS.flatMap((unit) => unit.lessonIds)
  assert.deepEqual(duplicatesOf(listedInUnits), [])
  assert.deepEqual([...new Set(listedInUnits)].sort(), [...lessonIds].sort())
  for (const unit of UNITS) {
    for (const lessonId of unit.lessonIds) {
      assert.equal(catalog.getLessonById(lessonId).unitId, unit.id, `${lessonId} em ${unit.id}`)
    }
  }
})

test('catálogo: leituras têm perguntas com resposta válida', () => {
  for (const reading of READINGS) {
    assert.ok(reading.lines.length > 0, reading.id)
    assert.ok(reading.questions.length > 0, reading.id)
    for (const question of reading.questions) {
      assert.ok(Number.isInteger(question.answerIndex), reading.id)
      assert.ok(question.answerIndex >= 0 && question.answerIndex < question.options.length, `${reading.id}: ${question.prompt}`)
    }
  }
})

test('catálogo: toda letra tem traços normalizados (0-1)', () => {
  for (const letter of LETTERS) {
    assert.ok(letter.strokes.length > 0, letter.id)
    for (const stroke of letter.strokes) {
      assert.ok(stroke.points.length >= 2, `${letter.id}: traço com poucos pontos`)
      for (const point of stroke.points) {
        assert.ok(point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1, `${letter.id}: ponto fora de 0-1`)
      }
    }
  }
})

test('catálogo + escrita: o próprio modelo de cada letra é aceito e a versão invertida é rejeitada', () => {
  for (const letter of LETTERS) {
    const asUserStrokes = letter.strokes.map((model) => (model.closed ? [...model.points, model.points[0]] : [...model.points]))
    const accepted = core.evaluateWriting(asUserStrokes, letter.strokes)
    assert.equal(accepted.ok, true, `${letter.id}: ${accepted.message}`)

    const longestOpenStrokeIndex = letter.strokes.findIndex((model) => {
      if (model.closed) return false
      const first = model.points[0]
      const last = model.points[model.points.length - 1]
      return Math.hypot(first.x - last.x, first.y - last.y) > 0.5
    })
    if (longestOpenStrokeIndex === -1) continue

    const withInvertedStroke = asUserStrokes.map((stroke, index) => (index === longestOpenStrokeIndex ? stroke.toReversed() : stroke))
    const rejected = core.evaluateWriting(withInvertedStroke, letter.strokes)
    assert.equal(rejected.ok, false, `${letter.id}: traço invertido deveria falhar`)
  }
})

test('catálogo + backup: IDs derivados do catálogo importam sem itens sem correspondência', () => {
  const state = core.createEmptyState()
  state.progress.completedLessons = LESSONS.map((lesson) => lesson.id)
  state.progress.favorites = VOCABULARY.map((item) => item.id)
  state.progress.reviewCards = VOCABULARY.slice(0, 5).map((item) => core.createReviewCard(item.id, '2026-11-15'))

  const catalogIds = { lessonIds: ids(LESSONS), vocabIds: ids(VOCABULARY) }
  const backup = JSON.parse(JSON.stringify(core.exportProgress(state)))
  const preview = core.previewImport(backup, catalogIds)
  assert.equal(preview.hasUnmatched, false)
  assert.equal(preview.summary.completedLessons, CATALOG_STATS.lessons)
  assert.equal(preview.summary.favorites, CATALOG_STATS.vocabulary)
})
