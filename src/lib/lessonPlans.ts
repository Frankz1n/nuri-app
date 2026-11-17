import { LETTERS, getLetterById, getLiveSituation, getPhraseById, getReadingById, getVocabById } from '../data'
import type { Lesson, VocabItem } from '../data'
import { sample, shuffle } from './random'
import { buildLiveListeningStep } from './liveListening'
import type { Random } from './random'
import { STAGE1_PLAN_BUILDERS } from './stage1Plans'
import type { ChoiceStep, InfoStep, ListenChoiceStep, Step, TilesStep, WordListenStep, WordRepeatStep } from './steps'
import {
  buildAssembleDemoInfo,
  buildLetterBlockStep,
  buildLetterCharStep,
  buildLetterSoundStep,
  buildPhraseStep,
  buildReadStep,
  buildReadingQuestionSteps,
  buildSyllableAssembleStep,
  buildSyllableComposeStep,
  buildSyllableDecomposeStep,
  buildVocabChoiceStep,
  buildWritePracticePair,
  buildWriteStep,
} from './stepBuilders'

const compact = <T>(items: readonly (T | null | undefined)[]): T[] => items.flatMap((item) => (item ? [item] : []))

const buildLetterLessonSteps = (lesson: Lesson, random: Random): Step[] => {
  const letter = lesson.letterId ? getLetterById(lesson.letterId) : undefined
  if (!letter) return []
  const intro: InfoStep = {
    kind: 'info',
    skillId: 'letter-char',
    title: 'Conheça a letra',
    big: letter.char,
    bigLanguage: 'ko',
    caption: `${letter.name} · romanização "${letter.romanization}"`,
    lines: [
      `Exemplo: ${letter.example.hangul} (${letter.example.romanization}) — ${letter.example.translation}.`,
      `Esta letra tem ${letter.strokes.length} ${letter.strokes.length === 1 ? 'traço' : 'traços'}. Na próxima etapa você vai desenhá-la.`,
    ],
  }
  return compact<Step>([
    intro,
    ...buildWritePracticePair(letter.id, letter.char),
    buildLetterSoundStep(letter, random),
    buildLetterBlockStep(letter, random) ?? buildLetterCharStep(letter, random),
  ])
}

/** Piloto: ㄱ, ㄴ, ㅏ → montar 가 e 나, depois aplicação 노. */
const buildPilotBlocksSteps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'letter-char',
      title: 'Seus primeiros jamo',
      big: 'ㄱ · ㄴ · ㅏ',
      bigLanguage: 'ko',
      lines: [
        'Você vai reconhecer e traçar ㄱ, ㄴ e ㅏ.',
        'Depois monta os primeiros blocos: 가 e 나.',
      ],
    },
    ...buildWritePracticePair('letter-a', 'ㅏ'),
    ...buildWritePracticePair('letter-g', 'ㄱ'),
    ...buildWritePracticePair('letter-n', 'ㄴ'),
    buildAssembleDemoInfo('가'),
    buildSyllableAssembleStep('가', random, { helpLevel: 'guided', distractors: [] }),
    buildSyllableAssembleStep('나', random, { helpLevel: 'guided', distractors: ['ㄱ'] }),
    {
      kind: 'info',
      skillId: 'syllable',
      title: 'Vogal embaixo',
      big: 'ㄴ + ㅗ → 노',
      bigLanguage: 'ko',
      lines: [
        'Com ㅗ, a vogal fica embaixo da consoante.',
        'Agora você escolhe a ordem das peças sem ver o arranjo pronto.',
      ],
    },
    buildWriteStep('letter-o', { guide: 'guided', prompt: 'Trace ㅗ (fica embaixo no bloco)' }),
    buildSyllableAssembleStep('노', random, {
      helpLevel: 'apply',
      distractors: ['ㅏ'],
      prompt: 'Monte o bloco com ㄴ e ㅗ',
    }),
  ])

