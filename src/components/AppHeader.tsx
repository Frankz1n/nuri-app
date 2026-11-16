import type { ReactNode } from 'react'
import { BackIcon } from './icons'

interface AppHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  showBrand?: boolean
  actions?: ReactNode
}

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="brand-mark__block brand-mark__block--dark" lang="ko">
        한
      </span>
      <span className="brand-mark__block brand-mark__block--soft" lang="ko">
        글
      </span>
    </span>
  )
}

export function AppHeader({ title, subtitle, backHref, backLabel = 'Voltar', showBrand = false, actions }: AppHeaderProps) {
  return (
    <header className="app-header">
      {backHref ? (
        <a className="icon-button" href={backHref} aria-label={backLabel}>
          <BackIcon />
        </a>
      ) : null}
      {showBrand ? <BrandMark /> : null}
      <div className="app-header__text">
        <h1 className="app-header__title">{title}</h1>
        {subtitle ? <p className="app-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="app-header__actions">{actions}</div> : null}
    </header>
  )
}
