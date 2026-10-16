# Transcript — teste E2E do MODO DIRETO do skill `construir` (persona: Marina, analista quantitativa)

- Data: 2026-10-16
- Projeto de teste: `.superpowers/e2e/modo-direto/` (repositório git próprio; o repositório principal não foi tocado)
- Roteiros seguidos: `skills/construir/SKILL.md` (fluxo 0 e invariantes do §3) e, após o aceite, `skills/construir/motor/modo-direto.md` (etapas 0–7), com consulta a `motor/team-patterns.md`, `motor/model-selection-guide.md`, `motor/orchestrator-template.md`, `motor/execution-modes.md`, `motor/qa-agent-guide.md`, `motor/skill-writing-guide.md`; `skills/validar/SKILL.md` como referência de conferência final.
- Convenção: **Facilitador:** e **Marina:** são falas verbatim. `> [bastidor]` = ações internas (não mostradas à Marina). `> [ambiguidade]` = ponto em que o texto era ambíguo/contraditório e a decisão tomada (os skills NÃO foram alterados). `> [agente]` = execução real de um papel por subagente.

---

## Fluxo 0 — Situar e retomar (SKILL.md §0)

**Marina:** Oi. Sou analista quant num fundo de ações. Quero um harness pequeno de agentes para backtesting de sinais de fator: ler CSVs de preço (formato longo, data/ticker/preço ajustado), calcular o sinal, rodar o backtest long-short com custos, gerar um tearsheet e ter alguém revisando antes de eu levar ao comitê. Uso Python/pandas no dia a dia e versiono tudo em git. Pode usar a pasta `.superpowers/e2e/modo-direto`.

> [bastidor] §0.1–0.3: a pasta não existia → criada vazia. Procurei `CLAUDE.md`, `AGENTS.md`, `.claude/`, `metodo/`, `CURRICULUM.md`: nada → sem retomada. Ambiente conferido em silêncio: Python 3.14.4, pandas 3.0.2, numpy 2.4.4, git 2.54 (invariante 5 — nada a instalar).
> [bastidor] §0.4 — detecção de tecnicidade: Marina cita CSV em formato longo, pandas, git, "long-short", sem pedir explicação → critério do texto ("cita arquivos, JSON, git") satisfeito com folga. Ofereço o modo direto.

**Facilitador:** Confirmando o rumo em uma frase: um time pequeno de agentes, com regras e travas, que leva uma hipótese de sinal de fator até um tearsheet líquido de custos, revisado por alguém que não participou e aprovado por você — tudo em `.superpowers/e2e/modo-direto`, que está vazia (nada a aproveitar, nada a quebrar).

Como você é da área, tenho dois caminhos:

1. **Workshop guiado** — 8 módulos conversados (contexto, papéis, ferramentas, pipeline, travas, testes, observabilidade), com explicação de cada conceito. Feito para quem não é técnico.
2. **Modo direto** — um fluxo técnico de 7 etapas: levantamento do estado atual, análise do trabalho, desenho do modo de execução e do time, definição dos agentes, skills, orquestrador, e verificação com teste real. Menos conversa, mais artefato.

Nos dois as garantias são as mesmas: método separado da fiação do Claude Code (`metodo/` portável × `.claude/`), todo número saindo de script Python, nenhum modelo fixado sem justificativa escrita, revisor independente em contexto limpo, sua aprovação explícita registrada, glossário único de termos, uma skill `comece-aqui` para quem chegar depois e a pasta de gabaritos das evals bloqueada para os agentes. Qual prefere?

E uma coisa de casa: vou inicializar um repositório git na pasta e commitar a cada bloco de etapas — o método fica versionado desde o primeiro arquivo. Ok?

**Marina:** Modo direto, com certeza. Git sim, pode commitar por etapa.

