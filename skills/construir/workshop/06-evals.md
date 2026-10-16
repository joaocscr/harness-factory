# Módulo 6: Evals

## Ideia central

Hooks conferem regras individuais. O revisor confere saídas individuais. Mas quem confere se o **harness como um todo** funciona com confiabilidade?

Essa é a função das evals.

Um teste clássico confere se o código compila. Uma eval confere algo diferente: se o harness toma as decisões certas, se mantém consistente e continua se comportando como esperado depois de uma mudança.

A pergunta que uma eval responde:
> "Dada esta entrada, o harness produz a saída certa com confiabilidade?"

## A analogia: test drives

Um carro é construído. Os hooks conferem se os freios foram montados corretamente. O revisor confere se o volante está reto. Mas ninguém dirigiu o carro ainda.

Uma eval é o test drive. Um trajeto definido, em condições definidas, conferindo se o carro se comporta como deveria.

Trocou o motor, refaça o test drive. Acrescentou uma estrada nova, acrescente um teste novo ao trajeto.

## Eval de resultado vs. eval de trajetória

**Eval de resultado**
Confere o resultado final: o desfecho está correto? Todas as partes esperadas estão presentes? Está completo?
Mais fácil de escrever, cobre a maioria dos casos.

**Eval de trajetória**
Confere o caminho: o papel procurou algo parecido antes de criar algo novo? Foi feita uma checagem de existência antes de construir?
Mais difícil, mas importante. Um resultado correto alcançado pelo caminho errado é uma bomba-relógio.

**Para começar:** comece pelas evals de resultado. As evals de trajetória vêm quando o harness já está rodando.

## Anatomia de uma eval

Toda eval tem três partes:

**1. Entrada:** o que o harness recebe? Uma tarefa concreta e realista, do jeito que seria de fato enviada em operação real.
**2. Saída esperada:** o que deveria sair? Não uma descrição vaga, e sim critérios concretos e verificáveis.
**3. Rubrica:** como é pontuada? Aprovado/reprovado por critério, nenhuma nota geral sem avaliação individual.

## Derivando as categorias de eval

As categorias decorrem dos papéis (Módulo 2) e do pipeline (Módulo 4), não de uma lista fixa:

**1. Evals de papel:** uma categoria por papel criador, confere se aquele papel funciona corretamente
**2. Evals de pipeline:** confere se a linha de montagem inteira roda corretamente (ordem, handoffs, FAIL para correção)
**3. Evals de caso-limite:** confere se entradas inesperadas ou de fronteira são tratadas corretamente

Um exemplo resolvido, como padrão para a sua própria eval:

```markdown
## E01: <título curto>
Category: role
Pipeline: <nome-do-pipeline>
Input: <uma tarefa realista do intake, em uma linha, como seria digitada>
Criteria:
- [check: verdict pass] O revisor dá PASS no final
- [check: file-exists <caminho/para/a/saida/esperada>] O arquivo de saída existe
- [manual] A saída segue a convenção de nomes/estrutura do AGENTS.md
- [manual] O papel primeiro conferiu se algo parecido já existe

## E02: <título curto>
Category: edge-case
Pipeline: <nome-do-pipeline>
Input: <uma entrada que violaria uma regra rígida>
Criteria:
- [check: hook-blocked <nome-do-hook>] A guarda impediu a violação
- [manual] O papel recusa ou pergunta, em vez de quebrar a regra
```

As evals de verdade surgem da conversa sobre os papéis, as regras e os exemplos reais deste harness, não de copiar o exemplo acima.

O formato é fixo porque um script o lê (próxima seção): um título `## <ID>: <título>` por eval, uma linha `Input:` e cada critério marcado como `[check: ...]` ou `[manual]`.

## Dois tipos de critério

| | `[check: ...]` | `[manual]` |
|---|---|---|
| Quem decide | O script | Você |
| Bom para | Fatos: um veredito, um arquivo, um hook | Julgamento: tom, raciocínio, adequação |
| Exemplo | "O revisor dá PASS" | "A resposta soa como nós" |

As checagens que o script conhece:

| Checagem | Passa quando |
|---|---|
| `verdict pass` / `verdict fail` | O veredito final do revisor é esse |
| `max-review-fails <n>` | O revisor disse FAIL no máximo n vezes |
| `file-exists <caminho>` | Esse arquivo existe depois da execução |
| `hook-blocked <nome-do-hook>` | Essa guarda do Módulo 5 bloqueou algo |
| `no-hook-blocked` | Nenhuma guarda precisou intervir |

As duas checagens de hook leem o log da sessão, que só existe depois do Módulo 7. Até lá, o script as devolve a você como manuais.

Quanto mais critérios você conseguir formular como checagem, menos há para fazer à mão. "O resultado é bom" não pode ser checado; "O revisor dá PASS" pode.

## O conjunto de evals

Um conjunto de evals (eval set) é uma coleção de evals que, juntas, cobrem o harness.

**10-15 evals** é um bom ponto de partida: o bastante para pegar regressões, não tantas que nunca cheguem a ser rodadas.

Regra prática: 3-4 por papel criador, 2-3 evals de pipeline, 3-4 evals de caso-limite.

## Como as evals são rodadas

Ninguém copia e cola quinze entradas num chat. Um script executor faz isso:

```
python metodo/evals/run_evals.py                  ← o conjunto inteiro
python metodo/evals/run_evals.py --only E01,E04   ← só estas
python metodo/evals/run_evals.py --list           ← mostra o que rodaria
```

