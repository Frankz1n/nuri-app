/** Currículo anual Nuri: 6 etapas · 52 semanas · 260 sessões (5 por semana). */

export type CurriculumSkillFocus = 'listen' | 'read' | 'speak' | 'write' | 'transfer'

export type CurriculumSessionStatus = 'playable' | 'outline'

export interface CurriculumStage {
  id: number
  title: string
  weekStart: number
  weekEnd: number
  outcome: string
}

export interface CurriculumWeek {
  number: number
  stageId: number
  mission: string
  targetKorean: string
  daysSummary: {
    d1to3: string
    d4to5: string
  }
}

export interface CurriculumSession {
  id: string
  weekNumber: number
  day: 1 | 2 | 3 | 4 | 5
  skillFocus: CurriculumSkillFocus
  title: string
  status: CurriculumSessionStatus
  /** Lição jogável quando status === 'playable'. */
  lessonId?: string
}

const DAY_FOCUS: readonly CurriculumSkillFocus[] = ['listen', 'read', 'speak', 'write', 'transfer']

const DAY_LABELS: readonly string[] = [
  'Ouvir no contexto',
  'Ler e perceber padrões',
  'Falar ou interagir',
  'Escrever e aplicar',
  'Transferir e revisar',
]

export const CURRICULUM_STAGES: readonly CurriculumStage[] = [
  {
    id: 1,
    title: 'Primeiros sons e hangul',
    weekStart: 1,
    weekEnd: 4,
    outcome: 'Reconhecer palavras familiares, montar blocos e fazer um pedido curto com apoio.',
  },
  {
    id: 2,
    title: 'Coreano do cotidiano',
    weekStart: 5,
    weekEnd: 12,
    outcome: 'Apresentar-se, perguntar preço e horário, pedir direções e contar algo simples em turnos curtos.',
  },
  {
    id: 3,
    title: 'Conversas e histórias',
    weekStart: 13,
    weekEnd: 24,
    outcome: 'Narrar uma experiência, esclarecer um problema e acompanhar trechos curtos em fala natural.',
  },
  {
    id: 4,
    title: 'Coreano em contexto',
    weekStart: 25,
    weekEnd: 36,
    outcome: 'Acompanhar entrevistas e lives, ajustar o registro, relatar fala alheia e sustentar uma opinião com razões.',
  },
  {
    id: 5,
    title: 'Coreano avançado aplicado',
    weekStart: 37,
    weekEnd: 44,
    outcome: 'Ler notícias e textos formais, separar tese de evidência e produzir textos e falas estruturados.',
  },
  {
    id: 6,
    title: 'Coreano avançado autônomo',
    weekStart: 45,
    weekEnd: 52,
    outcome: 'Comparar fontes, perceber o que fica implícito, negociar e defender uma posição com contrapontos.',
  },
]