/** Sequência do vídeo: ㅣ → 피 → 키. */
const buildPiKiDemoSteps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'letter-char',
      title: 'A vogal ㅣ',
      big: 'ㅣ',
      bigLanguage: 'ko',
      lines: ['ㅣ é um traço vertical de cima para baixo.', 'Em seguida você monta 피 e 키.'],
    },
    ...buildWritePracticePair('letter-i', 'ㅣ'),
    {
      kind: 'info',
      skillId: 'letter-char',
      title: 'Consoantes ㅍ e ㅋ',
      big: 'ㅍ · ㅋ',
      bigLanguage: 'ko',
      lines: ['ㅍ (pieup) e ㅋ (kieuk) entram à esquerda; ㅣ fica à direita.'],
    },
    buildWriteStep('letter-p', { guide: 'guided', prompt: 'Trace ㅍ' }),
    buildWriteStep('letter-k', { guide: 'guided', prompt: 'Trace ㅋ' }),
    buildAssembleDemoInfo('피'),
    buildSyllableAssembleStep('피', random, { helpLevel: 'guided', distractors: [] }),
    buildSyllableAssembleStep('키', random, {
      helpLevel: 'guided',
      distractors: ['ㅍ'],
      prompt: 'Monte o bloco com ㅋ e ㅣ',
    }),
  ])

const buildReviewLessonSteps = (random: Random): Step[] => {
  const basics = LETTERS.filter((letter) => letter.group === 'vowel-basic' || letter.group === 'consonant-basic')
  const chosen = sample(basics, 6, random)
  const questions = chosen.flatMap((letter, index): Step[] =>
    index % 2 === 0 ? [buildLetterSoundStep(letter, random)] : [buildLetterCharStep(letter, random)],
  )
  const blocks = compact<Step>(sample(basics, 2, random).map((letter) => buildLetterBlockStep(letter, random)))
  const writing = buildWriteStep(sample(basics, 1, random)[0].id)
  return [...questions, ...blocks, writing]
}

const buildOrientationChoice = (
  syllable: string,
  prompt: string,
  correctText: string,
  wrongTexts: readonly string[],
  explanation: string,
  random: Random,
): ChoiceStep => {
  const options = shuffle([correctText, ...wrongTexts], random)
  return {
    kind: 'choice',
    skillId: 'syllable',
    errorId: `syllable:${syllable}`,
    prompt,
    big: syllable,
    bigLanguage: 'ko',
    options: options.map((text) => ({ text, language: 'pt' })),
    answerIndex: options.indexOf(correctText),
    explanation,
  }
}

const buildSyllableLessonSteps = (lesson: Lesson, random: Random): Step[] => {
  const decompose = (syllables: readonly string[]): Step[] =>
    compact(syllables.map((syllable) => buildSyllableDecomposeStep(syllable, random)))
  const compose = (syllables: readonly string[]): Step[] =>
    compact(syllables.map((syllable) => buildSyllableComposeStep(syllable, random)))

  if (lesson.id.endsWith('-02')) {
    const placement = (syllable: string, isRight: boolean): ChoiceStep =>
      buildOrientationChoice(
        syllable,
        'Onde fica a vogal neste bloco?',
        isRight ? 'À direita da consoante' : 'Embaixo da consoante',
        [isRight ? 'Embaixo da consoante' : 'À direita da consoante'],
        isRight
          ? 'Vogais verticais (ㅏ, ㅓ, ㅣ...) ficam à direita da consoante.'
          : 'Vogais horizontais (ㅗ, ㅜ, ㅡ...) ficam embaixo da consoante.',
        random,
      )
    return [
      {
        kind: 'info',
        skillId: 'syllable',
        title: 'Vogais verticais e horizontais',
        big: '가 · 고',
        bigLanguage: 'ko',
        lines: [
          'Vogais verticais (ㅏ, ㅓ, ㅣ) ficam à direita da consoante: ㄱ + ㅏ = 가.',
          'Vogais horizontais (ㅗ, ㅜ, ㅡ) ficam embaixo da consoante: ㄱ + ㅗ = 고.',
        ],
      },
      placement('가', true),
      placement('고', false),
      placement('구', false),
      placement('기', true),
      ...decompose(['고', '비', '구']),
      ...compose(['소', '누']),
    ]
  }

  if (lesson.id.endsWith('-03')) {
    const batchim = (syllable: string, finalChar: string, wrong: readonly string[]): ChoiceStep =>
      buildOrientationChoice(
        syllable,
        'Qual é o batchim (consoante final) deste bloco?',
        finalChar,
        wrong,
        `${syllable} termina em ${finalChar}: é o batchim, escrito embaixo da sílaba.`,
        random,
      )
    return [
      {
        kind: 'info',
        skillId: 'syllable',
        title: 'Batchim: a consoante final',
        big: '한',
        bigLanguage: 'ko',
        lines: [
          'O batchim é a consoante que fica embaixo do bloco, no final da sílaba.',
          '한 = ㅎ + ㅏ + ㄴ. O ㄴ embaixo é o batchim.',
        ],
      },
      ...decompose(['한', '글', '밤']),
      batchim('밥', 'ㅂ', ['ㅁ', 'ㅇ', 'ㄱ']),
      batchim('물', 'ㄹ', ['ㄴ', 'ㅁ', 'ㅂ']),
      ...compose(['말', '산']),
    ]
  }

  return compact<Step>([
    {
      kind: 'info',
      skillId: 'syllable',
      title: 'Formando sílabas',
      big: '가',
      bigLanguage: 'ko',
      lines: [
        'Cada bloco do hangul começa com uma consoante e uma vogal.',
        'ㄱ + ㅏ = 가. Quando a sílaba começa com som de vogal, usamos o ㅇ mudo: ㅇ + ㅏ = 아.',
      ],
    },
    buildAssembleDemoInfo('가'),
    buildSyllableAssembleStep('가', random, { helpLevel: 'guided' }),
    buildSyllableAssembleStep('나', random, { helpLevel: 'guided', distractors: ['ㄱ'] }),
    buildSyllableAssembleStep('고', random, { helpLevel: 'guided' }),
    ...decompose(['아']),
    ...compose(['다', '마']),
  ])
}

