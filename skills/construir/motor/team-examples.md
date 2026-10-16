# Exemplos práticos de composição de times

Cada exemplo mostra o critério para escolher o modo de execução adequado ao trabalho e a forma básica da sintaxe do Harness v2. A definição de cada modo está em `execution-modes.md`, e como escrever scripts de workflow está em `workflow-recipes.md`.

---

## Exemplo 1: time de pesquisa abrangente — coordenação por workflow

**Composição:** distribuição e integração (fan-out/fan-in) + verificação adversarial

**Motivo da escolha:** as perspectivas a pesquisar podem ser listadas de antemão, e o procedimento de verificar cada afirmação pode ser definido em código.

```
[Principal] levantamento prévio: fechar as perspectivas de pesquisa (fontes oficiais, imprensa, comunidade, contexto)
     → Workflow(script, args: {axes, topic, ws})
         phase 'pesquisa': pipeline(axes, axis => agent(..., {schema: FINDINGS}))
         phase 'verificação': executar agentes de verificação adversarial por afirmação → só passam as afirmações que a maioria julgou confirmed
         phase 'síntese': executar 1 revisor de omissões → se faltar alguma perspectiva, pesquisa adicional
     → o principal redige o relatório consolidado com o resultado estruturado devolvido
```

Os princípios de pesquisa e o formato de saída estruturada são definidos em `.claude/agents/researcher.md`, e o princípio de verificação que prioriza a refutação, em `.claude/agents/fact-checker.md`. No workflow, os dois agentes são indicados por `agentType`.

Informações que se contradizem não têm um dos lados descartado arbitrariamente. Elas vão no schema de retorno junto com a fonte.

## Exemplo 2: time de escrita de romance de ficção científica — modo misto centrado em agentes persistentes

**Composição:** pipeline + geração e verificação

**Motivo da escolha:** como é preciso ajustar em tempo real para que o universo ficcional, os personagens e o enredo não se contradigam, cada especialista precisa lembrar o contexto das conversas anteriores. Já os revisores só precisam entregar o resultado, a partir de perspectivas independentes entre si, então subagentes bastam.

```
Etapa 1 (agentes persistentes): Agent(name: "worldbuilder") + Agent(name: "character-designer")
               + Agent(name: "plot-architect") executados em paralelo
               → TaskCreate(universo, personagens, enredo, com as dependências mútuas explicitadas)
               → o líder faz a ponte: worldbuilder fecha a estrutura social
                 → repassa a character-designer via SendMessage
                 → se as profissões dos personagens conflitarem com o universo, pede ajuste
                   a worldbuilder via SendMessage
                 Como o contexto anterior continua lá, dá para mandar corrigir só uma parte,
                 como "na estrutura de classes definida antes, altere só a camada dos comerciantes".
Etapa 2 (subagente): uma chamada a prose-stylist → lê os três artefatos salvos em _workspace/ e escreve
Etapa 3 (subagentes em paralelo): science-consultant + continuity-manager revisam, cada um por si
Etapa 4 (agente persistente): ao prose-stylist chamado uma única vez não se pode enviar SendMessage.
                 Se na etapa 2 ele tivesse sido executado com name, daria para mandá-lo incorporar o resultado da revisão.
                 Se as correções tendem a se repetir, dê name desde o início.
```

Dê `name` desde a primeira execução ao agente que pode vir a receber novos pedidos de correção. Um agente chamado uma única vez não consegue continuar usando o contexto das conversas anteriores.

## Exemplo 3: revisão abrangente de código — coordenação por workflow

**Composição:** distribuição e integração + verificação adversarial

**Motivo da escolha:** as perspectivas de revisão, como segurança, desempenho, estrutura e testes, podem ser definidas de antemão, e o procedimento de reverificar cada item encontrado também pode ser expresso em código.

```javascript
// Revisão por perspectiva → verificação adversarial de cada item encontrado
// Não espera a revisão completa. Terminada a revisão de segurança, mesmo que a de desempenho esteja em andamento,
// os problemas encontrados na área de segurança já são verificados.
const FINDINGS = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object',
    required: ['title', 'file', 'evidence'], properties: {
      title: { type: 'string' }, file: { type: 'string' }, evidence: { type: 'string' } } } } } }
const VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }
const results = await pipeline(
  [
    { key: 'security', prompt: 'Revise pela perspectiva de segurança.' },
    { key: 'perf', prompt: 'Revise pela perspectiva de desempenho.' },
    { key: 'arch', prompt: 'Revise pela perspectiva de estrutura.' },
    { key: 'test', prompt: 'Revise pela perspectiva de testes.' },
  ],
  d => agent(d.prompt, { phase: 'revisão', schema: FINDINGS }),
  r => parallel((r?.findings ?? []).map(f => () =>
    agent(`Verifique o achado a seguir. Se a evidência for suficiente, julgue confirmed; se for claramente refutado, refuted; se for difícil decidir, uncertain: ${JSON.stringify(f)}`,
      { phase: 'verificação', schema: VERDICT })
      .then(verdict => ({ ...f, verdict }))))
)
const confirmed = results.flat().filter(Boolean)
  .filter(f => f.verdict?.status === 'confirmed')
```

