---
name: guardas
description: "Transforma regras ditas em linguagem natural ('nunca envie nada sem eu aprovar', 'sempre confira os números antes de fechar') em travas automáticas (hooks) do harness da pessoa. Use quando ela pedir para 'criar uma regra/guarda/trava/proteção para quando o agente fizer X', 'impedir que aconteça Y', 'sempre exigir Z antes de W' — e no módulo 5 (guardas) do skill 'construir'. Para construir o harness inteiro use 'construir'; para só conferir qualidade use 'validar'. Conceito inspirado no hookify (Anthropic), reescrito do zero."
---

# Guardas — a regra da casa vira trava automática

Uma **guarda** é uma regra que não depende de ninguém lembrar dela: o próprio sistema impede (ou exige) a ação. Explique assim à pessoa: *"é a diferença entre 'combinamos que ninguém envia sem revisar' e 'o sistema não deixa enviar sem revisar'"*.

Você conduz; a pessoa nunca vê JSON, evento ou matcher — ela vê a regra dela, dita de volta em português claro.

## Fluxo

### 1. Elicitar (1–3 perguntas por vez, no vocabulário do domínio)

- "O que **nunca** pode acontecer aqui, aconteça o que acontecer?" (quase sempre é a primeira guarda que vale construir)
- "O que **sempre** tem que acontecer antes de [entregar/enviar/fechar]?"
- "Onde um passo esquecido já causou o maior prejuízo — mesmo antes de usar IA?"

Se a resposta for vaga ("qualidade"), peça o último caso concreto em que doeu.

### 2. Traduzir cada regra para evento + alvo + ação

Mapa interno (não mostre a tabela; use-a):

| A regra é sobre... | Evento de hook | Ação típica |
|---|---|---|
| impedir uma ação antes de acontecer ("nunca enviar/apagar/alterar X") | `PreToolUse` | bloquear e explicar o porquê |
| conferir o que acabou de ser feito ("todo número conferido após gerar") | `PostToolUse` | rodar checagem; avisar ou corrigir |
| exigência no fim do trabalho ("não encerrar sem o resumo/handoff") | `Stop` | barrar o encerramento até cumprir |
| preparar/lembrar no início | `SessionStart` | injetar o lembrete/contexto |
| reagir ao que a pessoa pediu ("se eu pedir X, lembre de Y") | `UserPromptSubmit` | acrescentar contexto |

Decida: a checagem cabe numa condição simples (hook direto) ou precisa de lógica (script em `metodo/checagens/hooks/`, **Python ou PowerShell — nunca bash puro**, saindo com código 2 e mensagem clara **em stderr** quando bloquear)?

**Encoding (obrigatório em todo hook Python):** no Windows, o Python lê stdin como cp1252 por padrão e corrompe acentos — um bloqueio por texto corrompido barra trabalho correto e o leigo não tem como diagnosticar. Todo hook gerado lê a entrada com `sys.stdin.buffer.read().decode("utf-8")` e reconfigura a saída com `sys.stderr.reconfigure(encoding="utf-8")` (bug real encontrado em teste, 15/10/2026).

### 3. Mostrar em linguagem leiga e aprovar

Antes de gravar, devolva cada regra: *"Vou instalar a trava: sempre que o assistente tentar [ação], o sistema [bloqueia e diz o motivo / roda a conferência]. Isso cobre o que você descreveu?"* Só grave com o sim.

### 4. Gravar

- Hooks entram em `.claude/settings.json` do harness alvo — **nunca sobrescreva**: leia o que existe, acrescente, mostre o resultado. Conflito com hook existente no mesmo evento? Pare e pergunte.
- Scripts entram em `metodo/checagens/hooks/` (são parte do método portável: a regra de negócio da trava vale em qualquer plataforma; só a amarração é do Claude Code).
- O formato exato de entrada/saída de hooks muda entre versões do Claude Code: **confirme na documentação atual antes de gravar o primeiro hook** e teste cada um — uma vez com ação que deve ser bloqueada, uma com ação que deve passar.
- Quando a mudança passa a valer varia com a versão do Claude Code: a documentação atual (verificada em 16/10/2026) diz que edições no settings são "normalmente captadas automaticamente", mas versões houve em que exigiam confirmação ou nova sessão. Por isso **nunca declare a guarda ativa pelo relógio: o teste obrigatório (um bloqueio + uma passagem) é o que confirma que ela passou a valer** — e, se o teste não disparar, reiniciar a sessão é o primeiro remédio.

## Exemplo completo (modelo a adaptar, não colar)

Regra da pessoa: *"nada sai daqui para fora sem a minha aprovação"*.

Tradução: bloquear ferramentas que enviam/publicam, orientando a pedir aprovação.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "SendUserFile|Artifact|mcp__.*send.*",
        "hooks": [
          {
            "type": "command",
            "command": "python \"${CLAUDE_PROJECT_DIR}/metodo/checagens/hooks/exige_aprovacao.py\""
          }
        ]
      }
    ]
  }
}
```

E `exige_aprovacao.py` sai com código 2 e a mensagem **em stderr** (é de lá que o agente a lê; stdout não chega a ele no bloqueio): `"Trava da casa: entregas externas exigem aprovação registrada da pessoa. Peça a aprovação e registre antes de enviar."` — o agente lê, para, e pede.

## O que guarda não é

- Guarda que dispara o tempo todo não é guarda, é sintoma de regra da casa mal escrita (módulo 1 do `construir`) — conserte lá.
- Não crie guardas que ninguém pediu "por segurança": cada trava é fricção; só o que a pessoa declarou como regra.
