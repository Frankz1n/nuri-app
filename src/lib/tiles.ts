import { composeFromJamo } from './hangul'
import type { TilesStep } from './steps'

export const joinTiles = (values: readonly string[], mode: TilesStep['join']): string =>
  mode === 'jamo' ? composeFromJamo(values) : values.join(mode)

export const areTilesEqual = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index])
