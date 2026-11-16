export type AudioAvailability = 'ready' | 'unavailable' | 'loading' | 'error'

export interface AudioClip {
  audioKey: string
  /** URL blob/remoto quando o provider tiver o áudio. */
  url?: string
  durationMs?: number
  status: AudioAvailability
  message?: string
}

export interface PronunciationScore {
  overall: number
  feedback: string
  status: AudioAvailability
  message?: string
}

export interface ConversationTurn {
  role: 'assistant' | 'user'
  text: string
  audioKey?: string
}

export interface ConversationScenario {
  id: string
  title: string
  description: string
  prompt: string
}

export interface AudioProvider {
  readonly id: string
  getClip(audioKey: string): Promise<AudioClip>
  play?(audioKey: string): Promise<AudioClip>
}

export interface PronunciationProvider {
  readonly id: string
  analyze(params: { audioKey: string; referenceText: string; recordingBlob: Blob }): Promise<PronunciationScore>
}

export interface ConversationProvider {
  readonly id: string
  listScenarios(): ConversationScenario[]
  start(scenarioId: string): Promise<{ sessionId: string; opening: ConversationTurn }>
  reply(sessionId: string, userText: string): Promise<ConversationTurn>
}
