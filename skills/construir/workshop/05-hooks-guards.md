# Módulo 5: Hooks e guardas

## Ideia central

Agora existe uma linha de montagem com papéis especializados, handoffs claros e um revisor.

Mas agentes às vezes esquecem, sem querer. Uma etapa é pulada. Uma checagem fica de fora. Uma ação de acompanhamento não é disparada porque ninguém pensou nela naquele momento.

**Hooks resolvem isso.** São código determinístico que roda automaticamente em certos pontos, independentemente de um papel ter se lembrado de fazê-lo.

Um hook não tem inteligência e nunca esquece. Ele simplesmente aplica uma regra, toda vez.

## A analogia: segurança da porta vs. consultor

Um papel (agente) é como um consultor: pensa junto, dá recomendações, toma decisões.

Um hook é como o segurança da porta: confere uma única regra e deixa passar ou não. Sem discussão, sem exceções.

```
Agente: "Terminei X e acho que Y também está atualizado."
Hook:   [confere automaticamente] "Y não foi alterado. PARE."
```

Naquele momento o hook sempre vence, porque não tem opinião, só uma regra.

## Pré-hooks vs. pós-hooks

**Pré-hook:** roda *antes* de uma ação acontecer, impedindo que algo errado seja executado.
**Pós-hook:** roda *depois* de uma ação acontecer, garantindo que o resultado está correto e disparando ações de acompanhamento.

```
Pré-hook  →  [ação do papel]  →  Pós-hook
```

## Derivando hooks das regras rígidas

Um hook nasce de fazer uma pergunta ao Módulo 1 (regras rígidas) e ao Módulo 4 (handoffs): **um papel pode esquecer isto? Se sim, hook.**

Seis padrões que aparecem em quase todo domínio. A implementação concreta decorre do intake, não desta lista:

**1. Checagem de formato/regra (pré)**
A saída viola uma regra rígida do `AGENTS.md`? (Análogo a: nada de valores fixos no código)

**2. Checagem de existência de referência (pré)**
Um papel referencia algo que ainda não existe? (Análogo a: token referenciado não existe)

**3. Checagem de mudança incompatível (pré)**
Um papel altera ou apaga algo que outros já consomem? (Análogo a: mudança de API pública sem ordem de migração)

**4. Hook de sincronização automática (pós)**
Algo mais precisa ser atualizado automaticamente depois desta mudança? (Análogo a: ressincronizar a camada de contexto depois de toda mudança)

**5. Checagem de patamar de qualidade (pós)**
Existe um padrão mensurável de qualidade que precisa ser conferido toda vez? (Análogo a: checagem de contraste segundo a WCAG)

**6. Checagem de completude (pós)**
A saída está completa em relação ao que deveria cobrir? (Análogo a: histórias de documentação faltando)

Nem todo domínio precisa dos seis. Alguns precisam só de dois, mais um que não está nesta lista; tudo bem.

## Como os hooks funcionam no Claude Code

O Claude Code suporta hooks via `settings.json`. Hooks são comandos de shell ou scripts que o Claude Code executa automaticamente em certos eventos.

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/harness/hooks/<nome-da-checagem>.js\"" }
        ]
      }
    ]
  }
}
```

Ou seja, um hook é um script que roda num evento específico. O script em si é código comum, sem IA, sem agente.

- `PreToolUse` é o pré-hook: roda antes de uma ferramenta ser usada e pode impedi-la. `PostToolUse` é o pós-hook: a ação já aconteceu, então o script só pode relatar ou disparar uma ação de acompanhamento.
- `matcher` diz quais ferramentas o hook observa. `Write|Edit` cobre as duas formas de um papel alterar um arquivo; `Write` sozinho deixa passar toda edição num arquivo existente.
- O script recebe os detalhes da ação (qual ferramenta, qual arquivo, qual papel) e responde com permitir ou bloquear, mais uma razão. O papel vê essa razão e pode se corrigir.

Hooks valem automaticamente para todo papel, inclusive o revisor e todos os papéis criadores. Essa é a diferença em relação à lista `tools` do Módulo 3: `tools` decide o que um papel pode tocar, para começo de conversa; hooks conferem o que ele faz com isso.

## Hooks vs. revisor: a diferença

| | Revisor (agente) | Hook |
|---|---|---|
| Tipo | Agente de IA | Código determinístico |
| Decide sobre | Qualidade, contexto, completude | Uma única regra |
| Pode esquecer | Sim (raramente) | Não, nunca |
| Pode discutir | Sim | Não |
| Custa tokens | Sim | Não |
| Quando | Como uma etapa do pipeline | Automaticamente, a cada gatilho |

Hooks e revisor se complementam: o hook pega erros mecânicos, o revisor julga a qualidade.

## Perguntas para a pessoa

- Que regra nunca pode ser quebrada, em nenhuma circunstância? (Esse é quase sempre o primeiro hook que vale construir)
- Onde uma etapa esquecida causou mais dor no passado, mesmo sem IA?
- Quais dos seis padrões acima servem para este domínio, e quais não?

## O que é construído

*(Adaptado para o layout de método portável.)*

- Um script por hook, em `metodo/checagens/hooks/`, ex.: `metodo/checagens/hooks/<nome-da-checagem>.py` — Python (preferido) ou PowerShell; nunca bash puro sem alternativa Windows.
- A ligação no `.claude/settings.json`, para que os hooks rodem de fato automaticamente. Esse arquivo é o único lugar que diz qual hook roda quando — e ele sempre carrega as regras de negação permanentes que mantêm os agentes de produção fora de `metodo/evals/gabaritos/`.
- Este módulo é conduzido pelo skill `guardas` deste plugin: ele levanta as regras na própria linguagem de domínio da pessoa e as traduz em hooks.

## Notas de condução

- Se o `.claude/settings.json` já existir, mescle a nova entrada nele e mantenha todo o resto. Mostre o resultado à pessoa antes de gravar.
- Pergunte qual runtime de script está instalado (Node, Python, shell puro) e escreva o hook nele. Um hook numa linguagem que a máquina não consegue executar falha em silêncio.
- Antes de escrever o primeiro script, confira o formato atual de entrada e saída de hooks na documentação do Claude Code. Teste cada hook uma vez com uma ação que deveria ser bloqueada e uma vez com uma que não deveria.
- Mudanças em settings passam a valer sem reiniciar. `/hooks` mostra o que está ativo.
- Comece pelo hook que cobre o modo de falha passado mais caro, não pelos seis padrões de uma vez.
- Um hook que nunca dispara não é problema. Um hook que dispara o tempo todo é sinal de um problema de contexto lá no Módulo 1 ou 2 (regras da casa ou um arquivo de papel), não primariamente um problema de hook.
