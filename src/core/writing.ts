import type { StrokeModel, StrokePoint } from '../data/types.ts'

export type WritingIssueCode =
  | 'ok'
  | 'no-model'
  | 'no-strokes'
  | 'missing-strokes'
  | 'extra-strokes'
  | 'wrong-order'
  | 'wrong-direction'
  | 'wrong-start'
  | 'wrong-end'
  | 'wrong-shape'
  | 'not-closed'
  | 'wrong-size'

export interface WritingResult {
  ok: boolean
  message: string
  code: WritingIssueCode
  /** Índice (base 0) do traço do usuário que causou o problema, quando aplicável. */
  strokeIndex?: number
}

export interface WritingOptions {
  /** Distância máxima (0-1) entre início/fim do traço e do modelo. */
  endpointTolerance?: number
  /** Distância média máxima (0-1) entre os pontos amostrados do traço e do modelo. */
  pathTolerance?: number
  /** Distância máxima entre início e fim de um traço que deveria ser fechado. */
  closureTolerance?: number
  /** Quantidade de pontos usados para comparar os caminhos. */
  sampleCount?: number
  /** Traços menores que isso (comprimento total) são tratados como toques acidentais. */
  minimumStrokeLength?: number
}

type Stroke = readonly StrokePoint[]

interface ResolvedOptions {
  endpointTolerance: number
  pathTolerance: number
  closureTolerance: number
  sampleCount: number
  minimumStrokeLength: number
}

const DEFAULT_OPTIONS: ResolvedOptions = {
  endpointTolerance: 0.22,
  pathTolerance: 0.22,
  closureTolerance: 0.2,
  sampleCount: 24,
  minimumStrokeLength: 0.03,
}

/** Desvio máximo permitido em qualquer ponto, relativo à tolerância média. */
const MAX_DEVIATION_FACTOR = 1.8
const MINIMUM_CLOSED_AREA = 0.002
const SIZE_RATIO_LIMIT = 1.6

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value))

const distanceBetween = (a: StrokePoint, b: StrokePoint): number => Math.hypot(a.x - b.x, a.y - b.y)

const sanitizeStroke = (stroke: Stroke): StrokePoint[] =>
  stroke
    .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
    .map((point) => ({ x: clampUnit(point.x), y: clampUnit(point.y) }))

const pathLength = (points: Stroke, isClosed: boolean): number => {
  const openLength = points.slice(1).reduce((total, point, index) => total + distanceBetween(points[index], point), 0)
  if (!isClosed || points.length < 2) return openLength
  return openLength + distanceBetween(points[points.length - 1], points[0])
}

const resample = (points: Stroke, sampleCount: number, isClosed: boolean): StrokePoint[] => {
  const outline = isClosed && points.length > 1 ? [...points, points[0]] : [...points]
  const cumulative = outline.reduce<number[]>(
    (lengths, point, index) => [...lengths, index === 0 ? 0 : lengths[index - 1] + distanceBetween(outline[index - 1], point)],
    [],
  )
  const totalLength = cumulative[cumulative.length - 1] ?? 0
  if (totalLength === 0) return Array.from({ length: sampleCount }, () => outline[0])

  const divisions = isClosed ? sampleCount : sampleCount - 1
  let segmentIndex = 1
  return Array.from({ length: sampleCount }, (_, sampleIndex) => {
    const targetLength = (totalLength * sampleIndex) / divisions
    while (segmentIndex < outline.length - 1 && cumulative[segmentIndex] < targetLength) segmentIndex += 1
    const segmentStart = cumulative[segmentIndex - 1]
    const segmentSpan = cumulative[segmentIndex] - segmentStart
    const ratio = segmentSpan === 0 ? 0 : (targetLength - segmentStart) / segmentSpan
    const from = outline[segmentIndex - 1]
    const to = outline[segmentIndex]
    return { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio }
  })
}

interface Deviation {
  mean: number
  max: number
}

const measureDeviation = (a: Stroke, b: Stroke): Deviation => {
  const distances = a.map((point, index) => distanceBetween(point, b[index]))
  return {
    mean: distances.reduce((sum, distance) => sum + distance, 0) / distances.length,
    max: Math.max(...distances),
  }
}

const isBetterDeviation = (candidate: Deviation, current: Deviation): boolean => candidate.mean < current.mean

const fitsTolerance = (deviation: Deviation, options: ResolvedOptions): boolean =>
  deviation.mean <= options.pathTolerance && deviation.max <= options.pathTolerance * MAX_DEVIATION_FACTOR

interface OpenShapeComparison {
  forwardFits: boolean
  reverseFits: boolean
}

