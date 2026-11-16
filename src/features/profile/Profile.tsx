import { useId, useState } from 'react'
import { DAILY_GOAL_OPTIONS, formatDailyGoalLabel, todayKey } from '../../core'
import { AppHeader } from '../../components/AppHeader'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { InstallPrompt } from '../../components/InstallPrompt'
import { ProgressBar } from '../../components/ProgressBar'
import { FlameIcon } from '../../components/icons'
import { getTodayXp } from '../../lib/catalog'
import { useNuri } from '../../state/useNuri'
import { getDisplayedStreak } from '../../state/transitions'
import { BackupSection } from './BackupSection'

const XP_GOAL_OPTIONS = [30, 50, 80, 100, 150] as const

interface ToggleRowProps {
  label: string
  description: string
  isChecked: boolean
  onChange: (isChecked: boolean) => void
}

function ToggleRow({ label, description, isChecked, onChange }: ToggleRowProps) {
  const descriptionId = useId()
  return (
    <label className="toggle-row">
      <span className="toggle-row__text">
        <span className="toggle-row__label">{label}</span>
        <span id={descriptionId} className="toggle-row__description">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        role="switch"
        className="switch"
        checked={isChecked}
        aria-describedby={descriptionId}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

export function Profile() {
  const { state, actions, saveFailure } = useNuri()
  const { profile } = state
  const [nameDraft, setNameDraft] = useState(profile.name ?? '')
  const [isResetOpen, setIsResetOpen] = useState(false)
  const today = todayKey()
  const todayXp = getTodayXp(state, today)
  const streak = getDisplayedStreak(state.progress, today)

  const commitName = (): void => {
    const trimmed = nameDraft.trim()
    if (trimmed !== (profile.name ?? '')) actions.setProfile({ name: trimmed === '' ? undefined : trimmed })
  }

  return (
    <div className="screen">
      <AppHeader title="Perfil" subtitle={profile.name ? `Olá, ${profile.name}` : 'Ajustes e progresso'} />

      {saveFailure === 'write-failed' ? (
        <p className="notice notice--error" role="alert">
          Não foi possível gravar seus dados neste aparelho (armazenamento cheio ou bloqueado). Exporte um backup.
        </p>
      ) : null}

      <section className="path-hero" aria-labelledby="daily-meta">
        <p id="daily-meta" className="path-hero__unit">
          Meta de hoje · {formatDailyGoalLabel(profile.dailyGoalMinutes)}
        </p>
        <h2 className="path-hero__title">
          {todayXp}/{profile.xpGoal} XP
        </h2>
        <ProgressBar value={todayXp} max={profile.xpGoal} label="Meta diária de XP" isCompact />
        <p className="path-hero__meta">
          <FlameIcon size={16} /> Sequência · {streak} {streak === 1 ? 'dia' : 'dias'} · {state.progress.xp} XP no
          total
        </p>
      </section>

      <a className="card card--link" href="#/profile/progress">
        <span>
          <span className="card__title">Meu progresso</span>
          <span className="card__text">
            {state.progress.completedLessons.length} aulas · conquistas e histórico
          </span>
        </span>
        <span aria-hidden="true">›</span>
      </a>

      <section className="card" aria-labelledby="routine-title">
        <h2 id="routine-title" className="card__title">
          Rotina e metas
        </h2>
        <div className="field">
          <label className="field__label" htmlFor="profile-name">
            Seu nome (opcional)
          </label>
          <input
            id="profile-name"
            className="input"
            type="text"
            autoComplete="given-name"
            maxLength={40}
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={commitName}
          />
        </div>
        <fieldset className="field">
          <legend className="field__label">Tempo diário</legend>
          <div className="segmented segmented--goals">
            {DAILY_GOAL_OPTIONS.map((minutes) => (
              <label key={minutes} className={`segmented__option${profile.dailyGoalMinutes === minutes ? ' is-active' : ''}`}>
                <input
                  type="radio"
                  name="daily-goal"
                  checked={profile.dailyGoalMinutes === minutes}
                  onChange={() => actions.setProfile({ dailyGoalMinutes: minutes })}
                />
                <span className="segmented__label">{formatDailyGoalLabel(minutes)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label className="field__label" htmlFor="xp-goal">
            Meta diária de XP
          </label>
          <select
            id="xp-goal"
            className="input"
            value={profile.xpGoal}
            onChange={(event) => actions.setProfile({ xpGoal: Number(event.target.value) })}
          >
            {[...new Set([...XP_GOAL_OPTIONS, profile.xpGoal])]
              .toSorted((a, b) => a - b)
              .map((option) => (
                <option key={option} value={option}>
                  {option} XP
                </option>
              ))}
          </select>
        </div>
      </section>

      <section className="card" aria-labelledby="display-title">
        <h2 id="display-title" className="card__title">
          Exibição e acessibilidade
        </h2>
        <ToggleRow
          label="Mostrar romanização"
          description="Mostra a escrita em letras latinas junto das palavras."
          isChecked={profile.showRomanization}
          onChange={(isChecked) => actions.setProfile({ showRomanization: isChecked })}
        />
        <ToggleRow
          label="Modo escuro"
          description="Fundo escuro, mais confortável à noite."
          isChecked={profile.darkMode}
          onChange={(isChecked) => actions.setProfile({ darkMode: isChecked })}
        />
        <ToggleRow
          label="Texto grande"
          description="Aumenta o tamanho das letras em todo o app."
          isChecked={profile.largeText}
          onChange={(isChecked) => actions.setProfile({ largeText: isChecked })}
        />
        <ToggleRow
          label="Reduzir movimento"
          description="Desliga animações, inclusive o guia animado da escrita."
          isChecked={profile.reduceMotion}
          onChange={(isChecked) => actions.setProfile({ reduceMotion: isChecked })}
        />
      </section>

      <InstallPrompt />

      <BackupSection />

      <a className="card card--link" href="#/glossary">
        <span>
          <span className="card__title">Glossário</span>
          <span className="card__text">Hangul, jamo, batchim e outros termos.</span>
        </span>
        <span aria-hidden="true">›</span>
      </a>

      <section className="card" aria-labelledby="danger-title">
        <h2 id="danger-title" className="card__title">
          Zona de risco
        </h2>
        <p className="card__text">Apaga XP, aulas, favoritas e revisões deste aparelho. Considere exportar um backup antes.</p>
        <button type="button" className="button button--danger" onClick={() => setIsResetOpen(true)}>
          Apagar todo o progresso
        </button>
      </section>

      {isResetOpen ? (
        <ConfirmDialog
          title="Apagar todo o progresso?"
          confirmLabel="Apagar tudo"
          isDestructive
          onConfirm={() => {
            actions.resetAll()
            setIsResetOpen(false)
            window.location.hash = '#/onboarding'
          }}
          onCancel={() => setIsResetOpen(false)}
        >
          <p>Esta ação remove seu progresso e configurações e não pode ser desfeita.</p>
        </ConfirmDialog>
      ) : null}
    </div>
  )
}
