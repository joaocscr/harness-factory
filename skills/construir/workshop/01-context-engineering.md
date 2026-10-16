# Módulo 1: Engenharia de contexto

## Ideia central

Imagine contratar alguém novo para este trabalho. No primeiro dia, a pessoa se senta diante de uma página em branco.
Do que ela precisa para fazer um bom trabalho?

- Que contexto, que tom, que expectativas?
- O que já existe: quais blocos, quais modelos?
- Que regras valem (estrutura, nomes, limites)?
- O que a organização já decidiu?
- O que não funcionou até agora?

Um agente de IA é exatamente igual. Ele começa toda tarefa sem memória, sem experiência, exceto o que você lhe dá.

**Engenharia de contexto** é a arte de fornecer exatamente o contexto certo. Nem pouco demais (o agente erra), nem demais (caro, lento, o agente perde o foco).

## O orçamento de tokens: por que contexto custa dinheiro

Cada palavra que um agente de IA recebe custa tokens. Tokens custam dinheiro.
Carregar um repositório ou arquivo inteiro em cada prompt é como mandar a wiki inteira da empresa para um colega novo todos os dias só para ele responder uma mensagem no Slack.

**A regra de ouro:** o agente recebe exatamente o que um contratado novo e experiente precisaria no primeiro dia, nem mais, nem menos.

## Os 4 tipos de contexto

| Tipo | O que é | Exemplo |
|---|---|---|
| **Persistente** | Sempre presente, raramente muda | Regras centrais, convenções de nomes |
| **Episódico** | Relevante para esta tarefa | "Estamos trabalhando neste caso/componente específico agora" |
| **Semântico** | Conhecimento do domínio | "X significa Y neste domínio, não Z" |
| **Procedimental** | Como as coisas são feitas | "Esclareça A primeiro, depois implemente B" |

Preencha a coluna de exemplo com os termos do intake; isso torna a tabela imediatamente palpável em vez de abstrata.

## O que pertence a um bom AGENTS.md

O `AGENTS.md` é o contexto persistente: sempre carregado, sempre ativo.

Ele fica na raiz do projeto, ao lado de um `CLAUDE.md` que contém uma única linha:

```markdown
@AGENTS.md
```

`CLAUDE.md` é o arquivo que o Claude Code carrega no início de toda sessão; a linha `@AGENTS.md` puxa as regras da casa para dentro. As regras em si ficam no `AGENTS.md`, um arquivo simples que outras ferramentas de agentes também conseguem ler. Todo papel construído no Módulo 2 também recebe esse contexto, automaticamente.

**Conteúdo mínimo, seja qual for o domínio:**

```
1. Stack e ferramentas  : Com o que se trabalha? (Ferramentas, sistemas, formatos)
2. Convenções           : Nomes, estrutura, língua
3. Regras rígidas       : O que NUNCA pode acontecer
4. Fluxo de trabalho    : Em que ordem o trabalho acontece
5. Escopo               : O que está DENTRO deste sistema, o que está FORA
```

**O que NÃO pertence aqui:**
- Tudo o que muda a cada tarefa (pertence ao prompt da tarefa)
- Arquivos grandes ou listas completas (pertencem a Ferramentas/MCP, Módulo 3)
- Explicações para leitores humanos (isso é documentação, não contexto de agente)

## A relação sinal-ruído

O conceito mais importante de toda a engenharia de contexto.

Contexto ruim: 80% ruído, 20% sinal. O agente produz resultados medíocres.
Contexto bom: 80% sinal, 20% estrutura. O agente produz resultados consistentes e de alta qualidade.

**Reconhecendo o ruído:** tudo de que o agente não precisa para concluir *esta* tarefa.

## Perguntas para a pessoa

**O seu domínio** (aprofunde aqui se ainda não foi respondido no intake):
- Qual é a fonte da verdade?
- Que categorias/blocos existem?
- Que convenção de nomes?
- Que língua para comentários/documentação?

**As suas regras:**
- O que um agente NUNCA deve fazer?
- Qual é a ordem? (O que vem primeiro, o que vem depois?)

**O seu escopo:**
- O que pertence a este harness?
- O que fica DELIBERADAMENTE de fora?

## O que é construído

- `AGENTS.md` na raiz do projeto, no formato acima, preenchido com as respostas do intake e deste módulo
- `CLAUDE.md` na raiz do projeto, contendo `@AGENTS.md`

## Notas de condução

- Se o projeto já tem um `AGENTS.md` ou `CLAUDE.md`, não o sobrescreva. Mostre à pessoa o que existe, acrescente as regras do harness como uma seção própria e adicione a linha `@AGENTS.md` ao `CLAUDE.md` existente se ela estiver faltando.
- Para confirmar que ele carrega: numa sessão nova, `/context` lista o `CLAUDE.md` entre os arquivos de memória.
- Depois do primeiro rascunho, percorra-o linha por linha junto com a pessoa e pergunte "sinal ou ruído?". Essa é a checagem de sinal da lição; não a pule.
- Se uma regra for vaga demais ("entregar boa qualidade"), peça um contraexemplo concreto. Como seria, especificamente, uma qualidade ruim?
- Este arquivo é o alicerce; tudo nos módulos seguintes se apoia nele. Curto e afiado é melhor que longo e vago.
