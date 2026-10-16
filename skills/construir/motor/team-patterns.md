# Padrões de composição de times — 6 padrões básicos, verificação de qualidade, definição de agentes

Este documento complementa as etapas 2-2 e 3 do `modo-direto.md`. Explica o modo de execução que a v2 recomenda para cada padrão. Os detalhes estão em `execution-modes.md`.

---

## Sumário

1. [Os 6 padrões básicos](#1-os-6-padrões-básicos)
2. [Padrões de verificação de qualidade (acrescentados na v2)](#2-padrões-de-verificação-de-qualidade-acrescentados-na-v2)
3. [Padrões compostos](#3-padrões-compostos)
4. [Escolha do tipo de agente](#4-escolha-do-tipo-de-agente)
5. [Estrutura da definição de agente](#5-estrutura-da-definição-de-agente)
6. [Critérios para separar agentes](#6-critérios-para-separar-agentes)
7. [Design de reutilização de agentes](#7-design-de-reutilização-de-agentes)
8. [Distinção entre skill e agente](#8-distinção-entre-skill-e-agente)

---

## 1. Os 6 padrões básicos

### 1-1. Pipeline (Pipeline)

Encadeia o trabalho numa ordem definida. A saída do agente anterior vira a entrada do agente seguinte.

```
[Análise] → [Design] → [Implementação] → [Verificação]
```

**Adequado:** quando cada etapa depende fortemente do artefato da etapa anterior

**Exemplo:** escrita de romance — universo ficcional → personagens → enredo → escrita → edição

**Atenção:** se uma etapa atrasa, o trabalho inteiro atrasa. Desenhe cada etapa da forma mais independente possível.

**Modo de execução recomendado na v2:** se as etapas e os itens puderem ser listados de antemão, recomenda-se a **coordenação por workflow**, usando `pipeline()`. Cada item passa para a etapa seguinte assim que a anterior termina. Como não é preciso esperar que todos os itens de uma etapa terminem, o tempo total de execução também diminui. Se for preciso que uma pessoa revise o artefato entre uma etapa e outra, chame subagentes em sequência.

### 1-2. Distribuição e integração (fan-out/fan-in)

Processa ao mesmo tempo tarefas independentes entre si e depois junta os resultados em um só.

```
                 ┌→ [Especialista A] ─┐
[Distribuição] → ├→ [Especialista B] ─┼→ [Integração]
                 └→ [Especialista C] ─┘
```

**Adequado:** quando a mesma entrada precisa ser analisada separadamente por várias perspectivas ou áreas

**Exemplo:** pesquisa abrangente — pesquisar ao mesmo tempo fontes oficiais, imprensa, comunidade e contexto, e depois consolidar em um único relatório

**Atenção:** a forma de juntar os resultados determina a qualidade do todo.

**Modo de execução recomendado na v2:** considere primeiro a **coordenação por workflow**. Defina a lista de perspectivas como um array, envie-a para `pipeline()`, receba os resultados conforme o `schema` e junte-os em código. Use `parallel()` só quando for preciso eliminar duplicatas depois de reunir todos os resultados. Nesse caso, só se passa à etapa seguinte depois que todas as chamadas paralelas terminarem. Para pesquisas com 2 a 4 pessoas em que os pesquisadores precisam compartilhar em tempo real o que encontraram, a colaboração de agentes persistentes também é adequada.

### 1-3. Pool de especialistas (Expert Pool)

Escolhe e chama só os especialistas adequados à entrada e à situação.

```
[Classificador] → { EspecialistaA | EspecialistaB | EspecialistaC }
```

**Adequado:** quando cada tipo de entrada exige uma forma de tratamento diferente

**Exemplo:** revisão de código — entre os especialistas em segurança, desempenho e arquitetura, chamar só o da área em questão

**Atenção:** se o agente classificador classificar mal a entrada, não dá para escolher o especialista adequado.

**Modo de execução recomendado na v2:** com a **delegação a subagentes**, chame uma vez só os especialistas necessários. Se for preciso continuar uma conversa de seguimento com o mesmo especialista, dê `name` e passe para a colaboração de agentes persistentes.

### 1-4. Geração e verificação (Producer-Reviewer)

Um agente gerador e um agente verificador trabalham em dupla.

```
[Geração] → [Verificação] → (se encontrar problema) → reexecuta [Geração]
```

**Adequado:** quando a qualidade do artefato precisa obrigatoriamente ser verificada e é possível definir critérios objetivos de julgamento

**Atenção:** para não repetir verificação e correção indefinidamente, fixe o número máximo de novas tentativas em 2 a 3.

**Modo de execução recomendado na v2:** se o critério de verificação puder ser expresso em código, use a **coordenação por workflow**. Com o padrão de verificação adversarial abaixo, faça verificação paralela de cada item encontrado. Se for preciso conciliar julgamentos subjetivos, execute o gerador e o verificador como **um par de agentes persistentes** com nome e troque feedback por SendMessage. Como o gerador mantém o conteúdo das conversas anteriores, consegue corrigir com precisão o trecho apontado.

### 1-5. Supervisor (Supervisor)

Um agente central gerencia o estado do trabalho e divide as tarefas conforme o andamento.

```
              ┌→ [Executor A]
[Supervisor] ─┼→ [Executor B]    ← distribui conforme o andamento
              └→ [Executor C]
```

**Adequado:** quando o volume de trabalho varia continuamente, ou quando é preciso decidir durante a execução como dividir as tarefas

**Diferença em relação à execução distribuída:** a execução distribuída define a forma de distribuição antes de começar o trabalho. O supervisor observa o andamento e redistribui as tarefas.

**Atenção:** se as tarefas forem divididas em pedaços pequenos demais, o supervisor precisa redistribuir com frequência e vira gargalo.

**Modo de execução recomendado na v2:** use a **colaboração de agentes persistentes**. O agente principal, como líder, registra as tarefas com `TaskCreate`, recebe as notificações de conclusão dos executores e redistribui as tarefas com `SendMessage` e `TaskUpdate`. Se a lista de tarefas puder ser fechada de antemão e o procedimento de distribuição também puder ser escrito em código, passe para a coordenação por workflow, porque nesse caso não sobra nada para o supervisor julgar.

### 1-6. Delegação hierárquica (Hierarchical Delegation)

O agente que recebeu a delegação repassa o trabalho a agentes subordinados. É a forma usada para dividir um problema complexo em vários níveis.

```
[Coordenação geral] → [Chefe de equipe A] → [Executores A1, A2]
                    → [Chefe de equipe B] → [Executor B1]
```

**Adequado:** quando o problema se divide naturalmente em tarefas superiores e subordinadas

**Atenção:** com três ou mais níveis de profundidade, a execução fica lenta e o conteúdo do trabalho anterior pode não ser transmitido direito. **Recomenda-se no máximo dois níveis.**

**Modo de execução recomendado na v2:** coordene aninhando workflows. O workflow superior chama o workflow subordinado com `workflow(nameOrRef, args)`. Como a chamada aninhada só suporta um nível, isso impede que a hierarquia fique profunda demais. Alternativamente, elimine a hierarquia e reorganize tudo com `phase()` dentro de um único workflow.

## 2. Padrões de verificação de qualidade (acrescentados na v2)

São padrões de verificação por workflow acrescentados a harnesses em que a exatidão do artefato importa. O objetivo é filtrar resultados que à primeira vista parecem certos mas na verdade estão errados.

| Padrão | Estrutura | Quando usar |
|------|------|------|
| **Verificação adversarial** | Para cada item encontrado, executa N agentes de verificação adversarial independentes. Só passam os itens que mais da metade dos N agentes julgou `confirmed`, por terem evidência suficiente. | Quando é preciso poder confiar no que foi encontrado ou nas afirmações (revisão, auditoria, pesquisa) |
| **Verificação com perspectivas distribuídas** | Em vez de dar o mesmo prompt aos N agentes de verificação adversarial, atribui a cada um uma perspectiva diferente, como exatidão, segurança e reprodutibilidade. | Quando os erros podem surgir de vários tipos. Dividindo os critérios de verificação, é possível encontrar erros que escapam quando se repete a mesma verificação. |
| **Banca julgadora** | Julga em paralelo N propostas feitas por abordagens diferentes. Com base na proposta mais bem avaliada, incorpora também, onde necessário, os pontos fortes das outras para redigir a versão final. | Design ou planejamento com muitas soluções possíveis. Comparar várias propostas é melhor do que corrigir uma única repetidamente. |
| **Repetir até não surgir item novo (Loop-until-dry)** | Repete a busca até que os itens novos encontrados sejam 0 por K vezes seguidas. Registra também os itens rejeitados em `seen` para impedir que o mesmo item seja proposto repetidamente. | Buscas em que não se sabe quantos problemas existem (bugs, issues, casos de fronteira). Fixar o número de rodadas de antemão pode fazer perder problemas que ainda seriam encontrados. |
| **Busca por vários critérios** | Executa em paralelo agentes que buscam por critérios diferentes, como contêiner, conteúdo, entidade e tempo. | Quando um único critério de busca não basta para encontrar tudo |
| **Revisão de omissões** | No final, põe um único agente que só verifica: "que critério de busca não foi usado, que afirmação não foi verificada, que material não foi lido?". | Logo antes de juntar os resultados. Os itens omitidos encontrados entram na tarefa de busca seguinte. |
| **Divulgação do número de itens excluídos** | Se o alcance da verificação for limitado por `top-N` ou amostragem, registre obrigatoriamente com `log()` o número de itens excluídos. | Toda execução distribuída. Se o número de excluídos não for declarado, o usuário entende erroneamente que tudo foi verificado. |

**Princípio de ajuste de escala:** defina a escala conforme o escopo de pesquisa pedido pelo usuário. Para "vê se tem bug", monte com poucos buscadores e um agente de verificação adversarial. Para "faz uma auditoria a fundo", aumente os buscadores, entregue a verificação de cada item encontrado a 3 a 5 agentes de verificação adversarial e passe por uma etapa de síntese. Se for difícil julgar o escopo do pedido, faça pesquisas, revisões e auditorias com minúcia, e verificações rápidas em escala pequena.

> Os exemplos de implementação estão em `workflow-recipes.md`.

## 3. Padrões compostos

No trabalho real, vários padrões são combinados.

| Padrão composto | Composição | Exemplo |
|----------|------|------|
| **Distribuição e integração + geração e verificação** | Faz várias propostas ao mesmo tempo e verifica cada uma | Tradução multilíngue — traduz em paralelo para quatro idiomas e depois um revisor nativo de cada idioma confere |
| **Pipeline + distribuição e integração** | Processa em paralelo parte das etapas sequenciais | Análise (sequencial) → implementação (paralela) → teste de integração (sequencial) |
| **Supervisor + pool de especialistas** | O supervisor chama o especialista adequado à situação | Atendimento a clientes — o supervisor classifica a solicitação e a atribui ao especialista adequado |
| **Busca + verificação adversarial + síntese** | Busca por vários critérios → verificação por item encontrado → revisão de omissões → redação do relatório | Auditoria abrangente de código, pesquisa aprofundada |

Nos padrões compostos, escolha o modo de execução adequado a cada etapa. Essa composição se chama modo misto. O critério de escolha é se o fluxo de controle da etapa pode ser definido de antemão em código.

## 4. Escolha do tipo de agente

Ao chamar um agente, indique o tipo pelo parâmetro `subagent_type` da ferramenta Agent ou `agentType` do Workflow.

### Tipos nativos

| Tipo | Ferramentas disponíveis | Uso adequado |
|------|----------|-----------|
| `general-purpose` | Todas (incluindo WebSearch, WebFetch) | Pesquisa na web, tarefas gerais, alteração de arquivos |
| `Explore` | Somente leitura (sem Edit, Write) | Localizar código em uma base de código. Não é usado para revisão nem auditoria. |
| `Plan` | Somente leitura (sem Edit, Write) | Design de arquitetura, elaboração de plano de implementação |

### Tipos personalizados

Defina o tipo em `.claude/agents/{name}.md`. Ao chamar, indique `subagent_type: "{name}"` ou `agentType: "{name}"`. As ferramentas e o modelo a usar são definidos no frontmatter YAML (cabeçalho).

### Critérios de escolha

| Situação | Recomendado | Motivo |
|------|------|------|
| Papel complexo, usado repetidamente em várias sessões | **Tipo personalizado** | Gerencia de forma consistente, em arquivo, o papel do especialista e os princípios de trabalho. |
| Pesquisa ou coleta simples e pontual, em que um prompt detalhado basta | `general-purpose` + prompt detalhado | Usa diretamente o tipo nativo, sem arquivo de definição à parte. |
| Só localizar código | `Explore` | Não tem ferramentas de alteração de arquivos, então não há risco de alterar algo por engano. |
| Só elaborar design ou plano | `Plan` | Concentra-se só na análise, sem alterar código. |
| Alteração simples e pontual de arquivo | `general-purpose` + prompt detalhado | Resolve direto com o tipo nativo. |
| Implementação usada repetidamente ou que exige regras especializadas | **Tipo personalizado** | Libera todas as ferramentas necessárias e aplica as diretrizes especializadas. |
| Alterar vários arquivos em paralelo | Tipo personalizado + `isolation: 'worktree'` | Evita conflito de alterações de arquivos entre agentes. Como criar a árvore de trabalho tem custo, use só quando a alteração for em paralelo. |

**Princípio:** papéis de especialista que serão reutilizados em várias sessões são criados como tipo personalizado em `.claude/agents/{name}.md`. Para tarefas pontuais que usam um tipo nativo tal como é, não crie arquivo de definição à parte.

**Política de modelos:** escolha a categoria de modelo pela complexidade do trabalho, pela duração prevista, pela margem de decisão própria exigida e pela velocidade de resposta necessária. Use **fable** em trabalhos de máxima dificuldade que exigem montar um plano e executá-lo de forma autônoma por longo período, e na coordenação de agentes. Use **opus** em design e arquitetura, geração de código, análises complexas, verificação cruzada e criação. Use **sonnet** em trabalhos padronizados com pouco a julgar, como análise de logs, conversão de formato, inspeção de arquivos estáticos, execução de scripts de deploy e coleta simples. Se for difícil decidir, escolha sonnet. Não atribua sem justificativa o mesmo modelo a todos os agentes, e deixe o motivo da escolha como comentário. Os critérios detalhados estão em `model-selection-guide.md`.

## 5. Estrutura da definição de agente

```markdown
---
name: agent-name
description: "Descreva o papel em uma ou duas frases e liste as expressões que servem de condição de acionamento."
# tools: Read, Grep, Glob, Bash        ← opcional: indique quando for restringir as ferramentas (revisor somente leitura etc.)
#                                         em agentes que alteram artefatos, inclua Edit junto com Write
# model: sonnet                         ← escolha conforme a natureza do trabalho (model-selection-guide.md) e registre o motivo da escolha como comentário
---

# Agent Name — resumo do papel em uma linha

Você é especialista em [papel] de [domínio].

## Papel central
1. Papel1
2. Papel2

## Princípios de trabalho
- Princípio1 (escreva também o motivo. Assim, mesmo em situações de exceção, o julgamento segue o mesmo critério.)
- Princípio2

## Regras de entrada e saída
- Entrada: [de onde recebe o quê — caminho de arquivo, args, artefato da etapa anterior]
- Saída: [onde escreve o quê — caminho em _workspace/ ou valor de retorno estruturado]
- Formato: [formato de arquivo, estrutura, schema]

## Regras de comunicação (colaboração de agentes persistentes)
- Primeiro relatório: informar ao líder a lista das ferramentas realmente disponíveis (para verificar se faltou alguma ferramenta listada em `tools`)
- Recebimento de mensagens: [de quem recebe que mensagens]
- Envio de mensagens: [para quem envia que mensagens]
- Tarefas compartilhadas: [que tipos de tarefa registra ou solicita]

## Ao ser chamado de novo
- Se houver artefato anterior, leia-o e incorpore as melhorias.
- Se receber feedback do usuário, corrija só o trecho correspondente.

## Tratamento de erros
- [o que fazer em caso de falha]
- [o que fazer quando a entrada estiver ausente ou ambígua]

## Colaboração
- Relação com os outros agentes
```

**Agentes exclusivos de workflow:** em vez do item "Regras de comunicação", inclua o item "Saída estruturada". Especifique a estrutura JSON a devolver e escreva que o texto final não é uma mensagem enviada ao usuário, e sim **dados de retorno**.

**Pontos de atenção ao restringir `tools`:**

- Em agentes que alteram artefatos, dê Edit junto com Write. Só com Write, até para corrigir uma linha é preciso reescrever o arquivo inteiro. Se o artefato for grande, o agente desiste da correção e contorna escrevendo à parte em outro arquivo, de modo que o artefato original fica sem correção.
- Há casos em que ferramentas de carregamento tardio, como `TaskCreate` e `TaskUpdate`, não são fornecidas na execução mesmo listadas em `tools` (observado no Claude Code 2.1.226; pode variar conforme o ambiente). Como `SendMessage`, também uma ferramenta de carregamento tardio, foi fornecida, a fronteira de quais ferramentas ficam de fora não é clara. Faça os agentes persistentes informarem, no primeiro relatório, a lista das ferramentas realmente disponíveis. Se faltar alguma ferramenta, o orquestrador assume essa tarefa no lugar dele (ex.: o líder atualiza o estado da tarefa com `TaskUpdate`) ou retira a restrição de `tools` do arquivo de definição.

## 6. Critérios para separar agentes

| Critério | Separar | Unir |
|------|------|------|
| Especialidade | Separe se as áreas de responsabilidade forem diferentes | Una se as áreas de responsabilidade se sobrepuserem |
| Paralelismo | Separe se puderem ser executados de forma independente | Avalie unir se precisarem ser processados em sequência |
| Informação necessária | Separe se um agente tiver informação demais para processar | Una se a informação necessária for pouca e a tarefa curta |
| Reutilização | Separe se puder ser reutilizado também por outros times | Avalie unir se for usado só neste time |

## 7. Design de reutilização de agentes

Antes de criar um agente novo, compare o papel dele com os agentes existentes em `.claude/agents/`. Quando o harness é construído ou ampliado várias vezes, agentes com o mesmo papel podem se acumular só com nomes diferentes.

| Relação com o agente existente | Ação |
|------|------|
| O agente existente já cobre todo o papel novo | Não crie outro; chame o agente existente. |
| Sobrepõe-se só em parte, e generalizando o agente existente ele assume também o papel novo | Generalize e amplie o agente existente. |
| Sobrepõe-se em parte, mas o domínio foi especializado de propósito | Crie um agente separado. |
| O escopo do papel é completamente diferente | Crie um novo. |

**Princípio:** quanto mais um agente se concentra em um único papel, mais fácil é reutilizá-lo e menos duplicação há. Se, como resultado da ampliação, ele passar a ter dois ou mais papéis, avalie primeiro se dá para dividi-lo.

**Ao ampliar um agente existente:** o comportamento dos orquestradores que chamam esse agente também pode mudar. Antes de ampliar, verifique quais orquestradores chamam este agente e reflita na `description` o papel ampliado. Depois de ampliar, confirme com uma simulação de execução (etapa 6-5 do `modo-direto.md`) que o fluxo existente continua funcionando como antes.

## 8. Distinção entre skill e agente

| Aspecto | Skill (Skill) | Agente (Agent) |
|------|-------------|-----------------|
| Definição | Procedimento de trabalho e conjunto de ferramentas | Papel de especialista e princípios de conduta |
| Local | `.claude/skills/` | `.claude/agents/` |
| Condição de execução | Quando o pedido do usuário corresponde às condições de aplicação escritas na `description` | Quando é chamado diretamente pela ferramenta Agent ou Workflow |
| Uso | "Como se faz" | "Quem faz" |

### Formas de ligar skills e agentes

| Forma | Implementação | Caso adequado |
|------|------|-----------|
| **Chamada pela ferramenta Skill** | Especificar no prompt do agente `chamar /skill-name pela ferramenta Skill` | Quando o skill é um workflow independente que o usuário também pode chamar diretamente |
| **Inclusão direta no prompt** | Escrever o conteúdo do skill diretamente na definição do agente | Quando o skill é curto, com 50 linhas ou menos, e só esse agente o usa |
| **Carregar arquivos de referência** | Ler com `Read` os arquivos de `references/` do skill só quando necessário | Quando o skill tem muito conteúdo e só é necessário em certas condições |

Skills usados em conjunto por vários agentes são chamados pela ferramenta Skill. Skills curtos usados só por um agente específico são colocados diretamente no prompt e, se tiverem muito conteúdo, carregam-se só os arquivos de referência necessários.
