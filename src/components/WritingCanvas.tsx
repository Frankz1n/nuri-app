import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { evaluateWriting } from '../core'
import type { WritingResult } from '../core'
import type { StrokeModel, StrokePoint } from '../data'

interface WritingCanvasProps {
  models: readonly StrokeModel[]
  isLocked?: boolean
  /** Contorno, ponto e seta do modelo. False = só grade neutra. */
  showOutline?: boolean
  onChecked: (result: WritingResult) => void
  onSkip?: () => void
}

type GuideMode = 'animated' | 'static'

const STROKE_ANIMATION_MS = 900
const STROKE_GAP_MS = 350
const LOOP_PAUSE_MS = 1400

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value))

const prefersReducedMotion = (): boolean =>
  document.documentElement.classList.contains('reduce-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches

const outlineOf = (model: StrokeModel): StrokePoint[] =>
  model.closed && model.points.length > 1 ? [...model.points, model.points[0]] : [...model.points]

const segmentLength = (a: StrokePoint, b: StrokePoint): number => Math.hypot(a.x - b.x, a.y - b.y)

/** Trecho inicial do traço, de 0 a 1 do comprimento total. */
const takeFraction = (points: readonly StrokePoint[], fraction: number): StrokePoint[] => {
  if (fraction >= 1 || points.length < 2) return [...points]
  const total = points.slice(1).reduce((sum, point, index) => sum + segmentLength(points[index], point), 0)
  const target = total * Math.max(0, fraction)
  const result: StrokePoint[] = [points[0]]
  let travelled = 0
  for (let index = 1; index < points.length; index += 1) {
    const length = segmentLength(points[index - 1], points[index])
    if (travelled + length >= target) {
      const ratio = length === 0 ? 0 : (target - travelled) / length
      const from = points[index - 1]
      const to = points[index]
      return [...result, { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio }]
    }
    result.push(points[index])
    travelled += length
  }
  return result
}

const readColor = (element: HTMLElement, variableName: string, fallback: string): string =>
  getComputedStyle(element).getPropertyValue(variableName).trim() || fallback

export function WritingCanvas({ models, isLocked = false, showOutline = true, onChecked, onSkip }: WritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<StrokePoint[][]>([])
  const activeStrokeRef = useRef<StrokePoint[] | null>(null)
  const activePointerIdRef = useRef<number | null>(null)
  const animationStartRef = useRef<number>(0)
  const [strokeCount, setStrokeCount] = useState(0)
  const [guideMode, setGuideMode] = useState<GuideMode>(() => (prefersReducedMotion() ? 'static' : 'animated'))
  const [isMotionReduced] = useState(prefersReducedMotion)

  const draw = useCallback(
    (now: number = performance.now()) => {
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      if (!canvas || !context) return
      const cssSize = canvas.clientWidth
      if (cssSize === 0) return
      const devicePixelRatio = window.devicePixelRatio || 1
      const pixelSize = Math.round(cssSize * devicePixelRatio)
      if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
        canvas.width = pixelSize
        canvas.height = pixelSize
      }
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      context.clearRect(0, 0, cssSize, cssSize)

      const gridColor = readColor(canvas, '--canvas-grid', '#d9d0b8')
      const guideColor = readColor(canvas, '--canvas-guide', '#9db8a5')
      const inkColor = readColor(canvas, '--canvas-ink', '#1f4d3a')
      const accentColor = readColor(canvas, '--canvas-accent', '#c9432d')
      const toPixels = (point: StrokePoint): [number, number] => [point.x * cssSize, point.y * cssSize]

      context.lineCap = 'round'
      context.lineJoin = 'round'

      context.strokeStyle = gridColor
      context.lineWidth = 1
      context.setLineDash([5, 5])
      context.beginPath()
      context.moveTo(cssSize / 2, 0)
      context.lineTo(cssSize / 2, cssSize)
      context.moveTo(0, cssSize / 2)
      context.lineTo(cssSize, cssSize / 2)
      context.stroke()
      context.setLineDash([])

      const elapsed = now - animationStartRef.current
      const cycleLength = models.length * (STROKE_ANIMATION_MS + STROKE_GAP_MS) + LOOP_PAUSE_MS
      const cycleTime = elapsed % cycleLength

      if (showOutline) {
        models.forEach((model, index) => {
          const outline = outlineOf(model)
          const fraction =
            guideMode === 'static' ? 1 : clampUnit((cycleTime - index * (STROKE_ANIMATION_MS + STROKE_GAP_MS)) / STROKE_ANIMATION_MS)
          if (fraction <= 0) return
          const visible = takeFraction(outline, fraction)

          // Trilha larga (como no vídeo) + linha guia.
          context.strokeStyle = guideColor
          context.globalAlpha = 0.35
          context.lineWidth = Math.max(18, cssSize * 0.09)
          context.beginPath()
          visible.forEach((point, pointIndex) => {
            const [x, y] = toPixels(point)
            if (pointIndex === 0) context.moveTo(x, y)
            else context.lineTo(x, y)
          })
          context.stroke()
          context.globalAlpha = 1
          context.setLineDash([6, 6])
          context.lineWidth = Math.max(3, cssSize * 0.012)
          context.beginPath()
          visible.forEach((point, pointIndex) => {
            const [x, y] = toPixels(point)
            if (pointIndex === 0) context.moveTo(x, y)
            else context.lineTo(x, y)
          })
          context.stroke()
          context.setLineDash([])

          const [startX, startY] = toPixels(outline[0])
          const endPoint = outline[Math.min(outline.length - 1, Math.max(1, Math.floor(outline.length * fraction)))]
          const [endX, endY] = toPixels(endPoint)
          const angle = Math.atan2(endY - startY, endX - startX)
          const radius = Math.max(14, cssSize * 0.045)

          context.fillStyle = accentColor
          context.beginPath()
          context.arc(startX, startY, radius, 0, Math.PI * 2)
          context.fill()

          // Seta no sentido do traço (ponto de partida).
          context.fillStyle = '#ffffff'
          context.beginPath()
          const arrow = radius * 0.55
          context.moveTo(startX + Math.cos(angle) * arrow, startY + Math.sin(angle) * arrow)
          context.lineTo(
            startX + Math.cos(angle + 2.4) * arrow * 0.75,
            startY + Math.sin(angle + 2.4) * arrow * 0.75,
          )
          context.lineTo(
            startX + Math.cos(angle - 2.4) * arrow * 0.75,
            startY + Math.sin(angle - 2.4) * arrow * 0.75,
          )
          context.closePath()
          context.fill()

          if (fraction > 0.85) {
            const tipX = endX + Math.cos(angle) * 4
            const tipY = endY + Math.sin(angle) * 4
            context.fillStyle = accentColor
            context.beginPath()
            context.moveTo(tipX, tipY)
            context.lineTo(tipX + Math.cos(angle + 2.5) * 12, tipY + Math.sin(angle + 2.5) * 12)
            context.lineTo(tipX + Math.cos(angle - 2.5) * 12, tipY + Math.sin(angle - 2.5) * 12)
            context.closePath()
            context.fill()
          }
        })
      }

      const userStrokes = activeStrokeRef.current ? [...strokesRef.current, activeStrokeRef.current] : strokesRef.current
      context.strokeStyle = inkColor
      context.lineWidth = Math.max(5, cssSize * 0.03)
      for (const stroke of userStrokes) {
        if (stroke.length === 0) continue
        context.beginPath()
        stroke.forEach((point, pointIndex) => {
          const [x, y] = toPixels(point)
          if (pointIndex === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        })
        if (stroke.length === 1) {
          const [x, y] = toPixels(stroke[0])
          context.lineTo(x + 0.01, y)
        }
        context.stroke()
      }
    },
    [guideMode, models, showOutline],
  )

  useEffect(() => {
    animationStartRef.current = performance.now()
    if (guideMode === 'static') {
      draw()
      return
    }
    let frameId = 0
    const loop = (now: number): void => {
      draw(now)
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [draw, guideMode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => draw())
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [draw])

  const toNormalizedPoint = (event: ReactPointerEvent<HTMLCanvasElement>): StrokePoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: clampUnit((event.clientX - rect.left) / rect.width),
      y: clampUnit((event.clientY - rect.top) / rect.height),
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (isLocked || activePointerIdRef.current !== null) return
    event.preventDefault()
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Ponteiros sintéticos (ex.: automação) não podem ser capturados; o desenho continua funcionando.
    }
    activePointerIdRef.current = event.pointerId
    activeStrokeRef.current = [toNormalizedPoint(event)]
    draw()
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (event.pointerId !== activePointerIdRef.current || !activeStrokeRef.current) return
    activeStrokeRef.current = [...activeStrokeRef.current, toNormalizedPoint(event)]
    draw()
  }

  const finishStroke = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (event.pointerId !== activePointerIdRef.current) return
    const finished = activeStrokeRef.current
    activePointerIdRef.current = null
    activeStrokeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    // (o navegador também solta a captura sozinho em pointerup/pointercancel)
    if (finished && finished.length >= 2) {
      strokesRef.current = [...strokesRef.current, finished]
      setStrokeCount(strokesRef.current.length)
    }
    draw()
  }

  const clear = (): void => {
    strokesRef.current = []
    activeStrokeRef.current = null
    setStrokeCount(0)
    draw()
  }

  const undoLastStroke = (): void => {
    strokesRef.current = strokesRef.current.slice(0, -1)
    setStrokeCount(strokesRef.current.length)
    draw()
  }

  return (
    <div className="writing-canvas">
      <canvas
        ref={canvasRef}
        className="writing-canvas__surface"
        role="img"
        aria-label={`Área de escrita com ${models.length} ${models.length === 1 ? 'traço' : 'traços'} de guia. Desenhe com o dedo ou o mouse.`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
      />
      <div className="writing-canvas__tools">
        <button type="button" className="button button--ghost" onClick={clear} disabled={isLocked || strokeCount === 0}>
          Limpar
        </button>
        <button type="button" className="button button--ghost" onClick={undoLastStroke} disabled={isLocked || strokeCount === 0}>
          Desfazer
        </button>
        {showOutline && !isMotionReduced ? (
          <button
            type="button"
            className="button button--ghost"
            aria-pressed={guideMode === 'animated'}
            onClick={() => setGuideMode((current) => (current === 'animated' ? 'static' : 'animated'))}
          >
            {guideMode === 'animated' ? 'Guia fixo' : 'Guia animado'}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        className="button button--primary button--block writing-canvas__check"
        disabled={isLocked || strokeCount === 0}
        onClick={() => onChecked(evaluateWriting(strokesRef.current, models))}
      >
        Verificar
      </button>
      {onSkip ? (
        <button type="button" className="button button--ghost button--block" onClick={onSkip} disabled={isLocked}>
          Pular escrita
        </button>
      ) : null}
    </div>
  )
}
