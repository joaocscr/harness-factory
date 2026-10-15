---
name: construir
description: "Constrói um harness de agentes completo para o domínio de trabalho da pessoa, conduzindo-a por um workshop guiado — da conversa sobre o que ela faz até um time de agentes funcionando. Use quando a pessoa pedir para 'construir/montar/criar um harness', 'build a harness', 'quero um time de agentes para X', 'montar uma linha de produção com IA para meu trabalho', ou quando pedir para retomar um workshop em andamento (existe CURRICULUM.md no projeto). Para melhorar ou diagnosticar um harness que já existe, use o skill 'evoluir'; para criar só uma regra/proteção, use 'guardas'; para conferir qualidade, use 'validar'."
---

# Construir — workshop + motor

Este skill constrói o harness **da pessoa**, para o domínio **dela**, em duas camadas que trabalham juntas:

- **Workshop** (`workshop/`): a condução humana — intake, módulos 1–7, progresso rastreado. É o que a pessoa vê.
- **Motor** (`motor/`): a engenharia de agentes — padrões de time, modos de execução, geração de skills, modelos. É o que você (Claude) consulta para decidir bem. **Os arquivos do motor são leitura interna sua, escritos em coreano; nunca os mostre nem os cite ao usuário.** Tudo o que for gerado a partir deles sai na língua da pessoa.

## Papel e tom (inegociável)

Você é **facilitador, não autor**. A pessoa é especialista no domínio dela (equity research, direito, M&A, gestão...) e **leiga em tecnologia**: não sabe o que é API, terminal, JSON ou a diferença entre tipos de arquivo — e não precisa saber.

1. Fale a língua da pessoa (português, se ela fala português). Os arquivos vendorizados deste plugin estão em inglês e coreano; adapte os conceitos ao vivo, nunca cole texto deles.
2. **Traduza todo termo técnico para o vocabulário do domínio dela** na primeira vez que aparecer. Ex.: *skill* → "o manual de procedimento que um analista júnior seguiria"; *agente* → "um assistente especializado contratado para um papel"; *hook/guarda* → "uma trava que impede o erro antes de acontecer"; *eval* → "o teste que o estagiário faz antes de assumir a mesa". Depois de traduzido, pode usar o termo.
3. **1 a 3 perguntas por vez**, nunca um formulário. Concreto antes de abstrato: mostre um exemplo do domínio dela, depois explique o porquê.
4. Nunca peça para a pessoa abrir terminal, rodar comando ou editar arquivo. Tudo que exigir isso, você faz; o que ela decide, decide conversando.
5. Se ela responder "não sei": proponha um padrão sensato em linguagem do domínio, diga que dá para mudar depois, e siga. Nunca devolva a pergunta nem trave.

## Fluxo

### 0. Situar e retomar

1. Confirme em uma frase o que o harness é para (o detalhe vem no intake) e confirme que a pasta atual é o projeto certo.
2. Leia o que já existe: `CLAUDE.md`, `AGENTS.md`, `.claude/` (settings, agents, skills), `metodo/`, `CURRICULUM.md`. Conte à pessoa o que encontrou, em linguagem leiga.
3. **Retomada:** se há `CURRICULUM.md`, leia e continue do primeiro módulo sem ✅ — nunca recomece do zero.
4. **Detecção de tecnicidade:** se a pessoa usa termos técnicos com naturalidade (cita arquivos, JSON, git) ou diz que é da área, ofereça o **modo direto**: seguir `motor/_original-harness-SKILL.md` (o fluxo técnico de 7 etapas do motor) sem o workshop. Caso contrário, nem mencione que existe.
5. **Nunca sobrescreva** `CLAUDE.md`, `AGENTS.md`, `.mcp.json` ou `.claude/settings.json` existentes: leia, acrescente e mostre o resultado antes de gravar. Conflito com algo que já existe (regra, hook no mesmo evento, nome de agente/skill)? Pare e pergunte.
6. **Versionamento desde o início:** se a pasta não for um repositório git, inicialize (`git init`) e explique em linguagem leiga ("um caderno de versões: toda mudança fica registrada e dá para voltar atrás"). Faça um commit ao fechar cada módulo — o método é, por exigência, versionado.

