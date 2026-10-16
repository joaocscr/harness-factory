# Finalização do harness-factory (v0.2.0) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar todos os pontos em aberto do harness-factory — língua padronizada em português, os 5 pontos do plano de ação da auditoria de 16/10, minors residuais — e entregar a v0.2.0 revisada por revisor independente.

**Architecture:** Nenhuma mudança estrutural: traduções fiéis in loco (original preservado no histórico git), edições pontuais de texto nos skills, dois testes novos registrados em `docs/testes/`, revisão final em contexto limpo.

**Tech Stack:** Markdown/JSON, git/gh, `claude plugin validate`. Traduções por agente com verificação de fidelidade independente.

**Spec:** `docs/superpowers/specs/2026-10-15-fabrica-harness-design.md` continua sendo a autoridade. Fontes adicionais desta rodada: o relatório da auditoria de 16/10/2026 (sessão "Auditoria profunda do trabalho realizado": 0 críticos, 4 importantes, 6 menores, plano de ação em 5 pontos) e a diretriz nova do dono: **padronizar a língua dos documentos em português** (derroga, por decisão do dono em 16/10, a regra "motor mantido intocado em coreano" do CLAUDE.md — os originais ficam no histórico git e os `_original-*.md` continuam intocados).

## Global Constraints

- Traduções são **fiéis**: mesmo conteúdo, mesma estrutura de títulos/tabelas/exemplos; nada é resumido, melhorado ou cortado. Termos de API/código (`agent()`, `pipeline()`, `model:`, nomes de arquivos) ficam como estão; `VERDICT: PASS/FAIL` fica em inglês (os runners o procuram literal).
- `_original-harness-SKILL.md` e `_original-build-harness-SKILL.md` continuam intocados (referência de vendorização).
- Toda mudança atualiza o que a descreve: ATTRIBUTION.md (estado real das adaptações), CLAUDE.md (regras), CHANGELOG (v0.2.0).
- Commits frequentes com a atribuição padrão da sessão; push ao fim de cada task.
- Fora do escopo, por depender do dono (vetável): eval de pipeline completa com caso real (exige login e PDFs reais — lacuna (c) da auditoria, fica para o primeiro uso).

## Review Focus

1. **Tradução que muda comportamento** — um número, um limite ou uma regra do motor alterados na tradução mudam o que a fábrica gera (teste: verificação de fidelidade por agente independente, Task 1/2 passo 3).
2. **Referência quebrada pós-tradução** — texto que ainda diz "em coreano/inglês" ou aponta arquivo renomeado (teste: greps da Task 3).
3. **"Hooks valem na hora" falso** — leigo confia numa trava inativa (teste: Task 4 confere a doc atual e o texto final reflete o comportamento real).
4. **Runner Node gerado pelo módulo 6** — viola o invariante Python/Windows (teste: grep "unchanged"/"needs Node" no 06 após a Task 4).
5. **Instalação real nunca exercitada** — plugin que valida mas não instala (teste: Task 7 instala de verdade via CLI e registra a saída).

---

### Task 1: Traduzir o motor (coreano → português)

**Files:**
- Modify: `skills/construir/motor/execution-modes.md`, `model-selection-guide.md`, `orchestrator-template.md`, `qa-agent-guide.md`, `skill-testing-guide.md`, `skill-writing-guide.md`, `team-examples.md`, `team-patterns.md`, `workflow-recipes.md` (tradução in loco; originais ficam no histórico git, commit 8cb4e8e)
- Create: `skills/construir/motor/modo-direto.md` — tradução fiel PT de `_original-harness-SKILL.md` (que fica intocado)

**Interfaces:**
- Produces: motor 100% PT; `modo-direto.md` é o novo roteiro do modo direto que a Task 3 referencia no `construir`.

