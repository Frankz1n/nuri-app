# Nuri · O que ainda falta no currículo

Documento de acompanhamento do plano de ensino (52 semanas · 6 etapas · 260 sessões).  
Atualizado em **17/11/2026**, após o piloto S01–S04.

---

## Já entregue

| Bloco | Status |
|-------|--------|
| Modelo do currículo (6 etapas, 52 semanas, 260 sessões) | Pronto — semanas 5–52 como **roteiro** navegável |
| UI Aprender por etapa/semana (D1–D5) | Pronto |
| Evidência de sessão (`unsupported` / `supported` / `skipped`) | Pronto |
| Onboarding com recomendação de etapa/semana | Pronto (diagnóstico curto; não é o teste 4 habilidades completo) |
| Progresso: trilha anual + evidências | Pronto |
| **S01–S04 jogáveis** (20 sessões) + marco S04D5 (pedido no café) | Pronto |
| Vocab `주세요`, step `listen-choice`, TTS local como fallback | Pronto |

---

## Pendências por prioridade

### 1. Conteúdo jogável — próximo lote editorial

| Lote | Semanas | Sessões | O que falta |
|------|---------|---------|-------------|
| **Primeiro lote** | S05–S12 | 40 | Cotidiano: apresentar-se, rotina, lugar, preços, horário, passado, planos, dia na cidade + **marco S12** |
| | S13–S24 | 60 | Conversas e histórias + lives (S22–S24) + **marco S24** |
| **Segundo lote** | S25–S36 | 60 | Contexto: fala corrida, registro, citação, entrevistas, argumentação + **marco S36** |
| | S37–S44 | 40 | Avançado aplicado: notícias, gráficos, e-mails, debate cultural + **marco S44** |
| | S45–S52 | 40 | Avançado autônomo: fontes, tom, negociação, mediação, projeto final + **marco S52** |

Hoje essas semanas existem só como **outline** (missão, coreano-alvo, resumo D1–D5). Falta: `lessonId`, planos de steps, gabaritos e (quando couber) reaproveitar catálogo legado (vocab, frases, leituras, live).

**Contagem:** 20/260 sessões playable · **240 restantes**.

---

### 2. Marcos e critérios de passagem

Implementados de forma jogável só o **S04** (pedido no café). Ainda falta:

| Marco | Tarefa inédita | Evidência a registrar |
|-------|----------------|------------------------|
| **S12** · Um dia na cidade | Horário + trajeto + pedido | Escuta, mapa/aviso, 2 turnos, recado escrito |
| **S24** · Passeio e relato | Imprevisto + reconto | Ideia central, comparação de textos, fala + relato |
| **S36** · Live ou entrevista | Clipe novo × texto | Tema, detalhes, inferência, resumo oral, atribuição |
| **S44** · Análise com dados | Áudio + texto + gráfico | Tese/evidência, fato×interpretação, ressalva, fonte |
| **S52** · Projeto final | Duas fontes, formatos diferentes | Exposição 3–4 min, síntese 220–300 eojeol, concessão |

Critérios ainda não no app:

- Escuta/leitura: 10 itens objetivos, meta interna 8/10, revisão direcionada + nova versão
- Fala/escrita: rubrica 0–2 (missão, clareza, adequação, interação/estrutura), meta 6/8
- Painel que compare **1ª tentativa** vs **nova tarefa 7–14 dias depois**
- Separar “reconhecimento de significado” de placar tipo “2/3” genérico

---

### 3. Diagnóstico de entrada (completo)

Hoje: orientação curta (6 perguntas) + familiaridade → sugere etapa, mas a entrada jogável ainda cai na Semana 1 quando o conteúdo avançado não existe.

Falta:

- Amostra por habilidade (escuta, leitura, fala, escrita) com dificuldade progressiva
- Material de sondagem **fora** das lições
- Quem ouve bem mas escreve mal: bloco oral adequado + hangul em paralelo
- Pontuação objetiva → ponto de entrada real quando S05+ estiver playable

---

### 4. Áudio e mídia