> [bastidor] §0.6: `git init -b main` em `modo-direto/` (identidade local "Marina (simulada)"). §0.5: nada existente a sobrescrever.
> [ambiguidade A1] O SKILL.md inteiro ("Papel e tom") presume leigo: traduzir todo termo técnico, nunca pedir comando. O §0.4 manda oferecer o modo direto, mas não diz se as regras de tom continuam valendo depois do aceite; o `modo-direto.md` etapa 1.6 diz para ajustar o nível ao vocabulário do usuário. **Decisão:** vocabulário técnico com a Marina (sem traduções forçadas), mas mantive 1–3 perguntas por leva e não pedi que ela rodasse nada.
> [ambiguidade A2] §0.6 manda commit "ao fechar cada módulo"; o modo direto não tem módulos. **Decisão:** commit por bloco de etapas (3–4, 5, 6 e um de correção).
> [ambiguidade A3] O §0.4 não diz se `CURRICULUM.md`/`HANDOUT.md` (âncoras de retomada do workshop) existem no modo direto. **Decisão:** não criados — o modo direto não tem módulos para rastrear; a retomada fica pelo git + registro no `CLAUDE.md`. Fica a lacuna: um modo direto interrompido no meio não tem âncora explícita de retomada.

---

## Modo direto — Etapa 0: verificação do estado atual

> [bastidor] Li `.claude/agents/`, `.claude/skills/`, `CLAUDE.md` do projeto: inexistentes → **construção do zero** (executar da etapa 1). Sem orquestrador v1 (item 3), sem registro a confrontar (item 4).

**Facilitador:** Estado atual: projeto vazio, sem agentes, skills ou `CLAUDE.md` → construção do zero. Plano:

1. Análise do trabalho (umas 2–3 levas de perguntas)
2. Modo de execução e composição do time
3. Definições dos agentes (com modelo e justificativa por agente)
4. Skills (método em `metodo/skills/`, wrappers finos em `.claude/skills/`), glossário e scripts Python
5. Orquestrador, regras da casa e registro no `CLAUDE.md`
6. Verificação: estrutura, teste real do pipeline com um caso-escola, condição de acionamento
7. Operação/manutenção fica para depois (com o skill `evoluir`)

Sigo?

**Marina:** Segue.

---

## Etapa 1: análise da área e do trabalho

**Facilitador:** Três perguntas para começar:

1. Que famílias de sinal você testa, e qual seria o exemplo canônico (com parâmetros)?
2. Universo e dados: de onde vêm os CSVs, qual o formato exato, e a base inclui empresas que saíram (deslistadas)?
3. Carteira e saída: como monta a carteira (quantis? long-short?), com que frequência rebalanceia, que custo usa, e o que precisa estar no tearsheet para o comitê?

**Marina:** 1. Momentum 12-1 é o carro-chefe; também baixa volatilidade e reversão de curto prazo (1 mês).
2. CSV longo exportado do nosso banco de dados: `data,ativo,preco_ajustado,volume`, diário, ajustado por proventos. A base de produção tem os deslistados, mas já peguei exportação sem eles — é um erro que quero que o sistema pegue. Para este teste, use dados sintéticos; os reais ficam no servidor do fundo.
3. Quintis, long Q5 / short Q1, pesos iguais, rebalanceamento mensal, 10 bps por lado como padrão. No tearsheet: retorno anualizado, vol, Sharpe, drawdown, turnover, IC, retorno por quantil e por ano — bruto e líquido.

**Facilitador:** Anotado. Agora sobre verificação e repetição:

1. Quais são os erros que mais custam caro num backtest seu — os que um revisor tem que pegar sempre?
2. Você costuma testar várias variantes (janelas, pulos) antes de escolher uma? Quantas, tipicamente?
3. Depois de um resultado, os pedidos típicos são "refaz com X" (só uma parte) ou você precisa de uma conversa longa com o mesmo analista?

**Marina:** 1. Look-ahead (operar no mesmo fechamento que gerou o sinal, ou universo definido com dado do fim), sobrevivência, esquecer custo, e apresentar a melhor de 30 variantes como se fosse a única.
2. De 5 a 20 variantes por estudo, às vezes mais.
3. Quase sempre "refaz com custo 20 bps", "troca a janela", "reescreve a conclusão". Não preciso de diálogo longo entre agentes. E uma regra: nada vai pro comitê sem eu aprovar — e ninguém mexe nos CSVs brutos.

**Facilitador:** Última leva desta etapa (stack e código existente):

1. Você tem código de backtest que eu deva aproveitar ou começo limpo?
2. Python mínimo no ambiente do fundo? pandas/numpy disponíveis? Precisa de gráfico ou tabela basta?

