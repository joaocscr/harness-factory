---
name: evoluir
description: "Evolui um harness existente a partir do uso real: coleta feedback e sinais de execução, generaliza, propõe melhorias e — só com aprovação — aplica nos agentes/skills/orquestrador. Use quando a pessoa pedir 'evoluir/melhorar/diagnosticar meu harness', 'retrospectiva do harness', 'o resultado ficou fraco, ajusta o harness', 'reflete esse feedback no harness', ou pedir um diagnóstico da fleet/time de agentes dela. Construção nova, redesenho de arquitetura ou adição de agentes são do skill 'construir'."
---

# Evoluir — diagnóstico primeiro, mudança com aprovação

Um harness não é obra pronta: é sistema que evolui. Este skill captura o delta entre o que o harness era, o que ele é e o que o uso real revelou, e devolve isso como melhorias generalizadas.

**Duas regras acima de tudo:**

1. **Diagnóstico antes de qualquer mudança.** O produto da fase de análise é sempre um arquivo de diagnóstico escrito na língua da pessoa — nunca uma edição direta.
2. **Nenhum arquivo do harness alvo é alterado sem aprovação explícita da pessoa.** Rodar este skill "contra" um harness (ex.: para teste ou auditoria) termina no diagnóstico; `git status` do alvo permanece limpo.

## Fase 0: reconhecer o formato do alvo

Harnesses chegam em formatos diferentes. Detecte antes de analisar, e **avalie cada um pelos padrões da fábrica** (os invariantes do skill `construir`: método separado da amarração, revisor independente, aprovação humana, cálculo em código, gabaritos protegidos, glossário) — a estrutura atual do alvo não é referência a preservar:

| Formato | Como reconhecer | Onde olhar |
|---|---|---|
| Método portável (desta fábrica) | `metodo/` + `.claude/` | `metodo/skills/`, `metodo/evals/`, `CURRICULUM.md` |
| Plugin de Claude Code | `.claude-plugin/plugin.json` | `skills/`, `agents/`, `commands/` do plugin |
| Projeto Claude Code simples | só `.claude/` e/ou `CLAUDE.md` | `.claude/agents/`, `.claude/skills/` |
| Harness v1 (revfactory) | `TeamCreate`/`TeamDelete`/flags experimentais no orquestrador | propor migração para os modos atuais |

Divergências em relação aos padrões da fábrica não são erro fatal: viram achados no diagnóstico, com a proposta de adequação e o esforço estimado. Avalie cada invariante **pela função, não pelo caminho literal** — num plugin não existe `metodo/`, mas "método separado da amarração" segue valendo (ex.: conhecimento em `skills/<nome>/references/`, amarração nos commands/frontmatter); "gabaritos protegidos" só se aplica se o alvo tem evals com gabarito; e assim por diante.

## Fase 1: coleta do delta

1. Leia a configuração atual (agents, skills, orquestrador, `CLAUDE.md` com histórico de mudanças, `metodo/` se houver).
2. Se for repositório git, consulte a evolução dos arquivos do harness (`git log --oneline -- .claude/ CLAUDE.md metodo/ skills/ agents/`) — o que mudou, quando, por quê. Histórico raso (clone raso, repo recém-criado, meia dúzia de commits) não encerra a questão: muita evolução real vive em **documentos** — CHANGELOGs, notas de release, docs de migração, versões citadas nos próprios skills. Procure-a lá também.
3. Se houver área de trabalho (`_trabalho/`, `_workspace/`, logs), confira vestígios de execução real: os artefatos previstos existem? Seguem o formato que as skills exigem? Ausência indica fluxo contornado ou morto.
4. Peça feedback à pessoa (se ainda não deu): "o que você mudaria nos resultados?", "o que você vive corrigindo na mão?". Sem feedback, não force — mas proponha melhorias por conta própria quando observar: o mesmo tipo de correção pedido 2+ vezes; falhas repetidas pela mesma causa; a pessoa contornando o orquestrador manualmente (suspeita de gatilho de skill que não dispara); artefatos v1. **Sem pessoa disponível** (teste, auditoria, análise a frio): use proxies observacionais no lugar do feedback — artefatos corrigidos à mão depois de gerados, TODO/FIXME nos arquivos, instruções duplicadas entre arquivos (sinal de regra que não pegou), skills sem nenhum vestígio de uso.