- [ ] **Step 1: Traduzir os 9 arquivos** (agente tradutor com as Global Constraints no prompt; um commit por lote coerente)
- [ ] **Step 2: Criar `modo-direto.md`** a partir do `_original-harness-SKILL.md`
- [ ] **Step 3: Verificar** — (a) zero caracteres coreanos: `grep -rP "[\x{AC00}-\x{D7AF}]" skills/construir/motor/ --include="*.md" -l` exclui apenas `_original-harness-SKILL.md`; (b) fidelidade: agente independente compara 3 arquivos sorteados com o original do histórico git (estrutura, números, regras) e reporta divergências; divergência material = corrigir e reamostrar.
- [ ] **Step 4: Commit** — `feat: motor traduzido para português (originais no histórico git)`

### Task 2: Traduzir o workshop (inglês → português)

*Interpretação minha de "padronizar a língua": o workshop em inglês também vira PT — além de padronizar, elimina a adaptação ao vivo que o facilitador faz hoje. Vetável sem afetar o resto do plano.*

**Files:**
- Modify: `skills/construir/workshop/00-intake.md` … `08-dashboard-bonus.md` (9 arquivos) e `templates/CURRICULUM.template.md` (tradução in loco; `log-event.js`/`run-evals.js` só comentários; `_original-build-harness-SKILL.md` intocado)

- [ ] **Step 1: Traduzir** (mesmo protocolo da Task 1, preservando as adaptações já feitas nos módulos 00/04/05/06/07)
- [ ] **Step 2: Verificar** — fidelidade por amostragem (2 arquivos) + conferir que as adaptações v0.1.x sobreviveram: greps por "modo eval", "registrar_evento.py", "levas de 1–3", "[obrigatória — nunca pular]" (ou seus equivalentes traduzidos, atualizando os greps correspondentes no `construir`)
- [ ] **Step 3: Commit** — `feat: workshop traduzido para português`

### Task 3: Consistência pós-tradução

**Files:**
- Modify: `skills/construir/SKILL.md` (remover "escritos em coreano…"; modo direto passa a apontar `motor/modo-direto.md`; nota de "adapte ao vivo do inglês" vira "os documentos são em português"), `ATTRIBUTION.md` (estado real: módulos 00 e 04–07 adaptados + tudo traduzido, achado menor 1 da auditoria), `CLAUDE.md` (regra do motor atualizada: "traduzido fielmente em 16/10/2026; originais no histórico git e nos `_original-*`"), `README.md` (nota sobre idioma)

- [ ] **Step 1: Editar os 4 arquivos**
- [ ] **Step 2: Verificar** — `grep -rn "coreano\|em inglês" skills/construir/SKILL.md skills/evoluir/SKILL.md README.md CLAUDE.md` → só menções historicamente corretas (ex.: ATTRIBUTION)
- [ ] **Step 3: Commit** — `chore: referências e atribuições pós-tradução`

### Task 4: Passe de correções da auditoria (ponto 1 do plano de ação) + minors restantes

**Files:**
- Modify: `skills/construir/workshop/06-evals.md` (importante 1: runner "unchanged"/Node → porte fiel em Python em `metodo/evals/`, preservando `VERDICT: PASS/FAIL`, como o 07 já faz)
- Modify: `skills/guardas/SKILL.md` e `skills/construir/SKILL.md` (importante 2: conferir na documentação atual do Claude Code se hooks valem imediatamente; trocar "valem na hora" por texto fiel ao comportamento real + "o teste obrigatório de cada guarda confirma quando passou a valer")
- Modify: `skills/guardas/SKILL.md` (menor 2: exemplo com `${CLAUDE_PROJECT_DIR}` no caminho do script)
- Modify: `skills/construir/SKILL.md` (menores 7 e 10 do parecer: nota "checklist de fechamento de módulo = What Gets Built + o que o layout atribui ao módulo"; linha dizendo que `qa-agent-guide.md` é alcançado pelo modo direto e pelo módulo 4 quando houver papel de QA)
- Modify: `docs/superpowers/plans/2026-10-15-harness-factory.md` (menor 9: checkboxes marcados `[x]` — registro fiel)