**Marina:** 1. Tenho notebooks no trabalho, mas começa limpo — quero ver o desenho.
2. Python 3.11 lá, pandas e numpy sim. Tabela em markdown basta por enquanto; gráfico fica para depois.

> [bastidor] Etapa 1 consolidada: área = pesquisa quant de fatores; tipos de trabalho = especificação (conversão), cálculo (determinístico), interpretação (análise), verificação (revisão). Fluxo (1.3): itens listáveis de antemão (um estudo por vez; variantes são parâmetros de cálculo); há laço verificar→corrigir (revisor→analista); troca de opiniões entre agentes não melhora o resultado; não é preciso conversa contínua com o mesmo especialista. Sobreposição (1.4): nenhum agente/skill existente. Base de código (1.5): não há — começa limpo. Nível (1.6): técnico.

---

## Etapa 2: modo de execução e composição do time

**Facilitador:** Proposta:

- **Trilho híbrido.** O cálculo inteiro (validação da spec e dos dados, sinal, backtest, custos, tearsheet, congelamento por sha256) é Python em `metodo/checagens/` — nenhum agente calcula. Os agentes fazem só o que exige julgamento.
- **Time de 3 agentes**, padrão *pipeline* + *geração e verificação*:
  1. `especificador-sinal` — hipótese em português → spec JSON validada (defasagem ≥ 1, custos > 0, variantes testadas declaradas);
  2. `analista-backtest` — interpreta os números e recomenda avançar / iterar / descartar;
  3. `revisor-backtest` — revisão independente em contexto limpo: reexecuta a trilha, procura look-ahead, sobrevivência, custo ausente, data snooping e número sem procedência; VERDICT PASS/FAIL. No máximo 2 voltas revisor→analista.
- **Modo de execução: delegação a subagentes em sequência**, conduzida pela sessão principal. Considerei o Workflow (a regra do roteiro manda usá-lo quando a lista de itens é definível em código), mas: (a) há paradas humanas entre etapas — confirmação da spec e aprovação final; (b) as suas 5–20 variantes são cálculo, então viram parâmetros do Python, não dezenas de agentes; (c) o Workflow exige seu consentimento explícito, e não ganharíamos nada com ele aqui. Agentes persistentes também não: os papéis não precisam conversar entre si.
- **Varredura de variantes:** fica fora desta versão mínima; cada variante é um estudo/reexecução e a contagem `variantes_testadas` sobe sempre (e o revisor cobra "melhor de N").

Faz sentido?

**Marina:** Faz. Concordo em deixar o Workflow de fora por enquanto. Quais modelos você vai pôr em cada um?

> [ambiguidade A4] `modo-direto.md` 2-1 regra 1 ("se a lista de itens, o critério de verificação e a condição de repetição puderem ser expressos de antemão em código, use workflow") apontaria para Workflow; a árvore de decisão de `execution-modes.md` §4 não considera paradas humanas. Só `team-patterns.md` 1-1 resolve ("se for preciso que uma pessoa revise o artefato entre uma etapa e outra, chame subagentes em sequência"). **Decisão:** modo C, com a justificativa escrita no orquestrador. O invariante "aprovação humana" do SKILL.md deveria aparecer como critério na própria etapa 2-1.

---

## Etapa 3: definições dos agentes

**Facilitador:** Modelos, pelo critério de natureza do trabalho (e cada justificativa fica escrita no próprio arquivo do agente):

| Agente | Modelo | Por quê | Ferramentas |
|---|---|---|---|
| especificador-sinal | sonnet | procedimento claro, próximo de conversão de formato | Read, Write, Edit, Glob, Grep, Bash (roda o validador) |
| analista-backtest | opus | análise complexa de escopo definido | Read, Write, Edit, Glob, Grep — **sem Bash de propósito**: não roda conta |
| revisor-backtest | opus | verificação cruzada / crítica de método | Read, Glob, Grep, Bash — **sem Edit/Write**: revisor que conserta vira juiz e parte |

Nenhum fable: não há tarefa longa e autônoma. A sessão principal (orquestração) não tem modelo fixado.

**Marina:** O revisor precisa conseguir reexecutar o backtest, não só ler. Bash resolve isso?

