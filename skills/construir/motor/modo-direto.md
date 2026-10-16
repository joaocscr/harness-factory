---
name: modo-direto
description: "Desenha o harness adequado ao projeto e cria os agentes especialistas e os skills que cada agente vai usar. Use quando o usuário pedir 'monta um harness', 'constrói um harness', 'design de harness', 'engenharia de harness', 'cria um time de agentes'. Use também ao construir o sistema de automação de uma área ou projeto novo, ou ao reorganizar ou ampliar um harness existente. Use também em pedidos de operação ou manutenção de um harness existente, como 'checar o harness', 'auditar o harness', 'situação do harness', 'sincronizar agentes/skills'. Para retrospectiva dos resultados de execução e incorporação de feedback, use o skill evoluir deste plugin."
---

Tradução fiel de _original-harness-SKILL.md (revfactory/harness v2, Apache-2.0); o original permanece intocado ao lado.

# Harness v2 — design de times de agentes e skills

Desenha o harness adequado ao projeto. Define o papel de cada agente e cria os skills que os agentes vão seguir ao trabalhar.

## Princípios centrais

1. Crie as definições de agentes em `projeto/.claude/agents/` e os skills em `projeto/.claude/skills/`. No agente, escreva quem trabalha; no skill, como esse trabalho é feito.
2. Escolha o modo de execução conforme o fluxo de trabalho. Se a ordem e as condições de repetição puderem ser definidas em código, coordene por workflow. Se for preciso trocar feedback com o mesmo especialista, use agentes persistentes. Trabalhos em que basta receber o resultado uma vez ficam com subagentes. Os critérios detalhados de escolha são tratados na etapa 2.
3. Escolha o modelo conforme a complexidade, a duração, a autonomia e a velocidade de resposta do trabalho. Use fable em trabalhos de máxima dificuldade que exigem montar um plano e executá-lo de forma autônoma por longo período; opus em design, geração de código, análises complexas e verificação cruzada; e sonnet em trabalhos do dia a dia, como análise de logs, conversão de formato e coleta simples. Os critérios detalhados são tratados na etapa 3.
4. Para que o skill orquestrador possa ser carregado também em sessões novas, registre no `CLAUDE.md` apenas a condição de acionamento e o histórico de mudanças.
5. Continue incorporando aos agentes, aos skills e ao `CLAUDE.md` o que se aprendeu com os resultados de execução. A retrospectiva e a identificação de mudanças ficam a cargo do skill evoluir deste plugin.
6. Escreva as definições de agentes, os skills, o orquestrador e o registro no `CLAUDE.md` gerados na língua que o usuário usa na conversa. Não escreva os artefatos na língua destes documentos por inércia: este roteiro e os templates de `motor/` estão em português (traduzidos do coreano original, preservado em `_original-harness-SKILL.md`), e isso não decide a língua do que você gera. Traduza também para essa língua os títulos e as frases de exemplo dos templates. Se o usuário definir uma língua à parte, siga essa língua; se, sem definir uma, ele ampliar um harness existente, siga a língua dos arquivos existentes.

## Procedimento

### Etapa 0: verificação do estado atual

Ao carregar este roteiro, verifique primeiro a configuração existente.

1. Leia `projeto/.claude/agents/`, `projeto/.claude/skills/` e `projeto/CLAUDE.md`.
2. Escolha o procedimento a seguir conforme o estado atual.
   - **Construção do zero**: se os diretórios de agentes ou de skills não existirem ou estiverem vazios, execute tudo a partir da etapa 1.
   - **Ampliação da configuração existente**: se for preciso acrescentar agentes ou skills a um harness existente, execute só as etapas necessárias segundo a tabela abaixo.
   - **Operação e manutenção**: se for preciso checar, corrigir ou sincronizar um harness existente, vá para o procedimento de operação da etapa 7.

   | Mudança | Etapa 1 | Etapa 2 | Etapa 3 | Etapa 4 | Etapa 5 | Etapa 6 |
   | --- | --- | --- | --- | --- | --- | --- |
   | Acrescentar agente | Pular e usar o resultado da etapa 0 | Decidir só em que modo de execução, time e etapa colocá-lo | Obrigatória | Quando precisar de skill dedicado | Alterar o orquestrador | Obrigatória |
   | Acrescentar/alterar skill | Pular | Pular | Pular | Obrigatória | Quando a ligação mudar | Obrigatória |
   | Mudar estrutura/modo de execução | Pular | Obrigatória | Só os agentes afetados | Só os skills afetados | Obrigatória | Obrigatória |

