'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { loadCore, loadCatalog } = require('./helpers/load-ts.cjs')

const core = loadCore()
const catalog = loadCatalog()

const catalogIds = {
  lessonIds: catalog.LESSONS.map((lesson) => lesson.id),
  vocabIds: catalog.VOCABULARY.map((item) => item.id),
}

const sampleBackup = () =>
  JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'nuri-progress-v3-sample.json'), 'utf8'))

const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    Object.values(value).forEach(deepFreeze)
  }
  return value
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const createFakeStorage = (initial = {}) => {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => void data.set(key, String(value)),
    removeItem: (key) => void data.delete(key),
  }
}

// ---------------------------------------------------------------------------
test('dates: todayKey usa data local, com zero à esquerda', () => {
  assert.equal(core.todayKey(new Date(2026, 0, 5, 23, 59, 59)), '2026-01-05')
  assert.equal(core.todayKey(new Date(2026, 11, 31, 0, 0, 1)), '2026-12-31')
  assert.match(core.todayKey(), /^\d{4}-\d{2}-\d{2}$/)
})

test('dates: addDays cruza mês, ano e ano bissexto', () => {
  assert.equal(core.addDays('2026-01-31', 1), '2026-02-01')
  assert.equal(core.addDays('2026-12-31', 1), '2027-01-01')
  assert.equal(core.addDays('2028-02-28', 1), '2028-02-29')
  assert.equal(core.addDays('2026-03-01', -1), '2026-02-28')
  assert.equal(core.addDays('2026-11-15', 30), '2026-12-15')
  assert.equal(core.addDays('2026-11-15', 0), '2026-11-15')
})

test('dates: daysBetween é assinado e imune a horário de verão', () => {
  assert.equal(core.daysBetween('2026-11-01', '2026-11-15'), 14)
  assert.equal(core.daysBetween('2026-11-15', '2026-11-01'), -14)
  assert.equal(core.daysBetween('2026-11-15', '2026-11-15'), 0)
  assert.equal(core.daysBetween('2026-03-01', '2026-04-01'), 31)
  assert.equal(core.daysBetween('2026-12-31', '2027-01-01'), 1)
})

test('dates: chaves inválidas lançam erro', () => {
  assert.throws(() => core.addDays('15/11/2026', 1), RangeError)
  assert.throws(() => core.addDays('2026-02-30', 1), RangeError)
  assert.throws(() => core.daysBetween('2026-11-15', 'ontem'), RangeError)
  assert.throws(() => core.addDays('2026-11-15', 1.5), RangeError)
  assert.equal(core.isValidDateKey('2026-02-30'), false)
  assert.equal(core.isValidDateKey('2026-02-28'), true)
})

// ---------------------------------------------------------------------------
test('xp: aula só concede XP na primeira conclusão', () => {
  assert.equal(core.XP_LESSON_FIRST, 20)
  assert.equal(core.canAwardLessonXp([], 'lesson-u1-01'), true)
  assert.equal(core.canAwardLessonXp(['lesson-u1-01'], 'lesson-u1-01'), false)
  assert.equal(core.canAwardLessonXp(['lesson-u1-01'], 'lesson-u1-02'), true)
  assert.equal(core.lessonXpAward(['lesson-u1-01'], 'lesson-u1-01'), 0)
  assert.equal(core.lessonXpAward([], 'lesson-u1-01'), 20)
})

test('xp: atividade diária não duplica no mesmo dia e libera no dia seguinte', () => {
  const frozenEmpty = deepFreeze({})
  assert.equal(core.canAwardDailyXp(frozenEmpty, 'practice-match', '2026-11-15'), true)

  const awarded = core.awardDailyXp(frozenEmpty, 'practice-match', '2026-11-15')
  assert.deepEqual(awarded, { 'practice-match': '2026-11-15' })
  assert.notEqual(awarded, frozenEmpty)
  assert.deepEqual(frozenEmpty, {})

  assert.equal(core.canAwardDailyXp(awarded, 'practice-match', '2026-11-15'), false)
  assert.equal(core.canAwardDailyXp(awarded, 'practice-daily', '2026-11-15'), true)
  assert.equal(core.canAwardDailyXp(awarded, 'practice-match', '2026-11-16'), true)
  assert.deepEqual(core.awardDailyXp(awarded, 'practice-match', '2026-11-15'), awarded)
})

