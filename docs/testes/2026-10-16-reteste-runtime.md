# Reteste do modo direto com runtime real — resultado parcial

16/10/2026 · fecha os diferidos da v0.2.0 ligados ao A17 · alvo: harness gerado em `.superpowers/e2e/modo-direto/`

## O que o reteste pedia

Rodar o harness gerado numa sessão/execução real do Claude Code **dentro da pasta dele**, para que os tipos de agente e as restrições de `tools` valham pelo sistema (não por instrução, como no teste de 16/10), mais o teste de acionamento (6-4) por execução e, se viável, um baseline (6-3).

## O que bloqueou: autenticação do CLI (pendência do dono)

A sondagem `claude -p "Responda somente: OK"` na pasta do harness falhou com **`401 OAuth access token is invalid`** — o mesmo erro do teste E2E de 15/10. Renovar o login do CLI é interativo e só o dono pode fazer. **Comandos prontos para depois do login:**

```bash
claude /login
```

e então, na pasta `.superpowers/e2e/modo-direto/`:

```bash
claude -p "Use o agente revisor-backtest para revisar o caso exemplo-momentum e me diga quais ferramentas ele teve disponíveis"
```

```bash
python metodo/evals/rodar_evals.py --only E01
```

(mais: um pedido que deve acionar `/backtest-fator` e um vizinho que não deve — teste 6-4.)

## O que foi verificado sem o login (prontidão estática para o runtime)

| Verificação | Resultado |
|---|---|
| Frontmatter dos 3 agentes (`name`, `description`) | ✅ 3/3 válidos — carregáveis pelo runtime |
| Restrições de `tools` declaradas nos 3 agentes | ✅ 3/3 (a imposição pelo sistema fica para o pós-login) |
| 5 wrappers de skill presentes em `.claude/skills/` | ✅ |
| Plugin harness-factory carregado pelo runtime desta sessão | ✅ — os 4 skills aparecem como `harness-factory:*` (evidência de que a instalação real funciona de ponta a ponta) |

## Achado sobre o artefato de teste

O `rodar_evals.py` gerado no teste do modo direto **não implementa `--list`** (só `--only`), divergindo do comportamento do template que o módulo 6 prescreve. É defeito do artefato de teste (git-ignorado, fora do release), não do texto da fábrica — as notas do modo direto na v0.2.0 já amarram o porte ao comportamento do template; fica o registro de que o executor de 16/10 portou de forma incompleta.

## Estado dos diferidos da v0.2.0

- Clarificações de uma linha: **todas aplicadas na v0.2.1** (QA×revisor + generalização do guia web; regra canônica CLAUDE.md×AGENTS.md; tom pós-aceite; `_trabalho/<caso>/`; precisão sobre `_original-*`; aviso no frontmatter do modo-direto; commit por etapa já existia).
- Regra autocrlf×sha256: **promovida a invariante 7** do `construir`, com item 12 espelho no `validar`.
- Reteste com runtime real, acionamento 6-4 por execução e baseline 6-3: **pendentes de `claude /login`** (única pendência, do dono, comandos prontos acima).
