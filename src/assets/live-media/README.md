# Trechos do BTS no Nuri

A unidade **Trechos do BTS** aparece assim que há uma lição cadastrada em [src/data/liveMedia.ts](../../data/liveMedia.ts). Cada lição usa o mesmo fluxo de escuta, leitura, resposta falada, aplicação e escrita da unidade A live começou.

## O que preparar por lição

| Item | Como preparar |
|---|---|
| Trecho principal | Um MP4 curto com uma fala em coreano. Comece com 5 a 12 segundos, H.264 com áudio AAC e até 2 MB. Exporte sem legenda gravada na imagem para o aluno poder tentar antes da resposta. |
| Texto | Transcrição em hangul, tradução em português e a expressão que o aluno deve notar. Transcreva o trecho real, incluindo o nível de formalidade. |
| Exercício | Duas alternativas plausíveis, uma resposta modelo que a pessoa pode dizer, uma nova fala pra testar a expressão e uma letra de hangul pra traçar. |
| Crédito | O texto de crédito que deve aparecer abaixo de cada vídeo ou imagem. |
| Imagem opcional | JPG, WebP ou PNG com até 2 MB. Informe texto alternativo e crédito. Ela aparece junto da leitura após a primeira tentativa. |
| Trecho opcional de aplicação | Outro MP4 com a expressão em uma fala diferente. A resposta modelo também pode ter um vídeo próprio se houver material que corresponda à fala. |

Inclua os arquivos neste diretório. Use nomes simples, por exemplo `trecho-01.mp4`. Não use a mesma mídia para falas diferentes. Se for usar áudio separado em vez de vídeo para a resposta, siga [live-audio](../live-audio/README.md). A build faz o cache dos arquivos curtos para o PWA poder abrir o exercício sem rede após o primeiro carregamento. Rode `npm test` para verificar referências, crédito e tamanho, depois teste a build com o som ligado e em modo avião.

Exemplo de cadastro. Os dados são ilustrativos. Substitua pelos textos e créditos do material real:

```ts
{
  id: 'live-bts-trecho-01',
  title: 'Entenda um cumprimento',
  context: 'A transmissão está começando.',
  opening: {
    ko: '안녕하세요!',
    pt: 'Olá!',
    video: { file: 'trecho-01.mp4', credit: 'Preencher com o crédito do trecho' },
  },
  reply: { ko: '안녕하세요! 반가워요.', pt: 'Olá! Prazer em conhecer você.' },
  transfer: { ko: '여러분, 안녕하세요!', pt: 'Olá, pessoal!' },
  focus: '안녕하세요',
  letterId: 'letter-ng',
  writingPrompt: 'Trace ㅇ, que aparece no começo do bloco 안.',
  distractors: ['Até amanhã!', 'Muito obrigado!'],
  picture: { file: 'trecho-01.jpg', alt: 'Descreva o que aparece na foto', credit: 'Preencher com o crédito da imagem' },
}
```