test('xp: chaves de recompensa conhecidas e desconhecidas', () => {
  for (const key of ['practice-match', 'practice-daily', 'practice-cards']) {
    assert.ok(core.dailyXpAmount(key) > 0, key)
  }
  assert.equal(core.canAwardDailyXp({}, 'chave-inexistente', '2026-11-15'), false)
  assert.equal(core.dailyXpAmount('chave-inexistente'), 0)
  assert.deepEqual(core.awardDailyXp({}, 'chave-inexistente', '2026-11-15'), {})
})

// ---------------------------------------------------------------------------
test('review: cronograma 1/3/7/14/30 com teto no último intervalo', () => {
  assert.deepEqual([...core.SCHEDULE_DAYS], [1, 3, 7, 14, 30])

  const today = '2026-11-15'
  const frozenCard = deepFreeze(core.createReviewCard('vocab-jip', today))
  assert.equal(frozenCard.intervalIndex, 0)
  assert.equal(frozenCard.dueDate, '2026-11-16')

  const expectedOffsets = [3, 7, 14, 30, 30, 30]
  const expectedIndexes = [1, 2, 3, 4, 4, 4]
  let card = frozenCard
  expectedOffsets.forEach((offset, step) => {
    card = core.reviewRemembered(card, today)
    assert.equal(card.intervalIndex, expectedIndexes[step], `passo ${step}`)
    assert.equal(core.daysBetween(today, card.dueDate), offset, `passo ${step}`)
    assert.equal(card.lastResult, 'remembered')
  })
  assert.equal(frozenCard.intervalIndex, 0)
})

test('review: esquecer volta ao intervalo 0 e vence hoje', () => {
  const today = '2026-11-15'
  const advanced = { vocabId: 'vocab-jip', intervalIndex: 3, dueDate: '2026-12-01', lastResult: 'remembered' }
  const forgotten = core.reviewForgotten(deepFreeze(advanced), today)
  assert.equal(forgotten.intervalIndex, 0)
  assert.equal(forgotten.dueDate, today)
  assert.equal(forgotten.lastResult, 'forgotten')
  assert.equal(forgotten.vocabId, 'vocab-jip')
  assert.equal(core.isReviewDue(forgotten, today), true)
  assert.equal(core.reviewRemembered(forgotten, today).intervalIndex, 1)
})

test('review: getDueCards filtra e ordena por vencimento', () => {
  const cards = [
    { vocabId: 'b', intervalIndex: 1, dueDate: '2026-11-15' },
    { vocabId: 'c', intervalIndex: 1, dueDate: '2026-11-20' },
    { vocabId: 'a', intervalIndex: 0, dueDate: '2026-11-10' },
  ]
  assert.deepEqual(core.getDueCards(cards, '2026-11-15').map((card) => card.vocabId), ['a', 'b'])
})

test('review: fila de erros só limpa em sessão NOVA e com acerto de primeira', () => {
  let errors = core.queueError([], { id: 'letter-a', kind: 'letter', lastFailedSessionId: 'sessao-1' })
  assert.equal(errors.length, 1)
  assert.equal(errors[0].failCount, 1)

  errors = core.queueError(errors, { id: 'vocab-jip', lastFailedSessionId: 'sessao-1' })
  errors = core.queueError(errors, { id: 'letter-a', kind: 'letter', lastFailedSessionId: 'sessao-2' })
  assert.equal(errors.length, 2)
  assert.equal(errors.find((error) => error.id === 'letter-a').failCount, 2)
  assert.equal(errors.find((error) => error.id === 'letter-a').lastFailedSessionId, 'sessao-2')

  const frozen = deepFreeze(clone(errors))
  assert.equal(core.clearErrorOnFirstTry(frozen, 'letter-a', 'sessao-2').length, 2, 'mesma sessão não limpa')
  assert.equal(core.clearErrorOnFirstTry(frozen, 'letter-a', 'sessao-3', false).length, 2, 'sem acerto de primeira não limpa')

  const cleared = core.clearErrorOnFirstTry(frozen, 'letter-a', 'sessao-3')
  assert.deepEqual(cleared.map((error) => error.id), ['vocab-jip'])
  assert.equal(frozen.length, 2)
  assert.equal(core.clearErrorOnFirstTry(frozen, 'inexistente', 'sessao-3').length, 2)
})

