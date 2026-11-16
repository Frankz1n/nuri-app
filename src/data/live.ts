export const LIVE_UNIT_ID = 'unit-9'

export interface LiveLine {
  ko: string
  pt: string
}

export interface LiveSituation {
  id: string
  title: string
  context: string
  opening: LiveLine
  reply: LiveLine
  transfer: LiveLine
  focus: string
  letterId: string
  writingPrompt: string
  distractors: [string, string]
}

export const LIVE_SITUATIONS: readonly LiveSituation[] = [
  {
    id: 'live-cumprimentar',
    title: 'Cumprimente quem chegou',
    context: 'A transmissão começou e alguém falou com o público.',
    opening: { ko: '안녕하세요?', pt: 'Olá!' },
    reply: { ko: '안녕하세요! 반가워요.', pt: 'Olá! Prazer em conhecer você.' },
    transfer: { ko: '여러분, 안녕하세요!', pt: 'Olá, pessoal!' },
    focus: '안녕하세요',
    letterId: 'letter-ng',
    writingPrompt: 'Treine ㅇ, que aparece no começo do bloco 안.',
    distractors: ['Por favor, esperem um pouco.', 'Muito obrigado pela ajuda.'],
  },
  {
    id: 'live-som',
    title: 'Entenda o teste de som',
    context: 'A pessoa que está ao vivo quer testar o microfone.',
    opening: { ko: '제 목소리 들려요?', pt: 'Dá pra ouvir minha voz?' },
    reply: { ko: '네, 잘 들려요!', pt: 'Sim, dá pra ouvir bem!' },
    transfer: { ko: '지금 제 목소리 잘 들려요?', pt: 'Agora dá pra ouvir bem minha voz?' },
    focus: '들려요?',
    letterId: 'letter-m',
    writingPrompt: 'Treine ㅁ, que aparece no começo do bloco 목.',
    distractors: ['Dá pra ver minha câmera?', 'Vocês chegaram agora?'],
  },
  {
    id: 'live-agradecer',
    title: 'Agradeça a presença',
    context: 'A pessoa se dirige a quem veio assistir à transmissão.',
    opening: { ko: '와 주셔서 감사합니다.', pt: 'Obrigado por virem.' },
    reply: { ko: '저도 감사해요!', pt: 'Eu também agradeço!' },
    transfer: { ko: '오늘 와 주셔서 정말 감사합니다!', pt: 'Muito obrigado por virem hoje!' },
    focus: '감사합니다',
    letterId: 'letter-g',
    writingPrompt: 'Treine ㄱ, que aparece no começo do bloco 감.',
    distractors: ['A transmissão vai começar amanhã.', 'Por favor, falem mais devagar.'],
  },
]

export type LiveClipRole = 'opening' | 'reply' | 'transfer'
export const liveAudioKey = (id: string, role: LiveClipRole): string => `live:${id}:${role}`

export const getLiveSituation = (id: string): LiveSituation | undefined =>
  LIVE_SITUATIONS.find((situation) => situation.id === id)