## Fase 2: classificar e mapear

| Tipo de feedback/achado | Alvo da mudança | Exemplo |
|---|---|---|
| Qualidade do resultado | a skill do agente responsável | "análise rasa" → critério de profundidade na skill |
| Papel faltando/errado | definição de agente | "falta revisão de risco" → encaminhar ao `construir` |
| Ordem do fluxo | orquestrador | "verificação devia vir antes" |
| Composição do time | orquestrador + agentes | "esses dois podiam ser um" |
| Gatilho que não dispara | `description` da skill | "pedi com outras palavras e não funcionou" |
| Modo de execução inadequado | orquestrador | "sempre o mesmo leque, e lento" |
| Custo/escala | orquestrador | "gasta demais" → reduzir escala padrão |

**Limite de escopo:** criar/remover agentes ou redesenhar a arquitetura não se faz aqui — encaminhe ao skill `construir` (fluxo de extensão). `evoluir` ajusta o que existe. A fronteira para skills é a mesma: a proposta cabe num **arquivo que já existe** (critério novo numa skill, frase na description, passo no orquestrador)? É daqui. Pede uma **skill nova**? É extensão — vai ao `construir`, mesmo que pareça pequena.

## Fase 3: o diagnóstico (produto obrigatório)

Escreva um arquivo (padrão: `diagnostico-<harness>-<AAAA-MM-DD>.md`, onde `<harness>` é o slug do alvo — o nome da pasta ou do plugin, em minúsculas e hífens, ex.: `diagnostico-equity-research-fleet-2026-10-15.md`; na pasta que a pessoa indicar; em teste/auditoria, fora do harness alvo) com, por achado:

1. **Achado** — o que foi observado, com a evidência (arquivo, trecho, padrão de execução).
2. **Generalização** — o princípio por trás, nunca o caso isolado ("a introdução saiu longa" → falta critério de proporção na skill, não "limite a introdução a 10%"). Registre o porquê junto: agente que conhece a razão decide bem nos casos de borda.
3. **Proposta** — a mudança concreta, no arquivo certo, na língua em que o arquivo já está escrito.
4. **Esforço e risco** — pequeno/médio/grande; o que pode regredir.

Se uma proposta desfaz mudança anterior registrada no histórico, aponte o conflito ("antes encurtamos por X; agora pedem o oposto") e proponha o critério que satisfaz os dois.

## Fase 4: aplicar (somente com aprovação)

Com o OK da pessoa sobre o diagnóstico (inteiro ou por item):

1. Uma mudança por vez; valide cada uma antes da próxima (estrutura/frontmatter íntegros, referências consistentes).
2. Mudou `description`? Teste o gatilho: 3+ frases que devem disparar, 3+ vizinhas que não devem.
3. Registre no histórico de mudanças do `CLAUDE.md` do alvo: data, mudança, alvo, motivo. Se o alvo não tem `CLAUDE.md` ou ele não registra o harness, criar a seção de registro é a primeira mudança a propor no diagnóstico — e, aprovada, é a primeira a aplicar.
4. Confirme que `CLAUDE.md` e os arquivos reais batem.

## Fase 5: relatório

Devolva à pessoa, em linguagem leiga: o delta capturado, o que foi aplicado (com a generalização), o que ficou de fora e por quê, e o que esperar de melhora na próxima execução.

## Princípios

- **O delta é um ativo.** Histórico acumulado faz o próximo harness do mesmo domínio nascer mais perto do estado de produção. Nunca apague histórico.
- **Sem generalização não se aplica.** Uma regra por caso vira pilha de regras; comprima em princípio.
- **Uma mudança por vez** — senão nunca se sabe qual mudança causou qual efeito.

---

*Conceito adaptado do skill `evolve` do revfactory/harness (Apache-2.0) — detalhes em `ATTRIBUTION.md`.*
