export const XP_LESSON_FIRST = 20

/** XP concedido no máximo uma vez por dia para cada tipo de atividade de prática. */
export const DAILY_XP_RULES = {
  'practice-match': 5,
  'practice-daily': 10,
  'practice-cards': 5,
  'practice-listen': 5,
  'practice-write': 5,
  'practice-syllables': 5,
  'practice-phrases': 5,
  'practice-blocks': 5,
  'practice-reading': 10,
  'practice-errors': 5,
} as const

export type DailyRewardKey = keyof typeof DAILY_XP_RULES

export const isDailyRewardKey = (rewardKey: string): rewardKey is DailyRewardKey =>
  Object.hasOwn(DAILY_XP_RULES, rewardKey)

export const canAwardLessonXp = (completedLessonIds: readonly string[], lessonId: string): boolean =>
  !completedLessonIds.includes(lessonId)

export const lessonXpAward = (completedLessonIds: readonly string[], lessonId: string): number =>
  canAwardLessonXp(completedLessonIds, lessonId) ? XP_LESSON_FIRST : 0

export const canAwardDailyXp = (
  lastAwardedDay: Readonly<Record<string, string>>,
  rewardKey: string,
  today: string,
): boolean => {
  if (!isDailyRewardKey(rewardKey)) return false
  return lastAwardedDay[rewardKey] !== today
}

export const dailyXpAmount = (rewardKey: string): number =>
  isDailyRewardKey(rewardKey) ? DAILY_XP_RULES[rewardKey] : 0

export const awardDailyXp = (
  lastAwardedDay: Readonly<Record<string, string>>,
  rewardKey: string,
  today: string,
): Record<string, string> => {
  if (!canAwardDailyXp(lastAwardedDay, rewardKey, today)) return { ...lastAwardedDay }
  return { ...lastAwardedDay, [rewardKey]: today }
}