**Facilitador:** Resolve: o Bash dele serve para rodar `rodar_checagens.py --verificar-congelamento`, que recalcula tudo do zero e compara com o que foi gravado. A resposta dele volta como texto e quem conduz grava em `_trabalho/`. Ressalva honesta: Bash tecnicamente permite escrever arquivo — a proibição é por instrução, não por bloqueio da ferramenta.

**Marina:** Aceito.

> [bastidor] Gravados `.claude/agents/{especificador-sinal,analista-backtest,revisor-backtest}.md` com o template de `team-patterns.md` §5 (papel central, princípios com motivo, entrada/saída, reexecução, erros, colaboração) e `model:` + comentário `# Por quê:` no frontmatter.
> [ambiguidade A5] `modo-direto.md` etapa 3 manda tirar Edit/Write de revisores somente-leitura; `qa-agent-guide.md` §3-1 manda o QA ter todas as ferramentas e "se necessário, alterar código". **Decisão:** Read/Glob/Grep/Bash sem Edit/Write (prevalece o invariante de revisor independente do SKILL.md).
> [ambiguidade A6] `qa-agent-guide.md` é todo sobre apps web (API↔hook, rotas). Adaptei o princípio "ler os dois lados" para spec↔métricas↔tearsheet (reprodutibilidade + procedência dos números). O guia não diz como generalizar para domínios não-web.
> [ambiguidade A7] Agnosticismo de modelo × etapa 3: o roteiro manda fixar `model:` com nomes de modelos do fornecedor; o SKILL.md exige justificativa escrita. Compatíveis se a justificativa existe e o pin mora só em `.claude/` (amarração). Mas o papel do agente (quem trabalha) também mora só em `.claude/agents/` — o layout §3 não tem lugar em `metodo/` para papéis, então trocar de executor perderia as definições de papel. Mitiguei pondo o "como" em `metodo/skills/`.

---

## Etapa 4: skills, glossário e checagens

**Facilitador:** Estrutura do que vou gravar:

- `metodo/GLOSSARIO.md` — definição única de: estudo, spec, sinal, score, momentum 12-1, data de rebalanceamento, defasagem, look-ahead, viés de sobrevivência, quantil, long-short, bruto/líquido, turnover, custo, bps, IC, monotonia, Sharpe (rf = 0, declarado), drawdown, variantes testadas, data snooping, tearsheet, congelamento, caso-escola, recomendação.
- `metodo/skills/` — `especificar-sinal.md`, `analisar-backtest.md`, `revisar-backtest.md` (o checklist em 8 itens com regra de PASS), mais o pipeline e o comece-aqui na etapa 5.
- `.claude/skills/<nome>/SKILL.md` — wrappers finos: frontmatter com condição de acionamento + "leia e siga `metodo/skills/<nome>.md`".
- `metodo/checagens/` (Python, saída JSON com schema): `ambiente.py`, `spec.py`, `validar_dados.py` (duplicatas, preço ≤ 0, lacunas, saltos > 50% = desdobramento não ajustado, **aviso de sobrevivência se ninguém sai da base em > 2 anos**), `sinais.py`, `backtest.py` (defasagem de execução, quem sai da base realiza o retorno até o último preço, turnover por pesos-alvo — simplificação declarada), `rodar_checagens.py` (trilha completa + congelamento sha256 + `--verificar-congelamento`), `tearsheet.py` (números por código + checagem de procedência dos números citados pelo analista), `registrar_aprovacao.py` (recusa sem PASS, com tearsheet alterado depois da revisão ou com artefato congelado mexido).
- `metodo/evals/` — 3 evals determinísticas (regressão, ausência de look-ahead por perturbação do futuro, coerência de custos) com runner em Python e marcador `VERDICT: PASS/FAIL`; 2 evals de pipeline em **modo eval** (aprovação "simulada — modo teste"); gabaritos numa pasta vedada aos agentes.
- Caso-escola `casos/exemplo-momentum/` com CSV **sintético** de semente fixa (20 ativos, um sai em 2022-06-30, um entra em 2021-03-01).

**Marina:** Ótimo. A checagem de procedência é uma boa ideia — já vi tearsheet com Sharpe "recalculado" pelo analista que não batia com nada.

