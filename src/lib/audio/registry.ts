import { nullAudioProvider, nullConversationProvider, nullPronunciationProvider } from './nullProviders'
import type { AudioProvider, ConversationProvider, PronunciationProvider } from './types'

/**
 * Ponto único de integração futura:
 * - Troque `audioProvider` por um cliente ElevenLabs (TTS) ou arquivos em /audio.
 * - Troque `pronunciationProvider` por um analisador de pronúncia.
 * - Troque `conversationProvider` por um backend de conversação com IA.
 *
 * Enquanto forem os providers null, a UI mostra “em breve” sem pontuações simuladas.
 */
let audioProvider: AudioProvider = nullAudioProvider
let pronunciationProvider: PronunciationProvider = nullPronunciationProvider
let conversationProvider: ConversationProvider = nullConversationProvider

export const getAudioProvider = (): AudioProvider => audioProvider
export const getPronunciationProvider = (): PronunciationProvider => pronunciationProvider
export const getConversationProvider = (): ConversationProvider => conversationProvider

export const setAudioProvider = (provider: AudioProvider): void => {
  audioProvider = provider
}

export const setPronunciationProvider = (provider: PronunciationProvider): void => {
  pronunciationProvider = provider
}

export const setConversationProvider = (provider: ConversationProvider): void => {
  conversationProvider = provider
}

export const resetAudioProviders = (): void => {
  audioProvider = nullAudioProvider
  pronunciationProvider = nullPronunciationProvider
  conversationProvider = nullConversationProvider
}
