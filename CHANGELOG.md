# Changelog

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

### Critérios de pronto do design (§9)
1. Plugin instala e os comandos aparecem — `claude plugin validate` ✔; teste de instalação real pendente da primeira utilização.
2. Teste ponta a ponta com domínio leigo — ver `docs/testes/`.
3. ATTRIBUTION.md completo, licenças em `licenses/` ✔.
4. `evoluir` contra a equity-research-fleet — ver `docs/testes/`.
