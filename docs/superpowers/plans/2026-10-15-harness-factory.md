# Harness Factory — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Plugin próprio de Claude Code (`joaocscr/harness-factory`, privado) que constrói e evolui harnesses de agentes conduzindo usuários leigos, com código vendorizado de 4 fontes.

**Architecture:** Fusão de duas camadas num skill principal: a condução estilo workshop do build-harness (intake, módulos, facilitação para leigos) como espinha, carregando por módulo as referências técnicas do motor revfactory v2 (padrões de time, modos de execução, geração de skills). Harnesses gerados seguem a convenção "método como pacote portável" (`metodo/` separado de `.claude/`).

**Tech Stack:** Markdown (skills/plugin Claude Code), JSON (manifests), Git/GitHub (`gh`). Sem código de runtime próprio — os únicos scripts são os vendorizados.

**Spec:** `docs/superpowers/specs/2026-10-15-fabrica-harness-design.md` (cópia de `design-fabrica-de-harness.md`; Task 1 a instala no repo)

## Global Constraints

- Repo: `C:\Users\jcout\projetos\harness-factory`, GitHub `joaocscr/harness-factory`, **privado**.
- Licenças: tudo que for copiado literal vem de fonte Apache-2.0 ou MIT, com `ATTRIBUTION.md` + cópia das licenças em `licenses/`. De hookify e plugin-dev (Anthropic, licença não confirmada): **zero cópia literal** — só conceito reescrito.
- Toda facilitação ao usuário final: na língua da pessoa (português primeiro), zero jargão não traduzido ("skill" → explicado no vocabulário do domínio dela).
- Nada gerado pode assumir bash/unix sem alternativa Windows.
- A fleet (`joaocscr/equity-research-fleet`) é alvo de teste, **nunca** referência de arquitetura.
- Commits frequentes, mensagens `feat:`/`chore:`/`test:`; atribuição de commit conforme regras da sessão.

## Review Focus

1. **Sessão interrompida no meio do workshop** → retomada pelo arquivo de progresso deve voltar ao módulo certo (teste na Task 4, passo 4).
2. **Pasta do usuário já tem `.claude/` ou `CLAUDE.md`** → fábrica nunca sobrescreve, sempre adiciona e mostra antes (teste na Task 4, passo 4).
3. **Leigo responde "não sei" no intake** → fábrica propõe um padrão em linguagem do domínio e segue, nunca trava nem devolve a pergunta (teste na Task 9, passo 2).
4. **Harness gerado em Windows** → nenhum script/hook gerado chama comando unix sem alternativa (teste na Task 9, passo 3).
5. **Agente de produção lê gabaritos de eval** → harness gerado contém regras de negação em `.claude/settings.json` cobrindo `metodo/evals/gabaritos/` (teste na Task 9, passo 3).

---

## Estrutura de arquivos do repositório (alvo)

```
harness-factory/
  .claude-plugin/
    plugin.json                  ← manifesto do plugin
    marketplace.json             ← marketplace própria
  skills/
    construir/
      SKILL.md                   ← NOVO (Task 4): fusão workshop + motor
      workshop/                  ← vendorizado do build-harness (Task 3)
        00-intake.md ... 08-dashboard-bonus.md
        templates/ (CURRICULUM.template.md, log-event.js, run-evals.js)
      motor/                     ← vendorizado do revfactory (Task 2)
        execution-modes.md, team-patterns.md, team-examples.md,
        workflow-recipes.md, model-selection-guide.md,
        skill-writing-guide.md, skill-testing-guide.md,
        qa-agent-guide.md, orchestrator-template.md
    evoluir/
      SKILL.md                   ← vendorizado do revfactory evolve, adaptado (Task 5)
    guardas/
      SKILL.md                   ← NOVO, conceito hookify reescrito (Task 6)
    validar/
      SKILL.md                   ← NOVO, conceito plugin-dev reescrito (Task 7)
  referencia/                    ← biblioteca muratcankoylan curada (Task 3)
    evaluation/  advanced-evaluation/  multi-agent-patterns/
    memory-systems/  tool-design/  context-fundamentals/
    context-compression/  long-horizon-prompting/
  licenses/
    revfactory-harness-LICENSE  muratcankoylan-LICENSE  build-harness-LICENSE
  docs/superpowers/specs/2026-10-15-fabrica-harness-design.md
  docs/superpowers/plans/2026-10-15-harness-factory.md
  ATTRIBUTION.md  README.md  CHANGELOG.md  LICENSE  .gitignore
```

