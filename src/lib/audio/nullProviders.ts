import type {
  AudioClip,
  AudioProvider,
  ConversationProvider,
  ConversationScenario,
  ConversationTurn,
  PronunciationProvider,
  PronunciationScore,
} from './types'

const UNAVAILABLE_AUDIO = 'Áudio em breve. Em breve conectamos a biblioteca de vozes.'
const UNAVAILABLE_PRONUNCIATION = 'Análise de pronúncia com IA em breve.'
const UNAVAILABLE_CONVERSATION = 'Conversação com IA em breve.'

export const CONVERSATION_SCENARIOS: readonly ConversationScenario[] = [
  {
    id: 'cafe',
    title: 'No café',
    description: 'Peça uma bebida e converse de forma educada.',
    prompt: 'Você está em um café em Seul. Peça algo para beber em coreano.',
  },
  {
    id: 'introduction',
    title: 'Apresentação',
    description: 'Diga seu nome, de onde você é e o que gosta.',
    prompt: 'Apresente-se a uma nova amizade em coreano.',
  },
  {
    id: 'drama-chat',
    title: 'Papo de dorama',
    description: 'Fale sobre séries e interesses em comum.',
    prompt: 'Converse sobre um dorama que você gostou, sem citar conteúdo oficial.',
  },
]

export const nullAudioProvider: AudioProvider = {
  id: 'null-audio',
  async getClip(audioKey: string): Promise<AudioClip> {
    return { audioKey, status: 'unavailable', message: UNAVAILABLE_AUDIO }
  },
  async play(audioKey: string): Promise<AudioClip> {
    return { audioKey, status: 'unavailable', message: UNAVAILABLE_AUDIO }
  },
}

export const nullPronunciationProvider: PronunciationProvider = {
  id: 'null-pronunciation',
  async analyze(): Promise<PronunciationScore> {
    return {
      overall: 0,
      feedback: '',
      status: 'unavailable',
      message: UNAVAILABLE_PRONUNCIATION,
    }
  },
}

export const nullConversationProvider: ConversationProvider = {
  id: 'null-conversation',
  listScenarios: () => [...CONVERSATION_SCENARIOS],
  async start(): Promise<{ sessionId: string; opening: ConversationTurn }> {
    throw new Error(UNAVAILABLE_CONVERSATION)
  },
  async reply(): Promise<ConversationTurn> {
    throw new Error(UNAVAILABLE_CONVERSATION)
  },
}