/** Metadados editoriais das 52 semanas (roteiro). Só S01 tem sessões playable nesta base. */
const WEEK_DEFS: readonly Omit<CurriculumWeek, 'stageId'>[] = [
  {
    number: 1,
    mission: 'Peça uma bebida',
    targetKorean: '커피, 물, 차, 빵, 안녕하세요, 네, 감사합니다, 주세요. Primeiros blocos com ㄱ, ㄴ e ㅏ.',
    daysSummary: {
      d1to3:
        'D1 ouça café, água e chá e escolha uma bebida. D2 reconheça as três palavras e acrescente pão. D3 cumprimente, peça uma bebida com 주세요 e agradeça em diálogo guiado.',
      d4to5: 'D4 monte 가 e 나 e trace ㄴ. D5 reconheça um pedido com outra voz e reconstrua 나 sem contorno.',
    },
  },
  {
    number: 2,
    mission: 'Decifre blocos',
    targetKorean: 'Vogais ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ e ㅑ ㅕ ㅛ ㅠ. ㄱ ㄴ ㄷ ㄹ ㅁ ㅇ inicial. Arranjos vertical e horizontal.',
    daysSummary: {
      d1to3: 'D1 distinga 아/어 e 오/우. D2 compare 가/고 e leia blocos com ㅡ/ㅣ. D3 repita contrastes com e sem som inicial de i breve.',
      d4to5: 'D4 escreva ㅏ, ㅗ, ㅁ e monte 마/모. D5 leia um bloco novo e identifique a vogal a partir do som.',
    },
  },
  {
    number: 3,
    mission: 'Leia palavras curtas',
    targetKorean: 'Consoantes ㅂ ㅅ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ. Contrastes de aspiração. 받침 em 물, 빵 e 밥.',
    daysSummary: {
      d1to3: 'D1 diferencie 피/비, 키/기 e 차/자. D2 localize inicial, vogal e final em 물, 빵 e 밥. D3 leia e repita palavras curtas.',
      d4to5: 'D4 monte blocos com final e escreva 물 e 밥. D5 associe áudio, bloco e imagem num cardápio novo.',
    },
  },
  {
    number: 4,
    mission: 'Seu primeiro pedido',
    targetKorean: 'Consoantes duplas ㄲ ㄸ ㅃ ㅆ ㅉ e ㅐ ㅔ ㅘ ㅝ ㅢ. Fórmula pedido + agradecimento.',
    daysSummary: {
      d1to3: 'D1 ouça séries com iniciais simples, aspiradas e tensas. D2 leia um cardápio. D3 faça um pedido e responda a uma confirmação.',
      d4to5: 'D4 digite a bebida e confira blocos. D5 desafio de saída com cardápio e voz diferentes.',
    },
  },
  {
    number: 5,
    mission: 'Apresente-se',
    targetKorean: '-이에요/-예요, 은/는, 저는, 이름, 브라질. Vogais restantes e revisão das 40 letras.',
    daysSummary: {
      d1to3: 'D1 reconheça nome e país. D2 identifique final antes de 이에요 e vogal antes de 예요. D3 apresente-se e pergunte o nome.',
      d4to5: 'D4 escreva três linhas de perfil. D5 associe uma apresentação nova a um perfil.',
    },
  },
  {
    number: 6,
    mission: 'Fale da sua rotina',
    targetKorean: '-아/어요, 을/를, verbos em 하다. 먹다, 마시다, 가다, 공부하다.',
    daysSummary: {
      d1to3: 'D1 associe falas a ações. D2 encontre objeto e verbo. D3 responda o que faz de manhã e à noite.',
      d4to5: 'D4 escreva três ações do seu dia. D5 compare a rotina de outra pessoa.',
    },
  },
  {
    number: 7,
    mission: 'Encontre um lugar',
    targetKorean: '있어요/없어요, 이/가, 에 para localização, 어디, 여기/거기/저기.',
    daysSummary: {
      d1to3: 'D1 ouça onde estão os lugares. D2 leia uma planta. D3 pergunte se há banheiro ou saída.',
      d4to5: 'D4 complete uma mensagem de localização. D5 localize um lugar num mapa diferente.',
    },
  },
  {
    number: 8,
    mission: 'Compre e peça quantidades',
    targetKorean: 'Números nativos com 개/잔. Números sino-coreanos em preços, 원, 얼마예요, 이/그/저.',
    daysSummary: {
      d1to3: 'D1 distinga quantidade de preço. D2 leia etiquetas e recibos. D3 peça dois itens e confirme o valor.',
      d4to5: 'D4 monte uma comanda. D5 refaça a compra num cardápio novo.',
    },
  },
  {
    number: 9,
    mission: 'Marque dia e hora',
    targetKorean: 'Horas nativas e minutos sino-coreanos, 에 temporal, dias da semana, 오전/오후, 부터/까지.',
    daysSummary: {
      d1to3: 'D1 escolha o horário ouvido. D2 leia uma agenda. D3 combine quando encontrar alguém.',
      d4to5: 'D4 escreva um convite. D5 reorganize um plano a partir de mudança de horário.',
    },
  },
  {
    number: 10,
    mission: 'Conte o que aconteceu',
    targetKorean: '-았/었어요, 안, 못, 어제, 지난주.',
    daysSummary: {
      d1to3: 'D1 localize quando e o que aconteceu. D2 contraste presente e passado. D3 conte o que fez ontem.',
      d4to5: 'D4 escreva um minidiário. D5 reconstrua a ordem de eventos.',
    },
  },
  {
    number: 11,
    mission: 'Faça um plano e diga do que gosta',
    targetKorean: '-(으)ㄹ 거예요, -고 싶어요, 좋아해요, -고, 하고.',
    daysSummary: {
      d1to3: 'D1 reconheça gostos e planos. D2 interprete a intenção. D3 convide e proponha outra atividade.',
      d4to5: 'D4 escreva um plano de fim de semana. D5 escolha uma atividade que combine com preferências novas.',
    },
  },
  {
    number: 12,
    mission: 'Resolva um dia na cidade',
    targetKorean: '-(으)세요, -아/어 주세요, 에서, -(으)로, 왼쪽/오른쪽.',
    daysSummary: {
      d1to3: 'D1 siga instruções de trajeto. D2 compare mapa, horário e aviso. D3 pergunte como chegar e faça um pedido.',
      d4to5: 'D4 escreva uma instrução de encontro. D5 desafio de transporte e café.',
    },
  },
  {
    number: 13,
    mission: 'Explique por que mudou os planos',
    targetKorean: '-아/어서, -(으)니까 e 그래서.',
    daysSummary: {
      d1to3: 'D1 distinga evento e motivo. D2 compare terminações. D3 remarque um encontro.',
      d4to5: 'D4 escreva uma justificativa. D5 responda a um imprevisto.',
    },
  },
  {
    number: 14,
    mission: 'Organize etapas',
    targetKorean: '-기 전에, -(으)ㄴ 후에, -고 나서, 먼저/나중에.',
    daysSummary: {
      d1to3: 'D1 ordene instruções. D2 leia uma lista com dependências. D3 explique o que vem primeiro.',
      d4to5: 'D4 escreva quatro passos. D5 corrija a ordem de um roteiro novo.',
    },
  },
  {
    number: 15,
    mission: 'Diga o que pode fazer',
    targetKorean: '-(으)ㄹ 수 있다/없다, 잘/못, honorífico -(으)시-.',
    daysSummary: {
      d1to3: 'D1 distinga disponibilidade de habilidade. D2 leia horários e condições. D3 pergunte o que é possível.',
      d4to5: 'D4 escreva um pedido de ajuda. D5 escolha uma solução com restrições novas.',
    },
  },
  {
    number: 16,
    mission: 'Escolha entre opções',
    targetKorean: '보다, 더/덜, 가장/제일, -지만, -거나.',
    daysSummary: {
      d1to3: 'D1 identifique preferências. D2 compare horários e preços. D3 recomende com ressalva.',
      d4to5: 'D4 escreva duas comparações. D5 justifique uma escolha com dados novos.',
    },
  },
  {
    number: 17,
    mission: 'Peça permissão e entenda regras',
    targetKorean: '-아/어도 돼요, -(으)면 안 돼요, -아/어야 해요.',
    daysSummary: {
      d1to3: 'D1 diferencie permitido, obrigatório e proibido. D2 leia regras. D3 peça autorização.',
      d4to5: 'D4 escreva instruções de visita. D5 resolva duas regras cruzadas.',
    },
  },
  {
    number: 18,
    mission: 'Descreva pessoas e lugares',
    targetKorean: 'Adjetivos -(으)ㄴ + nome, verbos -는 + nome, localização e características.',
    daysSummary: {
      d1to3: 'D1 associe descrição a pessoa ou lugar. D2 identifique o nome descrito. D3 indique o que procura.',
      d4to5: 'D4 escreva descrição curta. D5 compare candidatos com pistas novas.',
    },
  },
  {
    number: 19,
    mission: 'Relate experiências',
    targetKorean: '-아/어 보다, -(으)ㄴ 적이 있다/없다, -고 있다.',
    daysSummary: {
      d1to3: 'D1 separe experiência de ação em andamento. D2 leia relatos. D3 conte o que já experimentou.',
      d4to5: 'D4 escreva um relato breve. D5 compare com um depoimento novo.',
    },
  },
  {
    number: 20,
    mission: 'Resolva um problema simples',
    targetKorean: '-(으)면, 혹시, 다시, 천천히, 한 번 더.',
    daysSummary: {
      d1to3: 'D1 identifique problema e solução. D2 leia instruções condicionais. D3 peça repetição ou confirmação.',
      d4to5: 'D4 escreva solicitação de troca. D5 resolva atendimento com condição diferente.',
    },
  },
  {
    number: 21,
    mission: 'Conte uma história curta',
    targetKorean: '-(으)ㄹ 때, -면서, 갑자기, 결국.',
    daysSummary: {
      d1to3: 'D1 faça uma linha do tempo. D2 identifique ações simultâneas. D3 reconte uma cena em 60 s.',
      d4to5: 'D4 transforme a cena em parágrafo. D5 reconte a ideia central de outra história.',
    },
  },
  {
    number: 22,
    mission: 'Acompanhe o início de uma live',
    targetKorean: '여러분, 들어오다, 오신 분들, 잘 들려요?, -네요.',
    daysSummary: {
      d1to3: 'D1 selecione a intenção do cumprimento. D2 compare áudio e transcrição. D3 cumprimente e confirme o som.',
      d4to5: 'D4 escreva um comentário curto. D5 reconheça a mesma função numa abertura nova.',
    },
  },
  {
    number: 23,
    mission: 'Reaja ao que ouviu',
    targetKorean: '-거든요, -는데요, 맞아요, 정말요?, 그렇군요.',
    daysSummary: {
      d1to3: 'D1 infira se a pessoa explica ou reage. D2 compare diálogos. D3 reaja e faça pergunta de acompanhamento.',
      d4to5: 'D4 escreva uma resposta adequada. D5 escolha uma reação numa troca nova.',
    },
  },
  {
    number: 24,
    mission: 'Planeje e conte um passeio',
    targetKorean: 'Revisão de tempo, condição, descrição e justificativa.',
    daysSummary: {
      d1to3: 'D1 extraia restrições de duas propostas. D2 leia avaliações. D3 negocie o plano e conte o que aconteceu.',
      d4to5: 'D4 escreva confirmação e relato. D5 missão integrando as quatro habilidades.',
    },
  },
  {
    number: 25,
    mission: 'Encontre pistas em fala corrida',
    targetKorean: '받침, ressilabificação, nasalização. 먹어요, 한국말, 국물.',
    daysSummary: {
      d1to3: 'D1 reconheça palavras em velocidade natural. D2 compare escrita e áudio. D3 repita por trechos.',
      d4to5: 'D4 transcreva palavras-chave. D5 reconheça padrões em frases novas.',
    },
  },
  {
    number: 26,
    mission: 'Ajuste o jeito de falar',
    targetKorean: '해요체, 합니다체 e 반말. -(으)시-, 드리다/주다.',
    daysSummary: {
      d1to3: 'D1 identifique a relação entre interlocutores. D2 compare registros. D3 reformule o mesmo pedido.',
      d4to5: 'D4 escreva duas versões de um convite. D5 escolha o registro de um diálogo novo.',
    },
  },
  {
    number: 27,
    mission: 'Conte o que alguém disse',
    targetKorean: '-다고 하다, -(이)라고 하다, -냐고 하다, -(으)라고 하다, -자고 하다.',
    daysSummary: {
      d1to3: 'D1 distinga comentário, pergunta, instrução e proposta. D2 ligue fala e relato. D3 resuma o que alguém disse.',
      d4to5: 'D4 transforme troca em mensagem de repasse. D5 relate trechos novos.',
    },
  },
  {
    number: 28,
    mission: 'Faça inferências com cuidado',
    targetKorean: '-(으)ㄴ/는 것 같다, -나 보다, -겠-.',
    daysSummary: {
      d1to3: 'D1 identifique observado vs inferido. D2 compare hipóteses. D3 formule uma suposição.',
      d4to5: 'D4 reescreva afirmação como hipótese. D5 escolha a inferência mais sustentada.',
    },
  },
  {
    number: 29,
    mission: 'Acompanhe uma entrevista curta',
    targetKorean: '-더라고요, -던 em contexto.',
    daysSummary: {
      d1to3: 'D1 identifique tema e experiência. D2 localize evidência. D3 responda em 60–90 s.',
      d4to5: 'D4 escreva um resumo. D5 responda sobre outro entrevistado.',
    },
  },
  {
    number: 30,
    mission: 'Interprete comentários numa live',
    targetKorean: 'Elipse de sujeito, 아/그냥/진짜, -잖아요.',
    daysSummary: {
      d1to3: 'D1 encontre assunto e tom. D2 recupere referentes omitidos. D3 peça esclarecimento.',
      d4to5: 'D4 escreva a ideia em coreano simples. D5 compare dois comentários.',
    },
  },
  {
    number: 31,
    mission: 'Argumente sobre uma escolha',
    targetKorean: '반면에, -는 대신에, -뿐만 아니라, 그래서.',
    daysSummary: {
      d1to3: 'D1 localize razões. D2 compare critérios. D3 defenda uma escolha.',
      d4to5: 'D4 escreva parágrafo com posição e exemplo. D5 adapte o argumento a um dado novo.',
    },
  },
  {
    number: 32,
    mission: 'Explique causa e resultado com precisão',
    targetKorean: '-느라고, -는 바람에, 덕분에, -(으)ㄴ 결과.',
    daysSummary: {
      d1to3: 'D1 identifique consequência. D2 compare explicações. D3 esclareça por que um plano deu errado.',
      d4to5: 'D4 reescreva justificativa. D5 explique incidente novo.',
    },
  },
  {
    number: 33,
    mission: 'Entenda avisos e serviços',
    targetKorean: 'Passivas frequentes, -게 되다, -도록 하다, vocabulário de avisos.',
    daysSummary: {
      d1to3: 'D1 extraia ação e prazo. D2 diferencie agente e destinatário. D3 passe instruções.',
      d4to5: 'D4 escreva resumo acionável. D5 responda a mudança de regra.',
    },
  },
  {
    number: 34,
    mission: 'Trabalhe com opiniões diferentes',
    targetKorean: '-(으)ㄹ 수도 있다, -다고 해도, -는 데다가.',
    daysSummary: {
      d1to3: 'D1 marque concordância e divergência. D2 reconheça concessões. D3 renegocie um detalhe.',
      d4to5: 'D4 redija proposta intermediária. D5 proponha saída num debate novo.',
    },
  },
  {
    number: 35,
    mission: 'Compare notícia e reação',
    targetKorean: '-에 따르면, -(으)ㄴ 것으로 알려지다.',
    daysSummary: {
      d1to3: 'D1 ouça notícia e comentário. D2 atribua a fonte. D3 relate o fato e dê opinião.',
      d4to5: 'D4 escreva síntese com atribuição. D5 classifique fato, inferência e opinião.',
    },
  },
  {
    number: 36,
    mission: 'Resuma um trecho de live ou entrevista',
    targetKorean: 'Revisão de registro, citação, inferência e fala corrida.',
    daysSummary: {
      d1to3: 'D1 identifique ideia central. D2 confronte hipóteses. D3 resumo oral de 90–120 s.',
      d4to5: 'D4 escreva resumo com citação indireta. D5 verificação de saída com segunda fonte.',
    },
  },
  {
    number: 37,
    mission: 'Sintetize uma notícia',
    targetKorean: 'Estilo -다, -에 따르면, -는 것으로 나타나다, nominalização -기 e -(으)ㅁ.',
    daysSummary: {
      d1to3: 'D1 anote afirmação e fonte. D2 localize fatos e lacunas. D3 resumo oral.',
      d4to5: 'D4 escreva resumo neutro. D5 compare coberturas e ajuste certeza.',
    },
  },
  {
    number: 38,
    mission: 'Explique um gráfico',
    targetKorean: '-에 비해, -에 그치다, -을/를 차지하다, 증가/감소.',
    daysSummary: {
      d1to3: 'D1 relacione fala a gráfico. D2 interprete eixo e período. D3 descreva tendência.',
      d4to5: 'D4 escreva parágrafo com dados e limitação. D5 compare dois gráficos.',
    },
  },
  {
    number: 39,
    mission: 'Siga uma aula ou palestra',
    targetKorean: '즉, 예컨대, 다시 말해, 핵심은.',
    daysSummary: {
      d1to3: 'D1 tome notas. D2 cheque a função dos exemplos. D3 explique o tema sem roteiro.',
      d4to5: 'D4 escreva mapa de ideias. D5 use o método numa explicação inédita.',
    },
  },
  {
    number: 40,
    mission: 'Escreva e-mails formais úteis',
    targetKorean: '-고자 합니다, 확인 부탁드립니다, 검토해 주시면 감사하겠습니다.',
    daysSummary: {
      d1to3: 'D1 extraia requisitos. D2 compare e-mails. D3 confirme um prazo por voz.',
      d4to5: 'D4 escreva e-mail com assunto e data. D5 responda a uma objeção.',
    },
  },
  {
    number: 41,
    mission: 'Defenda uma proposta',
    targetKorean: '-기는 하지만, -는 셈이다, -다는 점에서.',
    daysSummary: {
      d1to3: 'D1 reconstrua a estrutura. D2 localize pressupostos. D3 defenda de forma organizada.',
      d4to5: 'D4 redija com contraponto. D5 reavalie diante de argumento novo.',
    },
  },
  {
    number: 42,
    mission: 'Leia nas entrelinhas da ficção',
    targetKorean: 'Ponto de vista, -나 싶다, -더니, emoções e omissões.',
    daysSummary: {
      d1to3: 'D1 identifique a relação sem legenda. D2 marque pistas de intenção. D3 explique duas leituras.',
      d4to5: 'D4 reescreva a cena. D5 identifique o implícito num diálogo novo.',
    },
  },
  {
    number: 43,
    mission: 'Apresente um tema cultural',
    targetKorean: '-을/를 중심으로, -에 걸쳐, -에 따르면.',
    daysSummary: {
      d1to3: 'D1 compare dois relatos. D2 anote convergências. D3 apresente em 2–3 min.',
      d4to5: 'D4 escreva versão para público brasileiro. D5 responda a pergunta nova.',
    },
  },
  {
    number: 44,
    mission: 'Produza uma análise multimodal',
    targetKorean: 'Consolidação de relato formal, dados, certeza e argumentação.',
    daysSummary: {
      d1to3: 'D1 extraia tese e razões. D2 compare texto e gráfico. D3 apresente com ressalva.',
      d4to5: 'D4 escreva análise com fonte. D5 verificação de saída com material novo.',
    },
  },
  {
    number: 45,
    mission: 'Avalie o que uma fonte realmente sustenta',
    targetKorean: '-에 불과하다, -을/를 시사하다, 단정하기 어렵다.',
    daysSummary: {
      d1to3: 'D1 distinga dado de conclusão. D2 compare fonte e repercussão. D3 explique insuficiência.',
      d4to5: 'D4 escreva nota com limitações. D5 corrija manchete superestimada.',
    },
  },
  {
    number: 46,
    mission: 'Entenda a intenção por trás do tom',
    targetKorean: 'Ironia, hesitação, -기는요, 글쎄요, -나 싶다.',
    daysSummary: {
      d1to3: 'D1 compare entonações. D2 confirme intenção pelo contexto. D3 peça confirmação.',
      d4to5: 'D4 reformule em registro neutro. D5 justifique duas interpretações.',
    },
  },
  {
    number: 47,
    mission: 'Negocie num contexto profissional',
    targetKorean: '-는 방향으로, -는 조건으로, -(으)실 수 있을까요?, 조율하다.',
    daysSummary: {
      d1to3: 'D1 encontre prioridades. D2 separe conflitos. D3 negocie e confirme acordo.',
      d4to5: 'D4 escreva ata compacta. D5 renegocie com restrição inédita.',
    },
  },
  {
    number: 48,
    mission: 'Medie entre português e coreano',
    targetKorean: 'Paráfrase, explicitação de referentes e adaptação de tratamento.',
    daysSummary: {
      d1to3: 'D1 entenda aviso para visitantes. D2 compare versões por público. D3 explique em coreano simples.',
      d4to5: 'D4 escreva síntese PT e reformulação KO. D5 recupere intenção sem tradução literal.',
    },
  },
  {
    number: 49,
    mission: 'Debata e responda a contrapontos',
    targetKorean: '-(으)ㄹ지라도, -(으)ㄴ/는 한, -에도 불구하고.',
    daysSummary: {
      d1to3: 'D1 identifique tese e contraponto. D2 explique divergências. D3 apresente tese e resposta.',
      d4to5: 'D4 redija defesa com contraponto. D5 responda a contraevidência.',
    },
  },
  {
    number: 50,
    mission: 'Acompanhe falas de vários interlocutores',
    targetKorean: 'Sobreposição, elipse e variação regional como compreensão.',
    daysSummary: {
      d1to3: 'D1 identifique quem disse o quê. D2 confronte anotações. D3 resuma e peça esclarecimento.',
      d4to5: 'D4 escreva registro por falante. D5 extraia ponto central de conversa nova.',
    },
  },
  {
    number: 51,
    mission: 'Construa uma síntese com duas fontes',
    targetKorean: '-와 달리, 일치하다, 상반되다, -는 것으로 해석할 수 있다.',
    daysSummary: {
      d1to3: 'D1 marque tese e ressalva. D2 compare escopo. D3 apresente convergência e divergência.',
      d4to5: 'D4 escreva síntese com atribuição. D5 reescreva para outro público.',
    },
  },
  {
    number: 52,
    mission: 'Projeto final',
    targetKorean: 'Integração de registro, compreensão, escrita e respostas espontâneas.',
    daysSummary: {
      d1to3: 'D1 registre primeira interpretação. D2 compare com segunda fonte. D3 exposição de 3–4 min.',
      d4to5: 'D4 entregue síntese e autoavaliação. D5 prova de transferência e plano de continuidade.',
    },
  },
]