3. Se o orquestrador existente contiver `TeamCreate`, `TeamDelete` ou `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, é um artefato da v1. Como não funciona no ambiente de execução atual, proponha migrá-lo para a v2. Para o método detalhado, siga "Migração da v1 para a v2" em `motor/execution-modes.md`.
4. Confronte a lista real de agentes e skills com o registro no `CLAUDE.md` para encontrar inconsistências.
5. Informe ao usuário o resultado da verificação e o plano de execução, e obtenha a confirmação dele.

### Etapa 1: análise da área e do trabalho

1. Identifique, a partir do pedido do usuário, a área e o objetivo do projeto.
2. Separe os tipos de trabalho necessários, como geração, verificação, edição e análise.
3. Verifique o fluxo de trabalho para poder escolher o modo de execução.
   - Dá para listar de antemão o que vai ser processado? Ex.: trabalho de mover N arquivos ou revisar M perspectivas
   - É preciso um procedimento repetido de verificar o artefato e corrigir de novo?
   - O resultado melhora quando os agentes trocam opiniões entre si?
   - É preciso continuar conversando com o mesmo especialista dentro de uma sessão?
4. Encontre o que se sobrepõe ou conflita com os agentes e skills existentes verificados na etapa 0.
5. Examine a base de código e identifique a stack tecnológica, o modelo de dados e os módulos principais.
6. Ajuste o nível de dificuldade das explicações observando os termos que o usuário usa e o nível das perguntas. Com usuários de pouca experiência em programação, não use sem explicação termos como condição de verificação (assertion) e esquema JSON (JSON Schema).

### Etapa 2: design do modo de execução e da estrutura do time

#### 2-1. Escolha do modo de execução

O Harness v2 usa três funcionalidades multiagente do Claude Code. Escolha um dos modos abaixo conforme o fluxo de trabalho.

| Modo de execução | Funcionalidade usada | Trabalho adequado |
| --- | --- | --- |
| **Coordenação por workflow** | `agent()`, `pipeline()`, `parallel()`, `phase()` do script `Workflow` | Trabalho em que a lista de itens a processar, o procedimento de verificação e o número de repetições podem ser definidos em código. Trabalho que precisa de resultado conforme o schema ou que exige chamar `Agent` dezenas de vezes ou mais |
| **Colaboração de agentes persistentes** | `Agent(name:)`, `SendMessage`, `TaskCreate`, `TaskUpdate` | Trabalho em que especialistas com nome precisam repetir feedback, negociação e edição conjunta mantendo o contexto da conversa |
| **Delegação a subagentes** | Uma chamada a `Agent`. Por padrão roda em segundo plano e permite chamadas em paralelo | Trabalho em que os agentes não precisam conversar entre si e basta receber o resultado uma vez |

Decida na seguinte ordem.

1. Se a lista de itens a processar, o critério de verificação e a condição de repetição puderem ser expressos de antemão em código, use workflow. Só não entregando o fluxo definido ao julgamento momentâneo do modelo é que dá para reexecutar do mesmo jeito.
2. Se for difícil definir em código e os agentes precisarem conversar entre si ou lembrar o contexto anterior, use agentes persistentes.
3. Se não se enquadrar em nenhuma das duas condições e só o resultado for necessário, entregue a subagentes.
4. Se a natureza do trabalho mudar de etapa para etapa, monte em modo misto. Escreva no orquestrador o modo de execução de cada etapa.

Para usar a ferramenta `Workflow`, o usuário precisa consentir explicitamente. Considera-se que consentiu se ele mesmo pediu a execução de um workflow ou se carregou um skill orquestrador que manda chamar `Workflow`. Limite a execução padrão a poucos agentes, e só aumente para grande escala quando o usuário pedir uma investigação ampla, com expressões como "a fundo" ou "levantamento completo".

> A comparação entre modos de execução, o limite de execução simultânea, os schemas, o orçamento de tokens e as condições de retomada estão em `motor/execution-modes.md`.

#### 2-2. Escolha da forma de composição do time

1. Divida o trabalho por área de especialidade.
2. Entre as seis formas abaixo, escolha a composição adequada ao trabalho. Os critérios detalhados estão em `motor/team-patterns.md`.
   - **Pipeline**: recebe o resultado da etapa anterior e processa em ordem. Adequado a `pipeline()`.
   - **Distribuição e integração (fan-out/fan-in)**: processa em paralelo tarefas independentes e depois junta os resultados. Use `pipeline()` e, só quando necessário, `parallel()`.
   - **Pool de especialistas**: escolhe e chama só os especialistas adequados à entrada. Adequado a subagentes ou agentes persistentes.
   - **Geração e verificação**: um agente produz e outro revisa. Use a verificação adversarial do workflow ou um par de agentes persistentes.
   - **Supervisor**: um agente central observa o andamento e redistribui as tarefas. Use agentes persistentes e uma lista de tarefas compartilhada.
   - **Delegação hierárquica**: um agente superior repassa a agentes subordinados. Use no máximo dois níveis, e limite o aninhamento de workflows a um nível.
3. Se a exatidão do artefato for importante, combine as formas de verificação abaixo.
   - **Verificação adversarial**: para cada item encontrado, coloque N agentes de verificação adversarial e só deixe passar os itens que a maioria julgou `confirmed`, por terem evidência suficiente. Julgamentos `refuted` ou `uncertain` não contam como aprovação.
   - **Banca julgadora**: crie N propostas separadamente, julgue-as em paralelo e produza a versão final com base na melhor proposta.
   - **Repetir até não surgir item novo (Loop-until-dry)**: busque até que os itens novos encontrados sejam 0 por K vezes seguidas.
   - **Busca por vários critérios**: pesquise em paralelo por critérios diferentes, como contêiner, conteúdo, entidade e tempo.
   - **Revisor de omissões**: faça o último agente procurar só o que ficou faltando.

#### 2-3. Critérios para dividir agentes

Divida os agentes pelos critérios de conhecimento especializado necessário, possibilidade de processamento paralelo, contexto de conversa a manter e chance de reutilização. A tabela detalhada está em "Critérios para separar agentes" de `motor/team-patterns.md`.

### Etapa 3: redação das definições de agentes

Agentes especialistas que serão reutilizados em várias sessões são definidos como arquivos `projeto/.claude/agents/{name}.md`. Não coloque um papel que será usado repetidamente apenas diretamente no `prompt` da ferramenta `Agent`.

- Só definindo em arquivo é possível reutilizar na sessão seguinte. Na ferramenta `Agent`, chama-se com `subagent_type: "{name}"`; no `Workflow`, com `agentType: "{name}"`.
- O resultado da colaboração é estável quando se define de antemão o que os agentes vão trocar entre si.
- No agente, escreva quem trabalha; no skill, como esse trabalho é feito, para que as duas coisas não se misturem.

Papéis de especialista que serão reutilizados são criados em arquivo como tipos personalizados e, ao chamar, o nome desse arquivo é indicado em `subagent_type` ou `agentType`. Para tarefas pontuais que usam tal como são os tipos nativos, como `general-purpose`, `Explore` e `Plan`, não crie arquivo de definição à parte.

#### Verificar sobreposição com agentes existentes

Antes de criar um arquivo de agente novo, verifique se o papel se sobrepõe ao dos agentes existentes em `projeto/.claude/agents/`. Mesmo quando a etapa 1 é pulada e só se acrescenta um agente, essa verificação não é pulada, porque, quando o harness é construído ou ampliado várias vezes, agentes com o mesmo papel podem se acumular só com nomes diferentes. Se houver sobreposição, não crie com nome novo: use o agente existente tal como está ou amplie-o. Os critérios de decisão e as exceções (quando o domínio foi especializado de propósito) estão em "Design de reutilização de agentes" de `motor/team-patterns.md`.

#### Critérios de escolha de modelo

Escolha o modelo de cada agente pelos critérios de complexidade, duração, autonomia e velocidade de resposta do trabalho. Indique-o em `model:` no frontmatter YAML (cabeçalho), ou nos argumentos de chamada `model` e `opts.model`, e deixe o motivo da escolha como comentário na definição do agente ou no orquestrador.

| Modelo | Critério de escolha | Trabalhos típicos |
| --- | --- | --- |
| **fable** | Trabalho de máxima dificuldade, que exige planejar por conta própria, encadear várias etapas e executar de forma autônoma por longo período | Coordenação de agentes, planejamento e execução de longa duração, integração de material volumoso, concretização de ideias vagas |
| **opus** | Trabalho especializado de escopo claro, mas que exige raciocínio e análise profundos | Design e arquitetura, geração de código, análises complexas, verificação cruzada, crítica de métodos de pesquisa, criação |
| **sonnet** | Trabalho do dia a dia com procedimento claro, em que a rapidez importa | Análise de logs, conversão de formato, inspeção de arquivos estáticos, execução de scripts de deploy, coleta simples, escrita e resumos em geral |

- Se for preciso executar de forma autônoma por longo período, mudando o plano seguinte conforme o resultado da etapa anterior, use fable. Para analisar a fundo um único problema de escopo definido, use opus. Por exemplo, para criticar a fundo um único artigo, opus é o adequado; para revisar dezenas de artigos e chegar até a estratégia e o relatório, fable é o adequado.
- Em trabalhos gerais de decisão ambígua, use sonnet como padrão.
- Não atribua fable ou opus a todos só porque os agentes são importantes. O modelo é escolhido pela natureza real do trabalho, não pela posição do agente.
- Mesmo que o agente superior responsável por planejamento e coordenação use fable, escolha separadamente para os executores subordinados o modelo adequado a cada trabalho.

> Os critérios detalhados por modelo estão em `motor/model-selection-guide.md`.

#### O que colocar no arquivo de definição

No frontmatter YAML, inclua obrigatoriamente `name` e `description`. Se necessário, acrescente `tools`, que restringe as ferramentas a usar, e `model`, que troca o modelo. No `tools` de agentes de revisão e análise somente leitura, retire Edit e Write para que não possam alterar arquivos.

Ao contrário, aos agentes que alteram artefatos dê também Edit, junto com Write. Sem Edit, até para corrigir uma linha é preciso reescrever o arquivo inteiro, e, se o artefato for grande, o agente desiste da correção e contorna. Além disso, como há casos em que as ferramentas listadas em `tools` não foram fornecidas na execução, faça os agentes persistentes informarem, no primeiro relatório, a lista das ferramentas realmente disponíveis.

No corpo, escreva obrigatoriamente o papel central, os princípios de trabalho, as regras de entrada e saída, o tratamento de erros e o modo de colaboração. Nos agentes persistentes, acrescente `## Regras de comunicação` para definir com quem trocar `SendMessage` e como usar a lista de tarefas compartilhada.

