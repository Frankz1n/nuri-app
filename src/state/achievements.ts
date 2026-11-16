import { LESSONS, UNITS } from '../data'
import type { NuriProgress } from '../core'

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  isUnlocked: (progress: NuriProgress) => boolean
}

const isUnitComplete = (progress: NuriProgress, unitNumber: number): boolean => {
  const unit = UNITS.find((candidate) => candidate.number === unitNumber)
  return unit !== undefined && unit.lessonIds.every((lessonId) => progress.completedLessons.includes(lessonId))
}

const countCompletedByKind = (progress: NuriProgress, kind: string): number =>
  LESSONS.filter((lesson) => lesson.kind === kind && progress.completedLessons.includes(lesson.id)).length

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { id: 'first-lesson', title: 'Primeiro passo', description: 'Conclua sua primeira aula.', isUnlocked: (p) => p.completedLessons.length >= 1 },
  { id: 'lessons-10', title: 'Pegando o ritmo', description: 'Conclua 10 aulas.', isUnlocked: (p) => p.completedLessons.length >= 10 },
  { id: 'lessons-30', title: 'Constância', description: 'Conclua 30 aulas.', isUnlocked: (p) => p.completedLessons.length >= 30 },
  { id: 'vowels-done', title: 'Vogais no bolso', description: 'Termine a unidade das vogais básicas.', isUnlocked: (p) => isUnitComplete(p, 1) },
  { id: 'alphabet-done', title: 'Hangul completo', description: 'Termine as unidades 1 a 3 do alfabeto.', isUnlocked: (p) => [1, 2, 3].every((n) => isUnitComplete(p, n)) },
  { id: 'first-reading', title: 'Leitor iniciante', description: 'Conclua uma aula de leitura.', isUnlocked: (p) => countCompletedByKind(p, 'reading') >= 1 },
  { id: 'streak-3', title: '3 dias seguidos', description: 'Estude 3 dias em sequência.', isUnlocked: (p) => p.streak >= 3 },
  { id: 'streak-7', title: 'Semana completa', description: 'Estude 7 dias em sequência.', isUnlocked: (p) => p.streak >= 7 },
  { id: 'xp-100', title: '100 XP', description: 'Acumule 100 XP.', isUnlocked: (p) => p.xp >= 100 },
  { id: 'xp-500', title: '500 XP', description: 'Acumule 500 XP.', isUnlocked: (p) => p.xp >= 500 },
  { id: 'favorites-5', title: 'Colecionador', description: 'Favorite 5 palavras.', isUnlocked: (p) => p.favorites.length >= 5 },
  { id: 'review-master', title: 'Memória firme', description: 'Leve um cartão ao intervalo máximo de revisão.', isUnlocked: (p) => p.reviewCards.some((card) => card.intervalIndex >= 4) },
]

export const findNewAchievementIds = (progress: NuriProgress): string[] =>
  ACHIEVEMENTS.filter((achievement) => !progress.achievements.includes(achievement.id) && achievement.isUnlocked(progress)).map(
    (achievement) => achievement.id,
  )