const stageIdForWeek = (weekNumber: number): number => {
  const stage = CURRICULUM_STAGES.find((item) => weekNumber >= item.weekStart && weekNumber <= item.weekEnd)
  return stage?.id ?? 1
}

export const CURRICULUM_WEEKS: readonly CurriculumWeek[] = WEEK_DEFS.map((week) => ({
  ...week,
  stageId: stageIdForWeek(week.number),
}))

type PlayableDayMap = Readonly<Record<1 | 2 | 3 | 4 | 5, { lessonId: string; title: string }>>

/** Sessões playable das semanas 1–4 (piloto Etapa 1). */
const STAGE1_PLAYABLE: Readonly<Record<1 | 2 | 3 | 4, PlayableDayMap>> = {
  1: {
    1: { lessonId: 'lesson-speak-01', title: 'Reconheça café, água e chá' },
    2: { lessonId: 'lesson-speak-02', title: 'Palavras do café e pão' },
    3: { lessonId: 'lesson-speak-03', title: 'Cumprimente e peça com 주세요' },
    4: { lessonId: 'lesson-u1-00', title: 'Monte 가 e 나' },
    5: { lessonId: 'lesson-s01-d5', title: 'Pedido novo e bloco 나' },
  },
  2: {
    1: { lessonId: 'lesson-s02-d1', title: 'Distinga 아/어 e 오/우' },
    2: { lessonId: 'lesson-s02-d2', title: 'Compare 가/고 e ㅡ/ㅣ' },
    3: { lessonId: 'lesson-s02-d3', title: 'Contrastes com i breve' },
    4: { lessonId: 'lesson-s02-d4', title: 'Trace ㅏ ㅗ ㅁ e monte 마/모' },
    5: { lessonId: 'lesson-s02-d5', title: 'Identifique a vogal pelo som' },
  },
  3: {
    1: { lessonId: 'lesson-s03-d1', title: 'Aspiração 피/비 · 키/기 · 차/자' },
    2: { lessonId: 'lesson-s03-d2', title: 'Batchim em 물 · 빵 · 밥' },
    3: { lessonId: 'lesson-s03-d3', title: 'Leia e repita palavras curtas' },
    4: { lessonId: 'lesson-s03-d4', title: 'Monte e escreva com final' },
    5: { lessonId: 'lesson-s03-d5', title: 'Cardápio novo' },
  },
  4: {
    1: { lessonId: 'lesson-s04-d1', title: 'Simples, aspirada e tensa' },
    2: { lessonId: 'lesson-s04-d2', title: 'Cardápio de quatro itens' },
    3: { lessonId: 'lesson-s04-d3', title: 'Pedido e confirmação' },
    4: { lessonId: 'lesson-s04-d4', title: 'Monte o pedido completo' },
    5: { lessonId: 'lesson-s04-d5', title: 'Marco: pedido no café' },
  },
}

