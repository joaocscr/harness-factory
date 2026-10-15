# Teste: workshop em pasta com `.claude/` e `CLAUDE.md` pré-existentes (lacuna "b" do fix pass)

**Data:** 15/10/2026 · **Resultado: PASS**

## Montagem

Fixture `.superpowers/e2e/preexistente/` (fora do versionamento): pasta de uma persona ("Marina", banker, decks de M&A) que **já usa** Claude Code —

- `CLAUDE.md` com notas e 3 regras pessoais ("não apagar").
- `.claude/settings.json` com uma negação (`Read(./confidencial/**)`) e um hook `PreToolUse` (matcher `Write`, confere nomenclatura).
- `.claude/agents/conferidor-de-deck.md` (agente dela).

Hashes SHA-256 registrados antes de qualquer mudança. O workshop (`construir` fluxo 0 + módulo 1 + uma guarda) foi então exercitado sobre a pasta.

## O que foi verificado

| Verificação | Evidência | Resultado |
|---|---|---|
| Fluxo 0.2: leitura antes de agir | CLAUDE.md, settings.json e o agente existentes lidos e relatáveis em linguagem leiga antes de qualquer escrita | ✅ |
| Fluxo 0.5: CLAUDE.md nunca sobrescrito | Módulo 1 **acrescentou** `@AGENTS.md` ao fim (com comentário dizendo que nada acima mudou); as 3 regras da Marina e o título continuam presentes (conferido por substring) | ✅ |
| Regras existentes absorvidas, não apagadas | O novo `AGENTS.md` herda as convenções da Marina e declara que o `CLAUDE.md` dela tem precedência | ✅ |
| settings.json mesclado, não substituído | JSON válido após a mudança; `deny` preservado; `PreToolUse` com **2** entradas — o hook antigo (`confere_nome_arquivo.py`) intacto ao lado do novo (`exige_aprovacao.py`) | ✅ |
| Conflito no mesmo evento → parar e perguntar | Hook novo em `PreToolUse` (evento já ocupado): o fluxo exige pausa e pergunta; simulada a resposta "adiciona e mantém a antiga" antes de gravar | ✅ |
| Agente pré-existente intocado | Hash SHA-256 do `conferidor-de-deck.md` idêntico antes/depois (`62A9BC06…`) | ✅ |
| Colisão de nomes conferida | Nenhum agente/skill novo com o nome `conferidor-de-deck` | ✅ |

## Observações honestas

1. O teste exercitou os pontos de escrita do módulo 1 e de uma guarda (os dois que tocam arquivos pré-existentes no início do workshop); módulos 2–7 completos não foram repetidos aqui — já cobertos pelo E2E de imóveis.
2. A aprovação da pessoa ("mostre o resultado antes de gravar") foi simulada, como nas evals de pipeline: registrada como simulada, nunca pulada em silêncio.

## Conclusão

Numa pasta que já tem `CLAUDE.md` e `.claude/`, o workshop lê primeiro, acrescenta em vez de sobrescrever, mescla o `settings.json` preservando travas e permissões existentes, e para e pergunta diante de conflito no mesmo evento. Nada do que a pessoa tinha se perde.