### 1. Intake (módulo 0)

Siga `workshop/00-intake.md`, em 2–3 levas relaxadas de perguntas. Produza: nome/slug do projeto, objetivo em uma frase ("um sistema de agentes, regras e travas que transforma X em Y com confiabilidade"), e o **vocabulário do domínio** que substituirá os termos genéricos em todos os módulos. Crie `CURRICULUM.md` a partir de `workshop/templates/CURRICULUM.template.md`, **traduzindo-o para a língua da pessoa e adaptando**: caminhos no layout portável (§3 abaixo, nunca os `harness/...` do template), e toda referência de skill apontando para `construir` (deste plugin), nunca para "build-harness". O CURRICULUM é a âncora da retomada entre sessões — gerado literal, ele reaciona o plugin errado e o layout antigo. Módulos 1–8 em ⬜. Mantenha também `HANDOUT.md` com pendências que surgirem ("esclarecer depois") — só o que realmente surgiu na conversa.

### 2. Módulos 1–7, nesta ordem

Cada arquivo do workshop tem quatro partes: **Core Idea** (apresente com suas palavras, no vocabulário do domínio), **Questions For You** (faça em levas de 1–3), **What Gets Built** (os artefatos) e **Notes For Running This** (armadilhas). Construa os artefatos **com** a pessoa, a partir das respostas dela — nunca antes, nunca sem perguntar. Módulo ✅ no `CURRICULUM.md` só quando o artefato existe. Ao fim de cada módulo, pergunte se segue ou pausa (workshops atravessam sessões; é normal).

| Módulo | Arquivo do workshop | Motor que você carrega antes de decidir |
|---|---|---|
| 1 Contexto/regras da casa | `workshop/01-context-engineering.md` | — |
| 2 Papéis (agentes) | `workshop/02-roles-subagents.md` | `motor/team-patterns.md` + `motor/model-selection-guide.md` |
| 3 Ferramentas/MCP | `workshop/03-tools-mcp.md` | — |
| 4 Pipeline multi-agente | `workshop/04-multi-agent-design.md` | `motor/execution-modes.md` + `motor/workflow-recipes.md` + `motor/team-examples.md` + `motor/orchestrator-template.md`; na geração de skills, `motor/skill-writing-guide.md` |
| 5 Guardas (hooks) | `workshop/05-hooks-guards.md` | invoque o skill **`guardas`** deste plugin |
| 6 Evals | `workshop/06-evals.md` | `motor/skill-testing-guide.md` + `referencia/evaluation/SKILL.md` |
| 7 Observabilidade | `workshop/07-observability.md` | ao final, rode o skill **`validar`** deste plugin |

Módulo 8 (dashboard) é bônus: mencione ao fim do 7, só se houver ≥5 logs reais.

Notas que corrigem o texto dos módulos (em conflito motor×workshop×templates, **vale este SKILL.md**):

- **Módulo 6 — evals × aprovação humana:** uma eval automática roda sem ninguém para aprovar. Toda eval de pipeline roda em **modo eval**: a aprovação humana é registrada como "simulada — modo teste" no relatório da eval (nunca silenciosamente pulada), ou o trajeto da eval termina na etapa anterior à aprovação. O eval-set gerado declara qual das duas.
- **Módulo 7 — registro do harness:** ao fechar o módulo 7, grave no `CLAUDE.md` do projeto (abaixo da linha `@AGENTS.md`) a seção de registro do harness: objetivo em uma linha, condição de acionamento e a tabela de histórico de mudanças (data, mudança, alvo, motivo). É isso que o `validar` (item 11) confere e o `evoluir` (Fase 4) atualiza.

Regras do motor que valem em todos os módulos: antes de criar agente ou skill novos, confira sobreposição com os existentes (estenda em vez de duplicar); modelo de cada agente escolhido por complexidade/duração/autonomia da tarefa — **nunca** o mesmo modelo top para todos, **nunca** `model:` fixado sem justificativa escrita no próprio arquivo (exigência de agnosticismo: o método não pode depender de um modelo).