const buildSessionId = (weekNumber: number, day: number): string =>
  `S${String(weekNumber).padStart(2, '0')}D${day}`

export const CURRICULUM_SESSIONS: readonly CurriculumSession[] = CURRICULUM_WEEKS.flatMap((week) =>
  ([1, 2, 3, 4, 5] as const).map((day) => {
    const id = buildSessionId(week.number, day)
    const weekPlayable = week.number >= 1 && week.number <= 4 ? STAGE1_PLAYABLE[week.number as 1 | 2 | 3 | 4] : undefined
    const playable = weekPlayable?.[day]
    return {
      id,
      weekNumber: week.number,
      day,
      skillFocus: DAY_FOCUS[day - 1],
      title: playable?.title ?? `${DAY_LABELS[day - 1]} · ${week.mission}`,
      status: playable ? 'playable' : 'outline',
      ...(playable ? { lessonId: playable.lessonId } : {}),
    } satisfies CurriculumSession
  }),
)

export const CURRICULUM_STATS = {
  stages: CURRICULUM_STAGES.length,
  weeks: CURRICULUM_WEEKS.length,
  sessions: CURRICULUM_SESSIONS.length,
  playableSessions: CURRICULUM_SESSIONS.filter((session) => session.status === 'playable').length,
} as const

export const getStageById = (stageId: number): CurriculumStage | undefined =>
  CURRICULUM_STAGES.find((stage) => stage.id === stageId)

export const getWeekByNumber = (weekNumber: number): CurriculumWeek | undefined =>
  CURRICULUM_WEEKS.find((week) => week.number === weekNumber)

export const getSessionById = (sessionId: string): CurriculumSession | undefined =>
  CURRICULUM_SESSIONS.find((session) => session.id === sessionId)

export const getSessionsOfWeek = (weekNumber: number): CurriculumSession[] =>
  CURRICULUM_SESSIONS.filter((session) => session.weekNumber === weekNumber)

export const getSessionByLessonId = (lessonId: string): CurriculumSession | undefined =>
  CURRICULUM_SESSIONS.find((session) => session.lessonId === lessonId)

export const formatWeekLabel = (week: CurriculumWeek): string =>
  `${String(week.number).padStart(2, '0')} · ${week.mission}`
