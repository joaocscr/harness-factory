# Teste: retomada entre sessões via CURRICULUM.md (lacuna "a" do fix pass)

**Data:** 15/10/2026 · **Resultado: PASS**

## Montagem

Fixture `.superpowers/e2e/retomada/` (fora do versionamento, como os demais E2E): cópia do harness real do E2E de imóveis reduzida ao estado "workshop interrompido no módulo 3" —

- Presentes (módulos 1–2): `CURRICULUM.md`, `CLAUDE.md` (`@AGENTS.md`), `AGENTS.md`, `metodo/GLOSSARIO.md`, `.claude/agents/` (6 papéis).
- Ausentes (módulos 3+): `.mcp.json`, `.claude/skills/`, `.claude/settings.json`, `metodo/skills|checagens|evals/`, `_trabalho/`, `casos/`.
- `CURRICULUM.md`: módulos 1–2 ✅, módulos 3–8 ⬜.

Uma "sessão 2" então seguiu o fluxo 0 do skill `construir` ("Situar e retomar") do zero, como se nada soubesse do workshop anterior.

## O que foi verificado

| Verificação | Evidência | Resultado |
|---|---|---|
| Gatilho de retomada existe | `description` do `construir` cobre "retomar um workshop em andamento (existe CURRICULUM.md no projeto)" | ✅ |
| Leitura do que existe (fluxo 0.2) | CLAUDE.md, AGENTS.md, `.claude/agents/`, `metodo/`, CURRICULUM.md lidos e relatáveis em linguagem leiga | ✅ |
| Ponto de retomada correto (fluxo 0.3) | Primeiro módulo sem ✅ na tabela = **módulo 3 (Ferramentas)**; não recomeça do zero nem repete os módulos 1–2 | ✅ |
| Template traduzido na retomada | grep `build-harness` no CURRICULUM = 0; grep `harness/` = 0; texto em pt-BR; seção Referência aponta "skill `construir` do plugin harness-factory"; artefatos no layout portável (`metodo/skills/`, `_trabalho/handoffs/`, `metodo/evals/`) | ✅ |
| Coerência artefato × status | Artefatos dos módulos ✅ existem; `.mcp.json` (módulo 3) não existe | ✅ |

## Observações honestas

1. Os arquivos de agente copiados do E2E original já traziam a linha `tools:` (entregável parcial do módulo 3). A retomada é dirigida pelo CURRICULUM, então o ponto de retomada não muda; um facilitador atento notaria o entregável parcial ao abrir o módulo 3 e confirmaria em vez de refazer — comportamento compatível com "artefato pronto ≠ discutido".
2. Os agentes do E2E original têm `model:` fixado (opus/sonnet) sem justificativa no corpo do arquivo — traço pré-existente daquele harness, fora do escopo deste teste; o `validar` (item 5) o apanharia.

## Conclusão

A retomada entre sessões funciona com o CURRICULUM traduzido/adaptado da v0.1.1: a sessão nova encontra a âncora na língua da pessoa, aponta para o plugin certo e continua exatamente no módulo interrompido.
