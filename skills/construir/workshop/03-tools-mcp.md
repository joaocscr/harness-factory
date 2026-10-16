# Módulo 3: Ferramentas e MCP

## Ideia central

Até aqui, definimos quem são os agentes e quais são as regras deles. Mas, por enquanto, os agentes só conseguem pensar; ainda não conseguem fazer nada.

Um agente que só lê e escreve texto é como alguém sem acesso às ferramentas reais do ofício. Tem o conhecimento, mas não tem as mãos.

**Ferramentas** dão mãos a um agente. Elas permitem que ele:
- Leia e grave arquivos
- Chame APIs
- Inspecione sistemas externos
- Valide coisas
- Use serviços externos

## O que é uma ferramenta

Uma ferramenta é uma função que o agente pode chamar. Ele decide sozinho quando precisa de qual ferramenta, com base na sua tarefa e no contexto.

Do ponto de vista do agente, uma ferramenta tem esta cara:

```
Nome:         read_record
Descrição:    Lê um registro do sistema de registro oficial
Entrada:      { "id": "..." }
Saída:        O conteúdo como dados estruturados
```

O agente lê a descrição e decide: "Preciso desta informação para conferir se X já existe. Vou chamar esta ferramenta."

A descrição é o que mais importa. Uma ferramenta mal descrita é usada errado pelo agente, ou nem é usada.

## O que é MCP

MCP significa **Model Context Protocol**, um padrão aberto que define como ferramentas são trocadas entre sistemas.

Pense nele como uma tomada:
- Antigamente, cada provedor de IA tinha sua própria API de ferramentas, incompatível com todas as outras
- O MCP é a tomada padronizada: uma ferramenta que fala MCP funciona com qualquer agente que entenda MCP

Isso significa que um servidor MCP que outra pessoa construiu (ex.: para Figma, GitHub, um banco de dados) funciona na hora no seu próprio harness. Você não precisa construí-lo.

```
Agente (um papel no Claude Code)
    ↕ MCP
Servidor MCP (Figma, sistema de arquivos, GitHub, sistema interno...)
    ↕
Sistema externo
```

## Dois tipos de ferramenta

**1. Ferramentas nativas**
Disponíveis diretamente no sistema de agentes: ler/gravar arquivos, executar código, busca na web. Não precisam ser instaladas; basta um papel tê-las na sua lista.

**2. Servidores MCP**
Servidores externos que oferecem ferramentas especializadas, exatamente para o sistema com que este domínio trabalha. Precisam ser configurados: quais servidores estão disponíveis.

## De que ferramentas este harness precisa?

Percorra os papéis do Módulo 2 e pergunte, para cada um: o que ele precisa ler? O que ele precisa gravar? A que sistema externo ele precisa acessar?

| Papel | Precisa | Ferramenta |
|---|---|---|
| *(do Módulo 2, papel 1)* | *(ler/gravar/conferir o quê)* | *(Sistema de arquivos / servidor MCP / sob medida)* |
| *(do Módulo 2, papel 2)* | … | … |
| Revisor | Capacidade de ler tudo o que os outros produziram | `Read, Grep, Glob` (geralmente basta) |

Duas ou três categorias de ferramenta costumam cobrir quase tudo; o resto é opcional ou muito específico.

## Como as ferramentas são configuradas

Dois lugares, duas perguntas.

**1. Que servidores existem?** Um arquivo na raiz do projeto, `.mcp.json`:

```json
{
  "mcpServers": {
    "<nome>": {
      "command": "<comando-do-servidor-mcp>",
      "args": ["<argumento>"]
    }
  }
}
```

**2. Que papel pode usar o quê?** A linha `tools` em cada arquivo de papel do Módulo 2:

```markdown
---
name: <papel-criador>
description: ...
tools: Read, Grep, Glob, Write, Edit, mcp__<servidor>__<ferramenta>
---
```

`tools` é uma lista de permissão: um papel pode usar o que está listado e nada mais. Ferramentas nativas vão pelo nome (`Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`). Ferramentas de um servidor MCP se chamam `mcp__<servidor>__<ferramenta>`; `mcp__<servidor>` sozinho concede todas as ferramentas que aquele servidor oferece.

É aqui que os limites do Módulo 2 passam a ser aplicáveis de fato. Um papel cujo arquivo diz "não altera a fonte da verdade" e cuja linha `tools` não tem ferramenta de gravação para ela não consegue cruzar essa linha, nem por engano.

Para o revisor, liste as ferramentas MCP uma a uma e só as que leem. `mcp__<servidor>` entregaria a ele também as ferramentas de gravação do servidor.

## Descrições de ferramentas são contexto

Este é o ponto mais importante deste módulo: **ferramentas não são só funções, são contexto.**

Uma boa descrição diz ao agente quando usar a ferramenta. Uma descrição ruim leva o agente a ignorar a ferramenta ou a usá-la mal.

Ruim:
```
Nome: get_file
Descrição: Pega um arquivo
```

Bom:
```
Nome: get_record
Descrição: Lê um registro do sistema de registro oficial.
Use antes de criar algo novo, para conferir se já existe.
Devolve o conteúdo completo do registro solicitado.
```

## Perguntas para a pessoa

- Para cada papel do Módulo 2: o que ele precisa ler/gravar/conferir?
- Que ferramentas/sistemas já usados no dia a dia o agente deveria acessar? (Do intake; concretize aqui)
- Já existe um servidor MCP para isso (oficial ou da comunidade), ou é preciso construir algo sob medida?

## O que é construído

- `.mcp.json` na raiz do projeto: quais servidores MCP estão ativos (pule se nenhum papel precisar de sistema externo)
- A linha `tools` em todo arquivo de papel em `.claude/agents/`, atualizada para o que aquele papel realmente precisa
- Onde um papel deve usar uma ferramenta num momento específico ("conferir se já existe um registro antes de criar um"), essa frase vai para a seção Processo do papel
- Opcional: `harness/tools/tool-descriptions.md`, uma visão geral simples, para humanos, de qual papel usa qual ferramenta. Os agentes não o carregam.

## Notas de condução

- Se o `.mcp.json` já existir, acrescente a ele; não o substitua. Mostre o resultado à pessoa antes de gravar.
- Nunca grave segredos (chaves de API, tokens) no `.mcp.json`. Referencie uma variável de ambiente em vez disso (`"${API_KEY}"`) e anote no `HANDOUT.md` que ela precisa ser definida.
- O Claude Code pede aprovação antes de usar servidores do `.mcp.json` de um projeto. Diga à pessoa para abrir uma sessão nova e aprová-los, depois confira com `/mcp` que estão conectados.
- Você não escreve as descrições das ferramentas de um servidor MCP existente; o servidor as traz. A lição "descrição boa vs. ruim" vale para ferramentas sob medida e para a forma como o arquivo de papel diz a um papel quando usar uma ferramenta.
- Se não estiver claro se existe um servidor MCP, diga isso abertamente. Não chute nem invente um. Pesquise, se possível, ou sinalize no `HANDOUT.md` como item em aberto.
- Comece pequeno: duas ferramentas bem descritas valem mais que dez feitas pela metade.
