/**
 * Valida um backup nuri-progress v3 contra o catálogo atual.
 * Uso: node scripts/validate-v3-backup.mjs [caminho-do-backup.json]
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { loadCore, loadCatalog } = require('../tests/helpers/load-ts.cjs')

const backupPath = resolve(process.argv[2] ?? 'tests/fixtures/nuri-progress-v3-sample.json')

const { previewImport, applyImport, createEmptyState } = loadCore()
const { LESSONS, VOCABULARY } = loadCatalog()

const fixture = JSON.parse(readFileSync(backupPath, 'utf8'))
const catalogIds = {
  lessonIds: LESSONS.map((lesson) => lesson.id),
  vocabIds: VOCABULARY.map((vocab) => vocab.id),
}

const preview = previewImport(fixture, catalogIds)
const before = createEmptyState()
const refused = applyImport(before, fixture, { acknowledgeUnmatched: false, catalogIds })
const applied = applyImport(before, fixture, { acknowledgeUnmatched: true, catalogIds })

const result = {
  backupPath,
  canImport: preview.canImport,
  hasUnmatched: preview.hasUnmatched,
  unmatched: preview.unmatched,
  summary: preview.summary,
  refusedWithoutAck: { ok: refused.ok, reason: refused.ok ? null : refused.reason ?? refused.message },
  appliedWithAck: applied.ok
    ? {
        ok: true,
        xp: applied.state.progress.xp,
        completedLessons: applied.state.progress.completedLessons,
        favorites: applied.state.progress.favorites,
        reviewVocabIds: applied.state.progress.reviewCards.map((card) => card.vocabId),
      }
    : { ok: false, reason: applied.reason ?? applied.message },
}

console.log(JSON.stringify(result, null, 2))

if (!preview.canImport || !applied.ok) {
  process.exitCode = 1
}