Na v1, usava-se um time persistente em que os revisores compartilhavam os achados entre si por `SendMessage`. Se, como no exemplo acima, um item encontrado pode ser verificado sozinho, coloque no prompt evidência suficiente desse item e verifique-o imediatamente. Se for preciso compará-lo com os achados de outras perspectivas, reúna o resultado da revisão completa e verifique depois de uma barreira de sincronização. Use agentes persistentes só quando a conversa em tempo real for realmente necessária, como quando é preciso debater a direção do design.

## Exemplo 4: migração de código em grande escala — colaboração persistente com supervisor ou coordenação por workflow

**Composição:** distribuição e integração, se der para dividir de antemão; supervisor, se for preciso redividir durante o andamento

**Critério de escolha:** escolha o modo de execução conforme seja possível ou não dividir os lotes de trabalho de antemão.

Se os lotes de trabalho puderem ser definidos de antemão, use workflow.

```javascript
const MIGRATION_RESULT = { type: 'object', required: ['worktreePath', 'changedFiles'], properties: {
  worktreePath: { type: 'string', minLength: 1 },
  changedFiles: { type: 'array', minItems: 1, uniqueItems: true,
    items: { type: 'string', minLength: 1 } } } }
const MIGRATION_VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }
const migrated = await pipeline(args.batches,   // os lotes são fechados depois de estimar a complexidade no levantamento prévio
  b => agent(`Migre o lote de trabalho a seguir e devolva o caminho absoluto da árvore de trabalho isolada e a lista dos arquivos realmente alterados: ${b.files.join(', ')}`,
    { agentType: 'migrator', isolation: 'worktree', schema: MIGRATION_RESULT }),
  (r, b) => r && agent(
    `Na árvore de trabalho isolada ${r.worktreePath}, confronte os alvos da migração com os arquivos realmente alterados e verifique omissões e erros. Alvos originais: ${b.files.join(', ')}. Alterações reais: ${r.changedFiles.join(', ')}`,
    { agentType: 'qa-inspector', schema: MIGRATION_VERDICT })
    .then(verdict => ({ ...r, verdict })))
const confirmed = migrated.filter(Boolean)
  .filter(r => r.verdict?.status === 'confirmed')
return { confirmed }
```

Passe obrigatoriamente ao agente de verificação adversarial o caminho da árvore de trabalho isolada onde está o resultado da migração. Terminado o workflow, o agente principal confere um a um os `worktreePath` dos resultados `confirmed` e mescla as alterações no branch de referência ou aplica seletivamente só os commits necessários. Se surgir conflito, resolva-o antes de juntar a árvore de trabalho seguinte, e aplique a alteração seguinte só depois de passar no teste de integração. Resultados `refuted` ou `uncertain` não são mesclados; relate o motivo da omissão.

Se for preciso redividir o trabalho conforme o andamento, use agentes persistentes.

```
O líder registra os lotes de trabalho com TaskCreate (incluindo depends_on)
→ Agent(name: "migrator-1"), Agent(name: "migrator-2"), Agent(name: "migrator-3") executados em paralelo
→ confere o resultado a cada notificação de conclusão recebida
→ para as tarefas que falharam, verifica a causa via SendMessage e redistribui com TaskUpdate
→ quando tudo terminar, teste de integração
```

## Exemplo 5: produção de webtoon — gerador persistente e revisor pontual

**Composição:** geração e verificação

**Motivo da escolha:** só são necessários um gerador e um revisor. Basta devolver o resultado da revisão ao gerador no máximo duas vezes, então um modo misto leve é suficiente.

```
Etapa 1: Agent(name: "artist") → gera os painéis → _workspace/panels/
Etapa 2: uma chamada a Agent(subagent_type: "webtoon-reviewer", prompt: "Revise os painéis") → julgamento PASS/FIX/REDO
       → _workspace/review_report.md
Etapa 3: só para os painéis julgados REDO, instrução de regerar via SendMessage({to: "artist"})
       Repete no máximo duas vezes. Como o artist lembra o contexto anterior,
       dá para restringir a instrução, como em "corrija só o enquadramento do painel 3".
Política de nova tentativa: se não passar mesmo depois de duas correções, informe ao usuário o estado pendente e a causa.
             Se 50% ou mais de todos os painéis forem REDO, sugira ao usuário corrigir o prompt.
```

---

## Como salvar os artefatos

- **Definição de agente:** crie em `projeto/.claude/agents/{name}.md`. Escreva obrigatoriamente o papel central, os princípios de trabalho, as regras de entrada e saída, o modo de nova chamada, o tratamento de erros e o modo de colaboração. Acrescente regras de comunicação aos agentes persistentes, e formato de saída estruturada aos agentes que serão usados em workflow.
- **Skill:** crie em `projeto/.claude/skills/{name}/SKILL.md` e, se necessário, inclua `references/` e `scripts/`.
- **Orquestrador:** escreva obrigatoriamente o modo de execução. Use os templates de `orchestrator-template.md`.
- **Artefatos intermediários:** salve no formato `_workspace/{phase}_{agent}_{artifact}.{ext}` e mantenha-os mesmo depois de terminada a verificação.
