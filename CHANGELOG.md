# Changelog

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
1. Plugin instala e os comandos aparecem — `claude plugin validate` ✔; teste de instalação interativa pendente da primeira utilização real.
2. Teste ponta a ponta com domínio leigo ✔ — workshop completo com persona leiga, estrutura 7/7 critérios; `docs/testes/2026-10-15-e2e-imoveis.md`.
3. ATTRIBUTION.md completo, licenças em `licenses/` ✔.
4. `evoluir` contra a equity-research-fleet ✔ — diagnóstico com 10 achados e propostas, clone intacto; `docs/testes/2026-10-15-evoluir-fleet.md`.
