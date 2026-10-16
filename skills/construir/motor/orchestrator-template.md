# Template de skill orquestrador (v2)

O orquestrador coordena o time inteiro. Conforme o modo de execução, são oferecidos três templates, e também se explica como combinar modos de execução por etapa.

- **Template A: coordenação por workflow** — execução distribuída em grande escala ou verificação repetida, com fluxo de controle definido de antemão
- **Template B: colaboração de agentes persistentes** — feedback repetido, negociação e colaboração de longa duração, em que os agentes precisam manter o conteúdo das conversas anteriores
- **Template C: delegação a subagentes** — entregar tarefas independentes uma vez cada, em paralelo, e só coletar os resultados
- **Modo misto** — combinar o modo de execução adequado a cada etapa

Todos os templates verificam na etapa 0 o trabalho já existente. Incluem também, obrigatoriamente, as regras de organização dos arquivos em `_workspace/`, o tratamento de erros e os cenários de teste.

---

## Template A: coordenação por workflow

```markdown
---
name: {domain}-orchestrator
description: "Coordena o workflow de {domínio}. Use quando o usuário pedir com uma das expressões {palavras-chave de execução inicial}, e também em trabalhos de seguimento como corrigir resultado de {domínio}, reexecução parcial, atualização, complemento, executar de novo e melhorar resultado anterior."
---

# Orquestrador de {Domain}

## Modo de execução: coordenação por workflow

Este skill coordena, com a ferramenta Workflow, trabalhos cujo fluxo de controle está definido de antemão. Quando o usuário carrega este skill,
considera-se que ele consentiu com o uso do Workflow. O número padrão de agentes é limitado a {N}. Só aumente o número de agentes
quando o usuário pedir "a fundo", "levantamento completo" ou "todos".

## Composição dos agentes

| Papel | `agentType` | Skill | Artefato (resumo do `schema`) |
|------|-----------|------|--------------------|
| {collector} | {personalizado ou nativo} | {skill} | {findings: [...]} |
| {verifier}  | {personalizado ou nativo} | {skill} | {status, reason} |

Em `{personalizado ou nativo}`, escreva o nome do tipo personalizado ou o tipo nativo.

## Procedimento

### Etapa 0: verificar o trabalho existente (tratamento de pedidos de seguimento)

1. Verifique se existe `_workspace/`.
   - Se não existe → executar do zero
   - Se existe e o pedido é corrigir só uma parte → reexecutar só essa parte
   - Se existe e chegou entrada nova → mover o `_workspace/` existente para `_workspace_{ts}/` e executar do zero
2. Se for reexecutar só uma parte e o `runId` da execução anterior estiver em `_workspace/run_meta.json`, proceda assim:
   - Altere no script só a etapa em questão e retome com `resumeFromRunId`. Chamadas `agent()` cujo conteúdo não mudou
     devolvem imediatamente o resultado em cache, então o custo de execução é baixo.
3. Ao executar do zero, receba um `runId` novo e registre-o em `_workspace/run_meta.json`.

### Etapa 1: fechar a lista de tarefas (feita diretamente pelo agente principal)

Antes de iniciar o workflow, dê uma olhada rápida em {lista de arquivos / eixos de pesquisa / alvos de revisão} e organize-os em um array.
Passe a lista organizada ao script por `args`.

### Etapa 2: executar o workflow

Passe o script abaixo à ferramenta Workflow. Para um exemplo detalhado, consulte `motor/workflow-recipes.md`.

- `meta`: `name` é '{domain}-run', `phases` é [{coleta}, {verificação}, {síntese}]
- Coleta: pipeline(args.items, item => agent(..., {schema: COLLECT}))
- Verificação: verificação adversarial de cada item encontrado → .filter(Boolean) → só os itens aprovados na verificação passam para a etapa seguinte
- Síntese: return do resultado estruturado

Depois de chamar, espere a notificação de conclusão. Não presuma o resultado antes de receber a notificação.

### Etapa 3: organizar e relatar os resultados

1. Receba o valor devolvido pelo workflow.
2. Se houver itens excluídos ou faltantes, declare-os obrigatoriamente no relatório.
3. Gere o artefato final em `{output-path}/{filename}`.
4. Deixe os artefatos intermediários e o `run_meta.json` em `_workspace/`.

## Tratamento de erros

| Situação | Como agir |
|------|------|
| Falha de um `agent()` individual (devolve `null`) | Exclua com `.filter(Boolean)` e registre com `log()` quantos itens foram excluídos. Declare também no relatório os itens faltantes. |
| Falha do workflow inteiro | Verifique no `journal` os valores realmente devolvidos, corrija só a etapa que falhou e retome com `resumeFromRunId`. |
| Falha em que tentar de novo não adianta (limite de uso esgotado, autenticação expirada, permissão negada) | Não tente de novo nem retome antes de a causa ser resolvida, porque isso só consome o limite restante. Abra você mesmo o `journal` e os artefatos parciais para conferir até onde o trabalho realmente avançou, registre o que faltou em um arquivo em `_workspace/` e relate ao usuário. Se for limite de uso, informe também o horário em que ele é liberado. Depois que a causa for resolvida, dá para continuar a execução com `resumeFromRunId`. O agente principal só preenche no lugar do agente os fatos que verificou diretamente, e não preenche por suposição os julgamentos do agente (ex.: qual material ele excluiu e por quê). |
| Resultado vazio | Não confunda com sucesso. Verifique no `journal` o valor realmente devolvido por cada agente. |
| Dados que se contradizem | Não apague; registre-os junto com a fonte. |

## Cenários de teste

### Fluxo normal
1. Quando o usuário fornece {entrada}, a verificação prévia fecha {M} itens.
2. O workflow coleta os {M} itens e, se {K} deles passarem na verificação, organiza o resultado.
3. Resultado esperado: `{output-path}/{filename}` é gerado e as informações da execução são registradas em `run_meta.json`.

### Fluxo de erro
1. Na etapa de coleta, dois itens devolvem `null`.
2. Esses itens são excluídos com `.filter(Boolean)` e `log()` informa "2 excluídos".
3. O relatório final registra "falha na coleta de 2 {nome do item}".
```

