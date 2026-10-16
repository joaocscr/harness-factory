# Módulo 4: Design multi-agente

## Ideia central

Agora existem vários papéis especializados. Cada um sabe o que faz e o que não faz.

Mas quem começa? Quem passa o quê para quem? O que acontece quando um papel termina: o próximo começa automaticamente, ou alguém precisa dar a partida?

Isso é design multi-agente: **a ordem, os handoffs e as regras que determinam quem é o próximo.**

## A analogia da fábrica

Imagine uma linha de montagem:

```
Matéria-prima → Estação 1 → Estação 2 → Controle de qualidade → Produto acabado
```

Cada estação tem uma tarefa. Nenhuma estação começa antes de a anterior terminar. O controle de qualidade normalmente acontece no fim de uma estação, não em algum ponto no meio, onde pode ser esquecido.

O harness funciona do mesmo jeito. A pergunta é: como é essa linha de montagem neste domínio?

## Os dois padrões básicos

**1. Sequência: um depois do outro**
```
Papel A → Papel B → Papel C
```
Cada papel espera a saída do anterior. Simples, previsível, fácil de depurar. Desvantagem: lento se as tarefas forem, na verdade, independentes entre si.

**2. Paralelo: vários ao mesmo tempo**
```
Papel A ──┐
          ├── Revisor
Papel B ──┘
```
Vários papéis trabalham ao mesmo tempo, e o revisor confere o que eles devolvem. Mais rápido, porém mais complexo; os handoffs precisam ser definidos com precisão.

**Para começar:** a sequência é quase sempre a porta de entrada certa. O paralelo vem quando o ritmo já é conhecido.

## Derivando a sua própria linha de montagem

A partir dos papéis do Módulo 2, normalmente surge um padrão como este:

```
1. Papel criador 1
      ↓
2. Revisor           ← primeira checagem de qualidade
      ↓ (só se PASS)
3. Papel criador 2 (se aplicável)
      ↓
4. Revisor           ← segunda checagem de qualidade
      ↓ (só se PASS)
5. Papel de documentação/saída (se aplicável)
      ↓
6. Papel de contexto/memória   ← geralmente o último, mantém o contexto persistente atualizado
```

O revisor muitas vezes aparece mais de uma vez, uma depois de cada papel criador. Isso não é erro, é intencional: pegar erros cedo é mais barato que pegá-los tarde.

Isto é um padrão, não uma regra fixa. A ordem real surge da conversa com a pessoa, não deste modelo.

## Handoffs: a passagem entre papéis

Um handoff é o momento em que um papel termina e o próximo começa.

Um bom handoff define:
- **O que é passado adiante**: quais arquivos/dados, em que formato
- **O que o próximo papel faz primeiro**, para que ele não precise adivinhar
- **O que acontece se algo estiver faltando**: o papel pergunta, não adivinha

Ruim:
```
Papel A: "Aqui está o resultado."
Papel B: [adivinha o que se quis dizer]
```

Bom:
```
Saída do Papel A:
- Artefatos alterados/novos: [lista concreta]
- Revisor deu PASS em: [data]
→ O Papel B pode começar
```

### Handoffs são arquivos

Cada papel roda no seu próprio contexto (Módulo 2). O Papel B nunca viu o que o Papel A pensou ou disse; ele só sabe o que lhe é entregue. Por isso o handoff tem de existir como arquivo:

```
harness/handoffs/<tarefa>/
  01-<papel-a>.md      ← o que o Papel A produziu e onde está
  02-reviewer.md       ← VERDICT: PASS / FAIL mais as razões
  03-<papel-b>.md
  04-reviewer.md
```

Os números simplesmente vão subindo. Se o revisor disser FAIL, a tentativa corrigida e a revisão dela viram os dois arquivos seguintes; nada é sobrescrito.

Todo papel encerra o trabalho com uma nota curta de handoff como resposta. O pipeline salva essa nota como o próximo arquivo numerado e passa o caminho ao papel seguinte. Isso vale também para o revisor: ele não pode gravar arquivos (Módulo 2), então responde com o veredito e o pipeline o registra.

A pasta serve também de registro do que aconteceu numa tarefa, e o Módulo 7 se apoia nisso.

## E se um papel receber FAIL?

```
Revisor: FAIL
  ❌ [razão concreta]

O papel criador recebe o retorno:
  → Corrige
  → Devolve ao revisor

Revisor: PASS
  → O próximo papel pode começar
```

Isso é um **ciclo de retorno**: o harness se corrige sem intervenção constante. Esse é o núcleo da engenharia agêntica.

Um ciclo precisa de uma saída. Depois de um número fixo de tentativas de correção fracassadas, o pipeline para e entrega a tarefa ao humano, com as últimas razões do revisor anexadas. Sem esse limite, dois papéis podem discutir para sempre na sua conta.

