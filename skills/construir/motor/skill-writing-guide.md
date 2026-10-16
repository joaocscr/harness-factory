# Guia de redação de skills

Explica em detalhe como elevar a qualidade dos skills criados pelo harness. É material de referência que complementa a etapa 4 do `modo-direto.md`.

---

## Sumário

1. [Como escrever a `description`](#1-padrão-de-redação-da-description)
2. [Como escrever o corpo](#2-estilo-de-redação-do-corpo)
3. [Como definir o formato de saída](#3-padrão-de-definição-do-formato-de-saída)
4. [Como escrever exemplos](#4-padrão-de-redação-de-exemplos)
5. [Como carregar por etapas só a informação necessária](#5-padrão-progressive-disclosure)
6. [Critério para decidir se scripts devem ser empacotados](#6-critério-para-empacotar-scripts)
7. [Padrão de schemas de dados](#7-padrão-de-schemas-de-dados)
8. [O que não colocar no skill](#8-o-que-não-incluir-no-skill)
9. [Design de reutilização de skills](#9-design-de-reutilização-de-skills)

---

<a id="1-padrão-de-redação-da-description"></a>

## 1. Como escrever a `description`

Os campos do skill expostos ao Claude são `name` e `description`, e as condições concretas de acionamento vão na `description`. O Claude lê esses dois campos e decide qual skill usar.

### Como um skill é acionado

O Claude tende a não acionar skills em tarefas simples, que resolve facilmente só com as ferramentas básicas. Por exemplo, um pedido simples como "lê este PDF pra mim" pode não acionar o skill mesmo que a `description` esteja bem escrita. Quanto mais complexa for a tarefa — passando por várias etapas ou exigindo julgamento especializado —, maior a chance de o skill ser acionado.

### Princípios de redação

1. Escreva tanto **o que o skill faz** quanto **as situações concretas em que ele deve ser acionado**.
2. Se houver casos que parecem parecidos mas em que o skill não deve ser acionado, escreva com clareza o escopo de aplicação e as condições de exclusão.
3. Levando em conta que o Claude decide de forma conservadora se aciona um skill, descreva de forma um tanto enfática as situações em que ele deve ser acionado.
4. Em skills que coordenam várias tarefas, inclua obrigatoriamente **palavras que indicam trabalho de seguimento** (reexecução, correção, complemento, melhorar resultado anterior).

### Bom exemplo

```yaml
description: "Lê arquivos PDF e extrai texto e tabelas, e faz mesclagem, divisão, rotação, marca d'água,
  criptografia e descriptografia, e OCR. Sempre que o usuário mencionar um arquivo .pdf ou pedir um
  artefato em PDF, use obrigatoriamente este skill. É especialmente útil em tarefas que exigem
  conversão, edição ou análise, mais do que em pedidos simples para 'ler' um PDF."
```

### Maus exemplos

- `"Skill que processa dados"` — vago demais; não dá para saber que arquivos ou tarefas ele trata.
- `"Tarefas relacionadas a PDF"` — não diz que tarefas consegue fazer nem quando deve ser acionado.

<a id="2-estilo-de-redação-do-corpo"></a>

## 2. Como escrever o corpo

### Explique primeiro o motivo

Um modelo de linguagem de grande porte (LLM), quando entende por que uma regra é necessária, consegue julgar adequadamente também em situações de exceção. Em vez de só listar como ordens o que fazer e o que não fazer, é mais eficaz informar por que a regra deve ser seguida.

**Mau exemplo:**

```markdown
Para extrair tabelas, use sempre pdfplumber. Nunca use PyPDF2 para tabelas.
```

**Bom exemplo:**

```markdown
Ao extrair tabelas, use pdfplumber. O PyPDF2 é feito para extrair texto e
não preserva a estrutura de linhas e colunas das tabelas. O pdfplumber reconhece os limites das células
e devolve dados estruturados.
```

### Corrija na forma de princípios aplicáveis a vários casos

Ao encontrar um problema em um feedback ou teste, não acrescente uma instrução que sirva só para aquele exemplo específico. Corrija na forma de um princípio aplicável também a outros casos.

**Correção com overfitting:** `Se houver uma coluna "Receita Q4", converta essa coluna para número.`

**Correção generalizada:** `Se o nome da coluna contiver palavras que indicam valores numéricos, como "receita", "valor" e "quantidade", converta a coluna para tipo numérico. Valores que não puderem ser convertidos ficam como estão.`

### Escreva no imperativo

Em vez de formas descritivas e polidas como "isto é feito", "é possível fazer", escreva em formas diretas como "faça", "use". Isso porque o skill é um conjunto de instruções que um agente de IA deve seguir.

### Reduza a quantidade de informação consultada de uma vez

A quantidade de informação que o modelo consegue consultar de uma vez (context window) é limitada. Esse limite inclui não só as instruções do skill, mas também as demais informações necessárias para o trabalho. Avalie, pelos critérios abaixo, se cada frase é necessária o bastante para os tokens que ocupa.

- "É algo que o Claude já sabe?" → apague.
- "Sem esta explicação, o Claude erra?" → mantenha.
- "Um exemplo concreto é mais claro do que uma explicação longa?" → troque por exemplo.

<a id="3-padrão-de-definição-do-formato-de-saída"></a>

## 3. Como definir o formato de saída

Em skills em que o formato do artefato importa, especifique a estrutura a seguir.

```markdown
## Estrutura do relatório
Siga exatamente o template abaixo.

# [Título]
## Resumo
## Principais achados
## Recomendações
```

É mais eficaz escrever curta a explicação do formato e incluir junto um exemplo real.

**Artefatos que serão lidos pela etapa seguinte do workflow:** se a etapa seguinte lê e processa o artefato por código, especifique uma **estrutura JSON** em vez de um template em markdown. Escreva também que o texto final não é uma mensagem a ser mostrada ao usuário, e sim dados de retorno a passar para a etapa seguinte. Como o `agent()` do `Workflow` impõe o formato de retorno via `schema`, a estrutura definida no skill e a definida no script precisam coincidir.

<a id="4-padrão-de-redação-de-exemplos"></a>

## 4. Como escrever exemplos

Exemplos concretos transmitem a regra com mais clareza do que explicações longas.

```markdown
## Formato da mensagem de commit

**Exemplo 1:**
Entrada: adicionar autenticação de usuário usando token JWT
Saída: feat(auth): implementa autenticação JWT

**Exemplo 2:**
Entrada: corrigir bug em que o botão de mostrar senha não funciona na página de login
Saída: fix(login): corrige o funcionamento do botão de alternar exibição da senha
```

<a id="5-padrão-progressive-disclosure"></a>

## 5. Como carregar por etapas só a informação necessária (Progressive Disclosure)

### Forma 1: dividir os arquivos por área de negócio

```
bigquery-skill/
├── SKILL.md (visão geral + instrução para escolher a área de negócio)
└── references/
    ├── finance.md (receita, métricas de faturamento)
    ├── sales.md (oportunidades de venda, pipeline)
    └── product.md (uso da API, funcionalidades)
```

Quando o usuário pergunta sobre receita, carrega-se só `finance.md`.

### Forma 2: ler a instrução detalhada só quando necessário

```markdown
## Edição de documentos
Edições simples são feitas alterando o XML diretamente.
**Se for preciso rastrear alterações**, consulte [REDLINING.md](references/redlining.md).
```

### Forma 3: colocar sumário em material de referência grande

Em material de referência com mais de 300 linhas, coloque um sumário no topo do arquivo.

<a id="6-critério-para-empacotar-scripts"></a>

## 6. Critério para decidir se scripts devem ser empacotados

Examine o registro de trabalho dos agentes que executaram os testes. Se acontecerem repetidamente coisas como as abaixo, inclua o script ou o procedimento no skill.

| O que se repete | Ação |
|------------|------|
| Nos três testes é criado o mesmo script auxiliar. | Coloque o script em `scripts/`. |
| Toda vez é executado o mesmo comando `pip install` ou `npm install`. | Escreva no skill uma etapa de instalação de dependências. |
| Toda vez é seguido o mesmo procedimento de processamento em várias etapas. | Escreva no corpo do skill o procedimento padrão. |
| Depois de passar por erros parecidos, toda vez se contorna do mesmo jeito. | Escreva no skill os problemas conhecidos e a solução. |

Scripts incluídos no skill devem obrigatoriamente ser executados e verificados por você mesmo.

## 7. Padrão de schemas de dados

Use os schemas-padrão abaixo para que os dados possam ser trocados de forma consistente entre skills. Os mesmos schemas também podem ser usados ao testar e avaliar os skills criados pelo harness.

### `eval_metadata.json`

```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name-here",
  "prompt": "Prompt de tarefa do usuário",
  "assertions": [
    "O artefato contém X",
    "O arquivo foi gerado no formato Y"
  ]
}
```

### `grading.json`

```json
{
  "expectations": [
    {
      "text": "O artefato contém 'Seul'",
      "passed": true,
      "evidence": "Na terceira etapa foi confirmada a 'extração de dados da região de Seul'"
    }
  ],
  "summary": { "passed": 1, "failed": 0, "total": 1, "pass_rate": 1.0 }
}
```

**Atenção aos nomes de campo:** use exatamente `text`, `passed` e `evidence`. Não troque por outros nomes, como `name`/`met`/`details`.

### `timing.json`

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

Quando chegar a notificação de conclusão do subagente, salve imediatamente `total_tokens` e `duration_ms`. Os dois valores só podem ser vistos no momento em que se recebe a notificação e não podem ser recuperados depois.

<a id="8-o-que-não-incluir-no-skill"></a>

## 8. O que não colocar no skill

- Documentos acessórios como `README.md`, `CHANGELOG.md`, `INSTALLATION_GUIDE.md`
- Informação necessária só durante a criação do skill (resultados de teste, histórico de correções iterativas)
- Manual voltado ao usuário (o skill é um conjunto de instruções seguido por um agente de IA)
- Conhecimento geral que o Claude já tem
- Itens que só eram usados na v1 (`TeamCreate`/`TeamDelete`, flags experimentais, `model` atribuído em bloco a todos os agentes)

## 9. Design de reutilização de skills

Antes de criar um skill novo, compare suas funções com as dos skills existentes em `.claude/skills/`. Quando o harness é construído ou ampliado várias vezes, skills com a mesma função podem se acumular só com nomes diferentes.

| Relação com o skill existente | Ação |
|------|------|
| O skill existente já cobre toda a função nova | Não crie outro; ligue o skill existente ao agente. |
| Sobrepõe-se só em parte, e generalizando o skill existente ele assume também a função nova | Generalize e amplie o skill existente. |
| Sobrepõe-se em parte, mas o domínio foi especializado de propósito | Crie um skill separado. |
| O escopo funcional é completamente diferente | Crie um novo. |

**Princípio:** quanto mais um skill se concentra em um único papel, mais fácil é reutilizá-lo e menos duplicação há. Se ele tem dois ou mais papéis, avalie primeiro se dá para dividi-lo.

### Até onde generalizar

A generalização pode ir indefinidamente, então pare no escopo de responsabilidade que o skill se propôs a assumir. Mantenha a especialização de domínio intencional e retire só as dependências que se agregaram por acaso.

Por exemplo, ao generalizar um skill de "PDF de avaliação de risco de fintech", fica assim.

| Dependência retirada | Resultado |
|------|------|
| Fintech | "PDF de resultado de avaliação". Se o escopo de responsabilidade é o relatório de avaliação, pare aqui. |
| Avaliação | "Preenchimento de formulário em PDF". Se já existe um skill com a mesma função, não crie outro; use aquele skill. |

Se o escopo de responsabilidade foi definido desde o início como "avaliação de risco de fintech", não generalize; mantenha-o como skill separado.

Ampliar um skill existente pode mudar também o comportamento dos agentes que o usam. Antes de ampliar, verifique quais agentes usam esse skill e reflita na `description` o escopo de uso ampliado.
