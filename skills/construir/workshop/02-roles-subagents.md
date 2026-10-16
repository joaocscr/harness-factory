# Módulo 2: Papéis e subagentes

## Ideia central

Agora existe um `AGENTS.md`, as regras da casa para todos os agentes. Mas o trabalho neste domínio geralmente consiste em várias tarefas distintas que exigem tipos diferentes de raciocínio.

Se um único agente for responsável por tudo, acontece isto:
- Ele perde o foco
- As instruções dele ficam enormes e contraditórias
- Ele faz um trabalho medíocre em tudo, em vez de um trabalho excelente em uma coisa

A solução: **especialização por papéis**, cada um sendo seu próprio subagente.

## O que é um arquivo de papel

Um arquivo de papel é um arquivo markdown que define um subagente. Ele diz a esse agente:
- Quem ele é (papel, perspectiva)
- Qual é a sua única tarefa
- Como ele aborda essa tarefa (passo a passo)
- O que ele entrega (formato, estrutura)
- O que ele explicitamente NÃO faz (isso importa tanto quanto o resto)

Pense nele como uma **atribuição precisa para um papel**, não como um manual.

## Papel ou skill: a diferença

Os dois são arquivos markdown, e é fácil confundi-los.

| | Skill | Papel (subagente) |
|---|---|---|
| O que é | Conhecimento ou um procedimento | Um trabalhador com uma tarefa |
| Onde roda | Na conversa que já está em andamento | No seu próprio contexto, limpo |
| O que vê | Tudo o que foi dito até agora | Só a sua atribuição e as regras da casa |
| Ferramentas | As mesmas da conversa | Lista própria |
| Fica em | `.claude/skills/<nome>/SKILL.md` | `.claude/agents/<nome>.md` |

Regra prática: uma skill acrescenta conhecimento ao contexto atual. Um papel recebe uma tarefa delimitada, no seu próprio contexto, com suas próprias ferramentas.

É essa separação que faz um revisor valer a pena. Um revisor que está na mesma conversa que o criador já leu todo o raciocínio do criador e tende a concordar com ele. Um revisor no seu próprio contexto vê só o resultado.

O harness usa os dois: os papéis deste módulo são subagentes, e a linha de montagem que os chama (Módulo 4) é uma skill.

## A analogia: papéis que já existem no domínio

Quase todo domínio já tem uma divisão informal de papéis, mesmo sem IA. Esse é o melhor modelo de onde partir:

| Padrão de papel | Foco | Não faz |
|---|---|---|
| Papel(éis) criador(es) | Produz/decide o artefato central | Não revisa a si mesmo |
| Papel compositor (se aplicável) | Constrói algo maior a partir de artefatos centrais | Não inventa novos artefatos centrais |
| Papel revisor | Confere contra as regras do `AGENTS.md` | Não constrói nada ele mesmo |

Esta tabela se concretiza a partir dos papéis que a pessoa citou no intake. Não invente um papel que ninguém mencionou.

É exatamente assim que agentes especializados funcionam: cada um conhece a sua área e respeita os limites dos outros.

## Anatomia de um arquivo de papel

```markdown
---
name: <nome-do-papel>
description: Quando este papel deve ser chamado, em uma frase.
tools: Read, Grep, Glob
---

## Identidade
Quem você é, em uma frase.

## Sua única tarefa
O que você faz, preciso, não vago.

## Entrada
Com o que você vai trabalhar.

## Processo
Passo a passo, como você procede.

## Saída
O que você produz: formato, estrutura, língua.

## Limites
O que você explicitamente NÃO faz.
```

O bloco entre as linhas `---` é o que o Claude Code lê para registrar o papel:
- `name`: minúsculas, com hífens. É assim que o pipeline chama o papel.
- `description`: quando entregar trabalho a este papel.
- `tools`: a lista completa do que este papel pode usar. O que não estiver listado fica indisponível para ele. O Módulo 3 preenche isso direito; por ora, comece com `Read, Grep, Glob` (somente leitura).

Tudo abaixo do bloco é a atribuição do papel.

## O revisor não pode consertar o que encontra

A lista `tools` do revisor continua somente leitura: `Read, Grep, Glob`, sem `Write`, `Edit` nem `Bash`. Um revisor que pode editar vai consertar um problema discretamente em vez de relatá-lo, e o papel criador nunca aprende.

A resposta do revisor começa com a linha `VERDICT: PASS` ou `VERDICT: FAIL`, seguida das razões concretas. O Módulo 4 retoma isso.

## Importante: arquivos de papel não repetem o AGENTS.md

Todo papel começa com as regras da casa já carregadas, por meio do `CLAUDE.md` do Módulo 1. O arquivo de papel não precisa repeti-las; ele se apoia nelas.

Ruim:
```
## Identidade
[Uma regra que já está no AGENTS.md]  ← ruído, duplicado
```

Bom:
```
## Identidade
Você opera dentro das regras do AGENTS.md.
Seu foco: [tarefa específica]
```

Com o que um papel **não** começa: a conversa até ali. O que ele precisar para a tarefa tem de chegar na entrada dele. Esse é o assunto dos handoffs no Módulo 4.

## Perguntas para a pessoa

- Que papéis/etapas de trabalho recorrentes existem neste domínio? (Do intake; concretize aqui, geralmente 2-4 papéis mais um revisor)
- Para cada papel: qual é a entrada concreta que ele recebe? O que ele produz como saída? Onde termina a responsabilidade dele?
- Isto realmente precisa de um papel revisor separado, ou cada papel confere o próprio trabalho bem o bastante neste domínio? (Um revisor separado geralmente compensa, mas nem sempre; pergunte)

## O que é construído

Um arquivo de papel por papel identificado, em `.claude/agents/`, ex.: `.claude/agents/<nome-do-papel>.md`. A maioria dos harnesses termina com pelo menos dois papéis criadores mais um papel revisor, mas o número exato decorre do intake, não deste modelo.

## Notas de condução

- Checagem de sobreposição no final: há áreas em que dois papéis se sobreporiam? Sobreposição é sinal de que os limites ainda não estão nítidos o bastante. Afie-os antes de dar o módulo por concluído.
- Se a pessoa citar um único papel ("na verdade eu faço tudo isso sozinho"), ainda vale perguntar: se você tivesse de delegar isto a três pessoas diferentes, como dividiria? Isso costuma revelar papéis escondidos.
- Nunca coloque `Agent` na lista `tools` de um papel. Papéis não chamam outros papéis; só o pipeline faz isso.
- Se `.claude/agents/` já tiver arquivos, deixe-os como estão e confira conflitos de nome antes de gravar.
- Se `.claude/agents/` não existia antes deste módulo, os papéis só ficam disponíveis numa sessão nova. Diga à pessoa para reiniciar o Claude Code antes do Módulo 4; o `CURRICULUM.md` retoma de onde ela parou. Edições posteriores nos arquivos de papel passam a valer em poucos segundos, sem precisar reiniciar.
- Se um papel precisar do mesmo procedimento extenso que outro papel, esse procedimento compartilhado é candidato a uma skill própria. Anote-o no `HANDOUT.md` em vez de construí-lo agora.
