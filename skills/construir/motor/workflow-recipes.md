# Exemplos de uso de workflow — esqueleto de script e pontos de atenção

Explica os padrões de script que podem ser colocados no skill de coordenação quando o harness é montado no modo de coordenação por workflow (modo A). Os scripts são escritos em JavaScript puro e passados no parâmetro `script` da ferramenta `Workflow`.

---

## Sumário

1. [Esqueleto básico](#1-esqueleto-básico)
2. [Execução distribuída (fan-out) + verificação adversarial](#2-execução-distribuída-fan-out--verificação-adversarial)
3. [Banca julgadora](#3-banca-julgadora)
4. [Repetir até não surgir item novo (Loop-until-dry)](#4-repetir-até-não-surgir-item-novo-loop-until-dry)
5. [Repetição vinculada ao orçamento de tokens](#5-repetição-vinculada-ao-orçamento-de-tokens)
6. [Tipo personalizado + saída estruturada](#6-tipo-personalizado--saída-estruturada)
7. [Pontos de atenção (lista de verificação)](#7-pontos-de-atenção-lista-de-verificação)

---

## 1. Esqueleto básico

Um script completo executável começa com o literal `meta`. Os títulos usados nas chamadas `phase()` precisam coincidir exatamente com os `title` de `meta.phases`.

```javascript
export const meta = {
  name: 'domain-task',
  description: 'Descrição em uma linha (exibida na caixa de diálogo de permissão)',
  phases: [
    { title: 'coleta', detail: 'Pesquisa em paralelo, uma perspectiva por vez' },
    { title: 'verificação', detail: 'Para cada item encontrado, busca evidências que o refutem e verifica' },
  ],
}

phase('coleta')
const raw = await pipeline(args.items, item =>
  agent(`...${item}...`, { label: `coleta:${item}`, phase: 'coleta', schema: COLLECT_SCHEMA }))

phase('verificação')
// ...

return { result }   // o valor de retorno final é entregue ao agente principal
```

**Princípios:**
- **Por padrão use `pipeline()`, e use `parallel()` só quando a barreira de sincronização for realmente necessária.** A barreira de sincronização só é necessária quando a etapa seguinte precisa comparar entre si o resultado **completo** da etapa anterior. Eliminação de duplicatas, encerramento antecipado quando o resultado total é 0 e prompts que mandam "comparar com os outros achados" se enquadram nisso.
- Não escreva diretamente no script os valores da lista de itens. Sempre que possível, passe por `args.items` a lista fechada pelo agente principal no levantamento prévio.
- Se precisar de timestamp, passe por `args.now`. `Date.now()` não pode ser usado.

## 2. Execução distribuída (fan-out) + verificação adversarial

Coleta o resultado da revisão de cada perspectiva e depois verifica os resultados um a um. Não espera a pesquisa das outras perspectivas terminar: assim que a pesquisa de uma perspectiva termina, os resultados dela já são verificados.

```javascript
export const meta = {
  name: 'review-fanout-verify',
  description: 'Revisa por perspectiva e, para cada item encontrado, busca evidências que o refutem e verifica',
  phases: [{ title: 'revisão' }, { title: 'verificação' }],
}

const FINDINGS = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object',
    required: ['title', 'file', 'evidence'], properties: {
      title: { type: 'string' }, file: { type: 'string' }, evidence: { type: 'string' } } } } } }
const VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }

const results = await pipeline(
  args.dimensions,   // ex.: [{key:'security', prompt:'...'}, {key:'perf', prompt:'...'}]
  d => agent(d.prompt, { label: `revisão:${d.key}`, phase: 'revisão', schema: FINDINGS }),
  review => parallel((review?.findings ?? []).map(f => () =>
    agent(`Verifique o resultado de revisão a seguir. Se a evidência for suficiente, julgue confirmed; se for claramente refutado, refuted; se for difícil decidir, uncertain: ${JSON.stringify(f)}`,
      { label: `verificação:${f.file}`, phase: 'verificação', schema: VERDICT })
      .then(v => ({ ...f, verdict: v }))))
)
const confirmed = results.flat().filter(Boolean)
  .filter(f => f.verdict?.status === 'confirmed')
log(`De ${results.flat().filter(Boolean).length} itens no total, ${confirmed.length} passaram na verificação.`)
return { confirmed }
```

Para tornar a verificação mais rigorosa, execute três agentes de verificação adversarial para cada item encontrado. Só passam os itens que dois ou mais deles julgarem `confirmed`, por terem evidência suficiente. Se cada agente receber um critério de verificação diferente, como exatidão, segurança e reprodutibilidade, dá para encontrar problemas mais variados do que inspecionando repetidamente pelo mesmo critério.

## 3. Banca julgadora

É o padrão usado em trabalhos de design com muitas soluções possíveis. Cria N propostas independentes entre si, julga-as em paralelo e, com base no resultado do julgamento, produz a versão final.

```javascript
export const meta = {
  name: 'design-judge-panel',
  description: 'Cria N propostas independentes, julga-as e redige a versão final com base na proposta de maior nota',
  phases: [{ title: 'propostas' }, { title: 'julgamento' }, { title: 'síntese' }],
}

const angles = args.angles?.length
  ? args.angles
  : ['que prioriza o MVP', 'que prioriza a gestão de riscos', 'que prioriza a experiência do usuário']
const judgeCount = args.judgeCount ?? 3

phase('propostas')
const drafts = (await parallel(angles.map(a => () =>
  agent(`Escreva de forma independente uma proposta pela perspectiva ${a}: ${args.brief}`,
    { label: `proposta:${a}`, phase: 'propostas' }))))
  .filter(Boolean)
log(`Das ${angles.length} propostas, ${drafts.length} foram criadas.`)
if (!drafts.length) return { error: 'Não há proposta concluída.', drafts: [] }

phase('julgamento')   // barreira de sincronização necessária: todas as propostas precisam ser comparadas entre si
const SCORE = { type: 'object', required: ['scores'], properties: {
  scores: { type: 'array', items: { type: 'object',
    required: ['index', 'score', 'strengths'], properties: {
      index: { type: 'integer' }, score: { type: 'number' }, strengths: { type: 'string' } } } } } }
const judged = (await parallel(Array.from({ length: judgeCount }, (_, j) => () =>
  agent(`Dê nota às ${drafts.length} propostas a seguir:\n${drafts.map((d, i) => `[${i}] ${d}`).join('\n---\n')}`,
    { label: `julgamento:${j}`, phase: 'julgamento', schema: SCORE })))).filter(Boolean)
log(`Dos ${judgeCount} jurados, foram recebidos os resultados de ${judged.length}.`)
if (!judged.length) return { error: 'Não há resultado de julgamento concluído.', drafts }

phase('síntese')
const ranked = drafts.map((_, i) => {
  const scores = judged.flatMap(r =>
    r.scores.filter(x => x.index === i).map(x => x.score)).filter(Number.isFinite)
  return scores.length
    ? { index: i, average: scores.reduce((sum, score) => sum + score, 0) / scores.length }
    : null
}).filter(Boolean)
if (!ranked.length) return { error: 'Não há notas válidas por proposta.', drafts, judged }
const winner = ranked.reduce((best, item) =>
  item.average > best.average ? item : best).index
const finalDraft = await agent(
  `Redija a versão final com base na proposta de maior nota. Incorpore também, onde necessário, os pontos fortes das outras propostas.\nProposta de maior nota:\n${drafts[winner]}\nPareceres dos jurados:\n${JSON.stringify(judged)}`,
  { phase: 'síntese' })
if (!finalDraft) {
  log('Não foi possível redigir a versão final.')
  return { error: 'Não foi possível redigir a versão final.', drafts, judged, winner }
}
return finalDraft
```

## 4. Repetir até não surgir item novo (Loop-until-dry)

Usado em trabalhos em que não se sabe de antemão quantos itens precisam ser encontrados. Repete a busca até que nenhum item novo apareça por K vezes seguidas.

O código das seções 4 a 6 são trechos para colocar dentro do esqueleto básico da seção 1. Para usar como script completo, ponha `meta` no início e defina junto os títulos de etapa e os schemas usados.

```javascript
const finders = args.finders ?? []
const dryLimit = args.dryRuns ?? 2
const findingKey = finding => JSON.stringify([
  finding.file ?? '', finding.title ?? '', finding.evidence ?? ''
])
const seen = new Set(), confirmed = []
if (!finders.length) return { confirmed, error: 'Não há critérios de busca.' }
let dry = 0
while (dry < dryLimit) {
  const found = (await parallel(finders.map(f => () =>
    agent(f.prompt, { phase: 'busca', schema: FINDINGS })))).filter(Boolean).flatMap(r => r.findings)
  const fresh = found.filter(b => !seen.has(findingKey(b)))   // a duplicidade é julgada com base em seen. Não se deve usar confirmed como base.
  if (!fresh.length) { dry++; continue }
  dry = 0
  fresh.forEach(b => seen.add(findingKey(b)))
  const judged = await parallel(fresh.map(b => () =>
    agent(`Verifique o resultado de revisão a seguir. Se a evidência for suficiente, julgue confirmed; se for claramente refutado, refuted; se for difícil decidir, uncertain: ${JSON.stringify(b)}`,
      { phase: 'verificação', schema: VERDICT })
      .then(v => ({ b, ok: v?.status === 'confirmed' }))))
  confirmed.push(...judged.filter(Boolean).filter(x => x.ok).map(x => x.b))
  log(`Até agora há ${confirmed.length} itens confirmados, e nesta rodada foram encontrados ${fresh.length} novos.`)
}
return { confirmed }
```

Se as duplicatas forem eliminadas com base em `confirmed`, os itens rejeitados na verificação reaparecem a cada rodada e a repetição não termina. As duplicatas precisam ser eliminadas com base em `seen`, que guarda os itens encontrados ao menos uma vez.

## 5. Repetição vinculada ao orçamento de tokens

Em sessões em que o usuário especificou um orçamento de tokens, como "+500k", é possível ajustar automaticamente o alcance da busca conforme o orçamento restante. Em sessões sem limite, sem `budget.total`, `remaining()` devolve `Infinity`; por isso, na condição, verifique sempre primeiro se `budget.total` existe.

```javascript
const findings = []
while (budget.total && budget.remaining() > 50_000) {
  const r = await agent('Prossiga com a próxima tarefa de busca.', { schema: FINDINGS })
  if (r) findings.push(...r.findings)
  log(`Até agora foram encontrados ${findings.length} itens, e o orçamento de tokens restante é ${Math.round(budget.remaining() / 1000)}k.`)
}
// Forma de definir de antemão a escala do trabalho: const FLEET = budget.total ? Math.floor(budget.total / 100_000) : 3
```

## 6. Tipo personalizado + saída estruturada

Usa no workflow, tal como estão, as definições `.claude/agents/{name}.md` criadas pelo harness.

```javascript
const r = await agent(
  `Verifique o arquivo _workspace/02_draft.md e devolva os itens encontrados`,
  { agentType: 'qa-inspector',      // .claude/agents/qa-inspector.md
    schema: FINDINGS,               // tipos personalizados também só devolvem resultados que obedecem ao schema indicado
    effort: 'high' })               // na etapa de verificação, é bom aumentar a intensidade de raciocínio
```

- Se `agentType` for omitido, usa-se o subagente de workflow padrão.
- Escolha `model` conforme a natureza do trabalho de cada etapa. Use `sonnet` nas etapas repetitivas de coleta e conversão, `opus` nas etapas de verificação, julgamento e design aprofundados, e `fable` nas etapas de planejamento geral e execução de longa duração. Para os critérios detalhados, consulte `model-selection-guide.md`.
- Se vários agentes puderem alterar arquivos ao mesmo tempo e entrar em conflito, indique `isolation: 'worktree'`. Como preparar o ambiente de trabalho tem custo, use só quando houver de fato possibilidade de conflito.

## 7. Pontos de atenção (lista de verificação)

Ao verificar scripts de workflow na etapa 6-2 do harness, confira a lista abaixo.

| Ponto de atenção | Problema que aparece | Prevenção |
|------|------|------|
| Uso de variáveis ou operações em `meta` | O script não pode ser analisado (parsing). | Coloque só literais em `meta`. |
| Uso de sintaxe TypeScript (`: string[]` etc.) | O script não pode ser analisado (parsing). | Escreva em JavaScript puro. |
| Uso de `Date.now()` / `Math.random()` / `new Date()` | Ocorre erro por causa da proteção de retomada da execução. | Passe timestamps e seeds por `args` e, se precisar de aleatoriedade, varie o prompt conforme o índice. |
| Falta de `.filter(Boolean)` | A etapa seguinte é interrompida pelo `null` devolvido por um agente que falhou. | Aplique `.filter(Boolean)` antes de usar o resultado de `parallel()` ou `pipeline()`. |
| Barreira de sincronização desnecessária | Os agentes que terminaram rápido esperam os lentos, e o tempo total de execução aumenta. | Se não for preciso comparar entre si o resultado completo, reescreva com `pipeline()`. |
| Títulos de `phase` não coincidem | O progresso não é exibido nos agrupamentos pretendidos. | Faça coincidir as chamadas `phase()` com os `title` de `meta.phases`. |
| Chamada global a `phase()` dentro de etapa paralela | Os agrupamentos de exibição do progresso entram em conflito. | Dentro da etapa, indique explicitamente `opts.phase`. |
| Eliminação de duplicatas com base em `confirmed` | Os itens rejeitados reaparecem e a repetição não termina. | Elimine duplicatas com base no conjunto `seen`. |
| Falta de verificação de `budget.total` na repetição por orçamento de tokens | Em sessões sem limite, continua executando até o número de chamadas `agent()` atingir o limite por workflow. | Use a condição `while (budget.total && ...)`. |
| Processar só uma parte sem informar o alcance processado | Processa só os N primeiros e ainda relata "tudo concluído". | Declare no `log()` o número de itens não processados. |
| Não verificar o registro de execução (`journal`) ao diagnosticar o resultado | Um resultado vazio vindo do cache é confundido com sucesso. | Antes de diagnosticar um workflow concluído, verifique o `journal` no diretório do histórico de execução (`transcript`). |
| Escrever o script primeiro em arquivo | Faz passar por uma etapa desnecessária. | Passe o conteúdo do script diretamente em `script`. Ao chamar, o arquivo é preservado automaticamente; para correções repetidas, faça `Edit` no arquivo preservado e chame de novo com `scriptPath`. |
