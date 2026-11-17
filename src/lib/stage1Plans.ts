import { getLetterById, getVocabById } from '../data'
import { sample, shuffle } from './random'
import type { Random } from './random'
import {
  buildLetterSoundStep,
  buildSyllableAssembleStep,
  buildVocabChoiceStep,
  buildWritePracticePair,
  buildWriteStep,
} from './stepBuilders'
import type { ChoiceStep, InfoStep, ListenChoiceStep, Step, TilesStep } from './steps'

const compact = <T>(items: readonly (T | null | undefined)[]): T[] => items.flatMap((item) => (item ? [item] : []))

const buildHangulListenChoice = (
  hangul: string,
  correctLabel: string,
  distractors: readonly string[],
  random: Random,
  skillId = 'listening',
  explanation?: string,
): ListenChoiceStep => {
  const options = shuffle([correctLabel, ...distractors], random)
  return {
    kind: 'listen-choice',
    skillId,
    errorId: `listen-choice:hangul:${hangul}`,
    speakText: hangul,
    prompt: 'O que você ouviu?',
    options,
    answerIndex: options.indexOf(correctLabel),
    explanation: explanation ?? `Você ouviu ${hangul}.`,
    revealHangul: hangul,
  }
}

const vowelContrast = (left: string, right: string, ask: string, labels: [string, string], random: Random): ListenChoiceStep =>
  buildHangulListenChoice(
    ask,
    ask === left ? labels[0] : labels[1],
    [ask === left ? labels[1] : labels[0]],
    random,
    'listening',
    `${left} e ${right} soam diferentes. Você ouviu ${ask}.`,
  )

const placementChoice = (
  syllable: string,
  isRight: boolean,
  random: Random,
): ChoiceStep => {
  const correct = isRight ? 'À direita da consoante' : 'Embaixo da consoante'
  const wrong = isRight ? 'Embaixo da consoante' : 'À direita da consoante'
  const options = shuffle([correct, wrong], random)
  return {
    kind: 'choice',
    skillId: 'syllable',
    errorId: `syllable:place:${syllable}`,
    prompt: 'Onde fica a vogal neste bloco?',
    big: syllable,
    bigLanguage: 'ko',
    options: options.map((text) => ({ text, language: 'pt' })),
    answerIndex: options.indexOf(correct),
    explanation: isRight
      ? 'Vogais verticais (ㅏ, ㅓ, ㅣ…) ficam à direita.'
      : 'Vogais horizontais (ㅗ, ㅜ, ㅡ…) ficam embaixo.',
  }
}

const batchimChoice = (syllable: string, finalChar: string, wrong: readonly string[], random: Random): ChoiceStep => {
  const options = shuffle([finalChar, ...wrong], random)
  return {
    kind: 'choice',
    skillId: 'syllable',
    errorId: `syllable:batchim:${syllable}`,
    prompt: 'Qual é o batchim (consoante final)?',
    big: syllable,
    bigLanguage: 'ko',
    options: options.map((text) => ({ text, language: 'ko' })),
    answerIndex: options.indexOf(finalChar),
    explanation: `${syllable} termina em ${finalChar}.`,
  }
}

const orderTiles = (drink: string, drinkId: string, random: Random): TilesStep => ({
  kind: 'tiles',
  skillId: 'phrase',
  errorId: `phrase:order:${drinkId}`,
  prompt: `Peça ${getVocabById(drinkId)?.translation ?? drink} com 주세요`,
  bank: shuffle([drink, '주세요', '네', '빵'], random),
  answer: [drink, '주세요'],
  join: ' ',
  tileLanguage: 'ko',
  patternHint: 'bebida + 주세요',
  explanation: `${drink} 주세요 = pedido educado.`,
})

/** S02D1 — contrastes 아/어 e 오/우. */
export const buildS02D1Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'listening',
      title: 'Ouça as vogais',
      lines: ['Distinga pares que mudam só a vogal.', 'Hangul só depois da tentativa ou com apoio.'],
    } satisfies InfoStep,
    vowelContrast('아', '어', '아', ['아 (a)', '어 (eo)'], random),
    vowelContrast('아', '어', '어', ['아 (a)', '어 (eo)'], random),
    vowelContrast('오', '우', '오', ['오 (o)', '우 (u)'], random),
    vowelContrast('오', '우', '우', ['오 (o)', '우 (u)'], random),
    buildHangulListenChoice('이', '이 (i)', ['으 (eu)', '아 (a)'], random),
  ])