---

## Template B: colaboração de agentes persistentes

```markdown
---
name: {domain}-orchestrator
description: "Coordena a colaboração dos agentes de {domínio}. Use quando o usuário pedir com uma das expressões {palavras-chave de execução inicial}, e também em trabalhos de seguimento como correção, reexecução parcial, atualização, complemento, executar de novo e melhorar resultado anterior."
---

# Orquestrador de {Domain}

## Modo de execução: colaboração de agentes persistentes

Ao contrário da v1, não se cria um objeto de time explícito. Os agentes executados com nome na sessão passam a fazer parte de
um único grupo de colaboração montado automaticamente. TeamCreate e TeamDelete eram ferramentas usadas só na v1.

## Composição dos agentes

| Nome | `subagent_type` | Papel | Skill | Artefato |
|------|--------------|------|------|------|
| {teammate-1} | {personalizado ou built-in} | {papel} | {skill} | {output-file} |
| {teammate-2} | {personalizado ou built-in} | {papel} | {skill} | {output-file} |

Em `{personalizado ou built-in}`, escreva o nome do tipo personalizado ou o tipo nativo.

## Procedimento

### Etapa 0: verificar o trabalho existente
Como no template A, verifique se existe `_workspace/` para decidir se executa pela primeira vez, se reexecuta só uma parte
ou se executa do zero. Se for reexecutar só uma parte, coloque no prompt do agente o caminho dos artefatos anteriores
para que ele leia e incorpore o resultado existente.

### Etapa 1: preparação
1. Analise a entrada do usuário e identifique {o que identificar}.
2. Crie `_workspace/` e salve a entrada em `_workspace/00_input/`.

### Etapa 2: executar os agentes e registrar as tarefas

1. Execute os agentes em paralelo numa única mensagem. `name` é obrigatório e serve para indicar o destinatário no SendMessage.
   - Agent(name: "{teammate-1}", subagent_type: "{type}", prompt: "{papel + instrução de trabalho + caminho de saída}")
   - Agent(name: "{teammate-2}", subagent_type: "{type}", prompt: "...")
2. Registre a lista de tarefas compartilhada.
   - TaskCreate({title: "{tarefa1}", assignee: "{teammate-1}"})
   - TaskCreate({title: "{tarefa3}", depends_on: [tarefa1]})
   > O adequado é de 3 a 6 tarefas por membro do time. Declare as dependências entre tarefas com `depends_on`.

### Etapa 3: coordenar a colaboração

- Avance recebendo as notificações de tarefa concluída e de espera dos membros do time. Verifique o andamento geral com TaskList.
- Peça a revisão com SendMessage({to: "{teammate-2}"}, "Revise o rascunho _workspace/01_... de {teammate-1}
  e diga o que precisa ser corrigido"). Repasse a resposta a {teammate-1} para que ele corrija.
  Como o agente mantém o conteúdo das conversas anteriores, dá para restringir a instrução, como em "só a seção 2 daquele rascunho de antes".
- Se os membros do time precisarem discutir o que encontraram, o líder repassa as mensagens. Os artefatos ficam sempre registrados em arquivo.

**Local de gravação dos artefatos:**

| Membro do time | Caminho de saída |
|------|----------|
| {teammate-1} | `_workspace/{phase}_{teammate-1}_{artifact}.md` |
| {teammate-2} | `_workspace/{phase}_{teammate-2}_{artifact}.md` |

### Etapa 4: congelar os artefatos

Agentes com nome continuam recebendo mensagens depois de relatar a conclusão. Se um deles alterar um artefato já entregue enquanto responde a uma pergunta tardia de outro membro do time, a etapa seguinte acaba trabalhando com o conteúdo de antes da alteração. As mensagens de verificação cruzada entre membros do time podem pegar erros, por isso não as bloqueie. Em vez disso, congele os artefatos a cada passagem de etapa, para que os arquivos que a etapa seguinte vai ler não mudem no meio do caminho.

1. Confirme, com TaskList e as notificações de conclusão, que todos os membros do time responsáveis pela etapa anterior relataram a conclusão.
2. Avise esses membros do congelamento por SendMessage. Ex.: "Os artefatos de {etapa} estão congelados. Se depois surgir algo a corrigir, não altere o arquivo existente: escreva em um arquivo de nova versão, como `{phase}_{teammate}_{artifact}_v2.md`, e avise o líder."
3. Registre o hash dos artefatos. Ex.: `shasum _workspace/{phase}_* > _workspace/freeze_{phase}.sha` (pode usar `md5sum` também)
4. Passe no prompt do agente responsável pela etapa seguinte o caminho dos artefatos junto com o caminho do arquivo de hash.

Se houver várias etapas de colaboração, siga o mesmo procedimento em cada fronteira de etapa.

### Etapa 5: integração
1. Confirme com TaskList que todas as tarefas terminaram.
2. Leia cada artefato com Read e aplique {lógica de integração/verificação}.
3. Logo antes de gerar o artefato final, recalcule o hash, como em `shasum -c _workspace/freeze_{phase}.sha`, para confirmar que os artefatos congelados não mudaram. Se o hash for diferente ou tiver surgido um arquivo de nova versão, verifique o que mudou e decida se reexecuta a etapa que leu o conteúdo anterior à alteração.
4. Gere o artefato final em `{output-path}/{filename}`.

### Etapa 6: encerramento
1. Deixe o `_workspace/` para que depois seja possível verificar e conferir o processo de trabalho.
2. Relate ao usuário um resumo do resultado.
   Não há procedimento para desmontar o time. Os agentes encerram automaticamente ao terminar o trabalho e, se necessário, são interrompidos com TaskStop.

## Tratamento de erros

| Situação | Como agir |
|------|------|
| Membro do time não responde ou foi interrompido | Verifique o estado com SendMessage e dê a instrução de novo. Se ainda assim falhar, execute o mesmo tipo personalizado com um nome novo e passe no prompt o contexto de trabalho necessário. |
| A causa da interrupção é limite de uso esgotado, autenticação expirada ou permissão negada | Como tentar de novo dá o mesmo resultado, não repita a instrução nem execute um agente substituto. Abra você mesmo os artefatos parciais para conferir até onde o trabalho realmente avançou, registre o que faltou em um arquivo em `_workspace/` e relate ao usuário. Se for limite de uso, informe também o horário em que ele é liberado. O líder só preenche no lugar do agente os fatos que verificou diretamente, e não preenche por suposição os julgamentos do agente (ex.: qual material ele excluiu e por quê). |
| Mais da metade dos membros do time falhou | Avise o usuário e confirme se deve continuar. |
| Tempo limite excedido | Prossiga com os resultados recebidos até o momento e declare no relatório as áreas que não foram concluídas. |
| Dados que se contradizem | Não apague; registre-os lado a lado, junto com a fonte. |
| Estado das tarefas refletido com atraso | Verifique com TaskList e atualize diretamente com TaskUpdate. |

## Cenários de teste

### Fluxo normal
1. Quando o usuário fornece {entrada}, a etapa 2 executa {N} agentes e registra {M} tarefas.
2. A etapa 3 troca feedback {K} vezes, a etapa 4 congela os artefatos e a etapa 5 integra os resultados.
3. Resultado esperado: `{output-path}/{filename}` é gerado.

### Fluxo de erro
1. Na etapa 3, {teammate-2} não responde.
2. Verifique o estado com SendMessage e dê a instrução de novo. Se ainda assim falhar, execute um agente substituto com o nome "{teammate-2}b" e passe a ele o caminho dos artefatos existentes.
3. O relatório final registra "parte da área de {teammate-2} refeita".
```