const compareOpenShape = (user: Stroke, model: Stroke, options: ResolvedOptions): OpenShapeComparison => {
  const userSamples = resample(user, options.sampleCount, false)
  const modelSamples = resample(model, options.sampleCount, false)
  return {
    forwardFits: fitsTolerance(measureDeviation(userSamples, modelSamples), options),
    reverseFits: fitsTolerance(measureDeviation(userSamples, modelSamples.toReversed()), options),
  }
}

/** Compara contornos fechados ignorando ponto de partida e sentido. */
const closedShapeFits = (user: Stroke, model: Stroke, options: ResolvedOptions): boolean => {
  const userSamples = resample(user, options.sampleCount, true)
  const modelSamples = resample(model, options.sampleCount, true)
  const orientations = [modelSamples, modelSamples.toReversed()]

  const best = orientations.reduce<Deviation>(
    (bestSoFar, orientation) =>
      Array.from({ length: options.sampleCount }, (_, shift) =>
        measureDeviation(
          userSamples,
          userSamples.map((_point, index) => orientation[(index + shift) % options.sampleCount]),
        ),
      ).reduce((innerBest, candidate) => (isBetterDeviation(candidate, innerBest) ? candidate : innerBest), bestSoFar),
    { mean: Number.POSITIVE_INFINITY, max: Number.POSITIVE_INFINITY },
  )
  return fitsTolerance(best, options)
}

/** Área com sinal (eixo y para baixo): positivo = sentido horário na tela. */
const signedArea = (points: Stroke): number =>
  points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length]
    return sum + (point.x * next.y - next.x * point.y)
  }, 0) / 2

const boundingDiagonal = (points: Stroke): number => {
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  return Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
}

const strokeFitsModel = (user: Stroke, model: StrokeModel, options: ResolvedOptions): boolean => {
  if (model.closed) return closedShapeFits(user, model.points, options)
  const comparison = compareOpenShape(user, model.points, options)
  return comparison.forwardFits || comparison.reverseFits
}

/** Procura uma permutação em que todos os traços encaixam, para detectar ordem trocada. */
const findFittingPermutation = (fitMatrix: readonly (readonly boolean[])[]): number[] | null => {
  const assign = (userIndex: number, usedModels: readonly number[]): number[] | null => {
    if (userIndex === fitMatrix.length) return [...usedModels]
    for (let modelIndex = 0; modelIndex < fitMatrix.length; modelIndex += 1) {
      if (usedModels.includes(modelIndex) || !fitMatrix[userIndex][modelIndex]) continue
      const result = assign(userIndex + 1, [...usedModels, modelIndex])
      if (result) return result
    }
    return null
  }
  return assign(0, [])
}

const success = (): WritingResult => ({ ok: true, message: 'Muito bem! Traços na ordem e no sentido certos.', code: 'ok' })

const failure = (code: WritingIssueCode, message: string, strokeIndex?: number): WritingResult => ({
  ok: false,
  code,
  message,
  ...(strokeIndex === undefined ? {} : { strokeIndex }),
})

const pluralizeStrokes = (count: number): string => (count === 1 ? 'traço' : 'traços')

const evaluateOpenStroke = (
  user: Stroke,
  model: StrokeModel,
  strokeIndex: number,
  options: ResolvedOptions,
): WritingResult | null => {
  const strokeNumber = strokeIndex + 1
  const comparison = compareOpenShape(user, model.points, options)
  if (!comparison.forwardFits && !comparison.reverseFits) {
    return failure('wrong-shape', `O traço ${strokeNumber} está diferente do modelo. Siga o caminho indicado.`, strokeIndex)
  }

  const userStart = user[0]
  const userEnd = user[user.length - 1]
  const modelStart = model.points[0]
  const modelEnd = model.points[model.points.length - 1]
  const tolerance = options.endpointTolerance

  const startDistance = distanceBetween(userStart, modelStart)
  const endDistance = distanceBetween(userEnd, modelEnd)
  const isForwardOk = comparison.forwardFits && startDistance <= tolerance && endDistance <= tolerance
  if (isForwardOk) return null

  const isReverseOk =
    comparison.reverseFits &&
    distanceBetween(userStart, modelEnd) <= tolerance &&
    distanceBetween(userEnd, modelStart) <= tolerance
  if (isReverseOk) {
    const isMostlyVertical = Math.abs(modelStart.x - modelEnd.x) < Math.abs(modelStart.y - modelEnd.y) * 0.45
    const goesDown = modelEnd.y > modelStart.y
    if (isMostlyVertical && goesDown) {
      return failure('wrong-direction', 'Comece pelo ponto de cima e deslize pra baixo.', strokeIndex)
    }
    return failure('wrong-direction', `Inverta o sentido do traço ${strokeNumber}.`, strokeIndex)
  }

  if (startDistance > tolerance) {
    const isMostlyVertical = Math.abs(modelStart.x - modelEnd.x) < Math.abs(modelStart.y - modelEnd.y) * 0.45
    if (isMostlyVertical && modelStart.y < modelEnd.y) {
      return failure('wrong-start', 'Comece pelo ponto de cima e deslize pra baixo.', strokeIndex)
    }
    return failure('wrong-start', `Comece mais perto do início do modelo no traço ${strokeNumber}.`, strokeIndex)
  }
  if (endDistance > tolerance) {
    return failure('wrong-end', `Termine mais perto do fim do modelo no traço ${strokeNumber}.`, strokeIndex)
  }
  return failure('wrong-shape', `O traço ${strokeNumber} está diferente do modelo. Siga o caminho indicado.`, strokeIndex)
}

