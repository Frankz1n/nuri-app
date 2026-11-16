import type { Letter, Phrase, Reading, VocabItem } from '../../data/types'

/** Chaves estáveis para mapear áudio (arquivos locais ou ElevenLabs) no futuro. */
export const letterAudioKey = (letter: Pick<Letter, 'id' | 'audioKey'>): string =>
  letter.audioKey ?? `letter:${letter.id}`

export const vocabAudioKey = (vocab: Pick<VocabItem, 'id' | 'audioKey'>): string =>
  vocab.audioKey ?? `vocab:${vocab.id}`

export const phraseAudioKey = (phrase: Pick<Phrase, 'id' | 'audioKey'>): string =>
  phrase.audioKey ?? `phrase:${phrase.id}`

export const readingLineAudioKey = (
  reading: Pick<Reading, 'id'>,
  lineIndex: number,
  line?: { audioKey?: string },
): string => line?.audioKey ?? `reading:${reading.id}:${lineIndex}`
