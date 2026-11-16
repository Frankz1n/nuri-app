import type { Phrase } from './types'

export const PHRASES: readonly Phrase[] = [
  {
    id: 'phrase-1',
    pieces: ['저는', '학생', '입니다'],
    translation: 'Eu sou estudante.',
    patternNote: 'Em coreano o verbo vem no fim: [tópico] + [substantivo] + 입니다.',
  },
  {
    id: 'phrase-2',
    pieces: ['저는', '물을', '마셔요'],
    translation: 'Eu bebo água.',
    patternNote: 'A partícula 을/를 marca o objeto da ação.',
  },
  {
    id: 'phrase-3',
    pieces: ['친구가', '학교에', '가요'],
    translation: 'Meu amigo vai à escola.',
    patternNote: 'A partícula 에 indica destino; 가 marca o sujeito.',
  },
  {
    id: 'phrase-4',
    pieces: ['저는', '음악을', '좋아해요'],
    translation: 'Eu gosto de música.',
    patternNote: 'Sujeito + objeto + verbo: a ordem básica do coreano.',
  },
  {
    id: 'phrase-5',
    pieces: ['오늘', '날씨가', '좋아요'],
    translation: 'O tempo está bom hoje.',
    patternNote: 'Palavras de tempo, como 오늘, costumam abrir a frase.',
  },
  {
    id: 'phrase-6',
    pieces: ['우리는', '카페에', '가요'],
    translation: 'Nós vamos ao café.',
    patternNote: 'A partícula 는 destaca o tópico da frase.',
  },
  {
    id: 'phrase-7',
    pieces: ['저는', '한국어를', '공부해요'],
    translation: 'Eu estudo coreano.',
    patternNote: 'Depois de vogal usa-se 를; depois de consoante usa-se 을.',
  },
  {
    id: 'phrase-8',
    pieces: ['이것은', '책', '입니다'],
    translation: 'Isto é um livro.',
    patternNote: '이것 significa "isto"; combine com 은/는 e 입니다.',
  },
]

export const getPhraseById = (phraseId: string): Phrase | undefined =>
  PHRASES.find((phrase) => phrase.id === phraseId)