const evaluateClosedStroke = (
  user: Stroke,
  model: StrokeModel,
  strokeIndex: number,
  options: ResolvedOptions,
): WritingResult | null => {
  const strokeNumber = strokeIndex + 1

  if (!closedShapeFits(user, model.points, options)) {
    const sizeRatio = boundingDiagonal(user) / Math.max(boundingDiagonal(model.points), Number.EPSILON)
    if (sizeRatio < 1 / SIZE_RATIO_LIMIT) return failure('wrong-size', `Faça o traço ${strokeNumber} maior, ocupando a área do modelo.`, strokeIndex)
    if (sizeRatio > SIZE_RATIO_LIMIT) return failure('wrong-size', `Faça o traço ${strokeNumber} menor, dentro da área do modelo.`, strokeIndex)
    return failure('wrong-shape', `O traço ${strokeNumber} está diferente do modelo. Siga o contorno indicado.`, strokeIndex)
  }

  if (distanceBetween(user[0], user[user.length - 1]) > options.closureTolerance) {
    return failure('not-closed', `Feche o traço ${strokeNumber}: termine perto de onde começou.`, strokeIndex)
  }

  const userArea = signedArea(user)
  const modelArea = signedArea(model.points)
  const isSameDirection = Math.abs(userArea) < MINIMUM_CLOSED_AREA || Math.sign(userArea) === Math.sign(modelArea)
  if (isSameDirection) return null

  const expectedRotation = modelArea > 0 ? 'horário' : 'anti-horário'
  return failure('wrong-direction', `Inverta o sentido do traço ${strokeNumber}: desenhe no sentido ${expectedRotation}.`, strokeIndex)
}

export const evaluateWriting = (
  userStrokes: readonly Stroke[],
  models: readonly StrokeModel[],
  options: WritingOptions = {},
): WritingResult => {
  const resolved: ResolvedOptions = { ...DEFAULT_OPTIONS, ...options }

  if (models.length === 0) return failure('no-model', 'Não há modelo de traços para esta letra.')

  const strokes = userStrokes
    .map(sanitizeStroke)
    .filter((stroke) => stroke.length >= 2 && pathLength(stroke, false) >= resolved.minimumStrokeLength)

  if (strokes.length === 0) return failure('no-strokes', 'Desenhe a letra seguindo o modelo.')

  if (strokes.length < models.length) {
    const missing = models.length - strokes.length
    const message = missing === 1 ? 'Faltou um traço.' : `Faltaram ${missing} traços.`
    return failure('missing-strokes', message)
  }
  if (strokes.length > models.length) {
    const extra = strokes.length - models.length
    return failure(
      'extra-strokes',
      `Há ${extra} ${pluralizeStrokes(extra)} a mais. Esta letra tem ${models.length} ${pluralizeStrokes(models.length)}.`,
    )
  }

  const fitMatrix = strokes.map((stroke) => models.map((model) => strokeFitsModel(stroke, model, resolved)))
  const isInOrder = fitMatrix.every((row, index) => row[index])
  if (!isInOrder) {
    const permutation = findFittingPermutation(fitMatrix)
    if (permutation) return failure('wrong-order', 'A ordem dos traços está trocada. Siga a numeração do modelo.')
  }

  for (const [index, stroke] of strokes.entries()) {
    const model = models[index]
    const issue = model.closed
      ? evaluateClosedStroke(stroke, model, index, resolved)
      : evaluateOpenStroke(stroke, model, index, resolved)
    if (issue) return issue
  }

  return success()
}