> [bastidor] Arquivos gravados; scripts executados e testados antes de seguir (`modo-direto.md` / `skill-writing-guide.md` §6: "scripts incluídos devem ser executados e verificados por você mesmo"): geração do CSV, `ambiente.py` ok, `spec.py` ok, `validar_dados.py` ok (1 sai, 1 entra), trilha completa e rascunho do tearsheet ok. Artefatos do teste de fumaça apagados antes do teste oficial. Commit `cca39f0`.
> [ambiguidade A8] `modo-direto.md` princípio 1 e 4-1 mandam skills em `.claude/skills/<nome>/` com `scripts/`, `references/`, `assets/`; o layout §3 manda conhecimento em `metodo/skills/<nome>.md`, wrappers finos em `.claude/skills/` e código em `metodo/checagens/`. **Decisão:** layout §3 (vale o SKILL.md). O roteiro não tem nota dizendo "onde este texto diz `.claude/skills/<nome>/scripts`, leia `metodo/checagens/`".
> [ambiguidade A9] GLOSSARIO é "criado no módulo 1" e comece-aqui "no módulo 4" (§3); o modo direto não tem módulos. **Decisão:** glossário na etapa 4 (antes das skills que o usam), comece-aqui na etapa 5 (junto com o pipeline).
> [ambiguidade A10] O modo direto não fala de evals nem de gabaritos, mas o §3 exige "SEMPRE as regras de negação de `metodo/evals/gabaritos/`". Uma negação apontando para pasta inexistente seria vazia. **Decisão:** criei um eval-set mínimo com gabarito real para a regra ter função.

---

## Etapa 5: orquestrador, regras da casa e registro

**Facilitador:** O orquestrador fica em duas camadas:

- `metodo/skills/backtest-fator.md` — o pipeline portável: etapa 0 (primeira execução / seguimento / dados novos → arquivar), 1 Intake e spec **[obrigatória — nunca pular]**, 2 Checagens determinísticas **[obrigatória — nunca pular]**, 3 Rascunho, 4 Interpretação, 5 Revisão independente **[obrigatória — nunca pular]** (máx. 2 voltas), 6 Aprovação humana **[obrigatória — nunca pular]** — para e espera "aprovo"/"não aprovo"; tratamento de erros; cenários de teste (normal + 2 de erro). Artefatos em `_trabalho/<estudo>/{fase}_{quem}_{artefato}`; só o aprovado vai para `casos/<estudo>/tearsheet.md`.
- `.claude/skills/backtest-fator/SKILL.md` — a amarração: modo de execução (subagentes em sequência), tabela papel → `subagent_type` → prompt mínimo, e a regra de passar ao revisor **só** caminhos, sha256 e a lista de procedência.

Regras da casa no `AGENTS.md` (as suas: CSV bruto intocável, número só de script, sem look-ahead, custo sempre ligado, toda variante conta, nada ao comitê sem PASS + sua aprovação, Python/Windows). O `CLAUDE.md` fica assim:

```
@AGENTS.md

## Harness: backtesting de sinais de fator
**Objetivo:** levar uma hipótese de sinal de fator a um tearsheet reprodutível, líquido de custos, revisado de forma independente e aprovado pela Marina.
**Condição de acionamento:** ... use o skill `backtest-fator`. Para quem chega ao projeto, `comece-aqui`. ...
**Histórico de mudanças:** | 2026-10-16 | Primeira configuração (modo direto do `construir`) | Tudo | - |
```

E `.claude/settings.json` nega Read/Edit/Write em `metodo/evals/gabaritos/**`, `Bash(*gabaritos*)` e `PowerShell(*gabaritos*)` (senão um `cat` contorna), e Edit/Write em `casos/*/documentos/**`. Grava?

**Marina:** Grava.

