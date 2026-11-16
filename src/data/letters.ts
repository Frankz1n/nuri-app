import type { Letter, LetterGroup, StrokeModel, StrokePoint } from './types'

type Coordinate = readonly [number, number]

const point = (x: number, y: number): StrokePoint => ({ x, y })

const line = (x1: number, y1: number, x2: number, y2: number): StrokeModel => ({
  points: [point(x1, y1), point(x2, y2)],
})

const path = (...coordinates: Coordinate[]): StrokeModel => ({
  points: coordinates.map(([x, y]) => point(x, y)),
})

const closedPath = (...coordinates: Coordinate[]): StrokeModel => ({
  points: coordinates.map(([x, y]) => point(x, y)),
  closed: true,
})

const ring = (centerX: number, centerY: number, radius: number, segments = 16): StrokeModel => ({
  points: Array.from({ length: segments }, (_, index) => {
    const angle = (2 * Math.PI * index) / segments - Math.PI / 2
    return point(
      Number((centerX + radius * Math.cos(angle)).toFixed(3)),
      Number((centerY + radius * Math.sin(angle)).toFixed(3)),
    )
  }),
  closed: true,
})

interface LetterDefinition {
  id: string
  char: string
  name: string
  romanization: string
  group: LetterGroup
  exampleHangul: string
  exampleRomanization: string
  exampleTranslation: string
  strokes: StrokeModel[]
}

const defineLetter = (definition: LetterDefinition): Letter => ({
  id: definition.id,
  char: definition.char,
  name: definition.name,
  romanization: definition.romanization,
  group: definition.group,
  example: {
    hangul: definition.exampleHangul,
    romanization: definition.exampleRomanization,
    translation: definition.exampleTranslation,
  },
  strokes: definition.strokes,
})

