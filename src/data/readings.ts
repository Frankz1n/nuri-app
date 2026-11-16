import type { Reading } from './types'

export const READINGS: readonly Reading[] = [
  {
    id: 'reading-nova-amizade',
    title: 'Uma nova amizade',
    lines: [
      { ko: '안녕하세요? 저는 민지예요.', pt: 'Olá! Eu sou a Minji.' },
      { ko: '만나서 반갑습니다.', pt: 'Prazer em conhecer você.' },
      { ko: '저는 학생이에요. 한국어를 공부해요.', pt: 'Eu sou estudante. Estudo coreano.' },
      { ko: '우리는 친구예요.', pt: 'Nós somos amigos.' },
    ],
    questions: [
      {
        prompt: 'Quem é a Minji?',
        options: ['Uma estudante', 'Uma professora', 'Uma cantora'],
        answerIndex: 0,
      },
      {
        prompt: 'O que a Minji estuda?',
        options: ['Inglês', 'Coreano', 'Música'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'reading-pausa-cafe',
    title: 'Uma pausa no café',
    lines: [
      { ko: '지금 카페에 있어요.', pt: 'Agora estou no café.' },
      { ko: '저는 커피를 마셔요.', pt: 'Eu bebo café.' },
      { ko: '친구는 물을 마셔요.', pt: 'Meu amigo bebe água.' },
      { ko: '카페에서 음악을 들어요.', pt: 'No café, ouvimos música.' },
    ],
    questions: [
      {
        prompt: 'Onde eles estão?',
        options: ['Em casa', 'Na escola', 'No café'],
        answerIndex: 2,
      },
      {
        prompt: 'O que o amigo bebe?',
        options: ['Água', 'Café', 'Leite'],
        answerIndex: 0,
      },
    ],
  },
  {
    id: 'reading-interesse-comum',
    title: 'Um interesse em comum',
    lines: [
      { ko: '저는 음악을 좋아해요.', pt: 'Eu gosto de música.' },
      { ko: '친구도 음악을 좋아해요?', pt: 'Seu amigo também gosta de música?' },
      { ko: '네, 저도 노래를 좋아해요.', pt: 'Sim, eu também gosto de canções.' },
      { ko: '우리는 같이 춤을 춰요.', pt: 'Nós dançamos juntos.' },
    ],
    questions: [
      {
        prompt: 'O que os dois têm em comum?',
        options: ['Gostam de música', 'Gostam de viajar', 'Gostam de cozinhar'],
        answerIndex: 0,
      },
      {
        prompt: 'O que eles fazem juntos?',
        options: ['Estudam', 'Dançam', 'Cozinham'],
        answerIndex: 1,
      },
    ],
  },
]

export const getReadingById = (readingId: string): Reading | undefined =>
  READINGS.find((reading) => reading.id === readingId)