> [bastidor] Gravados orquestrador (duas camadas), `comece-aqui` (`metodo/skills/comece-aqui.md` + wrapper), `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`. Commit `89e2d85`.
> [ambiguidade A11] `orchestrator-template.md` coloca no skill orquestrador os nomes de ferramenta do Claude Code (`Agent`, `subagent_type`, `Workflow`); o §3 exige `metodo/` portável e o `validar` (item 1) reprova qualquer menção a `.claude/` dentro de `metodo/`. **Decisão:** pipeline portável em `metodo/`, amarração no wrapper — que deixa de ser "fino" (26 linhas). O §3 não prevê onde fica a amarração do orquestrador.
> [ambiguidade A12] `modo-direto.md` 5-4: "no `CLAUDE.md` ficam só a condição de acionamento e o histórico"; o layout §3 põe as regras da casa em `CLAUDE.md / AGENTS.md (módulo 1)` e a nota do módulo 7 manda registrar "abaixo da linha `@AGENTS.md`". O modo direto não tem etapa que crie regras da casa. **Decisão:** `AGENTS.md` com as regras vindas da etapa 1; `CLAUDE.md` = `@AGENTS.md` + registro (atende os dois textos).
> [ambiguidade A13] `modo-direto.md` 5-1 e o template falam em `_workspace/`; o §3 manda ler `_trabalho/`. O template supõe um `_workspace/` por execução; aqui há vários estudos. **Decisão:** `_trabalho/<estudo>/`, com a lógica de seguimento por estudo.
> [ambiguidade A14] `orchestrator-template.md` Template B etapa 4 congela com `shasum`/`md5sum` (bash puro) — contraria o invariante 5. **Decisão:** congelamento em Python (`hashlib`) dentro de `rodar_checagens.py`.
> [ambiguidade A15] O §3 diz que `settings.json` leva "hooks + SEMPRE as negações"; o modo direto não tem etapa de guardas (o workshop tem o módulo 5 / skill `guardas`) e o §4 diz que só o teste de bloqueio+passagem confirma uma guarda. **Decisão:** só as negações; nenhum hook criado nem testado. Fica a pergunta: no modo direto, o skill `guardas` deveria ser invocado?

---

## Etapa 6: verificação e teste

### 6-1 Arquivos e referências

> [bastidor] Script de verificação (scratchpad): 3 agentes e 5 skills com `name` = pasta e `description`; os 3 `model:` com `# Por quê`; toda referência `metodo/...` citada existe; nenhum `metodo/` menciona `.claude`; sem `.claude/commands/`; sem resíduos v1 (`TeamCreate`, `TeamDelete`, `team_name`, flag experimental). **Achados: nenhum.**

### 6-2 Por modo de execução (subagentes)

> [bastidor] Entrada de cada papel = saída da etapa anterior (spec → checagens → rascunho → interpretação → rascunho completo → revisão → aprovação); chamadas sequenciais (não paralelas, por dependência); a gravação da resposta do revisor está atribuída a quem conduz.

### 6-3 Teste de execução real (fluxo normal no caso-escola)

**Facilitador:** Vou rodar o pipeline de verdade no caso-escola: "momentum 12-1 clássico, quintis, long Q5/short Q1, mensal, 10 bps, 2021–2023, primeira variante".

> [agente] **especificador-sinal** (subagente, modelo sonnet, lendo `.claude/agents/especificador-sinal.md`): gravou `_trabalho/exemplo-momentum/01_especificador-sinal_spec.json`; `spec.py` ok, 0 avisos; declarou os padrões aplicados (direção `maior_melhor`, defasagem 1, pesos iguais) e separou o que veio da hipótese.
> [bastidor] Etapa 2: `rodar_checagens.py` código 0, aviso "período iniciado em 2023-11-30 descartado: saída depois do fim dos dados". Etapa 3: rascunho gerado.
> [agente] **analista-backtest** (subagente, modelo opus, sem execução de código): gravou `03_analista-backtest_interpretacao.md`; recomendação **descartar** (IC médio -0,000, t -0,01; monotonia 25%; líquido -12,9% a.a.; perda concentrada em 2021), com a condição que mudaria a recomendação. Observação do agente: o Glob não listou `_trabalho/` (leu direto pelo caminho).
> [bastidor] `tearsheet.py --interpretacao`: sha256 `39d5fa18…aee1d`; `numeros_sem_origem` = `["-03", "-06", "-1"]` — **falsos positivos** (pedaços das datas 2021-03-01 / 2022-06-30 e do rótulo "12-1").
> [agente] **revisor-backtest** (subagente, modelo opus, contexto limpo, recebeu só slug, caminhos, sha256 e a lista): rodou `--verificar-congelamento` (reprodutível); checklist de 8 itens; classificou corretamente os 3 itens da lista como estruturais; conferiu 6 números da interpretação contra o JSON; **VERDICT: PASS** com 1 ressalva ("não tem poder preditivo" mais forte que a evidência → "não mostrou poder preditivo nesta amostra") e 2 observações sobre o harness (spec validada fora do congelamento; ele não tinha como conferir o sha256 do rascunho). Não gravou nada (conferido por `git status`). Resposta gravada sem edição em `04_revisor-backtest_revisao.md`.

