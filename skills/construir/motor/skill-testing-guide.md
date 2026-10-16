# Guia de teste e melhoria iterativa de skills

Explica como verificar a qualidade dos skills criados pelo harness e melhorá-los em várias rodadas. É material de referência que complementa a etapa 6 do `modo-direto.md`.

---

## Sumário

1. [Visão geral do método de teste](#1-visão-geral-do-método-de-teste)
2. [Como escrever prompts de teste](#2-como-escrever-prompts-de-teste)
3. [Comparação entre a execução com skill (With-skill) e a execução de referência (Baseline)](#3-teste-de-execução-with-skill-vs-baseline)
4. [Executar o teste A/B por workflow (v2)](#4-ab-baseado-em-workflow-v2)
5. [Avaliação quantitativa com condições de verificação (assertion)](#5-avaliação-quantitativa-pontuação-baseada-em-assertion)
6. [Uso de agentes especializados](#6-uso-de-agentes-especializados)
7. [Procedimento de melhoria iterativa](#7-loop-de-melhoria-iterativa)
8. [Verificação da condição de acionamento da `description`](#8-verificação-de-gatilho-da-description)
9. [Estrutura do diretório de trabalho dos testes](#9-estrutura-do-workspace)

---

<a id="1-visão-geral-do-método-de-teste"></a>

## 1. Visão geral do método de teste

A qualidade de um skill é verificada usando juntas a **avaliação qualitativa, em que uma pessoa julga o artefato,** e a **avaliação quantitativa, que pontua por condições de verificação**.

| Tipo de avaliação | Método | Skills adequados |
|----------|------|-----------|
| **Avaliação qualitativa** | O usuário revisa o artefato diretamente. | Skills cuja qualidade exige avaliação humana, como estilo de texto, design e obras criativas |
| **Avaliação quantitativa** | Pontua automaticamente segundo as condições de verificação. | Skills cujo resultado pode ser verificado objetivamente, como geração de arquivos, extração de dados e geração de código |

Siga a ordem **escrever → executar o teste → avaliar → melhorar → testar de novo**.

## 2. Como escrever prompts de teste

### Princípios de redação

Escreva os prompts de teste como **frases concretas e naturais que um usuário real provavelmente digitaria**. Com prompts abstratos ou artificiais é difícil saber se o skill funciona bem em situações reais de uso.

**Exemplo ruim:** `"Processe o PDF"`, `"Extraia os dados"`

**Exemplo bom:**

```
"No arquivo 'Q4_receita_final_v2.xlsx' da pasta de downloads, usa a coluna C (receita) e a coluna D (custo)
pra adicionar uma coluna de margem (%). E depois ordena em ordem decrescente pela margem."
```

### Como variar os prompts

- Misture tom formal e tom informal.
- Misture pedidos que declaram a intenção diretamente com pedidos em que a intenção precisa ser deduzida do contexto. Por exemplo, inclua tanto casos em que o formato do arquivo é dito diretamente quanto casos em que precisa ser inferido do contexto.
- Misture tarefas simples e complexas, e coloque em alguns prompts abreviações, erros de digitação e expressões do dia a dia.

### Abrangência dos casos de uso

Comece com dois ou três prompts. Inclua obrigatoriamente um caso de uso central e uma situação de exceção e, se necessário, acrescente um caso que peça várias tarefas de uma vez.

<a id="3-teste-de-execução-with-skill-vs-baseline"></a>

## 3. Comparação entre a execução com skill (With-skill) e a execução de referência (Baseline)

### 3-1. Como comparar as duas execuções

Para cada prompt de teste, **execute simultaneamente** dois subagentes numa única mensagem.

- **Execução com skill (With-skill)**: lê o skill, trabalha e salva o resultado em `_workspace/iteration-N/eval-{id}/with_skill/outputs/`.
- **Execução de referência (Baseline)**: trata o mesmo prompt sem o skill e salva o resultado em `_workspace/iteration-N/eval-{id}/without_skill/outputs/`.

### 3-2. Como definir a execução de referência

| Situação | Execução de referência |
|------|----------|
| Criando um skill novo | Execute o mesmo prompt sem o skill. |
| Melhorando um skill existente | Preserve o skill de antes da alteração como cópia separada e use-o. |

### 3-3. Registro do tempo de execução e do uso de tokens

Quando chegar a notificação de conclusão do subagente, salve **imediatamente** `total_tokens` e `duration_ms`. Os dois valores só podem ser vistos no momento em que se recebe a notificação de conclusão e não podem ser recuperados depois.

<a id="4-ab-baseado-em-workflow-v2"></a>

## 4. Executar o teste A/B por workflow (v2)

Se houver três ou mais casos de teste, ou se for preciso verificar repetidamente em várias rodadas, transforme o próprio teste A/B em um script de workflow. Use apenas quando o usuário tiver consentido com a execução dos testes.

```javascript
export const meta = {
  name: 'skill-ab-test',
  description: 'Executa com skill e a referência e, ao final, pontua de forma anônima',
  phases: [{ title: 'execução' }, { title: 'pontuação' }],
}
const RUN_RESULT = { type: 'object', required: ['saved', 'files'], properties: {
  saved: { type: 'boolean' },
  files: { type: 'array', minItems: 2, items: { type: 'string', minLength: 1 } } } }
const SLOT_GRADE = { type: 'object', required: ['expectations', 'summary'], properties: {
  expectations: { type: 'array', items: { type: 'object',
    required: ['text', 'passed', 'evidence'], properties: {
      text: { type: 'string' }, passed: { type: 'boolean' }, evidence: { type: 'string' } } } },
  summary: { type: 'object', required: ['passed', 'failed', 'total', 'pass_rate'], properties: {
    passed: { type: 'integer' }, failed: { type: 'integer' }, total: { type: 'integer' },
    pass_rate: { type: 'number' } } } } }
const GRADE = { type: 'object', required: ['A', 'B', 'comparison'], properties: {
  A: SLOT_GRADE,
  B: SLOT_GRADE,
  comparison: { type: 'object', required: ['preferred', 'reason'], properties: {
    preferred: { type: 'string', enum: ['A', 'B', 'tie'] },
    reason: { type: 'string' } } } } }

const results = await pipeline(
  args.evals,   // [{id, prompt, assertions, skillPath, withSkillSlot: 'A' | 'B'}]
  e => {
    const withSkillSlot = e.withSkillSlot === 'B' ? 'B' : 'A'
    const baselineSlot = withSkillSlot === 'A' ? 'B' : 'A'
    return parallel([
      () => agent(
        `${e.prompt}\n\nPrimeiro leia ${e.skillPath} e siga-o. Salve os artefatos em ${args.ws}/${e.id}/with_skill/outputs/ e salve os mesmos arquivos também em ${args.ws}/${e.id}/blind/${withSkillSlot}/outputs/. Devolva todos os caminhos dos arquivos salvos.`,
        { label: `com-skill:${e.id}`, phase: 'execução', schema: RUN_RESULT }),
      () => agent(
        `${e.prompt}\n\nSalve os artefatos em ${args.ws}/${e.id}/without_skill/outputs/ e salve os mesmos arquivos também em ${args.ws}/${e.id}/blind/${baselineSlot}/outputs/. Devolva todos os caminhos dos arquivos salvos.`,
        { label: `referência:${e.id}`, phase: 'execução', schema: RUN_RESULT }),
    ])
  },
  (runs, e) => {
    const completed = (runs ?? []).filter(Boolean)
    if (completed.length !== 2 || completed.some(r => !r.saved || r.files.length < 2)) {
      log(`${e.id}: os artefatos da execução com skill e da execução de referência não estão ambos prontos; a pontuação será pulada.`)
      return null
    }
    return agent(
      `Primeiro verifique se existem os artefatos de ${args.ws}/${e.id}/blind/A/outputs/ e de ${args.ws}/${e.id}/blind/B/outputs/. Se qualquer um dos dois caminhos estiver vazio, não pontue e relate o motivo da falha. Se os dois artefatos existirem, pontue A e B separadamente e julgue qual é melhor, escolhendo entre A, B e tie. Para preservar o anonimato, não abra eval_metadata.json, with_skill/ nem without_skill/. Condições de verificação: ${JSON.stringify(e.assertions)}`,
      { label: `pontuação:${e.id}`, phase: 'pontuação', schema: GRADE })
      .then(grade => {
        if (!grade) log(`${e.id}: o resultado da pontuação anônima não foi recebido; este caso será pulado.`)
        return grade
      })
  }
)
const mapped = results.map((grade, index) => {
  if (!grade) return null
  const e = args.evals[index]
  const withSkillSlot = e.withSkillSlot === 'B' ? 'B' : 'A'
  const baselineSlot = withSkillSlot === 'A' ? 'B' : 'A'
  return {
    evalId: e.id,
    withSkill: grade[withSkillSlot],
    baseline: grade[baselineSlot],
    comparison: {
      preferred: grade.comparison.preferred === 'tie'
        ? 'tie'
        : grade.comparison.preferred === withSkillSlot ? 'with_skill' : 'baseline',
      reason: grade.comparison.reason,
    },
  }
}).filter(Boolean)
return { results: mapped }
```

O agente principal alterna `withSkillSlot` entre A e B a cada caso de teste. O avaliador só lê os caminhos neutros `blind/A/` e `blind/B/`, então não consegue saber em qual lado o skill foi aplicado. Só são pontuados os casos em que os artefatos das duas execuções estão prontos e, terminada a pontuação, o agente principal faz de novo a correspondência dos resultados A/B com a execução com skill e a execução de referência. O resultado dessa correspondência é salvo no `grading.json` do diretório de cada execução. Como a pontuação começa assim que um caso de teste termina, também não é preciso esperar até que todos os casos terminem. Se, depois de alterar o skill, a execução for refeita com `resumeFromRunId`, os casos que não mudaram usam o resultado em cache e são pulados.

<a id="5-avaliação-quantitativa-pontuação-baseada-em-assertion"></a>

## 5. Avaliação quantitativa com condições de verificação (assertion)

### 5-1. Como escrever condições de verificação

Uma **boa condição de verificação** permite distinguir objetivamente verdadeiro de falso, deixa claro o que está sendo checado só pela leitura do seu texto e mede um resultado que deve melhorar quando o skill é aplicado. Condições que passam sempre, mesmo sem usar o skill (ex.: "a saída existe"), ou que exigem julgamento subjetivo de uma pessoa (ex.: "está bem escrito"), não são boas.

### 5-2. Condições que podem ser checadas por código

Escreva como script as condições de verificação que podem ser conferidas por código. É mais rápido e mais confiável do que conferir a olho, e o mesmo script pode ser reutilizado mesmo quando muda a rodada de iteração.

### 5-3. Cuidado com condições de verificação sem poder de discriminação

Uma condição de verificação em que tanto a execução com skill quanto a execução de referência passam 100% não mede a diferença que surge ao usar o skill. Ao encontrar uma condição assim, apague-a ou troque-a por uma condição exigente o bastante para revelar a diferença entre as duas execuções.

### 5-4. Schema do resultado da pontuação

Siga o formato de `grading.json` definido em `skill-writing-guide.md` (`text`/`passed`/`evidence` e `summary`).

## 6. Uso de agentes especializados

| Papel | O que faz | Quando usar |
|------|--------|------------|
| **Avaliador (Grader)** | Registra se cada condição de verificação passou e a evidência, faz verificação cruzada das afirmações factuais contidas no artefato e também inspeciona a qualidade das próprias condições de verificação. | A cada rodada de iteração |
| **Comparador anônimo (Comparator)** | Oculta qual dos dois artefatos usou o skill, embaralha a ordem A/B e compara a qualidade. | Quando é preciso confirmar com rigor se a versão nova é de fato melhor |
| **Analista (Analyzer)** | Analisa padrões estatísticos, como condições de verificação sem poder de discriminação, casos de avaliação com grande variação de resultado e o trade-off entre tempo e uso de tokens. | Depois de acumulados resultados de três ou mais iterações |

<a id="7-loop-de-melhoria-iterativa"></a>

## 7. Procedimento de melhoria iterativa

### 7-1. Princípios de melhoria

1. **Generalize o feedback.** Corrigir sob medida para um único caso de teste gera overfitting. Corrija na forma de um princípio aplicável também a outros casos.
2. **Apague as instruções que não ajudam.** Leia o registro de trabalho do agente e, se o skill o estiver levando a fazer trabalho desnecessário, elimine a instrução.
3. **Explique o motivo.** Mesmo para um feedback curto, entenda por que ele importa e então corrija o skill de modo que esse motivo fique visível.
4. **Inclua de antemão as ferramentas necessárias para o trabalho repetitivo.** Se em todos os testes o mesmo script auxiliar for criado do zero, coloque esse script em `scripts/`.

### 7-2. Sequência da iteração

```
1. Altere o skill.
2. Execute de novo todos os casos de teste em um novo diretório `iteration-{N+1}/`.
3. Apresente ao usuário o resultado comparado com a rodada de iteração anterior.
4. Receba o feedback, altere de novo e repita a mesma sequência.
```

**Condição de término:** termine quando o usuário estiver satisfeito, quando não houver feedback a incorporar ou quando não for mais possível melhorar de forma significativa.

### 7-3. Revise o rascunho com outro olhar

Ao alterar o skill, faça primeiro um rascunho. Depois, imagine-se um revisor que lê o rascunho pela primeira vez, e releia-o do início corrigindo. Não tente escrever perfeito de primeira.

<a id="8-verificação-de-gatilho-da-description"></a>

## 8. Verificação da condição de acionamento da `description`

### 8-1. Escrever os pedidos para avaliar o acionamento

Crie 20 pedidos de avaliação: 10 pedidos `should-trigger`, em que o skill deve ser executado, e 10 pedidos `should-NOT-trigger`, em que não deve ser executado.

**Critérios para escrever os pedidos de avaliação:**

- Escreva frases concretas e naturais que um usuário real provavelmente digitaria.
- Inclua informações concretas, como caminhos de arquivo, a situação do usuário, nomes de colunas e nomes de empresas.
- Concentre-se em **casos de fronteira**, em que é difícil decidir se o skill se aplica, mais do que em casos de resposta óbvia.

**`should-trigger`:** inclua pedidos que expressam a mesma intenção de várias formas, pedidos que não especificam o tipo de arquivo mas claramente precisam do skill, casos de uso incomuns e pedidos que se sobrepõem a outro skill mas em que este skill deve ser escolhido.

**`should-NOT-trigger`:** **o importante são os casos de fronteira com expressão parecida mas fora do alvo (near miss).** Inclua pedidos que usam palavras parecidas mas para os quais outra ferramenta ou outro skill é mais adequado. Pedidos obviamente sem relação não valem o teste.

### 8-2. Verificar conflito com skills existentes

1. Colete todas as `description` dos skills existentes.
2. Verifique se os pedidos `should-trigger` do skill novo não acionam por engano um skill existente.
3. Se houver conflito, escreva com mais clareza na `description` o escopo de aplicação e as condições de exclusão.

### 8-3. Otimização automática (opcional, recurso avançado)

1. Divida os 20 pedidos de avaliação em 60% para treino (Train) e 40% para teste (Test).
2. Meça a precisão de acionamento da `description` atual.
3. Analise os casos que falharam e melhore a `description`.
4. Escolha a `description` de melhor desempenho com base no resultado do **conjunto de teste (Test set)**. Escolher com base no resultado do conjunto de treino gera overfitting.
5. Repita esse processo no máximo cinco vezes.

> A checagem é feita com um script que automatiza o modo headless, que roda sem tela (`claude -p`). Como consome muitos tokens, execute na etapa final, depois que o skill estiver suficientemente estável.

<a id="9-estrutura-do-workspace"></a>

## 9. Estrutura do diretório de trabalho dos testes

```
_workspace/
├── iteration-1/
│   ├── eval-descriptive-name/
│   │   ├── eval_metadata.json
│   │   ├── with_skill/    (outputs/ + timing.json + grading.json)
│   │   ├── without_skill/ (outputs/ + timing.json + grading.json)
│   │   └── blind/         (A/outputs/ + B/outputs/)
│   └── benchmark.json
├── iteration-2/
└── evals/evals.json
```

**Regras de guarda:**

- Dê aos diretórios de `eval` nomes que indiquem o conteúdo, em vez de números (ex.: `eval-multi-page-table-extraction`).
- Crie um diretório independente a cada rodada de iteração e não sobrescreva o diretório `iteration` anterior.
- Não apague o `_workspace/`, porque ele é necessário para a verificação posterior e para rastrear o histórico de mudanças.