// ---------------------------------------------------------------------------
const letterById = (letterId) => catalog.LETTERS.find((letter) => letter.id === letterId)
const toUserStroke = (model, jitter = 0.03) =>
  model.points.map((point, index) => ({
    x: point.x + (index % 2 === 0 ? jitter : -jitter),
    y: point.y + (index % 2 === 0 ? -jitter : jitter),
  }))
const reversed = (stroke) => [...stroke].reverse()
const pointsOnPath = (stroke, steps = 12) =>
  Array.from({ length: steps + 1 }, (_, index) => {
    const ratio = index / steps
    const first = stroke[0]
    const last = stroke[stroke.length - 1]
    return { x: first.x + (last.x - first.x) * ratio, y: first.y + (last.y - first.y) * ratio }
  })

test('writing: aceita traços corretos com pequeno desvio', () => {
  const letterA = letterById('letter-a')
  const user = letterA.strokes.map((model) => pointsOnPath(toUserStroke(model)))
  const result = core.evaluateWriting(user, letterA.strokes)
  assert.equal(result.ok, true, result.message)
})

test('writing: rejeita traço invertido e orienta qual traço inverter', () => {
  const letterA = letterById('letter-a')
  const user = letterA.strokes.map((model, index) => {
    const stroke = pointsOnPath(toUserStroke(model))
    return index === 1 ? reversed(stroke) : stroke
  })
  const result = core.evaluateWriting(user, letterA.strokes)
  assert.equal(result.ok, false)
  assert.equal(result.code, 'wrong-direction')
  assert.equal(result.message, 'Inverta o sentido do traço 2.')
})

test('writing: ordem dos traços trocada', () => {
  const letterA = letterById('letter-a')
  const user = letterA.strokes.map((model) => pointsOnPath(toUserStroke(model))).reverse()
  const result = core.evaluateWriting(user, letterA.strokes)
  assert.equal(result.ok, false)
  assert.equal(result.code, 'wrong-order')
  assert.match(result.message, /A ordem dos traços está trocada/)
})

test('writing: faltou traço, traço a mais e nenhum traço', () => {
  const letterA = letterById('letter-a')
  const strokes = letterA.strokes.map((model) => pointsOnPath(toUserStroke(model)))

  const missing = core.evaluateWriting([strokes[0]], letterA.strokes)
  assert.equal(missing.ok, false)
  assert.equal(missing.code, 'missing-strokes')
  assert.match(missing.message, /Faltou um traço/)

  const extra = core.evaluateWriting([...strokes, strokes[0]], letterA.strokes)
  assert.equal(extra.ok, false)
  assert.equal(extra.code, 'extra-strokes')
  assert.match(extra.message, /a mais/)

  const none = core.evaluateWriting([], letterA.strokes)
  assert.equal(none.code, 'no-strokes')
  const tapOnly = core.evaluateWriting([[{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.51 }]], letterA.strokes)
  assert.equal(tapOnly.code, 'no-strokes')
})

test('writing: início e fim distantes do modelo recebem orientação específica', () => {
  const letterEu = letterById('letter-eu')
  const lateStart = pointsOnPath([{ x: 0.45, y: 0.5 }, { x: 0.9, y: 0.5 }])
  const startResult = core.evaluateWriting([lateStart], letterEu.strokes)
  assert.equal(startResult.ok, false)
  assert.equal(startResult.code, 'wrong-start')
  assert.match(startResult.message, /Comece mais perto do início do modelo/)

  const earlyEnd = pointsOnPath([{ x: 0.1, y: 0.5 }, { x: 0.55, y: 0.5 }])
  const endResult = core.evaluateWriting([earlyEnd], letterEu.strokes)
  assert.equal(endResult.code, 'wrong-end')
  assert.match(endResult.message, /Termine mais perto do fim/)

  const wrongPlace = pointsOnPath([{ x: 0.1, y: 0.95 }, { x: 0.9, y: 0.95 }])
  assert.equal(core.evaluateWriting([wrongPlace], letterEu.strokes).ok, false)
})