---

## Template C: delegação a subagentes

```markdown
---
name: {domain}-orchestrator
description: "Delega a subagentes as tarefas independentes de {domínio}. Use quando o usuário pedir com uma das expressões {palavras-chave de execução inicial}, e também em trabalhos de seguimento como corrigir resultado, reexecução parcial, atualização, complemento, executar de novo e melhorar resultado anterior."
---

## Modo de execução: delegação a subagentes

## Procedimento

### Etapa 0: verificar o trabalho existente
Verifique se existe `_workspace/` para decidir se executa pela primeira vez, se reexecuta só uma parte ou se executa do zero.

### Etapa 1: preparação
Analise a entrada e crie `_workspace/`.

### Etapa 2: execução em paralelo
Chame a ferramenta Agent N vezes simultaneamente numa única mensagem. Por padrão roda em segundo plano.

| Agente | `subagent_type` | Entrada | Artefato |
|---------|--------------|------|------|
| {agent-1} | {tipo} | {fonte} | `_workspace/{phase}_{agent}_{artifact}.md` |
| {agent-2} | {tipo} | {fonte} | `_workspace/{phase}_{agent}_{artifact}.md` |

Em `{tipo}`, escreva o nome do tipo personalizado ou o tipo nativo.

Espere a notificação de conclusão. O agente principal não refaz a busca que já delegou.

### Etapa 3: integração
1. Reúna e integre os valores devolvidos e os artefatos em arquivo e, em seguida, gere o artefato final.

### Etapa 4: encerramento
Deixe o `_workspace/` e relate ao usuário um resumo do resultado.

## Tratamento de erros
- Se um agente falhar, tente de novo uma vez. Se falhar de novo, declare o que ficou faltando e continue.
- Falhas em que tentar de novo dá o mesmo resultado, como limite de uso esgotado, autenticação expirada e permissão negada, não são repetidas. Abra você mesmo os artefatos parciais para conferir até onde o trabalho realmente avançou, registre o que faltou em um arquivo em `_workspace/` e relate ao usuário. Se for limite de uso, informe também o horário em que ele é liberado. O agente principal só preenche no lugar do agente os fatos que verificou diretamente, e não preenche por suposição os julgamentos do agente.
- Se mais da metade dos agentes falhar, avise o usuário e confirme se deve continuar.
```

