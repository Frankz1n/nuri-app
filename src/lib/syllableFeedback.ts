import { HORIZONTAL_VOWELS, VERTICAL_VOWELS, composeFromJamo, decomposeSyllable } from './hangul'
import type { SyllableLayout } from './steps'

export const layoutForMedial = (medial: string, hasFinal = false): SyllableLayout => {
  if (hasFinal) return 'batchim'
  if (HORIZONTAL_VOWELS.includes(medial)) return 'horizontal-below'
  if (VERTICAL_VOWELS.includes(medial)) return 'vertical-right'
  return 'neutral'
}

export const layoutForSyllable = (syllable: string): SyllableLayout => {
  const parts = decomposeSyllable(syllable)
  if (!parts) return 'neutral'
  return layoutForMedial(parts.medial, Boolean(parts.final))
}

/** Mensagem concreta quando as peças certas estão na ordem errada ou a montagem falha. */
export const explainAssembleMistake = (selected: readonly string[], answer: readonly string[]): string => {
  const expected = composeFromJamo(answer)
  const samePieces =
    selected.length === answer.length &&
    [...selected].sort().join('\0') === [...answer].sort().join('\0')

  if (samePieces) {
    const parts = decomposeSyllable(expected)
    if (parts?.final) {
      return `Monte na ordem: ${parts.initial}, depois ${parts.medial}, e ${parts.final} embaixo.`
    }
    if (parts && HORIZONTAL_VOWELS.includes(parts.medial)) {
      return `Nesta sílaba, ${parts.medial} fica embaixo de ${parts.initial}.`
    }
    if (parts && VERTICAL_VOWELS.includes(parts.medial)) {
      return `Nesta sílaba, ${parts.medial} fica à direita de ${parts.initial}.`
    }
    return `A ordem importa: tente ${answer.join(' → ')}.`
  }

  const composedAttempt = composeFromJamo(selected)
  if (composedAttempt !== selected.join('') && composedAttempt !== expected) {
    return `Você montou ${composedAttempt}, mas o alvo é outra sílaba. Confira as peças.`
  }
  return `Use as peças certas na ordem do bloco. Exemplo esperado: ${answer.join(' + ')} → ${expected}.`
}