test('writing: respeita tolerância configurável', () => {
  const letterEu = letterById('letter-eu')
  const slightlyOff = pointsOnPath([{ x: 0.37, y: 0.5 }, { x: 0.9, y: 0.5 }])
  assert.equal(core.evaluateWriting([slightlyOff], letterEu.strokes).code, 'wrong-start')
  assert.equal(core.evaluateWriting([slightlyOff], letterEu.strokes, { endpointTolerance: 0.3 }).ok, true)
})

test('writing: círculo (curva fechada) valida o sentido de desenho', () => {
  const letterNg = letterById('letter-ng')
  const clockwise = [...letterNg.strokes[0].points, letterNg.strokes[0].points[0]]
  assert.equal(core.evaluateWriting([clockwise], letterNg.strokes).ok, true)

  const counterClockwise = reversed(clockwise)
  const result = core.evaluateWriting([counterClockwise], letterNg.strokes)
  assert.equal(result.ok, false)
  assert.equal(result.code, 'wrong-direction')
  assert.match(result.message, /Inverta o sentido do traço 1/)
  assert.match(result.message, /horário/)

  const tinyCircle = clockwise.map((point) => ({ x: 0.5 + (point.x - 0.5) * 0.25, y: 0.5 + (point.y - 0.5) * 0.25 }))
  assert.equal(core.evaluateWriting([tinyCircle], letterNg.strokes).code, 'wrong-size')

  const arc = clockwise.slice(0, 9)
  assert.equal(core.evaluateWriting([arc], letterNg.strokes).ok, false)
})

test('writing: modelo vazio e coordenadas inválidas não quebram', () => {
  assert.equal(core.evaluateWriting([[{ x: 0, y: 0 }, { x: 1, y: 1 }]], []).code, 'no-model')
  const letterEu = letterById('letter-eu')
  const dirty = [[{ x: Number.NaN, y: 0.5 }, { x: -3, y: 0.5 }, { x: 4, y: 0.5 }]]
  assert.doesNotThrow(() => core.evaluateWriting(dirty, letterEu.strokes))
})

// ---------------------------------------------------------------------------
test('state: createEmptyState e constantes', () => {
  assert.equal(core.STORAGE_KEY, 'nuri-state')
  const state = core.createEmptyState()
  assert.equal(state.version, 3)
  assert.equal(state.progress.xp, 0)
  assert.equal(state.profile.onboardingDone, false)
  assert.equal(state.activityDraft, null)
  assert.equal(state.lastRoute, null)
  assert.notEqual(core.createEmptyState().progress, state.progress)
})

test('state: migrateState v1 preserva aulas, XP, favoritos e revisões', () => {
  const legacyV1 = {
    xp: 120,
    streak: 4,
    lastStudyDay: '2026-11-10',
    name: 'Ana',
    completed: ['lesson-u1-01', 'lesson-u1-02', 'lesson-u1-01'],
    favorites: ['vocab-jip'],
    reviews: [{ id: 'vocab-jip', level: 2, due: '2026-11-20' }, { nonsense: true }],
    showRomanization: false,
  }
  const migrated = core.migrateState(deepFreeze(legacyV1))
  assert.equal(migrated.version, 3)
  assert.equal(migrated.progress.xp, 120)
  assert.equal(migrated.progress.streak, 4)
  assert.deepEqual(migrated.progress.completedLessons, ['lesson-u1-01', 'lesson-u1-02'])
  assert.deepEqual(migrated.progress.favorites, ['vocab-jip'])
  assert.deepEqual(migrated.progress.reviewCards, [{ vocabId: 'vocab-jip', intervalIndex: 2, dueDate: '2026-11-20' }])
  assert.equal(migrated.profile.name, 'Ana')
  assert.equal(migrated.profile.showRomanization, false)
  assert.equal(migrated.activityDraft, null)
})

