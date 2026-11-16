export type Random = () => number

export const hashSeed = (text: string): number =>
  [...text].reduce((hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261)

/** mulberry32: gerador determinístico (mesma semente, mesma sequência). */
export const createRandom = (seed: number): Random => {
  let current = seed >>> 0
  return () => {
    current = (current + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(current ^ (current >>> 15), current | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

export const createSessionId = (): string => `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`

export const createSessionRandom = (): Random => createRandom(hashSeed(createSessionId()))

export const shuffle = <T>(items: readonly T[], random: Random): T[] => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export const sample = <T>(items: readonly T[], count: number, random: Random): T[] =>
  shuffle(items, random).slice(0, count)

/** Embaralha garantindo (quando possível) que a ordem final difere da original. */
export const shuffleDifferent = <T>(items: readonly T[], random: Random): T[] => {
  const isSameOrder = (candidate: readonly T[]): boolean => candidate.every((item, index) => item === items[index])
  const candidates = Array.from({ length: 6 }, () => shuffle(items, random))
  return candidates.find((candidate) => !isSameOrder(candidate)) ?? candidates[0]
}
