import { todayKey } from '../../core'
import { AppHeader } from '../../components/AppHeader'
import { ProgressBar } from '../../components/ProgressBar'
import { buildGuidedCurriculumPlan, countCurriculumEvidence, listPlayableLessonIds } from '../../lib/curriculumPath'
import { SKILL_LABELS } from '../../lib/stepBuilders'
import { getTodayXp } from '../../lib/catalog'
import { ACHIEVEMENTS } from '../../state/achievements'
import { useNuri } from '../../state/useNuri'
import { getDisplayedStreak } from '../../state/transitions'

const formatDay = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-')
  return `${day}/${month}/${year}`
}

export function ProgressView() {
  const { state } = useNuri()
  const today = todayKey()
  const { progress } = state
  const streak = getDisplayedStreak(progress, today)
  const recentHistory = progress.history.toSorted((a, b) => b.day.localeCompare(a.day)).slice(0, 14)
  const skills = Object.entries(progress.skillFirstTry)
    .filter(([, stats]) => stats.total > 0)
    .toSorted(([a], [b]) => (SKILL_LABELS[a] ?? a).localeCompare(SKILL_LABELS[b] ?? b))
  const curriculum = buildGuidedCurriculumPlan(progress.completedLessons)
  const playableIds = listPlayableLessonIds()
  const playableDone = playableIds.filter((lessonId) => progress.completedLessons.includes(lessonId)).length
  const evidence = countCurriculumEvidence(progress.sessionEvidence)

  return (
    <div className="screen">
      <AppHeader title="Seu progresso" backHref="#/profile" backLabel="Voltar para Perfil" />

      <section className="stat-grid" aria-label="Resumo">
        <div className="stat">
          <span className="stat__value">{progress.xp}</span>
          <span className="stat__label">XP total</span>
        </div>
        <div className="stat">
          <span className="stat__value">{streak}</span>
          <span className="stat__label">{streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
        <div className="stat">
          <span className="stat__value">{progress.completedLessons.length}</span>
          <span className="stat__label">aulas feitas</span>
        </div>
        <div className="stat">
          <span className="stat__value">{getTodayXp(state, today)}</span>
          <span className="stat__label">XP hoje</span>
        </div>
      </section>

      <section className="card" aria-labelledby="curriculum-title">
        <h2 id="curriculum-title" className="card__title">
          Trilha anual
        </h2>
        <p className="card__text">
          {curriculum.phaseLabel}
          <br />
          Semana ativa: <strong>{curriculum.weekLabel}</strong>
        </p>
        <p className="card__text">
          Sessões jogáveis (S01–S04): {playableDone}/{playableIds.length}
        </p>
        <ProgressBar
          value={playableDone}
          max={Math.max(1, playableIds.length)}
          label="Progresso das sessões jogáveis das semanas 1 a 4"
          isCompact
        />
        <p className="field__hint">
          Evidência de escuta/fala: {evidence.unsupported} sem apoio · {evidence.supported} com apoio ·{' '}
          {evidence.skipped} fala pulada. O marco S04D5 fecha o pedido no café. XP e sequência acompanham o hábito.
        </p>
      </section>

      <section className="card" aria-labelledby="achievements-title">
        <h2 id="achievements-title" className="card__title">
          Conquistas ({progress.achievements.length}/{ACHIEVEMENTS.length})
        </h2>
        <ul className="achievement-list">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = progress.achievements.includes(achievement.id)
            return (
              <li key={achievement.id} className={`achievement${isUnlocked ? ' is-unlocked' : ''}`}>
                <span className="achievement__badge" aria-hidden="true">
                  {isUnlocked ? '★' : '☆'}
                </span>
                <span>
                  <span className="achievement__title">{achievement.title}</span>
                  <span className="achievement__description">
                    {achievement.description} {isUnlocked ? '(conquistada)' : '(bloqueada)'}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="card" aria-labelledby="skills-title">
        <h2 id="skills-title" className="card__title">
          Acertos de primeira por habilidade
        </h2>
        {skills.length === 0 ? (
          <p className="card__text">Responda algumas perguntas para ver suas estatísticas.</p>
        ) : (
          <ul className="plain-list">
            {skills.map(([skillId, stats]) => (
              <li key={skillId} className="skill-row">
                <span className="skill-row__label">{SKILL_LABELS[skillId] ?? skillId}</span>
                <span className="skill-row__value">
                  {stats.hits}/{stats.total} ({Math.round((stats.hits / stats.total) * 100)}%)
                </span>
                <ProgressBar value={stats.hits} max={stats.total} label={`Acertos de primeira em ${SKILL_LABELS[skillId] ?? skillId}`} isCompact />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="history-title">
        <h2 id="history-title" className="card__title">
          Histórico recente
        </h2>
        {recentHistory.length === 0 ? (
          <p className="card__text">Ainda sem atividade registrada.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th scope="col">Dia</th>
                <th scope="col">XP</th>
                <th scope="col">Aulas</th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.map((entry) => (
                <tr key={entry.day}>
                  <td>{formatDay(entry.day)}</td>
                  <td>{entry.xp}</td>
                  <td>{entry.lessons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