> O template de definição, o exemplo completo e os pontos de atenção ao restringir `tools` estão em "Estrutura da definição de agente" de `motor/team-patterns.md`.

#### Ao ter um agente de QA

- Indique para o agente de QA um tipo que possa usar todas as ferramentas de verificação. `Explore` é somente leitura e não consegue executar scripts de verificação.
- Não verifique só a existência de arquivos. Confronte a estrutura da resposta da API com a dos hooks do frontend.
- Não inspecione só uma vez depois que o trabalho inteiro terminar. Inspecione imediatamente a cada módulo concluído.
- Para o método detalhado, siga `motor/qa-agent-guide.md`.

### Etapa 4: redação dos skills

Crie em `projeto/.claude/skills/{name}/SKILL.md` os skills que cada agente vai seguir. Para o modo de redação detalhado, siga `motor/skill-writing-guide.md`.

#### 4-0. Verificar sobreposição com skills existentes

Antes de criar um skill novo, verifique se a função se sobrepõe à dos skills existentes em `projeto/.claude/skills/`. Se houver sobreposição, não crie com nome novo: ligue o skill existente ao agente ou amplie-o. Os critérios de decisão, as exceções (quando o domínio foi especializado de propósito) e até onde generalizar estão em "Design de reutilização de skills" de `motor/skill-writing-guide.md`.