---

### Task 1: Fundação do repositório

**Files:**
- Create: pasta `C:\Users\jcout\projetos\harness-factory` (git init), `LICENSE` (Apache-2.0, copyright João Coutinho 2026), `README.md` (stub: nome, propósito em 3 linhas, aviso de privado), `.gitignore` (`*.local.*`, `node_modules/`, `__pycache__/`), `ATTRIBUTION.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `docs/superpowers/specs/2026-10-15-fabrica-harness-design.md` (cópia do design), `docs/superpowers/plans/2026-10-15-harness-factory.md` (este plano)

**Interfaces:**
- Produces: repo git local + remoto privado `joaocscr/harness-factory`; `plugin.json` com `name: "harness-factory"`, `version: "0.1.0"`, `author: João Coutinho`, `skills: "./skills/"`; `marketplace.json` com um plugin `harness-factory`, `source: "./"`.

- [x] **Step 1: Criar pasta, git init, arquivos base** — `ATTRIBUTION.md` lista as 4 fontes com URL, autor, licença e o que foi usado: revfactory/harness (Apache-2.0, motor), Jeromski62/build-harness (MIT, workshop), muratcankoylan/Agent-Skills-for-Context-Engineering (MIT, biblioteca), anthropics/claude-code plugin-dev+hookify (conceitos reescritos, sem cópia).
- [x] **Step 2: Verificar manifests** — Run: `python -c "import json;[json.load(open(p)) for p in ['.claude-plugin/plugin.json','.claude-plugin/marketplace.json']]"` → sem erro; conferir campos obrigatórios (name, version, plugins[].source).
- [x] **Step 3: Criar repo remoto privado e push** — Run: `gh repo create joaocscr/harness-factory --private --source . --push`. Expected: repo criado, branch main no remoto.
- [x] **Step 4: Commit** (já incluso no push; mensagem `chore: fundação do repositório harness-factory`)

### Task 2: Vendorizar o motor revfactory

**Files:**
- Create: `skills/construir/motor/` (9 arquivos de `skills/harness/references/` do revfactory), `skills/evoluir/SKILL.md` (cópia crua de `skills/evolve/SKILL.md`; adaptação é a Task 5), `licenses/revfactory-harness-LICENSE`
- Referência para Task 4: guardar também `skills/harness/SKILL.md` original como `skills/construir/motor/_original-harness-SKILL.md`

**Interfaces:**
- Consumes: clone de `revfactory/harness` em pasta temporária (scratchpad).
- Produces: os 9 arquivos do motor nos caminhos acima, intocados (adaptações só via SKILL.md novo).

- [x] **Step 1: Clonar revfactory/harness no scratchpad e copiar os arquivos listados**
- [x] **Step 2: Verificar** — Run: `ls skills/construir/motor | wc -l` → 10 arquivos (9 + original); `licenses/revfactory-harness-LICENSE` existe e começa com "Apache License".
- [x] **Step 3: Commit** — `feat: vendoriza motor revfactory v2 (Apache-2.0)`

### Task 3: Vendorizar workshop build-harness e biblioteca muratcankoylan

**Files:**
- Create: `skills/construir/workshop/` ← conteúdo de `skills/build-harness/` do plugin instalado (9 reference/*.md como `00`–`08`, 3 templates/*, e o SKILL.md original como `_original-build-harness-SKILL.md`); `licenses/build-harness-LICENSE`
- Create: `referencia/<nome>/` para os 8 skills curados (ver estrutura alvo) ← clone de muratcankoylan, copiando cada pasta de skill inteira (SKILL.md + references/ + scripts/); `licenses/muratcankoylan-LICENSE`
- Fora da curadoria (não copiar): bdi-mental-states, hosted-agents, latent-briefing, filesystem-context, context-degradation, context-optimization, self-managed-context, self-improvement-loops, project-development, harness-engineering (sobrepõe o motor revfactory; motor vence).

**Interfaces:**
- Consumes: plugin build-harness instalado em `...rpm\plugin_011HpFe7cd1Zo1DjTyBGJCLJ\` (caminho completo no histórico da sessão); clone de muratcankoylan no scratchpad.
- Produces: `skills/construir/workshop/*` e `referencia/*` prontos para o SKILL.md da Task 4 referenciar.

- [x] **Step 1: Copiar workshop do plugin instalado + LICENSE (MIT, Philipp Jeroma)**
- [x] **Step 2: Clonar muratcankoylan e copiar os 8 skills curados + LICENSE**
- [x] **Step 3: Verificar** — `ls referencia | wc -l` → 8; cada `referencia/*/SKILL.md` existe; os 2 arquivos de licença novos existem.
- [x] **Step 4: Commit** — `feat: vendoriza workshop build-harness (MIT) e biblioteca de referência (MIT)`

### Task 4: Escrever `skills/construir/SKILL.md` — a fusão (núcleo do projeto)

**Files:**
- Create: `skills/construir/SKILL.md`
- Modify: `skills/construir/workshop/04-multi-agent-design.md`, `05-hooks-guards.md`, `06-evals.md` (apenas a seção "What Gets Built" de cada um, trocando o layout `harness/` do build-harness pelo layout portável §6.4 do design)

**Interfaces:**
- Consumes: workshop/ (Task 3), motor/ (Task 2), design §6.3–6.5 e §7.
- Produces: skill `construir` com frontmatter `name: construir` e `description` que dispara em "construir/montar um harness", "build a harness", "quero um time de agentes para X". É a única porta de entrada da fábrica; `guardas` (Task 6) e `validar` (Task 7) são chamados por ela nos módulos 5 e 7.

O SKILL.md novo (em português) define, nesta ordem — cada item abaixo é uma decisão do design, não prosa livre:

1. Papel: facilitador, não autor; língua da pessoa; 1–3 perguntas por vez; concreto antes de abstrato; traduzir todo termo técnico para o vocabulário do domínio da pessoa.
2. Intake (workshop/00): acrescenta detecção de tecnicidade; usuário técnico pode optar pelo **modo direto** (segue `motor/_original-harness-SKILL.md` sem workshop).
3. Módulos 1–7 na ordem do workshop, com o acoplamento do motor: módulo 2 (papéis) carrega `motor/team-patterns.md` + `model-selection-guide.md`; módulo 4 (pipeline) carrega `motor/execution-modes.md` + `workflow-recipes.md` + `team-examples.md` + `orchestrator-template.md`; módulo 4 na geração usa `motor/skill-writing-guide.md`; módulo 5 (guardas) invoca o skill `guardas`; módulo 6 (evals) carrega `motor/skill-testing-guide.md` + `referencia/evaluation/`; módulo 7 fecha com o skill `validar`.
4. Layout de saída §6.4 (`metodo/` + `.claude/`), com: skill de entrada "comece aqui" sempre gerado; regras de negação para `metodo/evals/gabaritos/` sempre geradas em `.claude/settings.json`; etapas obrigatórias do trilho marcadas como não puláveis no pipeline gerado; `metodo/GLOSSARIO.md` sempre gerado; cálculos gerados sempre em Python com schemas de saída; nenhum agente gerado com `model:` fixado sem justificativa escrita no próprio arquivo; todo pipeline gerado inclui um papel revisor que roda em contexto limpo (sem ver a produção) e um ponto de aprovação humana explícito antes da entrega (design §7-4 e §7-5).
5. Regras herdadas do workshop: nunca sobrescrever arquivos existentes (ler, adicionar, mostrar antes); retomada por arquivo de progresso; artefato escrito = módulo concluído; avisos de "quando cada coisa passa a valer".
6. Windows: todo script/hook gerado em Python ou PowerShell, nunca bash puro.

- [x] **Step 1: Editar as 3 seções "What Gets Built" do workshop para o layout §6.4**
- [x] **Step 2: Escrever `skills/construir/SKILL.md` conforme os 6 pontos acima**
- [x] **Step 3: Verificação de cobertura** — conferir, item a item, que os 6 pontos e as decisões §6.3/§6.4/§6.5-2/§7 do design aparecem no SKILL.md; listar qualquer ausência e corrigir.
- [x] **Step 4: Teste de mesa (dry run em conversa)** — simular 3 cenários sem construir nada: (a) retomada no módulo 3 com progresso existente → o fluxo manda ler o arquivo de progresso e continuar do módulo certo; (b) pasta com `CLAUDE.md` existente → fluxo manda ler/adicionar/mostrar, nunca sobrescrever; (c) pergunta "o que é um harness?" de leigo → resposta prevista sem jargão. Expected: os três comportamentos decorrem do texto do SKILL.md sem precisar inventar.
- [x] **Step 5: Commit** — `feat: skill construir — fusão workshop + motor com método portável`

### Task 5: Adaptar `skills/evoluir/SKILL.md`

**Files:**
- Modify: `skills/evoluir/SKILL.md` (vendorizado cru na Task 2)

**Interfaces:**
- Produces: skill `evoluir` que dispara em "evoluir/melhorar/diagnosticar meu harness"; opera sobre harnesses **no formato em que estão** (plugin, projeto §6.4, ou v1 do revfactory); entrega sempre um **diagnóstico escrito com propostas** antes de qualquer mudança, e só muda com aprovação.

- [x] **Step 1: Adaptar o SKILL.md** — acrescentar: detecção do formato do harness alvo; saída obrigatória = arquivo de diagnóstico (achados → proposta → esforço) na língua do usuário; proibição de alterar sem aprovação; remoção de referências a caminhos internos do repo revfactory que não existem aqui.
- [x] **Step 2: Verificar** — grep por caminhos/comandos do repo de origem que ficaram órfãos: `grep -n "skills/harness\|revfactory" skills/evoluir/SKILL.md` → nenhuma referência quebrada.
- [x] **Step 3: Commit** — `feat: skill evoluir — diagnóstico primeiro, formato alvo livre`

### Task 6: Escrever `skills/guardas/SKILL.md` (conceito hookify, reescrito)

**Files:**
- Create: `skills/guardas/SKILL.md`

**Interfaces:**
- Consumes: chamado pelo módulo 5 do `construir`; também dispara sozinho em "criar uma regra/guarda/proteção para quando o agente fizer X".
- Produces: skill que conversa com o leigo sobre "o que nunca pode acontecer / o que sempre deve acontecer" no domínio dele e gera hooks de Claude Code (`PreToolUse`/`PostToolUse`/`Stop` em `.claude/settings.json` do harness alvo, com scripts Python/PowerShell quando precisar de lógica). Zero código copiado do hookify.

- [x] **Step 1: Escrever o SKILL.md** — fluxo: elicitar regras em linguagem do domínio (1–3 por vez) → traduzir cada uma para evento+matcher+ação → mostrar em linguagem leiga o que a regra faz → gravar com aprovação; incluir tabela dos eventos de hook suportados e um exemplo completo (regra "nunca enviar nada sem minha aprovação" → hook PreToolUse).
- [x] **Step 2: Verificar** — o exemplo do SKILL.md é um JSON de settings válido: extrair e validar com `python -c "import json..."`.
- [x] **Step 3: Commit** — `feat: skill guardas — regras em linguagem natural viram hooks`

### Task 7: Escrever `skills/validar/SKILL.md` (conceito plugin-dev, reescrito)

**Files:**
- Create: `skills/validar/SKILL.md`

**Interfaces:**
- Consumes: chamado pelo módulo 7 do `construir`; dispara sozinho em "validar/conferir meu harness".
- Produces: checklist executável que o Claude roda contra um harness e devolve relatório em linguagem leiga: estrutura §6.4 presente; frontmatter de skills/agents válido; glossário existe e os termos batem; gabaritos protegidos por regra de negação; nenhum `model:` fixado sem justificativa; nenhum script bash sem alternativa Windows; skill "comece aqui" presente; etapas obrigatórias não puláveis marcadas.

- [x] **Step 1: Escrever o SKILL.md com o checklist acima**, cada item com: como verificar (comando ou leitura) e o que dizer ao leigo quando falha.
- [x] **Step 2: Verificar** — rodar o checklist contra o próprio repo harness-factory (que NÃO é um harness §6.4): o relatório deve dizer corretamente que não se aplica/falha — prova que o checklist não dá falso "aprovado".
- [x] **Step 3: Commit** — `feat: skill validar — checklist de qualidade de harness`

### Task 8: Empacotamento, instalação e release

**Files:**
- Modify: `README.md` (instalação via `/plugin marketplace add joaocscr/harness-factory`, os 4 comandos, mapa do repo, seção de atualização manual das fontes), `CHANGELOG.md` (v0.1.0)

**Interfaces:**
- Consumes: todos os skills prontos (Tasks 4–7).
- Produces: plugin instalável; tag `v0.1.0`.

- [x] **Step 1: Completar README e CHANGELOG**
- [x] **Step 2: Instalar de verdade** — `/plugin marketplace add` apontando para o repo (ou caminho local) numa sessão de teste; Expected: plugin aparece e os 4 skills listam. Registrar o resultado.
- [x] **Step 3: Push + tag** — `git push && git tag v0.1.0 && git push --tags`
- [x] **Step 4: Commit final** — `chore: release v0.1.0`

### Task 9: Teste ponta a ponta — harness de domínio leigo

**Files:**
- Create (em pasta temporária de teste, fora do repo): um harness mínimo de domínio não-software (ex.: "due diligence de imóveis comerciais"), conduzido pelo skill `construir` com um subagente fazendo o papel do usuário leigo (persona: corretor, não sabe o que é API, responde "não sei" a pelo menos 2 perguntas).
- Create no repo: `docs/testes/2026-10-15-e2e-imoveis.md` (registro do teste)

- [x] **Step 1: Rodar o workshop com o subagente-persona até os módulos 1–5 (mínimo)**
- [x] **Step 2: Conferir conduta** — no transcript: nenhuma pergunta com jargão sem tradução; nos "não sei", a fábrica propôs padrão e seguiu. Expected: as duas condições verdadeiras.
- [x] **Step 3: Conferir estrutura gerada** — existe `metodo/` com `skills/`, `GLOSSARIO.md`; `.claude/settings.json` tem regra de negação para `metodo/evals/gabaritos/`; skill "comece aqui" existe; nenhum script gerado é bash puro. Expected: tudo verdadeiro.
- [x] **Step 4: Registrar resultado e commit** — `test: e2e harness leigo de domínio imobiliário`

### Task 10: Teste do `evoluir` contra a fleet

**Files:**
- Create (temp): clone de `joaocscr/equity-research-fleet`
- Create no repo: `docs/testes/2026-10-15-evoluir-fleet.md` (o diagnóstico produzido)

- [x] **Step 1: Clonar a fleet no scratchpad e rodar o skill `evoluir` contra ela**
- [x] **Step 2: Conferir** — saiu um diagnóstico com achados e propostas segundo os padrões da fábrica; **nenhum arquivo da fleet foi modificado** (`git -C <clone> status` limpo). Expected: ambos verdadeiros.
- [x] **Step 3: Registrar e commit** — `test: diagnóstico evoluir sobre a equity-research-fleet`
- [x] **Step 4: Conferir critérios de pronto §9 do design, um a um; registrar no CHANGELOG**