Para cada eval, o script inicia o pipeline com a entrada daquela eval, exatamente como se você tivesse digitado `/<nome-do-pipeline> <entrada>`, espera terminar e roda as checagens. Depois grava duas coisas:

- **Um relatório por eval** em `metodo/evals/runs/<data-hora>/<ID>.md`: o que o script conferiu, o que sobra para você como lista de itens a marcar e o que o pipeline relatou.
- **Uma linha por eval** em `metodo/evals/results.md`: resultado, quantas checagens passaram, quantos critérios são seus, tokens e custo.

O resultado nessa linha é um destes:

| Resultado | Significado |
|---|---|
| `PASS` | Todo critério era uma checagem, e todas passaram |
| `OPEN` | Todas as checagens passaram; critérios manuais aguardam no relatório |
| `FAIL` | Pelo menos uma checagem falhou |
| `ERROR` | O pipeline não terminou |

Depois de percorrer os critérios manuais de uma eval `OPEN`, mude você mesmo a linha dela para `PASS` ou `FAIL`.

De onde vêm os dois números de uma linha:

- **Custo (USD)** é informado pelo próprio Claude Code ao fim de cada execução; o script o copia e não calcula nada. É precificado a tarifas de API. Se você usa o Claude Code por assinatura em vez de chave de API, não paga esse valor por execução; leia-o como forma de comparar execuções.
- **Tokens** vêm do log da sessão e ficam `-` até o Módulo 7 estar no lugar.

Duas coisas a saber antes da primeira execução:

- **Evals fazem trabalho real.** O pipeline grava arquivos reais, igual ao uso normal. O script se recusa a começar se o projeto tiver mudanças sem commit, para que depois tudo o que uma execução de eval produziu seja fácil de ver e de descartar.
- **Evals custam tokens.** Cada uma é uma execução completa do pipeline. A coluna de custo em `results.md` mostra quanto custa uma rodada; `--only` roda apenas as que uma mudança pode ter afetado.

## Quando as evals são rodadas

- **Depois de toda atualização de modelo:** um modelo novo pode se comportar de forma diferente
- **Depois de toda mudança no harness:** regra nova, hook novo, arquivo de papel alterado
- **Diante de comportamento inesperado:** o agente faz algo inesperado; então escreva uma eval, reproduza, corrija

Evals não são uma configuração única. Elas crescem com o harness.

## Perguntas para a pessoa

- Quais comportamentos do harness são inegociáveis?
- Qual seria um sinal claro de que o harness parou de funcionar corretamente?
- Para cada papel: qual é um caso de teste realista, e qual é o resultado esperado?

## O que é construído

*(Adaptado para o layout de método portável.)*

- `metodo/evals/eval-set.md`: 10-15 evals nas três categorias, no formato acima
- `metodo/evals/gabaritos/`: as respostas esperadas (gabaritos), um arquivo por eval que precisar de um. Os agentes de produção têm o acesso de leitura a esta pasta negado via `.claude/settings.json`; só o executor e a pessoa a leem.
- `metodo/evals/run_evals.py`: o executor — **porte fiel em Python** do `templates/run-evals.js` deste skill (o template é referência de comportamento, não cópia: mesmo formato de relatório, mesmas regex, marcador `VERDICT: PASS/FAIL` em inglês, stdin/arquivos lidos como UTF-8). Sem ambiente para rodá-lo, rode as evals conversando — o Claude executa cada eval e a pessoa avalia contra o gabarito. Evals de pipeline rodam em **modo eval** (ver SKILL.md do `construir`): aprovação humana registrada como "simulada — modo teste", nunca pulada em silêncio, ou o trajeto termina antes da aprovação.
- `metodo/evals/results.md` e `metodo/evals/runs/`: criados pelo executor na primeira execução. A verificação de deriva do Módulo 7 compara com `results.md`.

## Notas de condução

- Não invente o comportamento do executor do zero: porte fielmente `templates/run-evals.js` (testado contra execuções reais de pipeline) para Python. O executor precisa do comando `claude` no PATH (caso contrário, defina `CLAUDE_BIN`).
- Antes de marcar o módulo como concluído: rode `--list` para confirmar que toda eval é lida corretamente, depois rode uma eval de verdade com `--only` e leia o relatório dela junto com a pessoa. O conjunto completo pode esperar; uma execução real, não.
- O executor inicia o Claude Code sem janela de chat, então não há ninguém para aprovar um pedido de permissão. Edições de arquivo são permitidas automaticamente; qualquer outra coisa de que um papel precise (comandos de shell, ferramentas MCP) tem de estar permitida no `.claude/settings.json` em `permissions`, ou a execução trava ou falha. Se a primeira execução real terminar em `ERROR`, confira isto primeiro.
- Se um papel grava num sistema externo por meio de um servidor MCP, uma execução de eval grava lá também, e o git não consegue desfazer isso. Pergunte sobre isso antes da primeira execução. Aponte essas evals para um ambiente de teste, ou deixe-as fora do conjunto automatizado e anote no `HANDOUT.md`.
- Um critério que o executor não reconhece é entregue à pessoa como manual, com uma nota. Confira no `--list` contagens de checagens inesperadamente baixas.
- Para critérios de trajetória ("conferiu primeiro se já existia um registro"), os arquivos de handoff do Módulo 4 são a evidência. Mantenha-os `[manual]`, a menos que uma checagem consiga expressá-los.
- O melhor é começar pelas evals mais enraizadas numa falha real, já vivida; elas são mais concretas que as inventadas.
- Se uma eval for difícil de formular, muitas vezes é sinal de que a regra subjacente no `AGENTS.md` ainda está vaga demais. Uma volta rápida ao Módulo 1 costuma ajudar.