const buildVocabLessonSteps = (vocabIds: readonly string[], random: Random): Step[] => {
  const vocabItems = vocabIds.flatMap((vocabId): VocabItem[] => {
    const vocab = getVocabById(vocabId)
    return vocab ? [vocab] : []
  })
  const introductions: InfoStep[] = vocabItems.map((vocab) => ({
    kind: 'info',
    skillId: 'vocab',
    title: 'Palavra nova',
    big: vocab.hangul,
    bigLanguage: 'ko',
    caption: vocab.translation,
    lines: vocab.note ? [vocab.note] : [],
    vocabId: vocab.id,
  }))
  const quiz = sample(vocabItems, Math.min(8, vocabItems.length), random).map((vocab, index) =>
    buildVocabChoiceStep(vocab, index % 2 === 0 ? 'ko-pt' : 'pt-ko', random),
  )
  return [...introductions, ...quiz]
}

const buildPhraseLessonSteps = (phraseIds: readonly string[], random: Random): Step[] => {
  const phrases = phraseIds.flatMap((phraseId) => getPhraseById(phraseId) ?? [])
  const intro: InfoStep = {
    kind: 'info',
    skillId: 'phrase',
    title: 'Ordem das palavras',
    lines: [
      'Em coreano, o verbo vem no final da frase.',
      'Neste exercício você pratica a ordem básica: sujeito/tópico + objeto ou complemento + verbo.',
      'Toque nas peças na ordem certa. Não é preciso teclado coreano.',
    ],
  }
  return [intro, ...phrases.map((phrase) => buildPhraseStep(phrase, random))]
}

const buildReadingLessonSteps = (readingId: string): Step[] => {
  const reading = getReadingById(readingId)
  return reading ? [buildReadStep(reading.id), ...buildReadingQuestionSteps(reading)] : []
}

const buildSpeakPair = (vocabId: string): Step[] => {
  const vocab = getVocabById(vocabId)
  if (!vocab) return []
  const listen: WordListenStep = {
    kind: 'word-listen',
    skillId: 'listening',
    vocabId,
    prompt: `Ouça: ${vocab.translation}`,
  }
  const repeat: WordRepeatStep = {
    kind: 'word-repeat',
    skillId: 'speaking-practice',
    vocabId,
    prompt: `Repita: ${vocab.translation}`,
  }
  return [listen, repeat]
}

const buildListenChoice = (
  vocabId: string,
  distractorTranslations: readonly string[],
  random: Random,
  skillId = 'listening',
): ListenChoiceStep | null => {
  const vocab = getVocabById(vocabId)
  if (!vocab) return null
  const options = shuffle([vocab.translation, ...distractorTranslations], random)
  return {
    kind: 'listen-choice',
    skillId,
    errorId: `listen-choice:${vocab.id}`,
    speakText: vocab.hangul,
    prompt: 'O que você ouviu?',
    options,
    answerIndex: options.indexOf(vocab.translation),
    explanation: `Você ouviu ${vocab.hangul}. É ${vocab.translation}.`,
    revealHangul: vocab.hangul,
  }
}

