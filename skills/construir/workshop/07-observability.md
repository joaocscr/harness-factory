# Módulo 7: Observabilidade

## Ideia central

Agora existe um harness completo: regras da casa, papéis, ferramentas, pipeline, hooks, evals.

Mas como saber o que está de fato acontecendo? Quanto custa uma sessão? Por que um papel tomou esta decisão? Quando o harness começou a piorar?

Isso é observabilidade: a capacidade de olhar dentro do harness em funcionamento.

Sem observabilidade, você trabalha às cegas. As saídas ficam visíveis, mas não o porquê de terem saído assim. Os problemas só aparecem quando o estrago já está feito.

## As três camadas

**1. Logs: o que aconteceu?**
Cada ação, cada decisão, cada chamada de hook. O histórico completo de uma sessão.

**2. Traces: por que aconteceu?**
O caminho de raciocínio de um papel. Que ferramentas ele chamou, em que ordem, por quê?

**3. Métricas: quão bem está rodando?**
Custo em tokens, latência, taxa de PASS/FAIL do revisor, frequência de disparo dos hooks.

## O que observar de fato

### Custo em tokens por sessão
Toda interação custa tokens. Uma sessão com muitos papéis e várias rodadas de revisão custa mais que uma com poucos. Saber quanto custa uma sessão típica facilita perceber quando algo saiu dos trilhos, ex.: porque um papel ficou preso num ciclo.

### Taxa de PASS/FAIL do revisor
FAILs frequentes têm duas causas possíveis: os papéis estão errando mais (ajuste os arquivos de papel) ou o revisor está rígido demais (esclareça as regras no `AGENTS.md`). Sem esse número, não dá para saber qual dos dois problemas está de fato acontecendo.

### Frequência de disparo dos hooks
Se um hook dispara todo dia, há um problema sistêmico que precisa ser corrigido no arquivo de papel ou no `AGENTS.md`; não é primariamente um problema de hook, e sim de contexto.

### Deriva
Agentes podem se comportar de forma diferente com o tempo: depois de atualizações de modelo, depois de mudanças nos arquivos de papel, depois de pausas longas. A deriva é difícil de perceber sem um ponto de comparação. O conjunto de evals do Módulo 6 é esse ponto de comparação; a observabilidade mostra quando vale a pena rodá-lo.

## Como a observabilidade fica na prática

Não é preciso um sistema de monitoramento complexo. Para começar, isto basta:

### Quem escreve o log

Não o agente. Um agente a quem se pede para relatar a própria contagem de tokens está chutando, e um papel que esqueceu uma etapa também vai esquecer de registrá-la. Vale o mesmo raciocínio do Módulo 5: se pode ser esquecido, um hook faz.

O Claude Code registra toda sessão, incluindo a execução de cada papel, num arquivo de transcrição com as contagens reais de tokens. Um hook lê desse registro e escreve o log.

### Log da sessão
Um arquivo por sessão, uma linha por evento, escritos por hooks:

```json
// harness/observability/logs/2026-07-12-<id-da-sessao>.jsonl
{"time": "2026-07-12T09:14:02Z", "type": "role", "role": "<papel>", "tokens": {"input": 6, "output": 1410, "cache_read": 10740, "cache_write": 6513, "total": 18669}}
{"time": "2026-07-12T09:15:40Z", "type": "role", "role": "reviewer", "tokens": {"total": 12573}, "verdict": "fail"}
{"time": "2026-07-12T09:16:05Z", "type": "hook", "hook": "<nome-do-hook>", "blocked": true, "role": "<papel>"}
{"time": "2026-07-12T09:19:31Z", "type": "role", "role": "<papel>", "tokens": {"total": 21952}}
{"time": "2026-07-12T09:20:48Z", "type": "role", "role": "reviewer", "tokens": {"total": 14466}, "verdict": "pass"}
{"time": "2026-07-12T09:21:10Z", "type": "session", "main_tokens": {"total": 206361}, "role_tokens": 67660, "total_tokens": 274021, "duration_minutes": 8}
```

(Abreviado aqui; toda entrada `tokens` tem os mesmos cinco números da primeira linha.)

`total_tokens` é a sessão inteira: a conversa principal que rodou o pipeline mais todos os papéis. Tokens `cache_read` são texto que o Claude Code reaproveitou de antes na sessão; são cobrados a uma fração do preço normal, então um total alto composto principalmente de `cache_read` é mais barato do que parece. 
O log da sessão conta tokens, não dinheiro. O Claude Code não passa um preço ao script de log, e o script não carrega uma tabela de preços própria, porque ela ficaria desatualizada. O único lugar onde aparece um valor em dólares é a coluna de custo em `harness/evals/results.md` (Módulo 6): para execuções de eval, o próprio Claude Code informa um custo. Para ter um custo aproximado de uma sessão normal, compare o total de tokens dela com o de uma execução de eval de tamanho parecido.

Três fontes o alimentam:

| Linha | Escrita por | De onde vêm os dados |
|---|---|---|
| `role` | Um hook que roda toda vez que um papel termina (`SubagentStop`) | Qual papel, a transcrição dele (tokens) e a primeira linha da resposta dele (`VERDICT: PASS/FAIL` no caso do revisor) |
| `hook` | Os próprios scripts de guarda do Módulo 5 | Cada script acrescenta uma linha quando dispara |
| `session` | Um hook que roda quando a sessão termina (`SessionEnd`) | A transcrição da sessão (total de tokens, primeiro e último horário registrado) |

