# Guia detalhado dos modos de execução — os três modos do harness v2

Este documento explica as principais funcionalidades, restrições e critérios de escolha dos três modos de execução oferecidos pelo harness v2. É um documento complementar à etapa 2-1 do `modo-direto.md`.

---

## Sumário

1. [Modo A: coordenação por workflow](#1-modo-a-coordenação-por-workflow)
2. [Modo B: colaboração de agentes persistentes](#2-modo-b-colaboração-de-agentes-persistentes)
3. [Modo C: delegação a subagentes](#3-modo-c-delegação-a-subagentes)
4. [Árvore de decisão para escolher o modo de execução](#4-árvore-de-decisão-para-escolher-o-modo-de-execução)
5. [Migração da v1 para a v2](#5-migração-da-v1-para-a-v2)

---

## 1. Modo A: coordenação por workflow

Executa um script de coordenação com a ferramenta `Workflow`. O fluxo de controle — execução distribuída (fan-out), repetição, ramificação condicional — é definido pelo **código**, e não pelo julgamento do modelo a cada momento. Por isso, com a mesma entrada fica fácil reproduzir a mesma estrutura, e o modo também é adequado para executar muitos agentes em paralelo.

```
[Agente principal] → Workflow(script)
           ├── phase('exploração'): pipeline(items, item => agent(...))
           ├── phase('verificação'): para cada item encontrado, buscar evidências que o refutem e verificar (em paralelo)
           └── return { confirmed }   ← resultado final estruturado
```

**Principais funcionalidades:**
- `agent(prompt, opts)` — executa um subagente. Se você especificar um esquema JSON (JSON Schema) em `opts.schema`, ele devolve um objeto estruturado que já passou pela validação do schema. Não é preciso fazer parsing à parte e, se o resultado não bater com o schema, ele tenta de novo automaticamente. Especificando `opts.agentType`, é possível usar um tipo personalizado definido em `.claude/agents/`. `opts.effort` ajusta a intensidade de raciocínio, e `opts.isolation: 'worktree'` isola as alterações de arquivos.
- `pipeline(items, stage1, stage2, ...)` — cada item passa por várias etapas de forma independente. Como não há barreira de sincronização entre as etapas, **é o padrão para trabalhos de várias etapas.**
- `parallel(thunks)` — é uma barreira de sincronização que espera até que todas as tarefas terminem. Use apenas quando a etapa seguinte precisar do resultado **completo** da etapa anterior. Eliminação de duplicatas ou encerramento antecipado com base na contagem total são exemplos disso.
- `phase(title)` / `log(msg)` — agrupam a exibição do progresso e informam ao usuário o trabalho em andamento.
- `budget` — vincula-se ao orçamento de tokens especificado pelo usuário (ex.: "+500k"). Use `budget.total` e `budget.remaining()` para ajustar dinamicamente o tamanho do trabalho.
- `workflow(nameOrRef, args)` — executa outro workflow aninhado, até um nível. Use para delegar trabalho de forma hierárquica.

**Características:**
- Como o código define o fluxo de controle, a mesma entrada segue a mesma estrutura de execução.
- Como usa saída estruturada (`schema`), é possível passar entre as etapas dados que obedecem ao schema.
- `resumeFromRunId` permite continuar uma execução interrompida. Chamadas `agent()` que não mudaram devolvem imediatamente o resultado em cache, então reexecutar só uma parte custa pouco.
- Roda em segundo plano e envia uma notificação quando o trabalho termina.

**Restrições:**
- **O usuário precisa pedir primeiro.** Só pode ser usado quando o usuário pediu diretamente um workflow ou a coordenação de vários agentes, ou quando executou um skill que especifica a chamada a `Workflow`. Os skills de coordenação criados pelo harness se enquadram no segundo caso. Ainda assim, mantenha baixo o número padrão de agentes e use execução distribuída em grande escala só quando o usuário pedir explicitamente.
- No script só se pode usar JavaScript puro; sintaxe TypeScript não é aceita. `Date.now()`, `Math.random()` e `new Date()` sem argumentos não podem ser usados, porque atrapalham a retomada da execução. Passe timestamps por `args`.
- No bloco `meta` só se podem usar literais. Variáveis, chamadas de função e sintaxe de spread não são permitidas.
- Há um limite de agentes que podem rodar simultaneamente por sessão. As tarefas acima do limite entram automaticamente numa fila. O número total de agentes que podem ser chamados durante a execução de um workflow também é limitado, para evitar execução excessiva.
- Um `agent()` que falhou ou foi pulado devolve `null`. Como `parallel()` não lança exceção quando uma chamada falha, aplique sempre `.filter(Boolean)` ao resultado.
- A barreira de `parallel()` só alinha o momento em que as tarefas terminam; não impede alterações depois que terminaram. No modo misto, um agente nomeado acordado por `SendMessage` depois do fim de uma etapa do workflow pode alterar os arquivos produzidos nessa etapa; por isso, congele os artefatos na fronteira em que o modo muda (etapa 4 do template B em `orchestrator-template.md`).

**Trabalhos adequados:** execução distribuída em que a lista pode ser definida de antemão, como N arquivos ou M perspectivas; repetição até não surgir item novo (Loop-until-dry) e verificação adversarial; migrações e auditorias em grande escala; geração de relatórios estruturados

**Trabalhos inadequados:** trabalho em que não dá para definir a lista de antemão porque o alvo vai sendo descoberto ao longo da conversa; trabalho que exige consultar o usuário com frequência no meio do caminho

> Para o esqueleto concreto do script e os pontos de atenção, consulte `workflow-recipes.md`.

## 2. Modo B: colaboração de agentes persistentes

Executa agentes com nome e os coordena com uma lista de tarefas compartilhada e `SendMessage`. É o substituto do modo "time de agentes" da v1.

**A maior diferença em relação à v1:** `TeamCreate` e `TeamDelete` não existem mais. Ao contrário da v1, não se cria um objeto de time explícito; os agentes executados com nome na sessão passam a fazer parte de um único grupo de colaboração montado automaticamente.

```
[Agente principal (líder)]
    ├── Agent(name: "researcher", subagent_type: "...", prompt: ...)   ← execução em paralelo
    ├── Agent(name: "critic", ...)
    ├── TaskCreate(tarefa + dependências) → lista de tarefas compartilhada
    ├── SendMessage({to: "researcher"}, ...)  ← instrução adicional mantendo o contexto da conversa
    └── recebe notificação de conclusão → reúne os resultados → consolidação final
```

**Principais funcionalidades:**
- `Agent(name: ..., subagent_type: ..., model: ..., prompt: ...)` — especificando `name`, ele se torna um agente persistente que pode ser chamado de novo por `SendMessage`. Por padrão roda em segundo plano e envia notificação ao concluir. Se for preciso esperar até o trabalho terminar, especifique `run_in_background: false`.
- `SendMessage({to: name})` — faz um agente executado antes continuar o trabalho **mantendo o contexto da conversa**. É necessário quando se trocam resultados e se corrige repetidamente.
- `TaskCreate` / `TaskUpdate` / `TaskList` / `TaskGet` — compartilham a lista de tarefas. Servem para gerenciar as dependências entre tarefas e o estado de progresso, e para o supervisor distribuir tarefas conforme o andamento.
- `TaskStop` — interrompe tarefas em segundo plano que estão rodando em excesso ou que não são mais necessárias.

**Características:**
- Como o agente lembra a conversa e o histórico de trabalho anteriores, consegue tratar pedidos de seguimento como "na mesma sessão, corrija só a seção 2 do rascunho que você fez antes".
- Os agentes compartilham o que descobriram, discutem opiniões divergentes e conseguem corrigir a direção do trabalho na hora.
- Enquanto a sessão durar, é possível continuar usando o mesmo agente especialista.

**Restrições:**
- Como o agente principal (líder) coordena diretamente, quanto mais agentes houver, mais trabalho se concentra no líder. O número adequado de agentes é de 3 a 5.
- Aninhar a delegação em muitos níveis torna as respostas lentas e facilita a perda do contexto da conversa. Recomenda-se delegar em no máximo dois níveis.
- Gasta mais tokens do que chamar um subagente uma única vez.
- Como agentes nomeados continuam recebendo mensagens depois de relatar a conclusão, podem alterar um artefato já entregue enquanto respondem a uma pergunta tardia de outro agente. Se a etapa seguinte lê esse artefato, congele o artefato na fronteira da etapa. O procedimento de congelamento está na etapa 4 do template B em `orchestrator-template.md`.

**Trabalhos adequados:** trabalho em que autor e verificador trocam resultados e corrigem repetidamente; trabalho de discutir dados que não batem entre si e unificá-los; trabalho em que um supervisor distribui tarefas conforme o andamento; trabalho que precisa de um agente especialista durante toda a sessão

**Trabalhos inadequados:** tarefas pontuais em que basta receber o resultado; execução distribuída em grande escala em que a lista de tarefas pode ser definida de antemão

## 3. Modo C: delegação a subagentes

É a forma de entregar o trabalho a um subagente chamando a ferramenta `Agent` uma única vez. Só o resultado volta ao agente principal, e os agentes não se comunicam entre si.

```
[Agente principal] → Agent(subA) ─┐
                   → Agent(subB) ─┼→ (em paralelo; o padrão é rodar em segundo plano) → recebe notificação de conclusão → reúne os resultados
                   → Agent(subC) ─┘
```

**Características:**
- A carga de execução é pequena e é rápido. O agente principal recebe resultados resumidos.
- Chamadas independentes entre si, quando **agrupadas em uma única mensagem**, rodam simultaneamente.
- Por padrão roda em segundo plano. Se for preciso receber o resultado imediatamente, especifique `run_in_background: false`.
- O agente principal não refaz a busca que já delegou; ele espera o resultado.

**Restrições:**
- Os agentes não conseguem se comunicar entre si e, terminada a chamada, o contexto da conversa também não continua. Para começar como tarefa nova, chame sem `name`.
- Toda a coordenação fica a cargo do agente principal.

**Trabalhos adequados:** pesquisa e coleta que terminam de uma vez; trabalho de escolher o especialista necessário e só receber o resultado; uma rodada de verificação independente

**Trabalhos inadequados:** trabalho que exige trocar resultados e corrigir repetidamente; trabalho distribuído em grande escala cujo fluxo de execução pode ser definido de antemão

## 4. Árvore de decisão para escolher o modo de execução

```
Dá para expressar em código, de antemão, a lista de tarefas, o critério de verificação e a condição de repetição?
├── Sim → coordenação por workflow (modo A)
│        O fluxo de controle é definido em código, não pelo julgamento do modelo.
│        Porém, respeite a condição de que o usuário precisa pedir primeiro e não aumente o número de agentes além do necessário.
│
└── Não → A qualidade melhora quando se trocam resultados repetidamente e se mantém o contexto da conversa?
              ├── Sim → colaboração de agentes persistentes (modo B)
              │
              └── Não → Há dois ou mais agentes?
                            ├── Sim → delegação paralela a subagentes (modo C)
                            └── Não → chamada única de subagente (modo C)
```

**Escolha do modo misto:** se a resposta às perguntas acima muda de etapa para etapa, misture os modos de execução. As combinações mais usadas são as seguintes.

| Combinação | Composição | Exemplo |
|------|------|------|
| Coleta por workflow → integração persistente | A → B | Depois de coletar material em grande volume de forma distribuída, o time discute os dados que não batem e chega a um consenso |
| Geração persistente → verificação por workflow | B → A | Depois que o time faz o rascunho, executa-se de forma distribuída a verificação adversarial de cada item encontrado |
| Levantamento prévio por subagente → trabalho principal por workflow | C → A | O agente principal ou um subagente primeiro identifica a lista de tarefas e depois passa essa lista ao workflow via `args` |

**Princípio de conferir a lista antes de coordenar:** antes de iniciar o workflow, dê uma olhada rápida na lista de arquivos, nos alvos de revisão e nos itens de pesquisa, e feche a lista de tarefas. Entender a forma do trabalho antes da execução simplifica o script e reduz trabalho desnecessário.

## 5. Migração da v1 para a v2

Ao encontrar skills de coordenação ou definições de agentes criados por um harness v1 existente, proponha convertê-los para o formato v2 conforme a tabela abaixo.

| Elemento da v1 | Situação | Substituto na v2 |
|---------|------|---------|
| `TeamCreate(team_name, members)` | **Removido** | Execute `Agent(name: ...)` em paralelo numa única mensagem. Agentes com nome passam a fazer parte do grupo de colaboração montado automaticamente na sessão, então não é preciso criar um objeto de time à parte. |
| `TeamDelete` / etapa de "desmontar o time" | **Removido** | Apague essa etapa. Os agentes encerram naturalmente ao terminar o trabalho e, se necessário, podem ser interrompidos com `TaskStop`. |
| Restrição de "só um time ativo por sessão" | **Mudou de forma** | Como o objeto de time explícito deixou de existir, a restrição da v1 não se aplica. Agentes com nome trabalham juntos no grupo de colaboração montado automaticamente na sessão. |
| Envio para todos com `SendMessage({to: "all"})` | Alterado | Envie `SendMessage` separadamente apenas aos destinatários necessários. |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | **Desnecessário** | Remova de todos os documentos e scripts. |
| `model: "opus"` imposto a todos os agentes | Política abandonada | Escolha o modelo de cada um conforme a natureza do trabalho. Na dúvida, use `sonnet`, e só mantenha a herança de modelo quando ela for uma escolha intencional. |
| Execução distribuída em grande escala montada como time | Melhorado | Passe para um script `Workflow`. O fluxo de controle é definido em código, usa-se saída estruturada e a execução pode ser retomada. |
| "Etapa 0: verificar o contexto da conversa" dos skills de coordenação | Mantido | Mantenha o procedimento existente, mas acrescente a opção `resumeFromRunId` ao modo de coordenação por workflow. |
| Regras de escrita de arquivos em `_workspace/` | Mantido | Use como está. |
| Indicação de localização e histórico de mudanças no `CLAUDE.md` | Mantido | Use como está. |

**Procedimento de migração:**
1. Remova dos skills de coordenação existentes as referências a `TeamCreate`, `TeamDelete`, envio para todos e flag experimental.
2. Encontre os trechos de execução distribuída e de repetição de verificação. Se o fluxo de execução puder ser definido de antemão em código, converta-os para o modo de coordenação por workflow.
3. Reescreva os trechos de colaboração restantes na sintaxe de colaboração de agentes persistentes (`Agent(name:)` + `SendMessage` + `TaskCreate` / `TaskUpdate`).
4. Remova das definições de agentes a atribuição em bloco de `model: "opus"` e mantenha apenas as atribuições que tenham justificativa.
5. Refaça a verificação da etapa 6 (verificação de estrutura e execução de teste) e registre no histórico de mudanças do `CLAUDE.md`.