export const LETTERS: readonly Letter[] = [
  // Vogais básicas (10)
  defineLetter({
    id: 'letter-a', char: 'ㅏ', name: 'A', romanization: 'a', group: 'vowel-basic',
    exampleHangul: '아이돌', exampleRomanization: 'aidol', exampleTranslation: 'ídolo (do K-pop)',
    strokes: [line(0.4, 0.1, 0.4, 0.9), line(0.4, 0.5, 0.8, 0.5)],
  }),
  defineLetter({
    id: 'letter-eo', char: 'ㅓ', name: 'Eo', romanization: 'eo', group: 'vowel-basic',
    exampleHangul: '어머니', exampleRomanization: 'eomeoni', exampleTranslation: 'mãe',
    strokes: [line(0.2, 0.5, 0.6, 0.5), line(0.6, 0.1, 0.6, 0.9)],
  }),
  defineLetter({
    id: 'letter-o', char: 'ㅗ', name: 'O', romanization: 'o', group: 'vowel-basic',
    exampleHangul: '오빠', exampleRomanization: 'oppa', exampleTranslation: 'irmão mais velho (dito por mulheres)',
    strokes: [line(0.5, 0.35, 0.5, 0.7), line(0.1, 0.7, 0.9, 0.7)],
  }),
  defineLetter({
    id: 'letter-u', char: 'ㅜ', name: 'U', romanization: 'u', group: 'vowel-basic',
    exampleHangul: '우유', exampleRomanization: 'uyu', exampleTranslation: 'leite',
    strokes: [line(0.1, 0.3, 0.9, 0.3), line(0.5, 0.3, 0.5, 0.65)],
  }),
  defineLetter({
    id: 'letter-eu', char: 'ㅡ', name: 'Eu', romanization: 'eu', group: 'vowel-basic',
    exampleHangul: '음악', exampleRomanization: 'eumak', exampleTranslation: 'música',
    strokes: [line(0.1, 0.5, 0.9, 0.5)],
  }),
  defineLetter({
    id: 'letter-i', char: 'ㅣ', name: 'I', romanization: 'i', group: 'vowel-basic',
    exampleHangul: '이름', exampleRomanization: 'ireum', exampleTranslation: 'nome',
    strokes: [line(0.5, 0.1, 0.5, 0.9)],
  }),
  defineLetter({
    id: 'letter-ya', char: 'ㅑ', name: 'Ya', romanization: 'ya', group: 'vowel-basic',
    exampleHangul: '야구', exampleRomanization: 'yagu', exampleTranslation: 'beisebol',
    strokes: [line(0.4, 0.1, 0.4, 0.9), line(0.4, 0.35, 0.8, 0.35), line(0.4, 0.65, 0.8, 0.65)],
  }),
  defineLetter({
    id: 'letter-yeo', char: 'ㅕ', name: 'Yeo', romanization: 'yeo', group: 'vowel-basic',
    exampleHangul: '여행', exampleRomanization: 'yeohaeng', exampleTranslation: 'viagem',
    strokes: [line(0.2, 0.35, 0.6, 0.35), line(0.2, 0.65, 0.6, 0.65), line(0.6, 0.1, 0.6, 0.9)],
  }),
  defineLetter({
    id: 'letter-yo', char: 'ㅛ', name: 'Yo', romanization: 'yo', group: 'vowel-basic',
    exampleHangul: '요리', exampleRomanization: 'yori', exampleTranslation: 'culinária / cozinhar',
    strokes: [line(0.35, 0.35, 0.35, 0.7), line(0.65, 0.35, 0.65, 0.7), line(0.1, 0.7, 0.9, 0.7)],
  }),
  defineLetter({
    id: 'letter-yu', char: 'ㅠ', name: 'Yu', romanization: 'yu', group: 'vowel-basic',
    exampleHangul: '유명', exampleRomanization: 'yumyeong', exampleTranslation: 'famoso(a)',
    strokes: [line(0.1, 0.3, 0.9, 0.3), line(0.35, 0.3, 0.35, 0.65), line(0.65, 0.3, 0.65, 0.65)],
  }),

  // Consoantes básicas (14)
  defineLetter({
    id: 'letter-g', char: 'ㄱ', name: 'Giyeok', romanization: 'g / k', group: 'consonant-basic',
    exampleHangul: '가수', exampleRomanization: 'gasu', exampleTranslation: 'cantor(a)',
    strokes: [path([0.15, 0.2], [0.8, 0.2], [0.8, 0.85])],
  }),
  defineLetter({
    id: 'letter-n', char: 'ㄴ', name: 'Nieun', romanization: 'n', group: 'consonant-basic',
    exampleHangul: '노래', exampleRomanization: 'norae', exampleTranslation: 'canção',
    strokes: [path([0.2, 0.15], [0.2, 0.8], [0.85, 0.8])],
  }),
  defineLetter({
    id: 'letter-d', char: 'ㄷ', name: 'Digeut', romanization: 'd / t', group: 'consonant-basic',
    exampleHangul: '드라마', exampleRomanization: 'deurama', exampleTranslation: 'drama (série)',
    strokes: [line(0.2, 0.2, 0.8, 0.2), path([0.2, 0.2], [0.2, 0.8], [0.8, 0.8])],
  }),
  defineLetter({
    id: 'letter-r', char: 'ㄹ', name: 'Rieul', romanization: 'r / l', group: 'consonant-basic',
    exampleHangul: '라면', exampleRomanization: 'ramyeon', exampleTranslation: 'lámen',
    strokes: [
      path([0.2, 0.15], [0.8, 0.15], [0.8, 0.45], [0.2, 0.45]),
      path([0.2, 0.45], [0.2, 0.85], [0.85, 0.85]),
    ],
  }),
  defineLetter({
    id: 'letter-m', char: 'ㅁ', name: 'Mieum', romanization: 'm', group: 'consonant-basic',
    exampleHangul: '무대', exampleRomanization: 'mudae', exampleTranslation: 'palco',
    strokes: [closedPath([0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8])],
  }),
  defineLetter({
    id: 'letter-b', char: 'ㅂ', name: 'Bieup', romanization: 'b / p', group: 'consonant-basic',
    exampleHangul: '바다', exampleRomanization: 'bada', exampleTranslation: 'mar',
    strokes: [
      line(0.25, 0.15, 0.25, 0.85),
      line(0.75, 0.15, 0.75, 0.85),
      line(0.25, 0.5, 0.75, 0.5),
      line(0.25, 0.85, 0.75, 0.85),
    ],
  }),
  defineLetter({
    id: 'letter-s', char: 'ㅅ', name: 'Siot', romanization: 's', group: 'consonant-basic',
    exampleHangul: '사랑', exampleRomanization: 'sarang', exampleTranslation: 'amor',
    strokes: [line(0.5, 0.2, 0.2, 0.85), line(0.5, 0.45, 0.8, 0.85)],
  }),
  defineLetter({
    id: 'letter-ng', char: 'ㅇ', name: 'Ieung', romanization: 'ng (final) / mudo (inicial)', group: 'consonant-basic',
    exampleHangul: '영화', exampleRomanization: 'yeonghwa', exampleTranslation: 'filme',
    strokes: [ring(0.5, 0.5, 0.3)],
  }),
  defineLetter({
    id: 'letter-j', char: 'ㅈ', name: 'Jieut', romanization: 'j', group: 'consonant-basic',
    exampleHangul: '주스', exampleRomanization: 'juseu', exampleTranslation: 'suco',
    strokes: [line(0.15, 0.2, 0.85, 0.2), line(0.5, 0.2, 0.2, 0.85), line(0.5, 0.45, 0.8, 0.85)],
  }),
  defineLetter({
    id: 'letter-ch', char: 'ㅊ', name: 'Chieut', romanization: 'ch', group: 'consonant-basic',
    exampleHangul: '춤', exampleRomanization: 'chum', exampleTranslation: 'dança',
    strokes: [
      line(0.5, 0.08, 0.5, 0.2),
      line(0.15, 0.3, 0.85, 0.3),
      line(0.5, 0.3, 0.2, 0.88),
      line(0.5, 0.52, 0.8, 0.88),
    ],
  }),
  defineLetter({
    id: 'letter-k', char: 'ㅋ', name: 'Kieuk', romanization: 'k', group: 'consonant-basic',
    exampleHangul: '카페', exampleRomanization: 'kape', exampleTranslation: 'café (lugar)',
    strokes: [path([0.15, 0.2], [0.8, 0.2], [0.8, 0.85]), line(0.15, 0.52, 0.8, 0.52)],
  }),
  defineLetter({
    id: 'letter-t', char: 'ㅌ', name: 'Tieut', romanization: 't', group: 'consonant-basic',
    exampleHangul: '택시', exampleRomanization: 'taeksi', exampleTranslation: 'táxi',
    strokes: [
      line(0.2, 0.2, 0.8, 0.2),
      path([0.2, 0.2], [0.2, 0.8], [0.8, 0.8]),
      line(0.2, 0.5, 0.75, 0.5),
    ],
  }),
  defineLetter({
    id: 'letter-p', char: 'ㅍ', name: 'Pieup', romanization: 'p', group: 'consonant-basic',
    exampleHangul: '팬', exampleRomanization: 'paen', exampleTranslation: 'fã',
    strokes: [
      line(0.1, 0.2, 0.9, 0.2),
      line(0.1, 0.8, 0.9, 0.8),
      line(0.35, 0.2, 0.35, 0.8),
      line(0.65, 0.2, 0.65, 0.8),
    ],
  }),
  defineLetter({
    id: 'letter-h', char: 'ㅎ', name: 'Hieut', romanization: 'h', group: 'consonant-basic',
    exampleHangul: '하늘', exampleRomanization: 'haneul', exampleTranslation: 'céu',
    strokes: [line(0.5, 0.08, 0.5, 0.2), line(0.2, 0.3, 0.8, 0.3), ring(0.5, 0.65, 0.22)],
  }),

  // Vogais compostas (11)
  defineLetter({
    id: 'letter-ae', char: 'ㅐ', name: 'Ae', romanization: 'ae', group: 'vowel-compound',
    exampleHangul: '새', exampleRomanization: 'sae', exampleTranslation: 'pássaro',
    strokes: [line(0.3, 0.1, 0.3, 0.9), line(0.3, 0.5, 0.55, 0.5), line(0.7, 0.1, 0.7, 0.9)],
  }),
  defineLetter({
    id: 'letter-e', char: 'ㅔ', name: 'E', romanization: 'e', group: 'vowel-compound',
    exampleHangul: '세계', exampleRomanization: 'segye', exampleTranslation: 'mundo',
    strokes: [line(0.15, 0.5, 0.4, 0.5), line(0.4, 0.1, 0.4, 0.9), line(0.7, 0.1, 0.7, 0.9)],
  }),
  defineLetter({
    id: 'letter-yae', char: 'ㅒ', name: 'Yae', romanization: 'yae', group: 'vowel-compound',
    exampleHangul: '얘기', exampleRomanization: 'yaegi', exampleTranslation: 'conversa / história',
    strokes: [
      line(0.3, 0.1, 0.3, 0.9),
      line(0.3, 0.35, 0.55, 0.35),
      line(0.3, 0.65, 0.55, 0.65),
      line(0.7, 0.1, 0.7, 0.9),
    ],
  }),
  defineLetter({
    id: 'letter-ye', char: 'ㅖ', name: 'Ye', romanization: 'ye', group: 'vowel-compound',
    exampleHangul: '예쁘다', exampleRomanization: 'yeppeuda', exampleTranslation: 'ser bonito(a)',
    strokes: [
      line(0.12, 0.35, 0.38, 0.35),
      line(0.12, 0.65, 0.38, 0.65),
      line(0.38, 0.1, 0.38, 0.9),
      line(0.7, 0.1, 0.7, 0.9),
    ],
  }),
  defineLetter({
    id: 'letter-wa', char: 'ㅘ', name: 'Wa', romanization: 'wa', group: 'vowel-compound',
    exampleHangul: '과자', exampleRomanization: 'gwaja', exampleTranslation: 'biscoito / petisco',
    strokes: [
      line(0.28, 0.4, 0.28, 0.65),
      line(0.08, 0.65, 0.5, 0.65),
      line(0.68, 0.1, 0.68, 0.9),
      line(0.68, 0.5, 0.9, 0.5),
    ],
  }),
  defineLetter({
    id: 'letter-wae', char: 'ㅙ', name: 'Wae', romanization: 'wae', group: 'vowel-compound',
    exampleHangul: '왜', exampleRomanization: 'wae', exampleTranslation: 'por quê?',
    strokes: [
      path([0.25, 0.4], [0.25, 0.65], [0.05, 0.65], [0.45, 0.65]),
      line(0.58, 0.1, 0.58, 0.9),
      line(0.58, 0.5, 0.78, 0.5),
      line(0.9, 0.1, 0.9, 0.9),
    ],
  }),
  defineLetter({
    id: 'letter-oe', char: 'ㅚ', name: 'Oe', romanization: 'oe', group: 'vowel-compound',
    exampleHangul: '회사', exampleRomanization: 'hoesa', exampleTranslation: 'empresa',
    strokes: [line(0.3, 0.4, 0.3, 0.65), line(0.1, 0.65, 0.55, 0.65), line(0.75, 0.1, 0.75, 0.9)],
  }),
  defineLetter({
    id: 'letter-wo', char: 'ㅝ', name: 'Wo', romanization: 'wo', group: 'vowel-compound',
    exampleHangul: '뭐', exampleRomanization: 'mwo', exampleTranslation: 'o quê?',
    strokes: [
      line(0.05, 0.3, 0.45, 0.3),
      line(0.25, 0.3, 0.25, 0.55),
      line(0.55, 0.5, 0.72, 0.5),
      line(0.72, 0.1, 0.72, 0.9),
    ],
  }),
  defineLetter({
    id: 'letter-we', char: 'ㅞ', name: 'We', romanization: 'we', group: 'vowel-compound',
    exampleHangul: '웨이터', exampleRomanization: 'weiteo', exampleTranslation: 'garçom',
    strokes: [
      path([0.05, 0.3], [0.45, 0.3], [0.25, 0.3], [0.25, 0.55]),
      line(0.5, 0.5, 0.65, 0.5),
      line(0.65, 0.1, 0.65, 0.9),
      line(0.9, 0.1, 0.9, 0.9),
    ],
  }),
  defineLetter({
    id: 'letter-wi', char: 'ㅟ', name: 'Wi', romanization: 'wi', group: 'vowel-compound',
    exampleHangul: '귀', exampleRomanization: 'gwi', exampleTranslation: 'orelha',
    strokes: [line(0.1, 0.3, 0.55, 0.3), line(0.32, 0.3, 0.32, 0.6), line(0.75, 0.1, 0.75, 0.9)],
  }),
  defineLetter({
    id: 'letter-ui', char: 'ㅢ', name: 'Ui', romanization: 'ui', group: 'vowel-compound',
    exampleHangul: '의자', exampleRomanization: 'uija', exampleTranslation: 'cadeira',
    strokes: [line(0.1, 0.6, 0.6, 0.6), line(0.75, 0.1, 0.75, 0.9)],
  }),

  // Consoantes duplas (5)
  defineLetter({
    id: 'letter-kk', char: 'ㄲ', name: 'Ssanggiyeok', romanization: 'kk', group: 'consonant-double',
    exampleHangul: '꿈', exampleRomanization: 'kkum', exampleTranslation: 'sonho',
    strokes: [
      path([0.08, 0.2], [0.42, 0.2], [0.42, 0.85]),
      path([0.58, 0.2], [0.92, 0.2], [0.92, 0.85]),
    ],
  }),
  defineLetter({
    id: 'letter-tt', char: 'ㄸ', name: 'Ssangdigeut', romanization: 'tt', group: 'consonant-double',
    exampleHangul: '떡볶이', exampleRomanization: 'tteokbokki', exampleTranslation: 'bolinho de arroz picante',
    strokes: [
      line(0.08, 0.2, 0.42, 0.2),
      path([0.08, 0.2], [0.08, 0.8], [0.42, 0.8]),
      line(0.58, 0.2, 0.92, 0.2),
      path([0.58, 0.2], [0.58, 0.8], [0.92, 0.8]),
    ],
  }),
  defineLetter({
    id: 'letter-pp', char: 'ㅃ', name: 'Ssangbieup', romanization: 'pp', group: 'consonant-double',
    exampleHangul: '아빠', exampleRomanization: 'appa', exampleTranslation: 'papai',
    strokes: [
      path([0.08, 0.15], [0.08, 0.85], [0.42, 0.85], [0.42, 0.15]),
      line(0.08, 0.5, 0.42, 0.5),
      path([0.58, 0.15], [0.58, 0.85], [0.92, 0.85], [0.92, 0.15]),
      line(0.58, 0.5, 0.92, 0.5),
    ],
  }),
  defineLetter({
    id: 'letter-ss', char: 'ㅆ', name: 'Ssangsiot', romanization: 'ss', group: 'consonant-double',
    exampleHangul: '쌀', exampleRomanization: 'ssal', exampleTranslation: 'arroz (cru)',
    strokes: [
      line(0.3, 0.2, 0.1, 0.85),
      line(0.3, 0.45, 0.5, 0.85),
      line(0.7, 0.2, 0.5, 0.85),
      line(0.7, 0.45, 0.9, 0.85),
    ],
  }),
  defineLetter({
    id: 'letter-jj', char: 'ㅉ', name: 'Ssangjieut', romanization: 'jj', group: 'consonant-double',
    exampleHangul: '짜장면', exampleRomanization: 'jjajangmyeon', exampleTranslation: 'macarrão com molho de feijão preto',
    strokes: [
      line(0.05, 0.2, 0.47, 0.2),
      path([0.05, 0.85], [0.26, 0.25], [0.47, 0.85]),
      line(0.53, 0.2, 0.95, 0.2),
      path([0.53, 0.85], [0.74, 0.25], [0.95, 0.85]),
    ],
  }),
]

export const getLetterById = (letterId: string): Letter | undefined =>
  LETTERS.find((letter) => letter.id === letterId)

export const getLettersByGroup = (group: LetterGroup): Letter[] =>
  LETTERS.filter((letter) => letter.group === group)
