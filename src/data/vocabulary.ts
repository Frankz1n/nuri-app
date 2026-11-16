import type { VocabCategory, VocabItem } from './types'

export const VOCAB_CATEGORY_LABELS: Readonly<Record<VocabCategory, string>> = {
  saudacoes: 'Saudações',
  cotidiano: 'Cotidiano',
  cultura: 'Cultura e K-pop',
  alimentacao: 'Alimentação',
  viagem: 'Viagem',
  pessoas: 'Pessoas',
  tempo: 'Tempo',
  numeros: 'Números',
}

export const VOCABULARY: readonly VocabItem[] = [
  // Saudações (10)
  { id: 'vocab-annyeonghaseyo', hangul: '안녕하세요', translation: 'olá', romanization: 'annyeonghaseyo', category: 'saudacoes', note: 'Cumprimento educado, usado a qualquer hora do dia.' },
  { id: 'vocab-annyeong', hangul: '안녕', translation: 'oi / tchau (informal)', romanization: 'annyeong', category: 'saudacoes', note: 'Só use com amigos próximos ou pessoas mais novas.' },
  { id: 'vocab-gamsahamnida', hangul: '감사합니다', translation: 'obrigado(a)', romanization: 'gamsahamnida', category: 'saudacoes', note: 'Forma formal de agradecer.' },
  { id: 'vocab-gomawoyo', hangul: '고마워요', translation: 'obrigado(a) (educado, mais leve)', romanization: 'gomawoyo', category: 'saudacoes' },
  { id: 'vocab-joesonghamnida', hangul: '죄송합니다', translation: 'sinto muito / com licença', romanization: 'joesonghamnida', category: 'saudacoes', note: 'Pedido de desculpas formal.' },
  { id: 'vocab-mianhaeyo', hangul: '미안해요', translation: 'desculpe', romanization: 'mianhaeyo', category: 'saudacoes' },
  { id: 'vocab-ne', hangul: '네', translation: 'sim', romanization: 'ne', category: 'saudacoes' },
  { id: 'vocab-aniyo', hangul: '아니요', translation: 'não', romanization: 'aniyo', category: 'saudacoes' },
  { id: 'vocab-annyeonghi-gaseyo', hangul: '안녕히 가세요', translation: 'tchau (para quem vai embora)', romanization: 'annyeonghi gaseyo', category: 'saudacoes', note: 'Dito por quem fica.' },
  { id: 'vocab-annyeonghi-gyeseyo', hangul: '안녕히 계세요', translation: 'tchau (para quem fica)', romanization: 'annyeonghi gyeseyo', category: 'saudacoes', note: 'Dito por quem vai embora.' },

  // Cotidiano (10)
  { id: 'vocab-jip', hangul: '집', translation: 'casa', romanization: 'jip', category: 'cotidiano' },
  { id: 'vocab-hakgyo', hangul: '학교', translation: 'escola', romanization: 'hakgyo', category: 'cotidiano' },
  { id: 'vocab-chaek', hangul: '책', translation: 'livro', romanization: 'chaek', category: 'cotidiano' },
  { id: 'vocab-jeonhwa', hangul: '전화', translation: 'telefone / ligação', romanization: 'jeonhwa', category: 'cotidiano' },
  { id: 'vocab-gabang', hangul: '가방', translation: 'bolsa / mochila', romanization: 'gabang', category: 'cotidiano' },
  { id: 'vocab-sigye', hangul: '시계', translation: 'relógio', romanization: 'sigye', category: 'cotidiano' },
  { id: 'vocab-uija', hangul: '의자', translation: 'cadeira', romanization: 'uija', category: 'cotidiano' },
  { id: 'vocab-changmun', hangul: '창문', translation: 'janela', romanization: 'changmun', category: 'cotidiano' },
  { id: 'vocab-mun', hangul: '문', translation: 'porta', romanization: 'mun', category: 'cotidiano' },
  { id: 'vocab-sinbal', hangul: '신발', translation: 'sapato', romanization: 'sinbal', category: 'cotidiano' },

  // Cultura e K-pop (10)
  { id: 'vocab-eumak', hangul: '음악', translation: 'música', romanization: 'eumak', category: 'cultura' },
  { id: 'vocab-norae', hangul: '노래', translation: 'canção', romanization: 'norae', category: 'cultura' },
  { id: 'vocab-gasu', hangul: '가수', translation: 'cantor(a)', romanization: 'gasu', category: 'cultura' },
  { id: 'vocab-yeonghwa', hangul: '영화', translation: 'filme', romanization: 'yeonghwa', category: 'cultura' },
  { id: 'vocab-deurama', hangul: '드라마', translation: 'drama (série de TV)', romanization: 'deurama', category: 'cultura', note: 'Os famosos doramas coreanos.' },
  { id: 'vocab-chum', hangul: '춤', translation: 'dança', romanization: 'chum', category: 'cultura' },
  { id: 'vocab-paen', hangul: '팬', translation: 'fã', romanization: 'paen', category: 'cultura' },
  { id: 'vocab-mudae', hangul: '무대', translation: 'palco', romanization: 'mudae', category: 'cultura' },
  { id: 'vocab-hangugeo', hangul: '한국어', translation: 'língua coreana', romanization: 'hangugeo', category: 'cultura' },
  { id: 'vocab-hanguk', hangul: '한국', translation: 'Coreia do Sul', romanization: 'hanguk', category: 'cultura' },

  // Alimentação (11)
  { id: 'vocab-mul', hangul: '물', translation: 'água', romanization: 'mul', category: 'alimentacao' },
  { id: 'vocab-bap', hangul: '밥', translation: 'arroz cozido / refeição', romanization: 'bap', category: 'alimentacao', note: 'Também é usado para "refeição" em geral.' },
  { id: 'vocab-kimchi', hangul: '김치', translation: 'kimchi (conserva de legumes)', romanization: 'gimchi', category: 'alimentacao' },
  { id: 'vocab-keopi', hangul: '커피', translation: 'café (bebida)', romanization: 'keopi', category: 'alimentacao' },
  { id: 'vocab-cha', hangul: '차', translation: 'chá', romanization: 'cha', category: 'alimentacao' },
  { id: 'vocab-ppang', hangul: '빵', translation: 'pão', romanization: 'ppang', category: 'alimentacao' },
  { id: 'vocab-uyu', hangul: '우유', translation: 'leite', romanization: 'uyu', category: 'alimentacao' },
  { id: 'vocab-gogi', hangul: '고기', translation: 'carne', romanization: 'gogi', category: 'alimentacao' },
  { id: 'vocab-gwail', hangul: '과일', translation: 'fruta', romanization: 'gwail', category: 'alimentacao' },
  { id: 'vocab-ramyeon', hangul: '라면', translation: 'lámen', romanization: 'ramyeon', category: 'alimentacao' },
  { id: 'vocab-tteok', hangul: '떡', translation: 'bolinho de arroz', romanization: 'tteok', category: 'alimentacao' },

  // Viagem (8)
  { id: 'vocab-gonghang', hangul: '공항', translation: 'aeroporto', romanization: 'gonghang', category: 'viagem' },
  { id: 'vocab-bihaenggi', hangul: '비행기', translation: 'avião', romanization: 'bihaenggi', category: 'viagem' },
  { id: 'vocab-taeksi', hangul: '택시', translation: 'táxi', romanization: 'taeksi', category: 'viagem' },
  { id: 'vocab-jihacheol', hangul: '지하철', translation: 'metrô', romanization: 'jihacheol', category: 'viagem' },
  { id: 'vocab-yeogwon', hangul: '여권', translation: 'passaporte', romanization: 'yeogwon', category: 'viagem' },
  { id: 'vocab-hotel', hangul: '호텔', translation: 'hotel', romanization: 'hotel', category: 'viagem' },
  { id: 'vocab-yeohaeng', hangul: '여행', translation: 'viagem', romanization: 'yeohaeng', category: 'viagem' },
  { id: 'vocab-seoul', hangul: '서울', translation: 'Seul (capital)', romanization: 'seoul', category: 'viagem' },

  // Pessoas (8)
  { id: 'vocab-chingu', hangul: '친구', translation: 'amigo(a)', romanization: 'chingu', category: 'pessoas' },
  { id: 'vocab-gajok', hangul: '가족', translation: 'família', romanization: 'gajok', category: 'pessoas' },
  { id: 'vocab-eomma', hangul: '엄마', translation: 'mamãe', romanization: 'eomma', category: 'pessoas' },
  { id: 'vocab-appa', hangul: '아빠', translation: 'papai', romanization: 'appa', category: 'pessoas' },
  { id: 'vocab-seonsaengnim', hangul: '선생님', translation: 'professor(a)', romanization: 'seonsaengnim', category: 'pessoas' },
  { id: 'vocab-haksaeng', hangul: '학생', translation: 'estudante', romanization: 'haksaeng', category: 'pessoas' },
  { id: 'vocab-saram', hangul: '사람', translation: 'pessoa', romanization: 'saram', category: 'pessoas' },
  { id: 'vocab-ai', hangul: '아이', translation: 'criança', romanization: 'ai', category: 'pessoas' },

  // Tempo (8)
  { id: 'vocab-oneul', hangul: '오늘', translation: 'hoje', romanization: 'oneul', category: 'tempo' },
  { id: 'vocab-eoje', hangul: '어제', translation: 'ontem', romanization: 'eoje', category: 'tempo' },
  { id: 'vocab-naeil', hangul: '내일', translation: 'amanhã', romanization: 'naeil', category: 'tempo' },
  { id: 'vocab-achim', hangul: '아침', translation: 'manhã', romanization: 'achim', category: 'tempo' },
  { id: 'vocab-jeonyeok', hangul: '저녁', translation: 'fim de tarde / noite', romanization: 'jeonyeok', category: 'tempo' },
  { id: 'vocab-bam', hangul: '밤', translation: 'noite (madrugada)', romanization: 'bam', category: 'tempo' },
  { id: 'vocab-jigeum', hangul: '지금', translation: 'agora', romanization: 'jigeum', category: 'tempo' },
  { id: 'vocab-jumal', hangul: '주말', translation: 'fim de semana', romanization: 'jumal', category: 'tempo' },

  // Números (7) — sino-coreanos
  { id: 'vocab-num-il', hangul: '일', translation: 'um (sino-coreano)', romanization: 'il', category: 'numeros' },
  { id: 'vocab-num-i', hangul: '이', translation: 'dois (sino-coreano)', romanization: 'i', category: 'numeros' },
  { id: 'vocab-num-sam', hangul: '삼', translation: 'três (sino-coreano)', romanization: 'sam', category: 'numeros' },
  { id: 'vocab-num-sa', hangul: '사', translation: 'quatro (sino-coreano)', romanization: 'sa', category: 'numeros' },
  { id: 'vocab-num-o', hangul: '오', translation: 'cinco (sino-coreano)', romanization: 'o', category: 'numeros' },
  { id: 'vocab-num-yuk', hangul: '육', translation: 'seis (sino-coreano)', romanization: 'yuk', category: 'numeros' },
  { id: 'vocab-num-chil', hangul: '칠', translation: 'sete (sino-coreano)', romanization: 'chil', category: 'numeros' },
]

export const getVocabById = (vocabId: string): VocabItem | undefined =>
  VOCABULARY.find((item) => item.id === vocabId)

export const getVocabIdsByCategory = (category: VocabCategory): string[] =>
  VOCABULARY.filter((item) => item.category === category).map((item) => item.id)