test('state: migrateState v2 aninhado e v3 preservam dados', () => {
  const legacyV2 = {
    version: 2,
    profile: { name: 'Leo', dailyGoalMinutes: 20, darkMode: true },
    progress: {
      xp: 75,
      completedLessons: ['lesson-u1-03'],
      lessonCompletions: { 'lesson-u1-03': '2026-11-02' },
      favorites: ['vocab-annyeong'],
      reviewCards: [{ vocabId: 'vocab-annyeong', intervalIndex: 1, dueDate: '2026-11-18', lastResult: 'remembered' }],
    },
  }
  const migrated = core.migrateState(legacyV2)
  assert.equal(migrated.version, 3)
  // 20 min legado aproxima para 30 min na escala atual (10/30/60/120)
  assert.equal(migrated.profile.dailyGoalMinutes, 30)
  assert.equal(migrated.profile.darkMode, true)
  assert.equal(migrated.progress.xp, 75)
  assert.deepEqual(migrated.progress.completedLessons, ['lesson-u1-03'])
  assert.deepEqual(migrated.progress.lessonCompletions, { 'lesson-u1-03': '2026-11-02' })
  assert.deepEqual(migrated.progress.favorites, ['vocab-annyeong'])
  assert.equal(migrated.progress.reviewCards[0].lastResult, 'remembered')

  const current = core.createEmptyState()
  current.progress.xp = 10
  current.progress.completedLessons = ['lesson-u1-01']
  current.lastRoute = '/praticar'
  assert.deepEqual(core.migrateState(clone(current)), current)

  assert.deepEqual(core.migrateState(null), core.createEmptyState())
  assert.deepEqual(core.migrateState('texto'), core.createEmptyState())
})

test('state: migrateState sanitiza valores inválidos', () => {
  const migrated = core.migrateState({
    version: 3,
    profile: { dailyGoalMinutes: 7, xpGoal: -1, darkMode: 'sim' },
    progress: { xp: -5, streak: 'x', completedLessons: 'nope', reviewCards: [{ vocabId: 'v', intervalIndex: 99, dueDate: 'ontem' }] },
  })
  assert.equal(migrated.profile.dailyGoalMinutes, 10)
  assert.equal(migrated.profile.xpGoal, 50)
  assert.equal(migrated.profile.darkMode, false)
  assert.equal(migrated.progress.xp, 0)
  assert.deepEqual(migrated.progress.completedLessons, [])
  assert.equal(migrated.progress.reviewCards[0].intervalIndex, 4)
  assert.match(migrated.progress.reviewCards[0].dueDate, /^\d{4}-\d{2}-\d{2}$/)
})

test('state: load/save roundtrip e migração na leitura', () => {
  const storage = createFakeStorage()
  assert.deepEqual(core.loadStateResult({ storage }), { state: core.createEmptyState(), status: 'empty' })

  const state = core.createEmptyState()
  state.progress.xp = 42
  state.progress.completedLessons = ['lesson-u1-01']
  assert.deepEqual(core.saveState(state, { storage }), { ok: true })
  assert.deepEqual(core.loadState({ storage }), state)

  const legacyStorage = createFakeStorage({ 'nuri-state': JSON.stringify({ xp: 9, completed: ['lesson-u1-01'] }) })
  const loaded = core.loadStateResult({ storage: legacyStorage })
  assert.equal(loaded.status, 'valid')
  assert.equal(loaded.state.progress.xp, 9)
  assert.equal(legacyStorage.getItem('nuri-state'), JSON.stringify({ xp: 9, completed: ['lesson-u1-01'] }), 'leitura não reescreve')
})

test('state: JSON corrompido não é apagado nem sobrescrito sem confirmação', () => {
  const corruptText = '{"version":3,"progress":{"xp":500,'
  const storage = createFakeStorage({ 'nuri-state': corruptText })

  const loaded = core.loadStateResult({ storage })
  assert.equal(loaded.status, 'corrupt')
  assert.deepEqual(loaded.state, core.createEmptyState())
  assert.equal(storage.getItem('nuri-state'), corruptText)
  assert.equal(storage.getItem(core.CORRUPT_BACKUP_STORAGE_KEY), corruptText)

  const refused = core.saveState(core.createEmptyState(), { storage })
  assert.deepEqual(refused, { ok: false, reason: 'corrupt-storage-not-confirmed' })
  assert.equal(storage.getItem('nuri-state'), corruptText)

  const confirmed = core.saveState(core.createEmptyState(), { storage, confirmOverwriteCorrupt: true })
  assert.deepEqual(confirmed, { ok: true })
  assert.equal(core.loadStateResult({ storage }).status, 'valid')
  assert.equal(storage.getItem(core.CORRUPT_BACKUP_STORAGE_KEY), corruptText, 'cópia do conteúdo corrompido é mantida')
})

