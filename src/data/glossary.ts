import type { GlossaryTerm } from './types'

export const GLOSSARY: readonly GlossaryTerm[] = [
  { id: 'glossary-hangul', term: 'Hangul (한글)', definition: 'O alfabeto coreano, criado no século XV. Combina consoantes e vogais em blocos silábicos.' },
  { id: 'glossary-jamo', term: 'Jamo (자모)', definition: 'Cada letra individual do hangul, seja consoante ou vogal.' },
  { id: 'glossary-silaba', term: 'Sílaba', definition: 'Bloco formado por uma consoante inicial, uma vogal e, às vezes, uma consoante final.' },
  { id: 'glossary-batchim', term: 'Batchim (받침)', definition: 'Consoante final na parte de baixo de uma sílaba, como o ㅁ em 감.' },
  { id: 'glossary-romanizacao', term: 'Romanização', definition: 'Representação dos sons do coreano com letras latinas. Ajuda no início, mas não substitui o hangul.' },
  { id: 'glossary-vogal-basica', term: 'Vogal básica', definition: 'Uma das 10 vogais simples do hangul, como ㅏ, ㅓ e ㅗ.' },
  { id: 'glossary-vogal-composta', term: 'Vogal composta', definition: 'Vogal formada pela combinação de vogais básicas, como ㅐ, ㅔ e ㅘ.' },
  { id: 'glossary-consoante-dupla', term: 'Consoante dupla', definition: 'Consoante tensa, pronunciada com mais força e sem sopro: ㄲ, ㄸ, ㅃ, ㅆ e ㅉ.' },
  { id: 'glossary-ieung', term: 'Ieung (ㅇ)', definition: 'No início da sílaba é muda; no fim da sílaba soa como "ng".' },
  { id: 'glossary-particula', term: 'Partícula', definition: 'Pequena marca que indica a função da palavra na frase, como 은/는 (tópico) e 을/를 (objeto).' },
  { id: 'glossary-formal', term: 'Registro formal', definition: 'Jeito educado de falar, usado com desconhecidos e superiores, como em 감사합니다.' },
  { id: 'glossary-informal', term: 'Registro informal', definition: 'Jeito descontraído de falar, usado com amigos próximos, como em 안녕.' },
  { id: 'glossary-sino-coreano', term: 'Números sino-coreanos', definition: 'Sistema numérico de origem chinesa (일, 이, 삼...) usado para datas, dinheiro e telefones.' },
]
