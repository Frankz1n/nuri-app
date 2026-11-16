const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const MILLISECONDS_PER_DAY = 86_400_000

const padTwoDigits = (value: number): string => String(value).padStart(2, '0')

const parseDateKeyToUtcMilliseconds = (dateKey: string): number => {
  const match = DATE_KEY_PATTERN.exec(dateKey)
  if (!match) throw new RangeError(`Chave de data inválida: "${dateKey}" (esperado YYYY-MM-DD)`)

  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const utcMilliseconds = Date.UTC(year, month - 1, day)
  const roundTrip = new Date(utcMilliseconds)
  const isCalendarDate =
    roundTrip.getUTCFullYear() === year && roundTrip.getUTCMonth() === month - 1 && roundTrip.getUTCDate() === day
  if (!isCalendarDate) throw new RangeError(`Chave de data inexistente no calendário: "${dateKey}"`)

  return utcMilliseconds
}

const formatUtcMillisecondsAsDateKey = (utcMilliseconds: number): string => {
  const date = new Date(utcMilliseconds)
  return `${date.getUTCFullYear()}-${padTwoDigits(date.getUTCMonth() + 1)}-${padTwoDigits(date.getUTCDate())}`
}

export const isValidDateKey = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  try {
    parseDateKeyToUtcMilliseconds(value)
    return true
  } catch {
    return false
  }
}

/** Data local (não UTC) no formato YYYY-MM-DD. */
export const todayKey = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`

/** Aritmética em UTC puro: imune a horário de verão. */
export const addDays = (dateKey: string, days: number): string => {
  if (!Number.isInteger(days)) throw new RangeError(`Quantidade de dias deve ser inteira: ${days}`)
  return formatUtcMillisecondsAsDateKey(parseDateKeyToUtcMilliseconds(dateKey) + days * MILLISECONDS_PER_DAY)
}

/** Dias de `a` até `b` (positivo quando `b` é posterior). */
export const daysBetween = (a: string, b: string): number =>
  Math.round((parseDateKeyToUtcMilliseconds(b) - parseDateKeyToUtcMilliseconds(a)) / MILLISECONDS_PER_DAY)
