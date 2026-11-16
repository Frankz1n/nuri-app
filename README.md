# Nuri

App PWA de estudo de coreano para brasileiros, com uma trilha que começa por **ouvir e falar**, intercalando leitura em hangul e escrita guiada. O app também tem alfabeto, sílabas, vocabulário, frases e leitura. O progresso fica no aparelho e o conteúdo da build pode ser acessado offline após o primeiro carregamento.

## Comandos

```bash
npm install
npm run dev       # desenvolvimento (http://localhost:5173)
npm test          # regras do core + integridade do catálogo
npm run build     # gera dist/ com service worker e manifesto
npm run preview   # serve o build em http://localhost:4173
npm run icons     # regenera ícones PNG em public/icons/
```

Hospedagem: publique o conteúdo de `dist/` em HTTPS estático (ou localhost para validar PWA).

## Instalar como app

- **Android (Chrome):** abra o Nuri → Perfil → **Instalar Nuri** (ou menu ⋮ → Instalar app).
- **iPhone/iPad (Safari):** Compartilhar → **Adicionar à Tela de Início**. Em modo standalone o convite some.
- Sem suporte a instalação, o app continua navegável no navegador.

## Teste offline (ponta a ponta)

1. `npm run build && npm run preview` e abra **com rede**. Espere o aviso **Pronto para usar offline**.
2. Ative o **modo avião** (ou DevTools → Network → Offline).
3. Abra o Nuri pelo ícone da tela inicial (ou recarregue a aba).
4. Conclua uma **aula que você nunca abriu**, confirme o progresso salvo, feche o app e abra de novo: o progresso deve permanecer.
5. **Atualização com atividade em andamento:** com o app aberto em uma aula/prática, gere um build novo e recarregue a origem online; quando aparecer **Atualização pronta**, aceite — o rascunho da atividade deve ser preservado e o `nuri-state` não é apagado.

A primeira visita sem rede não tem o que cachear: é necessário um primeiro carregamento conectado (explicado também na interface).

## Backup da v3 e compatibilidade

- Progresso em `localStorage` na chave `nuri-state`. Formato de exportação: `nuri-progress` v3.
- O backup **não inclui** gravações, fila de erros nem atividade em andamento.
- **O catálogo desta base foi reconstruído** (a fonte binária da v3 não estava no workspace). IDs foram alinhados ao mapa documentado (`lesson-uN-NN`, `letter-*`, `vocab-*`, etc.), mas um backup real da v3 pode conter IDs diferentes.
- Na restauração, o app mostra **prévia** (XP, aulas, favoritas, revisões) e lista **itens sem correspondência** antes de substituir. Sem confirmação explícita, a importação é recusada e o progresso atual não muda. Itens não reconhecidos são ignorados após o aceite.
- Fixture de teste: `tests/fixtures/nuri-progress-v3-sample.json` (inclui um ID fantasma `lesson-old-removed` para exercitar o aviso).
- Script: `npm run validate:backup` (ou `npm run validate:backup -- caminho/do/backup.json`) lista mismatches e confirma preservação de XP/aulas/favoritos/revisões sem mutar o app.
- **Validação com backup real da v3:** exporte o JSON no protótipo original, rode o script acima e/ou importe em Perfil. Confira se aulas concluídas, XP, favoritos e revisões reconhecidos foram preservados; qualquer ID sem match deve aparecer na prévia **antes** de substituir.

## Estrutura

- `src/data` — catálogo (61 aulas, 9 unidades, 40 letras, 70 palavras, 3 leituras) com `audioKey` opcional; piloto `lesson-u1-00` (가/나) e demo `lesson-u2-16` (ㅣ→피→키)
- `src/core` — datas, XP, revisão, escrita, estado, backup/migração
- `src/lib/audio` — contratos e registry para TTS, pronúncia e conversa
- `src/features` — telas; `src/components` — UI reutilizável
- `src/pwa` — instalação e atualização do service worker

## Unidade “A live começou”

As três primeiras aulas trabalham cumprimentos, teste de som e agradecimento. Cada uma começa com compreensão oral, sem mostrar hangul ou tradução antes da tentativa, seguida de leitura, resposta falada, nova versão da fala e escrita de uma letra presente na expressão. A checagem de compreensão e a de aplicação aparecem separadas em Progresso. A ajuda em texto não é contada como escuta independente. Erros de escuta aparecem em Revisão.

- O app prioriza clipes próprios da build. Consulte [nomes e formatos dos arquivos](src/assets/live-audio/README.md) para incluir as nove gravações. Esta versão ainda não leva esses arquivos.
- Sem clipe, a reprodução usa a voz **coreana local** do navegador ou sistema, se disponível. O Nuri sinaliza essa modalidade. Em aparelhos sem voz instalada, **Ver frase em hangul** é a alternativa. O service worker não instala vozes do aparelho.
- A resposta falada funciona com microfone opcional. A gravação fica na memória somente enquanto a tela está aberta, pode ser reproduzida para comparação com o modelo e não recebe nota. Negar permissão não impede a próxima etapa.
- Validação manual: em um aparelho com voz coreana local ou build com clipes, entre na primeira aula, ouça até o fim, escolha uma opção e confira. Recarregue no feedback e confirme que a resposta foi mantida. Leia, grave e compare, tente a fala nova e faça a escrita. Repita o teste sem microfone ou sem voz local para verificar as alternativas.

Os contratos existentes em `src/lib/audio` continuam disponíveis para integrações futuras com biblioteca ampliada, análise de pronúncia e conversação.