**Facilitador:** Resultado do caso-escola (dados sintéticos, só para validar o fluxo):

| | Bruto | Líquido |
|---|---|---|
| Retorno anualizado | -11,8% | -12,9% |
| Sharpe (rf = 0) | -0,28 | -0,33 |
| Máx. drawdown | -57,9% | -58,8% |

IC médio -0,000 (t -0,01), monotonia dos quantis 25%, turnover médio 107% ao mês. Recomendação do analista: **descartar**. Revisor independente: **PASS**, com uma ressalva de texto (a frase "não tem poder preditivo" afirma mais do que 34 meses permitem). Você aprova este tearsheet?

**Marina:** Aprovo — é o teste do harness, e o descarte está certo para dados aleatórios. Registra a ressalva do revisor como observação para a próxima versão do texto.

> [bastidor] Etapa 6 do pipeline: `registrar_aprovacao.py --decisao aprovado --aprovador "Marina" --observacao "..."` → `05_aprovacao.json` (modo real, veredito PASS, sha do tearsheet) e `casos/exemplo-momentum/tearsheet.md` com "**Status:** APROVADO por Marina em 2026-10-16 (revisão independente: PASS)".
> [bastidor] Fluxos de erro testados (numa cópia no scratchpad, para não sujar o projeto): rascunho alterado depois da revisão → recusa "o tearsheet mudou depois da revisão"; revisão com FAIL → recusa "não dá para aprovar com veredito do revisor = FAIL"; `--modo-teste` → registra "simulada — modo teste" e **não** publica em `casos/`. Spec com `defasagem_dias = 0` → `spec.py` recusa (código 1) com a mensagem de look-ahead (cenário de erro E05).
> [bastidor] Gabarito E01 gravado a partir das métricas aprovadas (regressão, declarado como tal no eval-set). `rodar_evals.py`: E01, E02 (346 sinais idênticos após perturbar o futuro), E03 → **TOTAL: VERDICT: PASS**.
> [bastidor] Correções por princípio (6-3 item 4), a partir dos achados: (1) a checagem de procedência passa a ignorar datas ISO e rótulos "N-N" — reteste: lista vazia no caso real, e números inventados ("0,71", "15,2%") continuam acusados; (2) `01_checagens_spec-validada.json` entra no congelamento; (3) `--verificar-congelamento` devolve `tearsheet_rascunho_sha256` e o checklist do revisor manda compará-lo. Histórico do `CLAUDE.md` atualizado.
> [bastidor] Achado extra no commit: o git com `autocrlf` converteria fim de linha de arquivos congelados por sha256 (dados, `_trabalho/`, gabaritos) — um clone quebraria a verificação. `.gitattributes` com `-text` nesses caminhos + `git add --renormalize`. Teste num clone novo: `--verificar-congelamento` reprodutível e E01 PASS. Commits `002217e` e `fa17db7`.
> [ambiguidade A16] 6-3 item 2 pede execução com skill × baseline em paralelo. **Não feito** (escala mínima/custo): só a execução com skill. 6-3 item 1 pede 2–3 pedidos de teste por skill: feito 1 pedido real de ponta a ponta + os cenários de erro por script.
> [ambiguidade A17] Limite do teste: os tipos personalizados do projeto não ficam carregados na sessão que o constrói (estão numa subpasta), então cada papel foi emulado com `general-purpose` + "leia e siga a sua definição" + o mesmo modelo do pin. As restrições de `tools` não foram impostas pelo runtime (os agentes relataram ferramentas extras disponíveis); só a instrução as conteve. O roteiro manda os agentes informarem as ferramentas disponíveis — isso funcionou e expôs exatamente esse limite.

### 6-4 Condição de acionamento

