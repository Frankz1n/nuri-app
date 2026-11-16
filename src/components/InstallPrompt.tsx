import { promptInstall, useInstallState } from '../pwa/installStore'

export function InstallPrompt() {
  const { canPrompt, isStandalone, isIos } = useInstallState()

  if (isStandalone) return null

  return (
    <section className="card" aria-labelledby="install-title">
      <h2 id="install-title" className="card__title">
        Instalar o Nuri
      </h2>
      <p className="card__text">Instale para abrir como um app, em tela cheia e com acesso offline depois da primeira visita.</p>
      {canPrompt ? (
        <button type="button" className="button button--primary" onClick={() => void promptInstall()}>
          Instalar Nuri
        </button>
      ) : isIos ? (
        <ol className="steps-list">
          <li>Abra o Nuri no Safari.</li>
          <li>Toque em Compartilhar (o ícone de quadrado com seta para cima).</li>
          <li>Escolha &ldquo;Adicionar à Tela de Início&rdquo; e confirme.</li>
        </ol>
      ) : (
        <p className="card__text">
          No Chrome (Android), abra o menu &ldquo;⋮&rdquo; e escolha &ldquo;Instalar app&rdquo; ou &ldquo;Adicionar à tela inicial&rdquo;.
          O botão de instalação aparece aqui quando o navegador permitir.
        </p>
      )}
    </section>
  )
}
