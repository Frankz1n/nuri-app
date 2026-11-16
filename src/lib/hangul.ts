const INITIALS = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ']
const MEDIALS = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ']
const FINALS = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ']

const SYLLABLE_BASE = 0xac00
const SYLLABLE_LAST = 0xd7a3
const MEDIAL_COUNT = MEDIALS.length
const FINAL_COUNT = FINALS.length

/** Vogais escritas à direita da consoante / abaixo dela. */
export const VERTICAL_VOWELS: readonly string[] = [...'ㅏㅐㅑㅒㅓㅔㅕㅖㅣ']
export const HORIZONTAL_VOWELS: readonly string[] = [...'ㅗㅛㅜㅠㅡ']

export interface SyllableParts {
  initial: string
  medial: string
  final: string
}

export const isHangulSyllable = (character: string): boolean => {
  const codePoint = character.codePointAt(0)
  return codePoint !== undefined && codePoint >= SYLLABLE_BASE && codePoint <= SYLLABLE_LAST
}

export const composeSyllable = (initial: string, medial: string, final = ''): string | null => {
  const initialIndex = INITIALS.indexOf(initial)
  const medialIndex = MEDIALS.indexOf(medial)
  const finalIndex = FINALS.indexOf(final)
  if (initialIndex < 0 || medialIndex < 0 || finalIndex < 0) return null
  return String.fromCodePoint(SYLLABLE_BASE + (initialIndex * MEDIAL_COUNT + medialIndex) * FINAL_COUNT + finalIndex)
}

export const decomposeSyllable = (character: string): SyllableParts | null => {
  if (!isHangulSyllable(character)) return null
  const offset = (character.codePointAt(0) ?? SYLLABLE_BASE) - SYLLABLE_BASE
  return {
    initial: INITIALS[Math.floor(offset / (MEDIAL_COUNT * FINAL_COUNT))],
    medial: MEDIALS[Math.floor(offset / FINAL_COUNT) % MEDIAL_COUNT],
    final: FINALS[offset % FINAL_COUNT],
  }
}

/** Lista de peças (consoante, vogal[, final]) -> bloco; peças incompletas ficam lado a lado. */
export const composeFromJamo = (pieces: readonly string[]): string => {
  const [initial, medial, final] = pieces
  if (pieces.length < 2 || pieces.length > 3) return pieces.join('')
  return composeSyllable(initial, medial, final ?? '') ?? pieces.join('')
}

export const isKoreanText = (text: string): boolean => /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7a3]/.test(text)