#### 4-1. Estrutura de diretórios

```
skill-name/
├── SKILL.md              # obrigatório
│   ├── frontmatter YAML  # name e description obrigatórios
│   └── corpo em Markdown
├── scripts/              # opcional: código executável de tarefas repetitivas ou cujo resultado precisa ser sempre o mesmo
├── references/           # opcional: documentos de referência lidos só quando necessário
└── assets/               # opcional: arquivos usados nos artefatos, como templates e imagens
```

#### 4-2. Escrever a condição de acionamento na description

O Claude olha o `name` e a `description` do skill para decidir qual skill carregar. Desses, na `description` escreva concretamente o que o skill faz e as situações em que deve ser usado, e distinga também os casos que parecem parecidos mas em que não deve ser usado.

**Mau exemplo:** `"Skill que processa documentos PDF"`

**Bom exemplo:** `"Executa tarefas com PDF, como leitura de arquivos PDF, extração de texto e tabelas, mesclagem, divisão, rotação, marca d'água, criptografia e OCR. Sempre que o usuário mencionar um arquivo .pdf ou pedir um artefato em PDF, use obrigatoriamente."`

#### 4-3. Princípios de redação do corpo

| Princípio | Como aplicar |
| --- | --- |
| **Explique primeiro o motivo** | Não liste só `ALWAYS` e `NEVER`; deixe claro por que a regra é necessária. Conhecendo o motivo, é possível julgar corretamente também em situações de exceção. |
| **Escreva de forma concisa** | Mantenha o `SKILL.md` abaixo de 500 linhas. Apague o que não ajuda a decidir ou mova para `references/`. |
| **Generalize em princípios** | Não crie regras que só servem a um exemplo específico. Escreva critérios de decisão aplicáveis a várias entradas. |
| **Inclua de antemão o código repetitivo** | Se, nos testes, vários agentes reescrevem o mesmo script, coloque-o em `scripts/`. |
| **Escreva como instruções** | Escolha uma única forma verbal adequada ao documento, entre a declarativa ("faz") e a imperativa ("faça"), e mantenha-a uniforme. A ação a ser feita precisa ficar clara. |

