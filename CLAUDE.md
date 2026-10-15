# harness-factory — contexto do projeto

Plugin de Claude Code que constrói e evolui harnesses de agentes para usuários **leigos em tecnologia** (analistas, gestores, bankers). Dono: João Coutinho (joaocscr) — fala português, não programa profissionalmente; explique decisões técnicas em linguagem simples.

## Autoridade dos documentos

1. **Design (spec, aprovado 15/10/2026):** `docs/superpowers/specs/2026-10-15-fabrica-harness-design.md` — decide qualquer conflito.
2. **Plano de implementação:** `docs/superpowers/plans/2026-10-15-harness-factory.md`.

## Regras que não mudam

- **Fork absorvido, não wrapper:** nada aqui depende dos repositórios de origem em runtime. Atribuições em `ATTRIBUTION.md`; toda cópia nova de terceiros exige licença compatível + atualização do ATTRIBUTION.
- De `hookify` e `plugin-dev` (Anthropic): **zero cópia literal** (licença não confirmada), só conceito reescrito.
- Facilitação ao usuário final: na língua dele, sem jargão não traduzido, 1–3 perguntas por vez.
- Harnesses gerados: layout método-portável (`metodo/` separado de `.claude/`), cálculos em código (Python), agnóstico de modelo, nunca bash puro sem alternativa Windows.
- A equity-research-fleet (`joaocscr/equity-research-fleet`) é caso de uso e fonte de método, **nunca** modelo de arquitetura.
- Arquivos `_original-*.md` em `skills/` são referência vendorizada intocada — não edite; adaptações vivem nos SKILL.md novos.

## Contexto de negócio (resumo)

Casos de uso do dono: (1) evoluir a equity-research-fleet; (2) harness de trabalho (deals, apresentações, modelos financeiros); (3) laboratório do projeto Annalisa — plataforma de análise de investimento com método auditável; a fábrica serve ao laboratório (método, evals, golden set), nunca à plataforma (gateway, multi-tenant ficam fora).