---

## Combinação de modos de execução por etapa (modo misto)

Use o modo de execução adequado a cada etapa. No topo de cada etapa, escreva `**Modo de execução:**`.

```markdown
## Modo de execução: misto

| Etapa | Modo de execução | Motivo da escolha |
|------|----------|-----------|
| Etapa 1 (verificação prévia) | Feita diretamente pelo agente principal ou delegada a um subagente | É preciso fechar a lista de tarefas. |
| Etapa 2 (coleta e verificação em massa) | Coordenação por workflow | É preciso processar de forma distribuída a lista definida de antemão e fazer verificação adversarial. |
| Etapa 3 (consenso e integração) | Colaboração de agentes persistentes | É preciso discutir os dados que se contradizem e chegar a um consenso. |
| Etapa 4 (verificação independente) | Delegação a subagentes | Basta um agente responsável pela verificação de qualidade verificar de forma independente. |
```

**Regras de transição entre modos de execução:**
- Coordenação por workflow → colaboração de agentes persistentes: salve em `_workspace/` os dados estruturados devolvidos pelo workflow e escreva o caminho do arquivo no prompt dos agentes persistentes.
- Colaboração de agentes persistentes → coordenação por workflow: congele os artefatos do time (etapa 4 do template B) e depois coloque a lista de caminhos de arquivo no script por `args`.
- Em cada ponto em que o modo de execução muda, escreva o caminho de passagem dos dados, para que nunca aconteça de não se encontrar o resultado da etapa anterior.

