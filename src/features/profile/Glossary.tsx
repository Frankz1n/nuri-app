import { GLOSSARY } from '../../data'
import { AppHeader } from '../../components/AppHeader'

export function GlossaryList() {
  return (
    <dl className="glossary">
      {GLOSSARY.map((term) => (
        <div key={term.id} className="glossary__item">
          <dt className="glossary__term">{term.term}</dt>
          <dd className="glossary__definition">{term.definition}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Glossary() {
  return (
    <div className="screen">
      <AppHeader title="Glossário" subtitle="Termos usados nas aulas." backHref="#/profile" backLabel="Voltar para Perfil" />
      <GlossaryList />
    </div>
  )
}