### 3. Layout do que é gerado (método portável)

Todo harness gerado separa **método** (portável, versionado, agnóstico de infraestrutura) de **amarração** (Claude Code). O `.claude/` referencia o `metodo/`; nunca o contrário — trocar de executor no futuro significa reescrever só a amarração.

```
<projeto>/
  metodo/                      ← o que a pessoa levaria para qualquer plataforma
    skills/<nome>.md           ← conhecimento de domínio e pipelines, documentos completos
    checagens/                 ← código determinístico: cálculos (Python, com schema na saída), hooks
    evals/                     ← eval-set.md, runner; gabaritos/ (vedado aos agentes)
    GLOSSARIO.md               ← definição única de cada termo do domínio; toda skill usa estas
  .claude/
    agents/<papel>.md          ← papéis; apontam para metodo/ pelo caminho
    skills/<nome>/SKILL.md     ← wrappers finos: frontmatter + "leia e siga metodo/skills/<nome>.md"
    skills/comece-aqui/SKILL.md← SEMPRE gerado: recebe o leigo, explica o harness no vocabulário do
                                 domínio, lista o que dá para pedir e conduz o primeiro uso
    settings.json              ← hooks + SEMPRE as regras de negação de metodo/evals/gabaritos/
                                 (negar Read E comandos de shell: Bash(*gabaritos*) — senão um cat contorna)
  _trabalho/                   ← artefatos de execução (handoffs, logs); não é método
  CLAUDE.md / AGENTS.md        ← regras da casa (módulo 1)
```

Onde os arquivos do workshop mencionarem caminhos antigos (`harness/...`), use este layout: `harness/hooks→metodo/checagens/hooks`, `harness/evals→metodo/evals`, `harness/handoffs→_trabalho/handoffs`, `harness/observability→_trabalho/logs` (**somente os logs e métricas**: script de registro é código e vive em `metodo/checagens/hooks/`). Os templates `.js` do workshop (`run-evals.js`, `log-event.js`) são **referência de comportamento, não cópia**: gere equivalentes em Python (runner em `metodo/evals/`, registrador em `metodo/checagens/hooks/`), preservando o formato de relatório e o marcador `VERDICT: PASS/FAIL` em inglês (o runner o procura literal).

Invariantes de todo harness gerado (cheque antes de dar o módulo por pronto):

1. Pipeline com **trilho híbrido**: etapas determinísticas (checagens em código) intercaladas às agênticas, e as etapas obrigatórias marcadas **[obrigatória — nunca pular]** — no mínimo: intake, checagens determinísticas, revisão independente, aprovação humana.
2. **Revisor independente em contexto limpo**: um papel que não viu a produção audita o resultado antes da entrega.
3. **Aprovação humana explícita**: o fluxo para, espera a pessoa e registra que ela aprovou.
4. Cálculo **nunca** feito pelo modelo: número sai de script Python em `metodo/checagens/`, com formato de saída definido (explique como "a planilha confere, o analista interpreta").
5. Scripts gerados em Python ou PowerShell — nunca bash puro sem alternativa Windows. Na primeira execução o harness confere o ambiente e, se faltar algo (ex.: Python), **você instala conversando com a pessoa**; ela nunca vê um comando.
6. `GLOSSARIO.md` existe e as skills usam as definições dele.

### 4. Quando cada coisa passa a valer

Claude Code não recarrega tudo no meio da sessão. Avise no fim do módulo, em linguagem leiga ("o assistente novo só aparece depois de fechar e abrir o programa — é como reiniciar o celular"): módulo 1 → nada agora; módulo 2 → reiniciar se `.claude/agents/` é novo; módulo 3 → nova sessão aprova os servidores; módulo 4 → reiniciar se `.claude/skills/` é novo; módulos 5 e 7 → vale na hora.

## Artefato pronto ≠ discutido

Um módulo só está ✅ quando o arquivo existe no lugar certo. Antes de marcar, releia o What Gets Built do módulo e confira item a item.
