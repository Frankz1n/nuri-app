# Nuri

App PWA de estudo de coreano para brasileiros, pensado para o trio **escrever · ouvir · ler**: hangul, sílabas, vocabulário, frases, leitura, escuta guiada, autoescuta de pronúncia e (em breve) conversação com IA. Progresso local; depois do primeiro carregamento online, funciona offline.

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

- `src/data` — catálogo (58 aulas, 8 unidades, 40 letras, 70 palavras, 3 leituras) com `audioKey` opcional; piloto `lesson-u1-00` (가/나) e demo `lesson-u2-16` (ㅣ→피→키)
- `src/core` — datas, XP, revisão, escrita, estado, backup/migração
- `src/lib/audio` — contratos e registry para TTS, pronúncia e conversa
- `src/features` — telas; `src/components` — UI reutilizável
- `src/pwa` — instalação e atualização do service worker

## Próximas integrações (voz e IA)

Nesta versão **não** há chamadas a ElevenLabs nem a modelos de IA, e **não** há pontuação simulada.

| Capacidade | Tela / rota | Onde plugar |
|------------|-------------|-------------|
| TTS / biblioteca de vozes | Escuta (`#/listen`), botão Ouvir em letra/palavra | `setAudioProvider(...)` em `src/lib/audio/registry.ts` |
| Análise de pronúncia | Pronúncia (`#/pronounce`) — hoje só autoescuta local | `setPronunciationProvider(...)` |
| Conversação | Conversar (`#/converse`) — UI de cenários pronta | `setConversationProvider(...)` |

Chaves de áudio estáveis: `letter:…`, `vocab:…`, `phrase:…`, `reading:…:linha` (`src/lib/audio/keys.ts`). A gravação local de pronúncia não entra no backup.