test('state: versão desconhecida/futura é tratada como não confiável e preservada', () => {
  const futureText = JSON.stringify({ version: 9, progress: { xp: 999 } })
  const storage = createFakeStorage({ 'nuri-state': futureText })
  assert.equal(core.loadStateResult({ storage }).status, 'corrupt')
  assert.equal(core.saveState(core.createEmptyState(), { storage }).ok, false)
  assert.equal(storage.getItem('nuri-state'), futureText)
})

test('state: falha de leitura devolve último estado válido; falha de escrita não apaga', () => {
  const storage = createFakeStorage()
  const state = core.createEmptyState()
  state.progress.xp = 77
  core.saveState(state, { storage })
  core.loadState({ storage })

  const brokenReader = { ...storage, getItem: () => { throw new Error('SecurityError') } }
  const result = core.loadStateResult({ storage: brokenReader })
  assert.equal(result.status, 'unreadable')
  assert.equal(result.state.progress.xp, 77)

  const savedText = storage.getItem('nuri-state')
  const brokenWriter = { ...storage, setItem: () => { throw new Error('QuotaExceededError') } }
  assert.deepEqual(core.saveState(core.createEmptyState(), { storage: brokenWriter }), { ok: false, reason: 'write-failed' })
  assert.equal(storage.getItem('nuri-state'), savedText)

  assert.deepEqual(core.saveState(state, { storage: null }), { ok: false, reason: 'storage-unavailable' })
})

// ---------------------------------------------------------------------------
const buildRichState = () => {
  const state = core.createEmptyState()
  state.profile.name = 'Frank'
  state.progress.xp = 300
  state.progress.completedLessons = ['lesson-u1-01']
  state.progress.favorites = ['vocab-jip']
  state.progress.reviewCards = [core.createReviewCard('vocab-jip', '2026-11-15')]
  state.progress.errorQueue = [{ id: 'letter-a', lastFailedSessionId: 's1', failCount: 1 }]
  state.activityDraft = { type: 'practice-match', payload: { step: 3 }, updatedAt: '2026-11-15T10:00:00.000Z' }
  state.lastRoute = '/praticar'
  state.recordings = [{ id: 'rec-1', audio: 'data:audio/webm;base64,AAAA' }]
  return state
}

test('backup: exportProgress usa formato v3 e exclui rascunho, perguntas pendentes e gravações', () => {
  const state = deepFreeze(buildRichState())
  const backup = core.exportProgress(state, new Date('2026-11-15T15:00:00.000Z'))

  assert.equal(backup.format, 'nuri-progress')
  assert.equal(backup.version, 3)
  assert.equal(backup.exportedAt, '2026-11-15T15:00:00.000Z')
  assert.deepEqual(Object.keys(backup.state).sort(), ['profile', 'progress'])
  assert.equal(backup.state.progress.xp, 300)
  assert.deepEqual(backup.state.progress.favorites, ['vocab-jip'])
  assert.equal('errorQueue' in backup.state.progress, false)

  const serialized = JSON.stringify(backup)
  assert.equal(serialized.includes('activityDraft'), false)
  assert.equal(serialized.includes('practice-match'), false)
  assert.equal(serialized.includes('recordings'), false)
  assert.equal(serialized.includes('audio/webm'), false)
  assert.equal(serialized.includes('/praticar'), false)
})

test('backup: export → preview → apply preserva todo o progresso (roundtrip)', () => {
  const source = buildRichState()
  const backup = JSON.parse(JSON.stringify(core.exportProgress(source)))
  const preview = core.previewImport(backup, catalogIds)
  assert.equal(preview.canImport, true)
  assert.equal(preview.hasUnmatched, false)

  const target = core.createEmptyState()
  target.lastRoute = '/inicio'
  const result = core.applyImport(target, backup, { acknowledgeUnmatched: false, catalogIds })
  assert.equal(result.ok, true)
  assert.equal(result.state.progress.xp, 300)
  assert.deepEqual(result.state.progress.completedLessons, ['lesson-u1-01'])
  assert.deepEqual(result.state.progress.favorites, ['vocab-jip'])
  assert.equal(result.state.progress.reviewCards[0].vocabId, 'vocab-jip')
  assert.equal(result.state.profile.name, 'Frank')
  assert.equal(result.state.activityDraft, null)
  assert.deepEqual(result.state.progress.errorQueue, [])
  assert.equal(result.state.lastRoute, '/inicio')
})