/** S02D2 — 가/고 e blocos com ㅡ/ㅣ. */
export const buildS02D2Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'syllable',
      title: 'Compare os blocos',
      lines: ['가 tem vogal à direita; 고 tem vogal embaixo.', 'Depois leia blocos com ㅡ e ㅣ.'],
    },
    placementChoice('가', true, random),
    placementChoice('고', false, random),
    placementChoice('기', true, random),
    placementChoice('그', false, random),
    buildSyllableAssembleStep('가', random, { helpLevel: 'guided', distractors: [] }),
    buildSyllableAssembleStep('고', random, { helpLevel: 'guided', distractors: ['ㅏ'] }),
  ])

/** S02D3 — repetir contrastes com i breve (ㅑ ㅕ…). */
export const buildS02D3Steps = (random: Random): Step[] => {
  const letterYa = getLetterById('letter-ya')
  const letterA = getLetterById('letter-a')
  return compact<Step>([
    {
      kind: 'info',
      skillId: 'listening',
      title: 'Com e sem i breve',
      lines: ['ㅑ começa com um i breve antes do a.', 'Ouça, repita e compare com ㅏ.'],
    },
    buildHangulListenChoice('야', '야 (ya)', ['아 (a)', '여 (yeo)'], random),
    buildHangulListenChoice('아', '아 (a)', ['야 (ya)', '어 (eo)'], random),
    letterA ? buildLetterSoundStep(letterA, random) : null,
    letterYa ? buildLetterSoundStep(letterYa, random) : null,
    {
      kind: 'word-repeat',
      skillId: 'speaking-practice',
      vocabId: 'vocab-ai',
      prompt: 'Repita 아이 (criança) — começa com 아',
    },
  ])
}

/** S02D4 — escreva ㅏ, ㅗ, ㅁ e monte 마/모. */
export const buildS02D4Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'write',
      title: 'Trace e monte',
      lines: ['Pratique ㅏ, ㅗ e ㅁ.', 'Depois forme 마 e 모.'],
    },
    ...buildWritePracticePair('letter-a', 'ㅏ'),
    ...buildWritePracticePair('letter-o', 'ㅗ'),
    buildWriteStep('letter-m', { guide: 'guided', prompt: 'Trace ㅁ' }),
    buildSyllableAssembleStep('마', random, { helpLevel: 'guided', distractors: [] }),
    buildSyllableAssembleStep('모', random, { helpLevel: 'guided', distractors: ['ㅏ'] }),
  ])

/** S02D5 — bloco novo: identifique a vogal pelo som. */
export const buildS02D5Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'listening-transfer',
      title: 'Qual é a vogal?',
      lines: ['Ouça um bloco novo sem romanização.', 'Diga se a vogal fica à direita ou embaixo — e qual é.'],
    },
    buildHangulListenChoice('누', 'ㅜ (embaixo)', ['ㅏ (direita)', 'ㅣ (direita)'], random, 'listening-transfer', '누 = ㄴ + ㅜ. A vogal ㅜ fica embaixo.'),
    buildHangulListenChoice('니', 'ㅣ (direita)', ['ㅗ (embaixo)', 'ㅡ (embaixo)'], random, 'listening-transfer', '니 = ㄴ + ㅣ. A vogal ㅣ fica à direita.'),
    buildSyllableAssembleStep('누', random, { helpLevel: 'apply', distractors: ['ㅏ'], prompt: 'Monte o bloco que você ouviu' }),
    placementChoice('비', true, random),
  ])

/** S03D1 — aspiração 피/비, 키/기, 차/자. */
export const buildS03D1Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'listening',
      title: 'Simples × aspirada',
      lines: ['ㅍ e ㅂ, ㅋ e ㄱ, ㅊ e ㅈ mudam o sopro.', 'Ouça no contexto de sílabas curtas.'],
    },
    vowelContrast('피', '비', '피', ['피 (p aspirado)', '비 (b/p)'], random),
    vowelContrast('피', '비', '비', ['피 (p aspirado)', '비 (b/p)'], random),
    vowelContrast('키', '기', '키', ['키 (k aspirado)', '기 (g/k)'], random),
    vowelContrast('차', '자', '차', ['차 (ch aspirado / chá)', '자 (j)'], random),
  ])

/** S03D2 — inicial, vogal e final em 물, 빵, 밥. */
export const buildS03D2Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'syllable',
      title: 'Encontre o batchim',
      lines: ['물, 빵 e 밥 têm consoante final.', 'Localize inicial, vogal e final.'],
    },
    batchimChoice('물', 'ㄹ', ['ㅁ', 'ㅜ'], random),
    batchimChoice('빵', 'ㅇ', ['ㅃ', 'ㅏ'], random),
    batchimChoice('밥', 'ㅂ', ['ㅏ', 'ㅇ'], random),
    buildVocabChoiceStep(getVocabById('vocab-mul')!, 'ko-pt', random),
    buildVocabChoiceStep(getVocabById('vocab-ppang')!, 'ko-pt', random),
    buildVocabChoiceStep(getVocabById('vocab-bap')!, 'ko-pt', random),
  ])