#### 4-4. Carregar por etapas só a informação necessária

O skill carrega a informação e o código executável necessários nos momentos abaixo.

| Informação | Quando é carregada | Volume recomendado |
| --- | --- | --- |
| **Metadados** (`name`, `description`) | Sempre | Cerca de 100 palavras |
| **Corpo do `SKILL.md`** | Ao carregar o skill | Menos de 500 linhas |
| **`references/`** | Quando aquele material é necessário | Sem limite |
| **`scripts/`** | Ao executar tarefas repetitivas ou cujo resultado precisa ser sempre o mesmo | Sem limite. Pode ser executado diretamente, sem ler o conteúdo |

- Se o `SKILL.md` se aproximar de 500 linhas, mova os detalhes para `references/` e escreva no corpo quando ler qual arquivo.
- Se um documento de referência passar de 300 linhas, coloque um sumário no topo do documento.
- Se as diretrizes variarem por área ou framework, divida os documentos de referência para que só os arquivos necessários sejam lidos.

#### 4-5. Ligação entre agentes e skills

- Um agente pode usar um ou mais skills.
- Vários agentes podem compartilhar o mesmo skill.
- No skill, escreva o modo de trabalhar; no agente, o papel que assume esse trabalho.

### Etapa 5: integrar e definir a ordem de execução

O orquestrador também é um skill. Ele amarra os agentes e skills individuais em um único fluxo de trabalho e define quem colabora, quando e em que ordem. Os templates completos por modo estão em `motor/orchestrator-template.md`, e os exemplos de script de workflow em `motor/workflow-recipes.md`.

Ao ampliar um harness existente, não crie um orquestrador novo; altere o arquivo existente. Ao acrescentar agentes, reflita-os na composição, na atribuição de tarefas e na ordem de passagem de dados, e coloque também na `description` as novas condições de acionamento.

#### 5-0. Orquestrador por modo de execução

**A. Coordenação por workflow**

Defina um script `Workflow` no skill orquestrador. O script é composto de `meta`, `phase()`, `pipeline()`, `parallel()` e `agent()`. Tipos personalizados são indicados com `agentType`, e resultados conformes ao schema são recebidos com `schema`.

```
[Skill orquestrador] → Workflow(script)
    ├── phase('coleta'): pipeline(items, ...)   ← processa de forma distribuída a lista definida de antemão
    ├── phase('verificação'): verificação adversarial ou banca julgadora
    └── return resultado estruturado → o principal redige o relatório consolidado
```

**B. Colaboração de agentes persistentes**

Depois de executar agentes com nome, coordene-os com a lista de tarefas compartilhada e `SendMessage`. `TeamCreate` e `TeamDelete` não existem mais. Não se cria um objeto de time explícito, e os agentes executados com nome na sessão passam a fazer parte de um único grupo de colaboração montado automaticamente. É possível enviar de novo mensagens a esses agentes, mantendo o contexto da conversa anterior.

```
[Agente principal (líder)]
    ├── Agent(name: "researcher", ...) / Agent(name: "critic", ...)  ← execução em paralelo
    ├── TaskCreate(tarefa + dependências)
    ├── SendMessage({to: "critic"}, "Revise o rascunho do researcher")
    └── coleta e consolidação dos resultados
```

**C. Delegação a subagentes**

Numa única mensagem, chame a ferramenta `Agent` N vezes em paralelo e reúna os resultados a partir das notificações de conclusão. Os agentes chamados rodam em segundo plano por padrão.

Se a natureza do trabalho mudar de etapa para etapa, é possível montar em modo misto. Por exemplo, coletar material por workflow e depois os agentes persistentes chegarem a um consenso e integrarem, ou submeter à verificação adversarial por workflow o resultado produzido pelos agentes persistentes. Escreva `**Modo de execução:**` acima de cada etapa.

#### 5-1. Formas de passar dados

| Forma | Implementação | Modo de execução adequado | Quando usar |
| --- | --- | --- | --- |
| **Valor de retorno estruturado** | `agent(prompt, {schema})` do `Workflow` devolve JSON validado | Coordenação por workflow | Quando a etapa seguinte precisa processar o resultado em código |
| **Valor de retorno comum** | Mensagem de retorno da ferramenta `Agent` | Subagentes | Quando o principal reúne diretamente os resultados resumidos |
| **Mensagem** | Passagem direta entre agentes por `SendMessage` | Agentes persistentes | Quando é preciso coordenação e feedback em tempo real |
| **Lista de tarefas compartilhada** | Compartilhamento de estado com `TaskCreate`, `TaskUpdate` | Agentes persistentes | Para gerenciar andamento, dependências e atribuição dinâmica |
| **Arquivo** | Escrever e ler em caminhos combinados | Todos os modos | Quando os dados são grandes ou é preciso conferir depois o processo de trabalho |

