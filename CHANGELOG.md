# Changelog

## v0.2.1 — 2026-10-16 — diferidos fechados

Fecha todos os diferidos da v0.2.0 que não dependem do dono. Detalhes em `docs/testes/2026-10-16-reteste-runtime.md`.

- **construir:** clarificações — QA executa × revisor lê/julga (e generalizar o guia de QA, que é web-cêntrico); regra canônica CLAUDE.md×AGENTS.md; tom pós-aceite do modo direto; `_trabalho/<caso>/` com múltiplos casos; precisão sobre onde vivem os originais. **Invariante 7 novo:** `.gitattributes` obrigatório no harness gerado — `autocrlf` quebra hashes de congelamento em clones (achado de teste real).
- **validar:** item 12 espelho do invariante 7.
- **motor/modo-direto.md:** aviso sobre o frontmatter herdado (colisão de gatilho se o arquivo for movido).
- **Reteste com runtime real:** parcial — prontidão estática ✅ (agentes/wrappers carregáveis, plugin rodando como `harness-factory:*` em sessão); a execução headless segue bloqueada por `401 OAuth` — **única pendência, do dono: `claude /login`**, comandos de reteste prontos no registro.

## v0.2.0 — 2026-10-16 — finalização

Língua padronizada, plano de ação da auditoria de 16/10 aplicado por inteiro, dois testes novos e **instalação real realizada**. Revisão independente pré-tag: "pronto com correções" — correções aplicadas neste release.

### Língua: tudo em português
- Motor (9 arquivos) traduzido fielmente do coreano; `motor/modo-direto.md` criado como tradução integral do SKILL original (roteiro do modo direto). Workshop (9 módulos + template de CURRICULUM + comentários dos `.js`) traduzido do inglês. Originais preservados nos `_original-*.md` (os dois SKILL) e no histórico git (todo o resto). Fidelidade verificada por amostragem independente: FIEL, 0 divergências materiais.

### Plano de ação da auditoria (5 pontos — todos fechados)
1. Passe de correções: módulo 06 → porte Python do executor; "hooks valem na hora" corrigido contra a doc atual (só o teste da guarda confirma); `${CLAUDE_PROJECT_DIR}` no exemplo do guardas; ATTRIBUTION no estado real.
2. Autoteste do `validar` registrado (`docs/testes/2026-10-16-autoteste-validar.md`) — sem falso "aprovado" em alvo formato plugin.
3. Deslizes de jargão → regra de **termos-armadilha** no `construir` (com as duas exceções declaradas: `/comando` e login).
4. **Instalação real via CLI (16/10/2026): `claude plugin marketplace add joaocscr/harness-factory` → "Successfully added marketplace"; `claude plugin install harness-factory@harness-factory` → "Successfully installed plugin (scope: user)"; `claude plugin list` → enabled; os 4 skills presentes e visíveis em sessão. Critério §9-1 fechado por inteiro.** Após novo release, atualizar com `claude plugin update harness-factory`.
5. Modo direto testado de ponta a ponta com persona técnica (`docs/testes/2026-10-16-teste-modo-direto.md`) — PASSOU, invariantes 9/9.

### Correções da revisão final pré-tag
- **Notas que corrigem o roteiro do modo direto** no `construir` (caminhos, invariante→etapa, Workflow×aprovação humana, âncora de retomada) — fecha os conflitos 1–3 e 8 do teste.
- Títulos dos módulos citados em português no `construir` (referência quebrada pós-tradução).
- §3: `shasum`→`hashlib`; o "como" dos papéis mora em `metodo/skills/` (amarração reescrevível).

### Diferidos (menores, registrados)
Clarificações de uma linha (QA×revisor, CLAUDE.md×AGENTS.md canonizado, tom pós-aceite, commit por etapa, `_trabalho/<estudo>/`); qa-agent-guide web-cêntrico; baseline 6-3 e acionamento 6-4 por execução; reteste do modo direto com tipos de agente carregados pelo runtime (A17); regra `autocrlf`×sha256 como invariante da fábrica; precisão da frase "originais nos `_original-*`" (só os dois SKILL; o resto vive no histórico git); aviso sobre o frontmatter do `modo-direto.md` se um dia for movido.

## v0.1.2 — 2026-10-15

Fecha os 10 minors diferidos do fix pass e as duas primeiras lacunas de teste. Mapa item a item em `docs/testes/2026-10-15-fix-pass.md`.

