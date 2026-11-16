import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Última barreira: um erro de tela não apaga o progresso (ele fica no localStorage). */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Nuri: erro inesperado na interface', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="screen" role="alert" style={{ padding: '1.5rem' }}>
        <h1 className="screen__title">Algo deu errado</h1>
        <p className="screen__text">Seu progresso está salvo neste aparelho. Recarregue para tentar de novo.</p>
        <a className="button button--primary" href="#/learn" onClick={() => window.location.reload()}>
          Recarregar
        </a>
      </div>
    )
  }
}