Ao passar por arquivo, siga as regras abaixo.

- Salve os artefatos intermediários em `_workspace/`, dentro do diretório de trabalho.
- Use nomes de arquivo no formato `{phase}_{agent}_{artifact}.{ext}`. Ex.: `01_analyst_requirements.md`
- Só o artefato final é salvo no caminho indicado pelo usuário. O `_workspace/` é mantido para verificação posterior.

#### 5-2. Tratamento de erros

Inclua no orquestrador a política de tratamento de erros.

- Tente de novo uma vez; se falhar de novo, prossiga sem aquele resultado, mas registre no relatório final o que ficou faltando. Dados que se contradizem não são apagados; ficam registrados junto com a fonte.
- Porém, falhas em que tentar de novo dá o mesmo resultado, como limite de uso esgotado, autenticação expirada e permissão negada, não são repetidas: tentar de novo só consome o limite restante. Abra você mesmo os artefatos parciais para conferir até onde o trabalho realmente avançou, registre em arquivo o que faltou e relate ao usuário. Se for limite de uso, informe também o horário em que ele é liberado.
- Quando o orquestrador preencher as lacunas deixadas por um agente interrompido, só incorpore no lugar dele os fatos que verificou diretamente. Não preencha por suposição os julgamentos do agente (ex.: qual material ele excluiu e por quê). Preencher por suposição equivale a falsificar o registro que servirá à verificação posterior.
- No workflow, um `agent()` que falhou ou foi pulado devolve `null`, e `parallel()` não lança a falha como exceção. É preciso aplicar `.filter(Boolean)` ao array de resultados e informar com `log()` o número de itens que ficaram de fora.
- Se um agente persistente não responder, verifique o estado com `SendMessage` e dê a instrução de novo. Se ainda assim falhar, execute o mesmo tipo personalizado com um nome novo e passe no prompt o contexto de trabalho necessário.

> Como agir em cada tipo de erro está em "Tratamento de erros" do template do modo de execução correspondente, em `motor/orchestrator-template.md`.

#### 5-3. Escala do trabalho

| Escala do trabalho | Número de agentes persistentes | Volume de chamadas `Agent` no workflow |
| --- | --- | --- |
| Pequena: menos de 10 tarefas | 2 a 3 | 2 a 5 |
| Média: 10 a 20 tarefas | 3 a 5 | Cerca de 10. Acima do limite de execução simultânea, espera automática |
| Grande: mais de 20 tarefas | Supervisor + 3 a 5 executores | Dezenas a centenas. Limite total de 1.000 |

- Quanto mais agentes, maior também o custo de gestão. Mantenha pequena a escala padrão.
- Se o usuário indicar um orçamento de tokens, como `+500k`, verifique `budget.remaining()` no script de workflow para ajustar a escala da execução.

#### 5-4. Registrar no `CLAUDE.md` a informação de ligação do harness

Ao terminar a configuração, registre no `CLAUDE.md` do projeto o fato de que existe um harness e a condição de acionamento. Como o `CLAUDE.md` é lido em toda sessão nova, não coloque nele, repetidas, as regras detalhadas de execução.

````markdown
## Harness: {nome do domínio}

**Objetivo:** {objetivo central do harness em uma linha}

**Condição de acionamento:** ao receber pedidos de trabalho relacionados a {domínio}, use o skill `{orchestrator-skill-name}`. Perguntas simples podem ser respondidas diretamente.

**Histórico de mudanças:**
| Data | Mudança | Alvo | Motivo |
| --- | --- | --- | --- |
| {YYYY-MM-DD} | Primeira configuração com o Harness v2 | Tudo | - |
````

Não coloque a lista de agentes e skills, a estrutura de diretórios nem as regras detalhadas de execução. Essas informações são gerenciadas no skill orquestrador e em `.claude/agents/` e `.claude/skills/`. No `CLAUDE.md` ficam só a condição de acionamento e o histórico de mudanças.

#### 5-5. Tratamento de pedidos de seguimento

O orquestrador precisa funcionar não só na primeira execução, mas também quando o resultado é corrigido de novo.