- [ ] **Step 1: Conferir comportamento de hooks na doc atual** (WebFetch/WebSearch da doc oficial de hooks do Claude Code; registrar o achado no commit)
- [ ] **Step 2: Aplicar as edições**
- [ ] **Step 3: Verificar** — grep "unchanged\|needs Node" no 06 → 0; grep "valem na hora" → 0; grep "CLAUDE_PROJECT_DIR" no exemplo do guardas → 1+
- [ ] **Step 4: Commit** — `fix: passe de correções da auditoria de 16/10`

### Task 5: Termos-armadilha (ponto 3) + autoteste do validar (ponto 2)

**Files:**
- Modify: `skills/construir/SKILL.md` — decisão: os 4 deslizes viram **regra nova** na seção "Papel e tom": lista de termos-armadilha de tradução obrigatória (comando/terminal, skill, leitor automático, nomes de arquivo técnicos) + regra geral "nome de arquivo só aparece acompanhado da tradução"
- Create: `docs/testes/2026-10-16-autoteste-validar.md` — rodar o checklist do `validar` contra o próprio repositório e registrar (reproduz a verificação da Task 7 do plano anterior, que ficou sem artefato)

- [ ] **Step 1: Escrever a regra de termos-armadilha**
- [ ] **Step 2: Corrigir o CHANGELOG §9-2** (importante 4 do parecer): "✔" vira "✔ com ressalvas de condução registradas (4 deslizes de jargão → regra de termos-armadilha na v0.2.0)"
- [ ] **Step 3: Rodar o autoteste do validar e registrar** (formato ✅/⚠️/❌/não-se-aplica; a prova é não dar falso "aprovado" num alvo formato plugin)
- [ ] **Step 4: Commit** — `feat: termos-armadilha no construir; test: autoteste do validar registrado`

### Task 6: Teste do modo direto (ponto 5)

**Files:**
- Create: `docs/testes/2026-10-16-teste-modo-direto.md` + harness de teste em `.superpowers/e2e/modo-direto/` (git-ignorado)

- [ ] **Step 1: Agente com persona técnica** (ex.: analista quant que conhece git/JSON) pede um harness pequeno; o facilitador detecta tecnicidade, oferece o modo direto e segue `motor/modo-direto.md` (já em PT)
- [ ] **Step 2: Verificar** — o fluxo de 7 etapas do motor foi seguido; o resultado respeita os invariantes da fábrica (layout portável, Python, sem model pin injustificado); registrar divergências motor×invariantes se aparecerem
- [ ] **Step 3: Commit** — `test: modo direto com persona técnica`

### Task 7: Instalação real (ponto 4) e release v0.2.0

**Files:**
- Modify: `CHANGELOG.md` (v0.2.0 + registro da instalação, fechando §9-1 por inteiro), `.claude-plugin/plugin.json` (version 0.2.0)

- [ ] **Step 1: Tentar a instalação via CLI, sem bloquear** (ajuste do dono em 16/10: entregar tudo pronto; a instalação real é a ÚNICA pendência aceitável, e nada espera por ele) — tentar `claude plugin marketplace add joaocscr/harness-factory` + `claude plugin install harness-factory@harness-factory`; funcionando, conferir que os 4 skills aparecem e registrar comando + saída no CHANGELOG (fecha §9-1 por inteiro). Exigindo interatividade, registrar no CHANGELOG a pendência com os comandos prontos, e seguir.
- [ ] **Step 2: `claude plugin validate .`** → saída registrada (fecha o menor 4 do parecer)
- [ ] **Step 3: Commit + tag** — `chore: release v0.2.0` + `git tag v0.2.0` + push com tags

### Task 8: Revisão final e entrega

- [ ] **Step 1: Revisor independente em contexto limpo** (modelo mais capaz) sobre o diff v0.1.2→v0.2.0 + spec + este plano + Review Focus acima, com atenção especial à fidelidade das traduções
- [ ] **Step 2: Re-graduar, UM passe de correções (Critical/Important), minors diferidos registrados**
- [ ] **Step 3: Registro final** — atualizar `docs/testes/` com o parecer, CHANGELOG se houver correções, push final. Relatório ao dono com rulings e diferidos.