test('backup: previewImport lista itens sem correspondência sem mutar nada', () => {
  const backup = deepFreeze(sampleBackup())
  const snapshot = clone(backup)
  const preview = core.previewImport(backup, catalogIds)

  assert.equal(preview.canImport, true)
  assert.equal(preview.sourceVersion, 3)
  assert.equal(preview.hasUnmatched, true)
  assert.deepEqual(preview.unmatched, { lessons: ['lesson-old-removed'], vocabulary: [], reviews: [], favorites: [] })
  assert.equal(preview.matched.lessons.length, 7)
  assert.deepEqual(preview.matched.favorites, ['vocab-annyeonghaseyo', 'vocab-gamsahamnida', 'vocab-jip'])
  assert.equal(preview.matched.reviews.length, 3)
  assert.deepEqual(preview.summary, { xp: 235, streak: 6, completedLessons: 8, favorites: 3, reviewCards: 3 })
  assert.deepEqual(backup, snapshot)
})

test('backup: preview detecta vocabulário sem correspondência em favoritos e revisões', () => {
  const backup = sampleBackup()
  backup.state.progress.favorites.push('vocab-removido')
  backup.state.progress.reviewCards.push({ vocabId: 'vocab-fantasma', intervalIndex: 0, dueDate: '2026-11-11' })
  const preview = core.previewImport(backup, catalogIds)
  assert.deepEqual(preview.unmatched.favorites, ['vocab-removido'])
  assert.deepEqual(preview.unmatched.reviews, ['vocab-fantasma'])
  assert.deepEqual(preview.unmatched.vocabulary.sort(), ['vocab-fantasma', 'vocab-removido'])
})

test('backup: importação inválida é recusada sem alterar o estado atual', () => {
  const current = deepFreeze(buildRichState())
  const snapshot = clone(current)
  const options = { acknowledgeUnmatched: true, catalogIds }

  const brokenCases = [
    ['null', null],
    ['texto', 'nuri'],
    ['array', []],
    ['formato errado', { ...sampleBackup(), format: 'outro-app' }],
    ['sem formato', (({ format: _format, ...rest }) => rest)(sampleBackup())],
    ['versão futura', { ...sampleBackup(), version: 4 }],
    ['versão zero', { ...sampleBackup(), version: 0 }],
    ['versão textual', { ...sampleBackup(), version: '3' }],
    ['sem state', { ...sampleBackup(), state: undefined }],
    ['sem exportedAt', { ...sampleBackup(), exportedAt: undefined }],
    ['xp inválido', (() => { const b = sampleBackup(); b.state.progress.xp = 'muito'; return b })()],
    ['sem progress', (() => { const b = sampleBackup(); delete b.state.progress; return b })()],
    ['completedLessons não é lista', (() => { const b = sampleBackup(); b.state.progress.completedLessons = 'x'; return b })()],
  ]

  for (const [label, raw] of brokenCases) {
    const preview = core.previewImport(raw, catalogIds)
    assert.equal(preview.canImport, false, label)
    assert.equal(preview.hasUnmatched, false, label)

    const result = core.applyImport(current, raw, options)
    assert.equal(result.ok, false, label)
    assert.equal(typeof result.reason, 'string', label)
    assert.deepEqual(current, snapshot, label)
  }

  assert.equal(core.applyImport(current, sampleBackup(), { acknowledgeUnmatched: true }).reason, 'catalog-missing')
  assert.equal(core.applyImport(current, { format: 'x' }, options).reason, 'invalid-format')
  assert.equal(core.applyImport(current, { ...sampleBackup(), version: 4 }, options).reason, 'unsupported-version')
})

test('backup: itens sem correspondência exigem confirmação explícita', () => {
  const current = deepFreeze(buildRichState())
  const snapshot = clone(current)

  const refused = core.applyImport(current, sampleBackup(), { acknowledgeUnmatched: false, catalogIds })
  assert.equal(refused.ok, false)
  assert.equal(refused.reason, 'unmatched-not-acknowledged')
  assert.deepEqual(current, snapshot)
})