> [bastidor] Gravado `metodo/evals/acionamento.md`: 10 pedidos que devem acionar `backtest-fator` (inclusive seguimentos: "refaz com 20 bps", "só a interpretação", "atualiza com dados novos") e 10 de fronteira (revisar só → `revisar-backtest`; spec só → `especificar-sinal`; conceitual → resposta direta; "limpa os splits do CSV" → recusa pela regra da casa; "otimiza a janela de 3 a 24 meses" → conversa sobre data snooping). Verificado **por leitura das descriptions, não por execução** — declarado no arquivo.

### 6-5 Simulação de execução

> [bastidor] Feita de verdade em 6-3: ordem lógica, nenhum elo de dados quebrado, procedimento de erro executável (testado por script).

### 6-6 Cenários de teste

> [bastidor] `## Cenários de teste` em `metodo/skills/backtest-fator.md`: 1 normal + 2 de erro (spec com look-ahead; tearsheet alterado depois da revisão) — ambos os de erro exercitados.

**Facilitador:** Pronto. Resumo do que existe:

- 3 agentes (sonnet, opus, opus — cada um com o porquê no arquivo), 5 skills (pipeline, comece-aqui e os 3 manuais de papel), 9 scripts Python, glossário, regras da casa, registro no `CLAUDE.md`, evals com gabarito protegido.
- Teste real: pipeline completo no caso-escola com revisor PASS e sua aprovação registrada; 3 evals determinísticas PASS; 4 cenários de erro barrados pelos scripts.
- Pendências que ficaram de fora desta versão mínima: varredura de variantes (cada uma ainda é uma reexecução manual, com contagem), gráficos no tearsheet, hooks/guardas automáticas (hoje só as negações de permissão), comparação com baseline e teste de acionamento numa sessão real.

Para valer: os agentes e skills novos só aparecem depois de fechar e reabrir o Claude Code **nesta pasta**. Na primeira sessão, peça "como uso este projeto?" e o `comece-aqui` assume.

**Marina:** Perfeito. A varredura de variantes é a próxima coisa que vou querer.

---

## Etapa 7: operação e manutenção

> [bastidor] Não se aplica na construção (o roteiro a reserva para pedidos de checar/sincronizar um harness existente). Explicado à Marina que a retrospectiva e a evolução (ex.: a varredura de variantes) ficam com o skill `evoluir`, que também atualiza o histórico do `CLAUDE.md`.

**Facilitador:** Quando quiser a varredura de variantes, peça para evoluir o harness — ela entra como mudança de estrutura (novo modo de cálculo + regra de data snooping no revisor), com a linha correspondente no histórico do `CLAUDE.md`.

---

## Checagem final dos invariantes (§3) — feita pelo facilitador antes de encerrar

| Invariante | Situação | Evidência |
|---|---|---|
| Layout `metodo/` × `.claude/` | ok | `.claude/` aponta para `metodo/`; nenhum arquivo de `metodo/` menciona `.claude` |
| Trilho híbrido + 4 etapas obrigatórias marcadas | ok | `metodo/skills/backtest-fator.md` etapas 1, 2, 5, 6 |
| Revisor independente em contexto limpo | ok (testado) | subagente sem `name`, recebe só caminhos/sha/lista |
| Aprovação humana explícita registrada | ok (testado) | `registrar_aprovacao.py` + `05_aprovacao.json` |
| Cálculo nunca pelo modelo | ok | todos os números de `metodo/checagens/`; analista sem Bash; checagem de procedência |
| Python / Windows | ok | 9 scripts Python + runner; `ambiente.py` na primeira execução; nenhum `.sh` |
| `model:` com justificativa | ok | `# Por quê:` nos 3 agentes; modelos diferentes por natureza do trabalho |
| GLOSSARIO usado pelas skills | ok | todas as skills e agentes apontam para ele |
| comece-aqui | ok | `.claude/skills/comece-aqui/` + `metodo/skills/comece-aqui.md` |
| Negação dos gabaritos (Read + shell) | ok | `.claude/settings.json` (Read/Edit/Write + `Bash(*gabaritos*)` + `PowerShell(*gabaritos*)`) |
| Evals em modo eval (nota do módulo 6) | ok | eval-set declara "simulada — modo teste" (E04) e "termina antes da aprovação" (E05) |
| Registro no `CLAUDE.md` abaixo de `@AGENTS.md` | ok | 3 linhas de histórico, batem com os arquivos |