## A skill de pipeline

Para tudo isso funcionar, alguém precisa dar a partida na linha e chamar os papéis em ordem. Essa é a **skill de pipeline**: uma skill que roda na conversa principal e entrega cada etapa ao papel certo.

```markdown
---
name: <nome-do-pipeline>
description: Roda a linha de montagem <nome-do-pipeline> para uma tarefa.
argument-hint: [descrição da tarefa]
disable-model-invocation: true
---

Tarefa: $ARGUMENTS

Execute estas etapas em ordem. Use o subagente indicado em cada etapa; não faça você mesmo o trabalho de um papel.

1. Crie `harness/handoffs/<slug-da-tarefa>/`. Salve ali cada resposta como o próximo
   arquivo numerado (`01-<papel>.md`, `02-<papel>.md`, ...), rodadas de correção incluídas.
2. Chame `<papel-a>` com a tarefa. Salve a resposta.
3. Chame `reviewer` com o caminho desse arquivo. Salve a resposta.
   - `VERDICT: FAIL`: chame `<papel-a>` de novo com o caminho do arquivo do revisor, depois o revisor de novo. Depois de <N> tentativas fracassadas, pare e reporte à pessoa.
   - `VERDICT: PASS`: continue.
4. Chame `<papel-b>` com o caminho do último handoff de `<papel-a>`. ...
```

A pessoa dá a partida com uma linha:

```
/<nome-do-pipeline> <descrição concreta da tarefa>
```

`disable-model-invocation: true` significa que a linha só começa quando a pessoa digita esse comando, nunca por iniciativa do próprio Claude. `$ARGUMENTS` é substituído pelo que vier depois do comando.

Por que uma skill e não mais um papel? O pipeline é um procedimento a ser seguido pela conversa principal (Módulo 2: uma skill acrescenta conhecimento ao contexto atual). A conversa principal é também o único lugar que vê todos os handoffs, e é isso que lhe permite decidir quem é o próximo.

## Perguntas para a pessoa

- O padrão acima vale para este domínio, ou a ordem é diferente?
- Há casos especiais? (Só uma etapa parcial sem as outras, fluxos de exceção …)
- O que acontece no FAIL: quantas tentativas de correção antes de um humano intervir?
- O que exatamente é passado adiante em cada handoff?

## O que é construído

*(Adaptado para o layout de método portável — veja o SKILL.md principal de `construir` para a estrutura-alvo completa.)*

- `metodo/skills/<nome-do-pipeline>.md`: a linha de montagem completa, com handoffs e o limite de FAIL — este é o documento de método portável, independente do Claude Code. As etapas obrigatórias (intake, checagens determinísticas, revisão independente, aprovação humana) são marcadas **[obrigatória — nunca pular]**.
- `.claude/skills/<nome-do-pipeline>/SKILL.md`: um wrapper fino (frontmatter + "leia e siga `metodo/skills/<nome-do-pipeline>.md`"), iniciado com `/<nome-do-pipeline> <tarefa>`. O wrapper referencia o método; o método nunca referencia o wrapper.
- `_trabalho/handoffs/.gitkeep`: a pasta onde o pipeline grava os arquivos de handoff (artefatos de execução, não método).
- A seção Saída de cada arquivo de papel, atualizada para que o papel termine com a nota de handoff que a próxima etapa espera.
- O pipeline precisa incluir uma etapa de revisor independente que roda em contexto limpo (um papel que não viu a produção) e um ponto explícito de aprovação humana antes da entrega.

## Notas de condução

- A skill de pipeline chama os papéis; papéis nunca chamam uns aos outros. Mantenha todas as etapas na skill, mesmo que aninhar pareça mais arrumado.
- Não adicione `context: fork` à skill de pipeline. Ela precisa rodar na conversa principal para chamar os papéis um depois do outro.
- Um caso especial vindo das perguntas (ex.: "só uma etapa parcial") vira uma pequena skill de pipeline própria, não um desvio dentro da principal.
- Se `.claude/skills/` não existia antes deste módulo, diga à pessoa para rodar `/reload-skills` ou abrir uma sessão nova antes de tentar `/<nome-do-pipeline>`.
- Pergunte se os arquivos de handoff devem entrar nos commits. Padrão: sim, eles são a trilha de auditoria. Se as tarefas tiverem conteúdo sensível, adicione `_trabalho/handoffs/` ao `.gitignore` em vez disso.
- Quando os arquivos existirem, ofereça uma execução de teste real com a tarefa de exemplo do intake. Um pipeline que nunca rodou não está pronto.
- Comece pela sequência, mesmo que o paralelo seja tentador. No início, a facilidade de depurar importa mais que a velocidade.
- Se o revisor aparecer só uma vez, bem no fim, pergunte se uma checagem mais cedo não compensaria. Geralmente compensa.
