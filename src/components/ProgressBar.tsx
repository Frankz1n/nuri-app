interface ProgressBarProps {
  value: number
  max: number
  label: string
  isCompact?: boolean
}

export function ProgressBar({ value, max, label, isCompact = false }: ProgressBarProps) {
  const safeMax = Math.max(1, max)
  const percentage = Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)))
  return (
    <div
      className={`progress${isCompact ? ' progress--compact' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.min(value, safeMax)}
    >
      <div className="progress__fill" style={{ width: `${percentage}%` }} />
    </div>
  )
}