1. Coloque na `description` expressões como `executar de novo`, `reexecutar`, `atualizar`, `corrigir`, `complementar`, `só {tarefa parcial} de {domínio} de novo`, `com base no resultado anterior`, `melhorar o resultado`.
2. Na etapa 0 do orquestrador, verifique o contexto de trabalho existente.
   - Se `_workspace/` existe e o pedido é corrigir só uma parte, reexecute só a etapa ou o agente correspondente.
   - Se `_workspace/` existe e chegou entrada nova, mova o diretório existente para um diretório com timestamp e execute do zero.
   - Se `_workspace/` não existe, execute desde o início.
   - Se houver o `runId` anterior do workflow, dá para retomar com `resumeFromRunId`. Chamadas `agent()` que não mudaram usam o resultado em cache.
3. Escreva na definição do agente como chamá-lo de novo. Se houver arquivo de resultado anterior, ele lê; se houver feedback do usuário, corrige só o trecho correspondente.

### Etapa 6: verificação e teste

Verifique o harness gerado. Para o método detalhado, siga `motor/skill-testing-guide.md`.

#### 6-1. Verificação de arquivos e referências

- Verifique se todos os arquivos de agente estão no local correto.
- Verifique se o frontmatter YAML dos skills tem `name` e `description`.
- Verifique se os nomes pelos quais os agentes se referenciam uns aos outros coincidem.
- Verifique que não foram criados arquivos de comando em `.claude/commands/`.
- Verifique que não restaram nos artefatos `TeamCreate`, `TeamDelete`, `team_name` e flags de funcionalidade experimental, que são do jeito da v1.

#### 6-2. Verificação por modo de execução

- **Coordenação por workflow**: verifique se `meta` é um literal só com valores, se não foram usados `Date.now()` e `Math.random()`, se `parallel()` só foi usado quando era preciso esperar o resultado completo, se não falta `.filter(Boolean)` e se os títulos de `phase()` coincidem com `meta.phases`.
- **Colaboração de agentes persistentes**: verifique os caminhos de envio e recebimento de `SendMessage`, as dependências entre tarefas e o número de agentes.
- **Delegação a subagentes**: verifique se a entrada e a saída de cada agente se encadeiam, se as chamadas paralelas foram agrupadas numa única mensagem e se os resultados são reunidos sem omissões.
- **Modo misto**: verifique se o modo de execução foi escrito em cada etapa e se os dados não se perdem quando a etapa muda.

#### 6-3. Teste de execução dos skills

1. Para cada skill, crie 2 a 3 pedidos de teste concretos, que um usuário real provavelmente digitaria.
2. Faça em paralelo a execução com skill (With-skill) e a execução de referência (Baseline) para comparar o quanto o skill melhora o resultado. Se for preciso repetir, a própria comparação A/B pode ser feita como workflow.
3. Use juntas a avaliação qualitativa, em que o usuário revisa diretamente, e a avaliação quantitativa, que usa condições de verificação (assertion). Se não for possível criar condições objetivas, siga o julgamento do usuário.
4. Se surgirem problemas, não ponha regras que só bloqueiam um exemplo específico; corrija na forma de princípios aplicáveis a várias situações. Teste de novo e repita até que corrigir mais quase não traga ganho.
5. Se vários agentes criarem repetidamente o mesmo código, coloque-o em `scripts/`.

#### 6-4. Verificação da condição de acionamento

1. Crie 10 pedidos que devem carregar o skill, com tons e graus de explicitude diferentes entre si.
2. Crie também 10 casos de fronteira, de expressão parecida mas que exigem outro skill ou outra ferramenta.

Pedidos obviamente sem relação não verificam a fronteira. Por exemplo, ao testar um skill de geração de imagens, `escrever uma função de Fibonacci` é um caso de fronteira pior do que `extrai os gráficos deste arquivo Excel em PNG`, porque o resultado é uma imagem, mas na prática uma ferramenta de planilhas é mais adequada. Verifique também se a condição de acionamento se sobrepõe à de skills existentes.

#### 6-5. Simulação de execução

- Verifique se a ordem das etapas do orquestrador é lógica.
- Verifique se o caminho de passagem dos dados não se interrompe no meio.
- Verifique se a entrada de todos os agentes corresponde à saída da etapa anterior.
- Verifique se, quando ocorre um erro, o procedimento alternativo pode de fato ser executado.

#### 6-6. Registro dos cenários de teste

Crie `## Cenários de teste` no skill orquestrador e escreva um fluxo normal e pelo menos um fluxo de erro.

### Etapa 7: operação, manutenção e melhoria

O harness não é um artefato que se faz uma vez e acabou.