| Item | Status |
|------|--------|
| TTS / voz coreana do aparelho | Fallback em uso |
| MP3 embarcados (piloto: 커피, 물, 차, 빵, 안녕하세요, 네, 감사합니다, 주세요 + frases S01) | **Não produzidos** — ver `src/assets/live-audio/README.md` |
| Versão lenta didática dos clipes | Pendente |
| Contrastes de letras em áudio + nome da letra | Pendente |
| Unidade live com clipes próprios | Estrutura pronta; arquivos ausentes |
| Trechos BTS (`BTS_SITUATIONS`) | Array vazio — precisa clipes autorizados + crédito |
| Priorizar reprodução por ID de catálogo antes do TTS | Parcial (live tem caminho MP3; unificar nas telas) |

---

### 5. Fala, IA e versão paga

| Item | Status |
|------|--------|
| Gravar, ouvir, comparar com modelo (sem nota automática) | Pronto |
| “Não posso falar agora” → fala pendente / evidência `skipped` | Pronto |
| Análise de pronúncia (provider) | Contrato null — UI “em breve” |
| Conversação com IA (Horangi + ElevenLabs) | UI de prévia — sem backend |
| Franquia de minutos, sessões 3–5 min, sem anúncios na paga | Não iniciado |
| Anúncios ocasionais no fim de lições (gratuito) | Não iniciado |

---

### 6. Formatos de exercício avançados

O motor atual cobre info, choice, tiles, write, pairs, card, read, live-*, word-listen/repeat, listen-choice.

Ainda faltam formatos (ou extensões) para:

- Resumo / texto aberto com comprimento em eojeol
- Gráfico + interpretação (ex.: roteiro S38D4)
- E-mail formal com revisão de registro
- Rubrica + autoavaliação + modelo de resposta
- Debate / contraponto com turnos
- Projeto multimodal (áudio + texto + gráfico)
- Digitação de hangul (S04D4 no plano cita teclado; hoje é montagem por peças)

---

### 7. Produção editorial e qualidade

Para cada sessão playable futura, fechar a **ficha** (IDs tipo `S05D1-E03`):

- Enunciado, alvo, áudio, gabarito, distratores, explicação
- Acessibilidade (transcrição, alt, offline)
- Variante inédita para transferência/marco
- Revisão linguística e direitos de mídia

Inventário anual por semana com estados sugeridos:  
`roteiro` → `revisão coreana` → `mídia` → `integrado` → `testado`.

Critérios de “pronto” por lote: PT-BR + coreano revisado + mídia testada + feedback + variante inédita nos marcos; testar sem som, sem microfone, offline após download, rascunho e tela pequena.

---

### 8. Produto / plataforma (fora do núcleo pedagógico imediato)

- Simulado opcional TOPIK I (após básico) e exercícios inspirados em TOPIK II
- Calibrar intervalos de revisão (1/3/7/14/30) com piloto real
- Piloto com iniciantes + alunos que já estudam (duração, dificuldade, cortes)
- Congelar currículo-base das 260 sessões no “lançamento da trilha anual”

---

## Ordem sugerida de trabalho

1. **Áudio do piloto S01–S04** (MP3 + unificar player por `audioKey`)
2. **S05–S12 jogáveis** + marco S12 (fecha Etapa 2)
3. Rubrica fala/escrita + painel 1ª tentativa vs reteste
4. **S13–S24** + marco S24 (e clipes live / S22)
5. Diagnóstico 4 habilidades quando o catálogo playable passar da Etapa 1
6. **S25–S52** em lotes, com formatos abertos e marcos S36 / S44 / S52
7. BTS, IA paga, TOPIK opcional

---

## Referência rápida no código

| Peça | Caminho |
|------|---------|
| Currículo (etapas/semanas/sessões) | `src/data/curriculum.ts` |
| Planos S01 | `src/lib/lessonPlans.ts` |
| Planos S02–S04 | `src/lib/stage1Plans.ts` |
| Trilha / próxima sessão | `src/lib/curriculumPath.ts` |
| Evidência de sessão | `src/core/state.ts` (`sessionEvidence`) |
| Áudio live (README) | `src/assets/live-audio/README.md` |
| Mídia BTS (README) | `src/assets/live-media/README.md` |
| Plano pedagógico completo | conversa / brief original “Nuri · Plano de ensino de coreano” |