/** S03D3 — ler e repetir palavras curtas. */
export const buildS03D3Steps = (random: Random): Step[] => {
  const ids = ['vocab-mul', 'vocab-ppang', 'vocab-bap', 'vocab-cha'] as const
  return compact<Step>([
    {
      kind: 'info',
      skillId: 'listening',
      title: 'Leia e diga',
      lines: ['Ouça o modelo, leia o hangul e repita.'],
    },
    ...ids.flatMap((id) => {
      const vocab = getVocabById(id)
      if (!vocab) return []
      return [
        {
          kind: 'word-listen' as const,
          skillId: 'listening',
          vocabId: id,
          prompt: `Ouça: ${vocab.translation}`,
        },
        {
          kind: 'word-repeat' as const,
          skillId: 'speaking-practice',
          vocabId: id,
          prompt: `Repita: ${vocab.hangul}`,
        },
      ]
    }),
    ...sample(
      ids.map((id) => getVocabById(id)!),
      2,
      random,
    ).map((vocab) => buildVocabChoiceStep(vocab, 'pt-ko', random)),
  ])
}

/** S03D4 — monte com final; escreva 물 e 밥 (via letras + assemble). */
export const buildS03D4Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'write',
      title: 'Blocos com final',
      lines: ['Monte sílabas com batchim e trace as peças de 물 e 밥.'],
    },
    buildSyllableAssembleStep('물', random, { helpLevel: 'guided', distractors: ['ㅂ'] }),
    buildSyllableAssembleStep('밥', random, { helpLevel: 'guided', distractors: ['ㄹ'] }),
    buildWriteStep('letter-m', { guide: 'guided', prompt: 'Trace ㅁ (de 물)' }),
    buildWriteStep('letter-b', { guide: 'guided', prompt: 'Trace ㅂ (de 밥)' }),
    buildSyllableAssembleStep('빵', random, { helpLevel: 'apply', distractors: ['ㅁ'], prompt: 'Monte 빵' }),
  ])

/** S03D5 — cardápio novo: áudio + bloco + sentido. */
export const buildS03D5Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'listening-transfer',
      title: 'Cardápio novo',
      lines: ['Associe áudio, hangul e sentido num pedido diferente.'],
    },
    buildHangulListenChoice('물', 'água', ['pão', 'arroz cozido / refeição'], random, 'listening-transfer'),
    buildHangulListenChoice('밥', 'arroz cozido / refeição', ['água', 'chá'], random, 'listening-transfer'),
    buildVocabChoiceStep(getVocabById('vocab-ppang')!, 'pt-ko', random),
    orderTiles('물', 'vocab-mul', random),
    buildSyllableAssembleStep('밥', random, { helpLevel: 'apply', distractors: ['ㄹ', 'ㅇ'], prompt: 'Monte o item do cardápio' }),
  ])

/** S04D1 — séries simples / aspiradas / tensas. */
export const buildS04D1Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'listening',
      title: 'Três tipos de inicial',
      lines: ['ㄱ simples, ㅋ aspirada, ㄲ tensa.', 'Ouça pares curtos.'],
    },
    vowelContrast('가', '카', '카', ['가 (g/k)', '카 (k aspirado)'], random),
    vowelContrast('다', '따', '따', ['다 (d/t)', '따 (t tenso)'], random),
    vowelContrast('바', '빠', '빠', ['바 (b/p)', '빠 (p tenso)'], random),
    vowelContrast('사', '싸', '싸', ['사 (s)', '싸 (s tenso)'], random),
    buildHangulListenChoice('빵', '빵 (ppang)', ['방 (bang)', '팡 (pang)'], random),
  ])

/** S04D2 — cardápio de quatro itens. */
export const buildS04D2Steps = (random: Random): Step[] => {
  const items = ['vocab-keopi', 'vocab-mul', 'vocab-cha', 'vocab-ppang'].map((id) => getVocabById(id)!)
  return compact<Step>([
    {
      kind: 'info',
      skillId: 'vocab',
      title: 'Leia o cardápio',
      lines: ['Quatro itens: café, água, chá e pão.', 'Leia e associe ao sentido.'],
    },
    ...items.map((vocab) => buildVocabChoiceStep(vocab, 'ko-pt', random)),
    ...items.map((vocab) => buildVocabChoiceStep(vocab, 'pt-ko', random)),
  ])
}