A tarefa e o que cada papel produziu não são repetidos aqui; já estão em `harness/handoffs/<tarefa>/`, do Módulo 4.

### Tabela de métricas
Um arquivo markdown simples, com uma linha por sessão:

```markdown
## Métricas do harness

| Data | Pipeline | Tarefa | Tokens | FAILs do revisor | Bloqueios de hook | Duração |
|---|---|---|---|---|---|---|
```

Todo número de uma linha é copiado do log daquela sessão, nunca estimado.

### Verificação de deriva
Regularmente (ex.: toda semana): rode 3-4 evals do conjunto de evals (`node harness/evals/run-evals.js --only E01,E05,E09`) e compare com as entradas anteriores em `harness/evals/results.md`. Mais FAILs que antes significa que é hora de ajustar o harness.

## O que a observabilidade dá a você com o tempo

Depois de sessões suficientes, padrões ficam visíveis:
- Quanto custa uma sessão típica
- Qual pipeline é o mais caro
- Onde o revisor dá FAIL com mais frequência
- Quais hooks disparam com mais frequência

Esses números são sinais de onde o harness ainda não está bem configurado o bastante.

## Observabilidade vs. hooks vs. evals

| | Hooks | Evals | Observabilidade |
|---|---|---|---|
| Quando | Em tempo real, durante uma sessão | Sob comando, depois de mudanças | Depois de toda sessão |
| O quê | Uma única regra | Comportamento geral | Tendências ao longo do tempo |
| Reage a | Erros no momento | Regressões | Deriva e custo |
| Saída | PASS/FAIL | Lista de PASS/FAIL | Métricas e logs |

Os três juntos dão um quadro completo.

## Perguntas para a pessoa

- Realisticamente, com que frequência haverá sessões: diárias, semanais?
- Quem vai olhar essas métricas depois: só a própria pessoa, ou uma equipe?
- Qual é um ritmo realista para a verificação de deriva (semanal, mensal)?

## O que é construído

*(Adaptado para o layout de método portável. O registrador é código, então fica junto das checagens do método; só os logs em si são artefatos de execução. Conforme o SKILL.md principal: o template `.js` é referência de comportamento — gere uma versão fiel em Python, lendo o stdin como UTF-8.)*

- `_trabalho/logs/.gitkeep`: pasta para os logs de sessão e as métricas (artefatos de execução, não método)
- `metodo/checagens/hooks/registrar_evento.py`: o script que escreve o log — uma versão fiel em Python do `templates/log-event.js` deste skill (mesmas linhas de log, mesma nomenclatura de arquivos, pasta de destino `_trabalho/logs/`)
- A ligação dele no `.claude/settings.json`, ao lado dos hooks do Módulo 5:

  ```json
  "SubagentStop": [
    { "hooks": [ { "type": "command", "command": "python \"${CLAUDE_PROJECT_DIR}/metodo/checagens/hooks/registrar_evento.py\"" } ] }
  ],
  "SessionEnd": [
    { "hooks": [ { "type": "command", "command": "python \"${CLAUDE_PROJECT_DIR}/metodo/checagens/hooks/registrar_evento.py\"" } ] }
  ]
  ```
- Uma chamada acrescentada em cada script de guarda do Módulo 5, no ponto em que ele dispara, importando o módulo registrador e registrando `(input, '<nome-do-hook>', blocked)`
- `_trabalho/logs/metricas.md`: tabela de métricas (vazia, pronta para preencher)
- `_trabalho/logs/verificacao-de-deriva.md`: instruções para a verificação de deriva periódica

## Notas de condução

- Não escreva o script de log do zero; copie `templates/log-event.js`. Ele foi testado contra uma execução real de pipeline. Precisa de Node. Se a máquina da pessoa não tiver Node, porte-o para o runtime escolhido no Módulo 5 e mantenha o comportamento: mesmas linhas de log, mesma nomenclatura de arquivos.
- O script lê as contagens de tokens dos arquivos de transcrição do Claude Code, cujo formato pode mudar entre versões. Ele foi feito para gravar `null` quando não consegue ler um valor. Se `tokens` aparecer como `null` num log real, esse é o sinal de que o formato mudou: confira a documentação atual do Claude Code e ajuste `sumTokens` no script. Um número faltando tudo bem; um inventado, não.
- Se os scripts de guarda do Módulo 5 não forem escritos em Node, eles não podem usar `logHook` diretamente. Faça com que eles mesmos acrescentem a mesma linha JSON ao arquivo de log da sessão.
- Teste com uma execução real de pipeline e leia o log resultante junto com a pessoa. Só marque o módulo como concluído quando existir um arquivo de log com números reais.
- Pergunte se os logs devem entrar nos commits. Eles contêm nomes de papéis, contagens de tokens e vereditos, nenhum conteúdo de tarefa. Padrão: fazer commit deles, para que as métricas tenham histórico.
- Mescle no `.claude/settings.json`; não substitua os hooks do Módulo 5.
- Esta estrutura só se torna útil depois que sessões reais tiverem rodado. O objetivo aqui é colocá-la no lugar, não enchê-la de dados imediatamente.
- Quando existirem 5+ logs de sessões reais, o Módulo 8 (Painel de observabilidade, bônus) passa a ser relevante. Veja `08-dashboard-bonus.md`.