A retrospectiva dos resultados de execução e a incorporação de feedback ficam a cargo do skill evoluir deste plugin. Quando o usuário pedir `retrospectiva do harness`, `evolução do harness`, `incorpora o feedback`, use o skill evoluir deste plugin. Esse skill analisa a diferença entre a configuração inicial e o estado atual, organiza o feedback para que se aplique a várias situações e o incorpora aos agentes, aos skills e ao orquestrador. Também atualiza o histórico de mudanças do `CLAUDE.md`.

Este roteiro (o modo direto do skill `construir`) trata diretamente os procedimentos abaixo, de operação e manutenção de um harness existente.

1. **Verificação do estado atual**: compare `.claude/agents/`, `.claude/skills/` e a configuração do orquestrador, monte a lista de inconsistências e informe ao usuário.
2. **Acrescentar e alterar aos poucos**: mude um item de cada vez e execute logo em seguida a verificação seguinte.
3. **Registro do histórico de mudanças**: escreva no `CLAUDE.md` a data, a mudança, o alvo e o motivo.
4. **Verificação da mudança**: verifique a estrutura de arquivos. Se a condição de acionamento for afetada, faça também o teste de acionamento. Se o alcance da mudança for grande, faça até o teste de execução e a simulação de execução e, por fim, confirme que o `CLAUDE.md` e os arquivos reais coincidem.

Nas situações abaixo, proponha melhorar com o skill evoluir deste plugin.

- O mesmo tipo de feedback apareceu duas vezes ou mais.
- Um agente falha repetidamente pela mesma causa.
- O usuário continua tratando manualmente o mesmo trabalho, sem passar pelo orquestrador.

## Checklist dos artefatos

- [ ] Criei em `projeto/.claude/agents/` os arquivos de todos os tipos personalizados que serão reutilizados. Excluí os casos em que um tipo nativo é usado tal como é para tarefas pontuais.
- [ ] Criei em `projeto/.claude/skills/` os `SKILL.md` e documentos de referência necessários.
- [ ] Coloquei num único skill orquestrador a forma de passar dados, o tratamento de erros e os cenários de teste.
- [ ] Escrevi qual modo de execução será usado, entre coordenação por workflow, agentes persistentes e subagentes. Se for modo misto, indiquei em cada etapa.
- [ ] Escolhi o `model:` de cada agente pela complexidade, duração, autonomia e velocidade de resposta, e deixei o motivo como comentário. Não atribuí em bloco o mesmo modelo de alto desempenho a todos os agentes.
- [ ] Não restou nos artefatos nada do jeito da v1, como `TeamCreate`, `TeamDelete` e flags de funcionalidade experimental.
- [ ] Coloquei `.filter(Boolean)` nos scripts de workflow e usei só literais em `meta`. Espero o resultado completo com `parallel()` só quando realmente necessário.
- [ ] Não criei arquivos em `.claude/commands/`.
- [ ] Antes de criar agentes e skills novos, verifiquei se o papel se sobrepõe ao dos existentes. Salvo quando o domínio foi especializado de propósito, usei ou ampliei os existentes nos casos de sobreposição, e não há conflito de nomes nem de papéis.
- [ ] Escrevi as definições de agentes, os skills, o orquestrador e o registro no `CLAUDE.md` na língua que o usuário usa na conversa. Quando havia uma língua definida à parte pelo usuário ou a língua dos arquivos do harness existente, segui essa língua.
- [ ] Escrevi concretamente na `description` dos skills o que fazer e a condição de acionamento, e incluí também as expressões de pedido de seguimento.
- [ ] O corpo do `SKILL.md` tem menos de 500 linhas. Se tinha 500 ou mais, movi os detalhes para `references/`.
- [ ] Executei com 2 a 3 frases de teste parecidas com pedidos reais.
- [ ] Verifiquei a condição de acionamento com pedidos que devem carregar o skill e com casos de fronteira que não devem carregá-lo.
- [ ] Registrei no `CLAUDE.md` só a condição de acionamento e o histórico de mudanças.
- [ ] A etapa 0 do orquestrador distingue primeira execução, execução de seguimento e reexecução parcial. O workflow trata também a opção de retomada.

## Documentos de referência

- **Detalhes dos modos de execução**: `motor/execution-modes.md`
- **Guia de escolha de modelos**: `motor/model-selection-guide.md`
- **Formas de composição de times e definição de agentes**: `motor/team-patterns.md`
- **Exemplos práticos de composição de times**: `motor/team-examples.md`
- **Exemplos de script de workflow e pontos de atenção**: `motor/workflow-recipes.md`
- **Templates de orquestrador**: `motor/orchestrator-template.md`
- **Guia de redação de skills**: `motor/skill-writing-guide.md`
- **Guia de teste de skills**: `motor/skill-testing-guide.md`
- **Guia do agente de QA**: `motor/qa-agent-guide.md`