const buildAudioContrastStep = (
  leftVocabId: string,
  rightVocabId: string,
  askFor: 'left' | 'right',
  random: Random,
): ListenChoiceStep | null => {
  const left = getVocabById(leftVocabId)
  const right = getVocabById(rightVocabId)
  if (!left || !right) return null
  const target = askFor === 'left' ? left : right
  const options = shuffle([left.translation, right.translation], random)
  return {
    kind: 'listen-choice',
    skillId: 'listening',
    errorId: `listen-choice:contrast:${target.id}`,
    speakText: target.hangul,
    prompt: 'Qual áudio é este?',
    options,
    answerIndex: options.indexOf(target.translation),
    explanation: `Era ${target.hangul} (${target.translation}).`,
    revealHangul: target.hangul,
  }
}

/** S01D1 — reconhecer café, água e chá sem hangul na primeira tentativa. */
const buildS01D1Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'listening',
      title: 'No balcão do café',
      lines: [
        'O Horangi pede bebidas em coreano. Ouça primeiro; o hangul só aparece se você pedir apoio.',
        'Depois você escolhe a bebida pelo sentido.',
      ],
    },
    ...buildSpeakPair('vocab-keopi'),
    ...buildSpeakPair('vocab-mul'),
    ...buildSpeakPair('vocab-cha'),
    buildListenChoice('vocab-mul', ['café (bebida)', 'chá'], random),
    buildAudioContrastStep('vocab-keopi', 'vocab-cha', 'right', random),
    {
      kind: 'word-repeat',
      skillId: 'speaking-practice',
      vocabId: 'vocab-keopi',
      prompt: 'Repita 커피 e compare com o modelo',
    },
    buildListenChoice('vocab-cha', ['água', 'café (bebida)'], random, 'listening-transfer'),
  ])

/** S01D2 — as três bebidas + 빵, associação palavra–imagem (tradução). */
const buildS01D2Steps = (random: Random): Step[] => {
  const items = ['vocab-keopi', 'vocab-mul', 'vocab-cha', 'vocab-ppang'].flatMap((id) => getVocabById(id) ?? [])
  return compact<Step>([
    {
      kind: 'info',
      skillId: 'vocab',
      title: 'Palavras do café',
      lines: ['Agora você lê e associa café, água, chá e pão.', 'Hangul e sentido juntos.'],
    },
    ...items.flatMap((vocab) => buildSpeakPair(vocab.id)),
    ...items.map((vocab) => buildVocabChoiceStep(vocab, 'ko-pt', random)),
    ...sample(items, 2, random).map((vocab) => buildVocabChoiceStep(vocab, 'pt-ko', random)),
  ])
}

/** S01D3 — cumprimento + pedido com 주세요. */
const buildS01D3Steps = (random: Random): Step[] => {
  const orderDrink = (drinkHangul: string, drinkId: string): TilesStep => {
    const bank = shuffle([drinkHangul, '주세요', '네', '안녕하세요'], random)
    return {
      kind: 'tiles',
      skillId: 'phrase',
      errorId: `phrase:order:${drinkId}`,
      prompt: 'Monte o pedido educado',
      bank,
      answer: [drinkHangul, '주세요'],
      join: ' ',
      tileLanguage: 'ko',
      patternHint: 'bebida + 주세요',
      explanation: `${drinkHangul} 주세요 = peça ${getVocabById(drinkId)?.translation ?? 'a bebida'} com educação.`,
    }
  }

  return compact<Step>([
    {
      kind: 'info',
      skillId: 'listening',
      title: 'Cumprimente e peça',
      lines: [
        'No café você cumprimenta, pede com 주세요 e agradece.',
        'Monte as peças na ordem certa.',
      ],
    },
    ...buildSpeakPair('vocab-annyeonghaseyo'),
    ...buildSpeakPair('vocab-juseyo'),
    ...buildSpeakPair('vocab-gamsahamnida'),
    orderDrink('물', 'vocab-mul'),
    orderDrink('커피', 'vocab-keopi'),
    {
      kind: 'tiles',
      skillId: 'phrase',
      errorId: 'phrase:thanks',
      prompt: 'Agradeça depois do pedido',
      bank: shuffle(['감사합니다', '네', '물', '주세요'], random),
      answer: ['감사합니다'],
      join: ' ',
      tileLanguage: 'ko',
      explanation: '감사합니다 = obrigado(a), forma formal.',
    },
    buildListenChoice('vocab-ne', ['não', 'olá'], random),
  ])
}

