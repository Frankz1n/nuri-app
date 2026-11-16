import { ALL_LIVE_SITUATIONS, LIVE_SITUATIONS, LESSONS, UNITS } from '../data'
import type { Lesson, Unit } from '../data'
import { findNextLesson, getLessonsOfUnit, getUnitOfLesson, summarizeUnit } from './catalog'
import type { PracticeMode } from './session'

export interface GuidedStudyPlan {
  nextLesson?: Lesson
  currentUnit?: Unit
  unitSummary: { completed: number; total: number }
  phaseLabel: string
  phaseHint: string
  suggestedPractice: {
    href: string
    title: string
    reason: string
  }
}

const PHASE_BY_UNIT: Readonly<Record<number, { label: string; hint: string }>> = {
  1: { label: 'Letras e sons', hint: 'Agora o foco é reconhecer e escrever as vogais.' },
  2: { label: 'Letras e sons', hint: 'Consoantes entram na trilha; continue letra a letra.' },
  3: { label: 'Letras e sons', hint: 'Vogais compostas e consoantes duplas ampliam o hangul.' },
  4: { label: 'Sílabas', hint: 'Você junta letras em blocos e conhece o batchim.' },
  5: { label: 'Palavras e conversa', hint: 'Saudações e pessoas: o coreano começa a fazer sentido.' },
  6: { label: 'Palavras do dia a dia', hint: 'Vocabulário para situações reais.' },
  7: { label: 'Seu mundo', hint: 'Cultura, viagem e interesses em coreano.' },
  10: { label: 'Trechos do BTS', hint: 'Escute trechos, confira o sentido e pratique uma resposta.' },
  9: { label: 'Escuta e fala', hint: 'Reconheça expressões de uma live e pratique suas respostas.' },
  8: { label: 'Frases e leitura', hint: 'Montar frases e ler textos curtos com compreensão.' },
}

const LIVE_PRACTICE = {
  href: `#/lesson/${LIVE_SITUATIONS[0].id}`,
  title: 'Ouça e responda',
  reason: 'Pratique expressões que você pode encontrar numa transmissão.',
}

const PRACTICE_FOR_KIND: Readonly<Record<Lesson['kind'], GuidedStudyPlan['suggestedPractice']>> = {
  live: LIVE_PRACTICE,
  letter: {
    href: '#/practice/write',
    title: 'Escrita guiada',
    reason: 'Reforce os traços das letras que você acabou de ver.',
  },
  review: {
    href: '#/practice/pairs',
    title: 'Encontrar pares',
    reason: 'Revise o que já estudou com um exercício rápido.',
  },
  syllable: {
    href: '#/practice/syllables',
    title: 'Montar sílabas',
    reason: 'Pratique juntar consoante e vogal em blocos.',
  },
  batchim: {
    href: '#/practice/syllables',
    title: 'Montar sílabas',
    reason: 'Treine blocos com consoante final.',
  },
  vocab: {
    href: '#/practice/cards',
    title: 'Cartões de revisão',
    reason: 'Guarde as palavras novas na memória de longo prazo.',
  },
  phrase: {
    href: '#/practice/phrases',
    title: 'Organizar frases',
    reason: 'Monte frases com peças, sem teclado coreano.',
  },
  reading: {
    href: '#/practice/reading',
    title: 'Leitura guiada',
    reason: 'Leia de novo e responda às perguntas com calma.',
  },
}

export const buildGuidedStudyPlan = (completedLessons: readonly string[]): GuidedStudyPlan => {
  const nextLesson = findNextLesson(completedLessons)
  const lastCompleted = [...LESSONS].reverse().find((lesson) => completedLessons.includes(lesson.id))
  const currentUnit = nextLesson ? getUnitOfLesson(nextLesson) : lastCompleted ? getUnitOfLesson(lastCompleted) : UNITS[0]
  const phase = currentUnit ? PHASE_BY_UNIT[currentUnit.number] : undefined
  const suggestedPractice = nextLesson?.kind === 'live'
    ? { ...LIVE_PRACTICE, href: `#/lesson/${nextLesson.id}`, title: nextLesson.title }
    : lastCompleted ? PRACTICE_FOR_KIND[lastCompleted.kind] : LIVE_PRACTICE

  return {
    nextLesson,
    currentUnit,
    unitSummary: currentUnit ? summarizeUnit(currentUnit, completedLessons) : { completed: 0, total: 0 },
    phaseLabel: phase?.label ?? 'Sua trilha',
    phaseHint: phase?.hint ?? 'Siga a próxima aula sugerida.',
    suggestedPractice,
  }
}

export const getCurrentUnitLessons = (unit: Unit | undefined): Lesson[] => (unit ? getLessonsOfUnit(unit) : [])

export type PracticePillarId = 'write' | 'sound' | 'read'

export const PRACTICE_PILLARS: readonly {
  id: PracticePillarId
  title: string
  text: string
  modes?: readonly PracticeMode[]
  links?: readonly { href: string; title: string; description: string; chip?: string }[]
}[] = [
  {
    id: 'sound',
    title: 'Ouvir e falar',
    text: 'Escute e responda em situações de live.',
    links: ALL_LIVE_SITUATIONS.map((situation) => ({
      href: `#/lesson/${situation.id}`,
      title: situation.title,
      description: situation.context,
    })),
  },
  {
    id: 'write',
    title: 'Escrever',
    text: 'Traços, sílabas, pares e frases.',
    modes: ['write', 'syllables', 'pairs', 'blocks', 'phrases'],
  },
  {
    id: 'read',
    title: 'Ler e revisar',
    text: 'Textos, cartões, desafio e erros.',
    modes: ['reading', 'cards', 'daily', 'errors'],
  },
]

export const pillarForSuggestedHref = (href: string): PracticePillarId => {
  if (href.includes('/lesson/live-') || href.includes('/listen') || href.includes('/pronounce') || href.includes('/converse')) return 'sound'
  if (href.includes('/reading') || href.includes('/cards') || href.includes('/daily') || href.includes('/errors')) return 'read'
  return 'write'
}
