# Guia de design do agente de QA

São as diretrizes a consultar ao incluir um agente de QA num harness de build. Com base em bugs encontrados em projetos reais e em suas causas, explica como encontrar os defeitos que o agente de QA costuma deixar passar.

---

## Sumário

1. [Padrões de defeitos que o agente de QA deixa passar](#1-padrões-de-defeitos-que-o-agente-de-qa-deixa-passar)
2. [Verificação de coerência de integração](#2-verificação-de-coerência-de-integração-integration-coherence-verification)
3. [Princípios de design do agente de QA](#3-princípios-de-design-do-agente-de-qa)
4. [QA executada por workflow (v2)](#4-qa-baseada-em-workflow-v2)
5. [Template de checklist de verificação](#5-template-de-checklist-de-verificação)
6. [Template de definição do agente de QA](#6-template-de-definição-do-agente-de-qa)

---

## 1. Padrões de defeitos que o agente de QA deixa passar

### 1-1. Incompatibilidade de contrato nas junções entre componentes (Boundary Mismatch)

É o defeito mais frequente. Olhando cada um dos dois componentes separadamente, ambos estão implementados corretamente, mas no ponto de ligação seguem contratos diferentes.

| Ponto de ligação | Exemplo de incompatibilidade | Por que passa despercebido |
|--------|-----------|-----------|
| Resposta da API → hook do frontend | A API devolve `{ projects: [...] }`, mas o hook espera `Project[]`. | Cada componente é verificado isoladamente e não se comparam um com o outro. |
| Nome de campo da resposta da API → definição de tipo | A API usa `thumbnailUrl` (camelCase) e o tipo usa `thumbnail_url` (snake_case). | Quando o tipo é afirmado com genéricos, o compilador não detecta. |
| Caminho do arquivo → `href` do link | A página está em `/dashboard/create`, mas o link aponta para `/create`. | Não se compara a estrutura de arquivos com os `href`. |
| Mapa de transição de estados → atualização real de `status` | O mapa define a transição, mas falta no código o tratamento que muda o estado. | Só se verifica se o mapa existe e não se rastreia o código que de fato atualiza. |
| Endpoint da API → hook do frontend | A API existe, mas não há hook que a chame. | Não se confronta um a um a lista de APIs com a lista de hooks. |
| Resposta imediata → resultado do processamento assíncrono | A API devolve `{ status }` imediatamente, mas o frontend acessa campos do resultado final. | Só se verifica o tipo, sem distinguir a resposta imediata da resposta final. |

### 1-2. Por que é difícil encontrar só com revisão estática de código

- **Limite dos tipos genéricos**: escrevendo como `fetchJson<Project[]>()`, a compilação passa mesmo que a resposta real seja `{ projects: [...] }`.
- **Por que um build bem-sucedido não garante funcionamento correto**: código que usa asserção de tipo, `any` e genéricos pode compilar com sucesso e ainda assim falhar em tempo de execução.
- **A existência da API e o contrato de resposta são alvos de verificação diferentes**: verificar "a API existe?" e verificar "a resposta da API corresponde ao valor que quem chama espera?" são coisas completamente diferentes.

<a id="2-verificação-de-coerência-de-integração-integration-coherence-verification"></a>

## 2. Verificação de coerência de integração (Integration Coherence Verification)

O agente de QA precisa obrigatoriamente incluir **verificação que confronta os componentes entre si**. Os exemplos abaixo tomam o Next.js como base, mas o princípio se aplica a qualquer stack tecnológica. Abra juntos o código produtor e o código consumidor e compare o contrato dos dois lados.

### 2-1. Confronto entre a resposta da API e o tipo do hook do frontend

```
1. Extraia a estrutura da resposta no ponto de serialização da resposta da rota (route) da API (NextResponse.json() etc.).
2. Verifique o tipo esperado pelo hook ou cliente correspondente (o T de fetchJson<T> etc.).
3. Compare a estrutura da resposta com T. Se a API devolve { data: [...] }, verifique inclusive se o hook extrai .data.
```

Verifique em especial os casos em que uma resposta embrulhada em paginação é recebida erroneamente como array, em que falta a conversão entre snake_case e camelCase, e em que a estrutura da resposta imediata (202) difere da resposta final.

### 2-2. Confronto entre caminhos de arquivo e caminhos de link/roteador

```
1. Extraia os padrões de URL da estrutura de arquivos de roteamento. Remova (group) e trate [param] como segmento dinâmico.
2. Colete todos os valores de href=, router.push( e redirect( presentes no código.
3. Verifique se cada link corresponde a um caminho que realmente existe.
```

### 2-3. Rastreamento de que as transições de estado foram implementadas sem lacunas

```
1. Extraia do mapa de transição de estados a lista de transições permitidas.
2. Busque todo o código que atualiza status.
3. Verifique se as transições que ocorrem no código estão definidas no mapa. Não pode haver transição não permitida.
4. Encontre transições que estão no mapa mas não são executadas no código. Não pode haver transição sem uso.
5. Verifique em especial se falta o tratamento que passa do estado intermediário para o estado final.
```

### 2-4. Confronto um a um entre endpoints da API e hooks do frontend

```
1. Extraia a lista de endpoints por método HTTP.
2. Extraia a lista de URLs das chamadas fetch do cliente.
3. Para cada endpoint não chamado, decida se é uma API administrativa que o cliente não chama diretamente ou se falta o código de chamada.
```

## 3. Princípios de design do agente de QA

### 3-1. Escolha um tipo de agente que possa usar todas as ferramentas

Se o agente de QA for do tipo `Explore`, ele só consegue ler arquivos. Para fazer QA de verdade, ele precisa conseguir buscar padrões com `Grep`, executar scripts que confrontam resultados automaticamente e, se necessário, alterar código. Escolha `general-purpose` ou um tipo personalizado que possa usar todas as ferramentas, e especifique na definição do agente o procedimento "verificação → relatório → pedido de correção".

### 3-2. O checklist deve conter resultados de confronto, mais do que existência

| Checklist simples | Checklist centrado em confronto |
|---------------|---------------|
| O endpoint da API existe? | A estrutura da resposta da API corresponde ao tipo do hook correspondente? |
| O mapa de transição de estados está definido? | Todo o código que atualiza `status` corresponde ao mapa de transição? |
| O arquivo da página existe? | Todos os links do código apontam para páginas que realmente existem? |
| Usa modo estrito (strict mode)? | Não há lugar em que a segurança de tipos foi contornada por asserção de tipo genérico? |

### 3-3. Leia juntos os dois lados do código conectado

Para encontrar bugs que surgem nos pontos de ligação, não basta ler o código de um lado só. Leia juntos, respectivamente, a rota da API e o hook correspondente, o mapa de transição de estados e o código que de fato atualiza, e a estrutura de arquivos e os caminhos de link. Escreva esse princípio claramente também na definição do agente.

### 3-4. Execute a QA a cada módulo concluído, e não depois de todos os módulos prontos

Se a QA for executada só depois de terminada a implementação inteira, os bugs se acumulam e o custo de correção sobe, e as incompatibilidades de contrato surgidas no início se espalham para os módulos seguintes. Recomenda-se a **QA incremental (incremental QA)**: a cada endpoint de API concluído, confrontar imediatamente essa API com o hook correspondente.

<a id="4-qa-baseada-em-workflow-v2"></a>

## 4. QA executada por workflow (v2)

Se for possível montar uma lista dos pontos de ligação a verificar, o processo de QA também pode ser estruturado como workflow.

```javascript
// Inspecionar os pontos de ligação em partes → reverificar cada item encontrado pela perspectiva contrária
const FINDINGS = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object',
    required: ['title', 'file', 'evidence'], properties: {
      title: { type: 'string' }, file: { type: 'string' }, evidence: { type: 'string' } } } } } }
const VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }
const boundaries = args.boundaries  // extraído no levantamento prévio: [{api: '...', consumer: '...'}, ...]
const found = await pipeline(
  boundaries,
  b => agent(`Leia os dois lados juntos e encontre incompatibilidades de contrato: ${b.api} ↔ ${b.consumer}`,
    { agentType: 'qa-inspector', phase: 'inspeção', schema: FINDINGS }),
  r => parallel((r?.findings ?? []).map(f => () =>
    agent(`Verifique pela perspectiva contrária se esta incompatibilidade causa erro real de execução: ${JSON.stringify(f)}`,
      { phase: 'reverificação', schema: VERDICT }).then(verdict => ({ ...f, verdict }))))
)
const confirmed = found.flat().filter(Boolean)
  .filter(f => f.verdict?.status === 'confirmed')
return { confirmed }
```

Reverificando pela perspectiva contrária os itens encontrados e mantendo só os julgados `confirmed`, dá para filtrar apontamentos que parecem plausíveis mas na verdade não são problema. Assim, os apontamentos do relatório final de QA ficam mais confiáveis.

## 5. Template de checklist de verificação

Inclua o checklist de coerência de integração abaixo na definição do agente de QA que inspeciona aplicações web.

```markdown
### Verificação de coerência de integração (app web)

#### Ligação entre API e frontend
- [ ] Verifique se a estrutura da resposta de todas as rotas da API corresponde ao tipo genérico do hook correspondente.
- [ ] Verifique se o hook extrai o valor real dos dados de respostas embrulhadas em objeto ({ items: [...] }).
- [ ] Verifique se a conversão entre snake_case e camelCase é aplicada de forma consistente.
- [ ] Verifique se o frontend distingue a estrutura da resposta imediata (202) da resposta final.
- [ ] Verifique se todo endpoint da API tem um hook do frontend correspondente e se ele é de fato chamado.

#### Coerência de roteamento
- [ ] Verifique se todos os valores de href/router.push do código correspondem a caminhos reais de arquivos de página.
- [ ] Verifique os caminhos levando em conta que o (group) usado em grupos de rotas (route group) some da URL.
- [ ] Verifique se os segmentos dinâmicos ([id]) recebem o valor de parâmetro correto.

#### Coerência da máquina de estados
- [ ] Verifique se todas as transições de estado definidas são executadas no código (não pode haver transição sem uso).
- [ ] Verifique se todas as atualizações de status no código estão definidas no mapa de transição (não pode haver transição não permitida).
- [ ] Verifique se não falta o tratamento que passa do estado intermediário para o estado final.
- [ ] Verifique se o X das ramificações por estado no frontend (if status === "X") é um estado realmente alcançável.

#### Coerência do fluxo de dados
- [ ] Verifique se a correspondência entre os nomes de campo do schema do BD e os nomes de campo da resposta da API é consistente.
- [ ] Verifique se as definições de tipo do frontend e os nomes de campo da resposta da API coincidem.
- [ ] Verifique se os dois lados tratam de forma consistente os valores null/undefined de campos opcionais (optional field).
```

## 6. Template de definição do agente de QA

```markdown
---
name: qa-inspector
description: "Agente de QA que verifica a conformidade com a especificação, a coerência de integração e a qualidade de design."
---

# Agente de QA

## Papel principal
Verifica se a implementação segue a especificação e verifica a **coerência de integração entre módulos**.

## Prioridade de verificação
1. **Coerência de integração** (a mais alta) — incompatibilidades de contrato nos pontos de ligação são a principal causa de erros em tempo de execução.
2. **Conformidade com a especificação funcional** — verifique API, máquina de estados e modelo de dados.
3. **Qualidade de design** — verifique cores, fontes e comportamento responsivo.
4. **Qualidade de código** — verifique código sem uso e convenções de nomenclatura.

## Método de verificação: ler juntos os dois lados do código conectado
| Alvo de verificação | Produtor | Consumidor |
|----------|-------|-------|
| Estrutura da resposta da API | Ponto de serialização da resposta | Tipo esperado pelo cliente |
| Roteamento | Estrutura de arquivos de roteamento | Valores de href, router.push |
| Transição de estados | Mapa de transição | Código que atualiza status |
| BD → API → UI | Nomes das colunas da tabela do BD | Campos da resposta da API → definição de tipo |

## Procedimento de relatório e pedido de correção
- Ao encontrar um problema, peça imediatamente ao agente responsável a correção concreta (arquivo:número da linha + como corrigir).
- Se o problema surgiu num ponto de ligação, avise os agentes responsáveis pelos dois lados.
- Para o líder, envie um relatório de verificação que separe os itens aprovados, reprovados e não verificados.
```

---

## Casos reais: bugs encontrados e suas causas

| Bug | Ponto de ligação | Causa |
|------|----------|------|
| `projects?.filter is not a function` | API → hook | A API devolve `{projects:[]}`, mas o hook espera um array. |
| 404 em todos os links do dashboard | Caminho do arquivo → `href` | Falta o prefixo `/dashboard/`. |
| Imagem de miniatura não aparece | API → componente de UI | `thumbnailUrl` e `thumbnail_url` não coincidem. |
| Valor selecionado não é salvo | API → hook | A API existe, mas não há hook correspondente. |
| Página de geração fica presa em estado de espera | Transição de estados → código | Falta o código que muda para o estado final. |
| Crash ao acessar `data.failedIndices` | Resposta imediata → frontend | O frontend acessa, na resposta imediata, o resultado do processamento em segundo plano. |
| 404 ao abrir a página de detalhe depois da conclusão | Caminho do arquivo → `href` | O prefixo da rota não coincide. |
