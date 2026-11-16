import { MASCOT_POSES } from '../assets/mascot/poses'
import { FlameIcon } from './icons'

interface StreakCelebrateProps {
  streak: number
  weekMarks: readonly boolean[]
  weekLabels?: readonly string[]
  message: string
  onContinue: () => void
}

const DEFAULT_WEEK_LABELS = ['Sáb', 'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as const

/** Celebração de ofensiva diária com o Horangi. */
export function StreakCelebrate({
  streak,
  weekMarks,
  weekLabels = DEFAULT_WEEK_LABELS,
  message,
  onContinue,
}: StreakCelebrateProps) {
  return (
    <div className="streak-celebrate" role="dialog" aria-modal="true" aria-labelledby="streak-celebrate-title">
      <img className="streak-celebrate__mascot" src={MASCOT_POSES.cheer} alt="" width={180} height={180} />
      <div className="streak-celebrate__flame" aria-hidden="true">
        <FlameIcon size={48} />
      </div>
      <p id="streak-celebrate-title" className="streak-celebrate__count">
        {streak}
      </p>
      <p className="streak-celebrate__label">{streak === 1 ? 'dia de ofensiva' : 'dias de ofensiva'}</p>

      <ol className="streak-celebrate__week" aria-label="Semana de prática">
        {weekLabels.map((label, index) => {
          const isDone = weekMarks[index] ?? false
          return (
            <li key={label} className={`streak-celebrate__day${isDone ? ' is-done' : ''}`}>
              <span>{label}</span>
              <span className="streak-celebrate__dot" aria-hidden="true">
                {isDone ? '✓' : ''}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="streak-celebrate__message">{message}</p>
      <button type="button" className="button button--primary button--block" onClick={onContinue}>
        Continuar
      </button>
    </div>
  )
}