/** S01D5 — pedido com outra voz + montar 나 sem contorno. */
const buildS01D5Steps = (random: Random): Step[] =>
  compact<Step>([
    {
      kind: 'info',
      skillId: 'listening-transfer',
      title: 'Mesmo pedido, situação nova',
      lines: [
        'Ouça de novo sem texto e reconheça a bebida.',
        'Depois reconstrua 나 sem ver o contorno pronto.',
      ],
    },
    buildListenChoice('vocab-keopi', ['água', 'chá'], random, 'listening-transfer'),
    buildListenChoice('vocab-mul', ['pão', 'chá'], random, 'listening-transfer'),
    {
      kind: 'tiles',
      skillId: 'phrase',
      errorId: 'phrase:order:transfer',
      prompt: 'Peça chá com 주세요',
      bank: shuffle(['차', '주세요', '빵', '네'], random),
      answer: ['차', '주세요'],
      join: ' ',
      tileLanguage: 'ko',
      explanation: '차 주세요 = chá, por favor.',
    },
    buildSyllableAssembleStep('나', random, {
      helpLevel: 'apply',
      distractors: ['ㄱ', 'ㅏ'],
      prompt: 'Monte 나 sem contorno',
    }),
  ])

const buildSpeakLessonSteps = (vocabIds: readonly string[], random: Random): Step[] => {
  const items = vocabIds.flatMap((vocabId) => getVocabById(vocabId) ?? [])
  if (items.length === 0) return []

  const intro: InfoStep = {
    kind: 'info',
    skillId: 'listening',
    title: 'Fale desde o começo',
    lines: [
      'Primeiro você ouve a palavra em coreano.',
      'Depois repete em voz alta. Começamos com palavras curtas e vamos crescendo.',
    ],
  }

  const pairs = items.flatMap((vocab) => buildSpeakPair(vocab.id))
  const quiz = sample(items, Math.min(3, items.length), random).map((vocab) =>
    buildVocabChoiceStep(vocab, 'ko-pt', random),
  )
  return [intro, ...pairs, ...quiz]
}

export const buildLessonSteps = (lesson: Lesson, random: Random): Step[] => {
  if (lesson.id === 'lesson-speak-01') return buildS01D1Steps(random)
  if (lesson.id === 'lesson-speak-02') return buildS01D2Steps(random)
  if (lesson.id === 'lesson-speak-03') return buildS01D3Steps(random)
  if (lesson.id === 'lesson-s01-d5') return buildS01D5Steps(random)
  if (lesson.id === 'lesson-u1-00') return buildPilotBlocksSteps(random)
  if (lesson.id === 'lesson-u2-16') return buildPiKiDemoSteps(random)
  const stage1Builder = STAGE1_PLAN_BUILDERS[lesson.id]
  if (stage1Builder) return stage1Builder(random)

  switch (lesson.kind) {
    case 'speak':
      return buildSpeakLessonSteps(lesson.vocabIds ?? [], random)
    case 'live': {
      const situation = getLiveSituation(lesson.id)
      if (!situation) return []
      return [
        buildLiveListeningStep(situation, 'opening', random),
        { kind: 'live-read', skillId: 'reading', situationId: situation.id },
        { kind: 'live-speak', skillId: 'speaking-practice', situationId: situation.id },
        buildLiveListeningStep(situation, 'transfer', random),
        buildWriteStep(situation.letterId, { guide: 'guided', prompt: situation.writingPrompt }),
      ]
    }
    case 'letter':
      return buildLetterLessonSteps(lesson, random)
    case 'review':
      return buildReviewLessonSteps(random)
    case 'syllable':
    case 'batchim':
      return buildSyllableLessonSteps(lesson, random)
    case 'vocab':
      return buildVocabLessonSteps(lesson.vocabIds ?? [], random)
    case 'phrase':
      return buildPhraseLessonSteps(lesson.phraseIds ?? [], random)
    case 'reading':
      return buildReadingLessonSteps(lesson.readingId ?? '')
  }
}