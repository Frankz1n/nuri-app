'use strict'

/**
 * Permite que testes CJS carreguem o código TypeScript real de `src/` (Node >= 22.18 remove os tipos
 * nativamente). O catálogo usa imports relativos sem extensão ("./letters"), que o Node não resolve;
 * este hook síncrono tenta `.ts` e `/index.ts` como fallback. Assim não há cópia da lógica nos testes.
 */
const { registerHooks } = require('node:module')

const isRelativeSpecifier = (specifier) => specifier.startsWith('./') || specifier.startsWith('../')
const hasExtension = (specifier) => /\.[cm]?[jt]sx?$|\.json$/.test(specifier)

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!isRelativeSpecifier(specifier) || hasExtension(specifier)) return nextResolve(specifier, context)

    const candidates = [`${specifier}.ts`, `${specifier.replace(/\/$/, '')}/index.ts`]
    for (const candidate of candidates) {
      try {
        return nextResolve(candidate, context)
      } catch (error) {
        if (error?.code !== 'ERR_MODULE_NOT_FOUND' && error?.code !== 'MODULE_NOT_FOUND') throw error
      }
    }
    return nextResolve(specifier, context)
  },
})

module.exports = {
  loadCore: () => require('../../src/core/index.ts'),
  loadCatalog: () => require('../../src/data/index.ts'),
  loadTsModule: (relativeFromRepoRoot) => require(`../../${relativeFromRepoRoot}`),
}