test('backup: aplicar com confirmação mantém só o compatível e preserva o XP importado', () => {
  const current = deepFreeze(buildRichState())
  const snapshot = clone(current)

  const result = core.applyImport(current, sampleBackup(), { acknowledgeUnmatched: true, catalogIds })
  assert.equal(result.ok, true)
  const { state } = result

  assert.equal(state.version, 3)
  assert.equal(state.progress.xp, 235)
  assert.equal(state.progress.streak, 6)
  assert.equal(state.progress.lastStudyDay, '2026-11-10')
  assert.deepEqual(state.progress.completedLessons, [
    'lesson-u1-01', 'lesson-u1-02', 'lesson-u1-03', 'lesson-u1-04', 'lesson-u1-05', 'lesson-u2-01', 'lesson-u5-01',
  ])
  assert.equal('lesson-old-removed' in state.progress.lessonCompletions, false)
  assert.equal(state.progress.lessonCompletions['lesson-u1-03'], '2026-11-06')
  assert.deepEqual(state.progress.favorites, ['vocab-annyeonghaseyo', 'vocab-gamsahamnida', 'vocab-jip'])
  assert.equal(state.progress.reviewCards.length, 3)
  assert.equal(state.progress.reviewCards[0].intervalIndex, 2)
  assert.deepEqual(state.progress.dailyXpAwards, { 'practice-match': '2026-11-10', 'practice-daily': '2026-11-10' })
  assert.equal(state.progress.history.length, 3)
  assert.equal(state.profile.name, 'Frank')
  // Fixture v3 com 15 min → aproxima para 10 min na escala atual
  assert.equal(state.profile.dailyGoalMinutes, 10)
  assert.equal(state.profile.darkMode, true)
  assert.equal(state.activityDraft, null)
  assert.deepEqual(current, snapshot, 'estado atual não foi mutado')
})

test('backup: remove favoritos e revisões sem correspondência ao aplicar', () => {
  const backup = sampleBackup()
  backup.state.progress.favorites.push('vocab-removido')
  backup.state.progress.reviewCards.push({ vocabId: 'vocab-fantasma', intervalIndex: 0, dueDate: '2026-11-11' })

  const result = core.applyImport(core.createEmptyState(), backup, { acknowledgeUnmatched: true, catalogIds })
  assert.equal(result.ok, true)
  assert.equal(result.state.progress.favorites.includes('vocab-removido'), false)
  assert.equal(result.state.progress.reviewCards.some((card) => card.vocabId === 'vocab-fantasma'), false)
  assert.equal(result.state.progress.favorites.length, 3)
  assert.equal(result.state.progress.reviewCards.length, 3)
})

test('backup: backup de versão anterior (v2) é migrado na importação', () => {
  const backupV2 = {
    format: 'nuri-progress',
    version: 2,
    exportedAt: '2026-06-01T00:00:00.000Z',
    state: { xp: 55, completed: ['lesson-u1-01'], favorites: ['vocab-ne'], reviews: [{ vocabId: 'vocab-ne', level: 1, due: '2026-06-05' }] },
  }
  const preview = core.previewImport(backupV2, catalogIds)
  assert.equal(preview.canImport, true)
  assert.equal(preview.sourceVersion, 2)
  assert.equal(preview.hasUnmatched, false)

  const result = core.applyImport(core.createEmptyState(), backupV2, { acknowledgeUnmatched: false, catalogIds })
  assert.equal(result.ok, true)
  assert.equal(result.state.version, 3)
  assert.equal(result.state.progress.xp, 55)
  assert.deepEqual(result.state.progress.completedLessons, ['lesson-u1-01'])
  assert.deepEqual(result.state.progress.favorites, ['vocab-ne'])
  assert.equal(result.state.progress.reviewCards[0].intervalIndex, 1)
})

test('backup: o arquivo de exemplo só contém IDs do catálogo, exceto o fantasma', () => {
  const backup = sampleBackup()
  const lessonIds = new Set(catalogIds.lessonIds)
  const unknownLessons = backup.state.progress.completedLessons.filter((id) => !lessonIds.has(id))
  assert.deepEqual(unknownLessons, ['lesson-old-removed'])
})