---

## Princípios de redação aplicáveis a todos os templates

1. **Declare o modo de execução no topo do documento.** Se for modo misto, organize em tabela o modo de execução de cada etapa.
2. **No modo de coordenação por workflow, descreva em detalhe a estrutura do script.** Especifique sem omissões `phases`, o resumo do `schema` e os itens que vão em `args`.
3. **No modo de colaboração de agentes persistentes, descreva em detalhe o uso de `name`, SendMessage e TaskCreate.** Inclua a lista de agentes a executar, as regras de comunicação, as dependências entre tarefas e o procedimento de congelamento de artefatos nas fronteiras de etapa.
4. **No modo de delegação a subagentes, escreva todos os parâmetros do Agent.** Declare se é uma execução pontual sem `name` e especifique `subagent_type`, `prompt` e o caminho de saída.
5. **Escreva os caminhos de arquivo com clareza.** Escreva os caminhos tendo `_workspace/` como base, e os nomes de arquivo seguem a regra `{phase}_{agent}_{artifact}.{ext}`.
6. **Declare as dependências entre etapas.** Nos pontos em que o modo de execução muda, descreva com detalhe especial como os dados são passados.
7. **Prepare-se para os erros que podem realmente acontecer.** Não presuma que todas as tarefas terão sucesso; defina o tratamento para cada situação.
8. **Inclua obrigatoriamente cenários de teste.** Escreva um cenário normal e pelo menos um cenário de erro.
9. **Não inclua itens que só eram usados na v1.** Se houver referência a TeamCreate, TeamDelete, `team_name`, envio para todos ou flag experimental, foi escrito errado.

## Expressões de pedido de seguimento a incluir na `description`

Inclua as expressões abaixo para que este skill seja escolhido não só na primeira execução, mas também quando se corrige ou se executa de novo o resultado.

- reexecução, executar de novo, atualização, correção, complemento
- "só {parte} de {domínio} de novo"
- "com base no resultado anterior", "melhorar o resultado"
- Expressões de pedido usadas no dia a dia do domínio (ex.: num harness de estratégia de lançamento, "launch", "divulgação", "trending")

Sem expressões de pedido de seguimento, este harness pode não ser escolhido de novo depois da primeira execução.