/** S04D3 — pedido + confirmação. */
export const buildS04D3Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'phrase',
      title: 'Faça o pedido',
      lines: ['Cumprimente, peça com 주세요 e confirme com 네.'],
    },
    {
      kind: 'word-listen',
      skillId: 'listening',
      vocabId: 'vocab-annyeonghaseyo',
      prompt: 'Ouça o cumprimento',
    },
    orderTiles('커피', 'vocab-keopi', random),
    orderTiles('빵', 'vocab-ppang', random),
    {
      kind: 'tiles',
      skillId: 'phrase',
      errorId: 'phrase:confirm',
      prompt: 'Confirme: “sim”',
      bank: shuffle(['네', '아니요', '주세요'], random),
      answer: ['네'],
      join: ' ',
      tileLanguage: 'ko',
      explanation: '네 = sim.',
    },
    {
      kind: 'word-repeat',
      skillId: 'speaking-practice',
      vocabId: 'vocab-gamsahamnida',
      prompt: 'Agradeça em voz alta',
    },
  ])

/** S04D4 — “digite” a bebida: monte blocos e espaçamento do pedido. */
export const buildS04D4Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'phrase',
      title: 'Monte o pedido completo',
      lines: ['Confira a ordem das peças e o espaço entre bebida e 주세요.'],
    },
    orderTiles('차', 'vocab-cha', random),
    {
      kind: 'tiles',
      skillId: 'phrase',
      errorId: 'phrase:full-order',
      prompt: 'Monte: água, por favor + obrigado',
      bank: shuffle(['물', '주세요', '감사합니다', '아니요'], random),
      answer: ['물', '주세요', '감사합니다'],
      join: ' ',
      tileLanguage: 'ko',
      explanation: '물 주세요. 감사합니다.',
    },
    buildSyllableAssembleStep('차', random, { helpLevel: 'guided', distractors: ['ㅋ'] }),
    buildWriteStep('letter-ch', { guide: 'guided', prompt: 'Trace ㅊ' }),
  ])

/**
 * S04D5 — marco de saída: cardápio e “voz” diferentes.
 * Evidência: reconhece bebida, lê 3/4 itens, monta bloco, pedido com cortesia.
 */
export const buildS04D5Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'listening-transfer',
      title: 'Marco S04 · Pedido no café',
      lines: [
        'Cardápio e voz novos. Sem apoio na primeira escuta.',
        'Meta: reconhecer a bebida, ler o cardápio, montar um bloco e pedir com 주세요.',
      ],
    },
    buildHangulListenChoice('우유', 'leite', ['água', 'chá'], random, 'listening-transfer', 'Você ouviu 우유 (leite) — item novo no cardápio.'),
    buildVocabChoiceStep(getVocabById('vocab-keopi')!, 'ko-pt', random),
    buildVocabChoiceStep(getVocabById('vocab-mul')!, 'ko-pt', random),
    buildVocabChoiceStep(getVocabById('vocab-cha')!, 'ko-pt', random),
    buildVocabChoiceStep(getVocabById('vocab-ppang')!, 'pt-ko', random),
    buildSyllableAssembleStep('나', random, {
      helpLevel: 'apply',
      distractors: ['ㄱ', 'ㅗ'],
      prompt: 'Monte um bloco novo com letras estudadas',
    }),
    {
      kind: 'tiles',
      skillId: 'phrase',
      errorId: 'phrase:milestone-order',
      prompt: 'Faça um pedido educado (leite)',
      bank: shuffle(['우유', '주세요', '빵', '아니요'], random),
      answer: ['우유', '주세요'],
      join: ' ',
      tileLanguage: 'ko',
      patternHint: 'item + 주세요',
      explanation: '우유 주세요 = leite, por favor. Fórmula de cortesia do marco S04.',
    },
    {
      kind: 'word-repeat',
      skillId: 'speaking-practice',
      vocabId: 'vocab-gamsahamnida',
      prompt: 'Feche com agradecimento',
    },
  ])

export const STAGE1_PLAN_BUILDERS: Readonly<Record<string, (random: Random) => Step[]>> = {
  'lesson-s02-d1': buildS02D1Steps,
  'lesson-s02-d2': buildS02D2Steps,
  'lesson-s02-d3': buildS02D3Steps,
  'lesson-s02-d4': buildS02D4Steps,
  'lesson-s02-d5': buildS02D5Steps,
  'lesson-s03-d1': buildS03D1Steps,
  'lesson-s03-d2': buildS03D2Steps,
  'lesson-s03-d3': buildS03D3Steps,
  'lesson-s03-d4': buildS03D4Steps,
  'lesson-s03-d5': buildS03D5Steps,
  'lesson-s04-d1': buildS04D1Steps,
  'lesson-s04-d2': buildS04D2Steps,
  'lesson-s04-d3': buildS04D3Steps,
  'lesson-s04-d4': buildS04D4Steps,
  'lesson-s04-d5': buildS04D5Steps,
}