- **construir:** intake em levas de 1–3 até cobrir os três grupos; layout nomeia o módulo dono do `GLOSSARIO.md` (1) e do `comece-aqui` (4); `casos/<caso>/` entra no layout (insumos em `documentos/`, produto final na raiz do caso); mapeamento nominal `_workspace→_trabalho`; nota do módulo 4 corrigida (`_trabalho/handoffs/`).
- **guardas:** exemplo diz explicitamente que a mensagem de bloqueio sai em stderr.
- **evoluir:** invariantes avaliados pela função (não pelo caminho literal); histórico raso → procurar evolução em documentos; proxies observacionais quando não há pessoa; fronteira "skill nova = construir" explícita; slug do diagnóstico definido; atribuição movida da `description` para o corpo.
- **docs:** transcript do E2E de imóveis versionado (`docs/testes/2026-10-15-e2e-imoveis-transcript.md`); CHANGELOG diz onde registrar a primeira instalação interativa.
- **Testes novos:** retomada entre sessões via CURRICULUM.md (PASS — `docs/testes/2026-10-15-teste-retomada-curriculum.md`) e workshop em pasta com `.claude/`/`CLAUDE.md` pré-existentes, nada sobrescrito (PASS — `docs/testes/2026-10-15-teste-pasta-preexistente.md`).

## v0.1.1 — 2026-10-15

Fix pass da revisão independente (parecer: "pronto com correções"). Detalhes e diferidos em `docs/testes/2026-10-15-fix-pass.md`.

- **guardas/validar:** hooks Python leem stdin como UTF-8 obrigatório (bug real do Windows encontrado no E2E: cp1252 corrompia acentos e bloqueava trabalho correto).
- **construir:** CURRICULUM gerado traduzido/adaptado (retomada segura); registro do harness no CLAUDE.md fecha o módulo 7; templates `.js` viram porte fiel em Python; evals de pipeline em "modo eval" (aprovação simulada declarada); negação de gabaritos cobre shell; `git init` com explicação leiga e commit por módulo; módulo 7 do workshop adaptado ao layout portável.
- **evoluir:** alvo sem registro no CLAUDE.md → criar a seção é a primeira proposta do diagnóstico.
- **README:** aviso de que o plugin substitui o build-harness original (colisão de gatilho).

## v0.1.0 — 2026-10-15

Primeira versão. Fork absorvido de quatro fontes (ver ATTRIBUTION.md), fundidas em um plugin único.

### Skills
- **construir** — workshop guiado para leigos (base: build-harness v2.0.0, MIT) acoplado ao motor de engenharia de agentes (base: revfactory/harness v2.1.0, Apache-2.0). Gera harnesses no layout método-portável (`metodo/` separado de `.claude/`), com skill "comece aqui", gabaritos de evals protegidos, revisor independente, aprovação humana, cálculos em Python e agnosticismo de modelo.
- **evoluir** — reescrito em português a partir do `evolve` do revfactory: diagnóstico obrigatório antes de qualquer mudança, opera sobre harnesses em qualquer formato, só altera com aprovação.
- **guardas** — novo (conceito do hookify, Anthropic, reescrito): regras em linguagem natural viram hooks.
- **validar** — novo (conceito do plugin-dev, Anthropic, reescrito): checklist de 11 itens com relatório em linguagem leiga.

### Adaptações sobre as fontes vendorizadas
- Workshop módulos 4–6: seções "What Gets Built" adaptadas ao layout método-portável.
- Motor revfactory mantido intocado (coreano; leitura interna do Claude).
- Biblioteca `referencia/`: 8 skills curados do muratcankoylan (MIT).

### Critérios de pronto do design (§9) — conferidos em 15/10/2026
1. Plugin instala e os comandos aparecem — `claude plugin validate` ✔; teste de instalação interativa pendente da primeira utilização real (quando acontecer, registrar aqui a data e o resultado).
2. Teste ponta a ponta com domínio leigo ✔ **com ressalvas de condução registradas** (estrutura 7/7; 4 deslizes de jargão na condução → viraram a regra de termos-armadilha do `construir` na v0.2.0); `docs/testes/2026-10-15-e2e-imoveis.md`.
3. ATTRIBUTION.md completo, licenças em `licenses/` ✔.
4. `evoluir` contra a equity-research-fleet ✔ — diagnóstico com 10 achados e propostas, clone intacto; `docs/testes/2026-10-15-evoluir-fleet.md`.
