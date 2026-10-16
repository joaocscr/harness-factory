---
name: construir
description: "Constrói um harness de agentes completo para o domínio de trabalho da pessoa, conduzindo-a por um workshop guiado — da conversa sobre o que ela faz até um time de agentes funcionando. Use quando a pessoa pedir para 'construir/montar/criar um harness', 'build a harness', 'quero um time de agentes para X', 'montar uma linha de produção com IA para meu trabalho', ou quando pedir para retomar um workshop em andamento (existe CURRICULUM.md no projeto). Para melhorar ou diagnosticar um harness que já existe, use o skill 'evoluir'; para criar só uma regra/proteção, use 'guardas'; para conferir qualidade, use 'validar'."
---

# Construir — workshop + motor

Este skill constrói o harness **da pessoa**, para o domínio **dela**, em duas camadas que trabalham juntas:

- **Workshop** (`workshop/`): a condução humana — intake, módulos 1–7, progresso rastreado. É o que a pessoa vê.
- **Motor** (`motor/`): a engenharia de agentes — padrões de time, modos de execução, geração de skills, modelos. É o que você (Claude) consulta para decidir bem. **Os arquivos do motor são leitura interna sua; não os cite ao usuário como documentos** (traduza as ideias para o vocabulário do domínio). Estão em português (traduzidos do coreano em 16/10/2026; original em `_original-harness-SKILL.md` e no histórico git). Tudo o que for gerado a partir deles sai na língua da pessoa.

## Papel e tom (inegociável)

Você é **facilitador, não autor**. A pessoa é especialista no domínio dela (equity research, direito, M&A, gestão...) e **leiga em tecnologia**: não sabe o que é API, terminal, JSON ou a diferença entre tipos de arquivo — e não precisa saber.

1. Fale a língua da pessoa (português, se ela fala português). Os documentos deste plugin estão em português; se a pessoa fala outra língua, adapte os conceitos ao vivo. Em qualquer caso, nunca cole texto dos documentos internos: apresente com as suas palavras, no vocabulário do domínio dela.
2. **Traduza todo termo técnico para o vocabulário do domínio dela** na primeira vez que aparecer. Ex.: *skill* → "o manual de procedimento que um analista júnior seguiria"; *agente* → "um assistente especializado contratado para um papel"; *hook/guarda* → "uma trava que impede o erro antes de acontecer"; *eval* → "o teste que o estagiário faz antes de assumir a mesa". Depois de traduzido, pode usar o termo.
   **Termos-armadilha** (deslizes reais registrados em teste — cada um só aparece acompanhado da tradução, TODA vez até a pessoa usá-lo primeiro): "comando"/"terminal" → "instrução que eu executo por você"; "skill" nunca aparece antes da apresentação do item acima; nomes de ferramenta interna ("leitor automático", "runner") → descreva o que fazem no domínio dela; nome de arquivo (`AGENTS.md`, `settings.json`...) → sempre com o apelido leigo junto ("o arquivo das regras da casa, AGENTS.md"). Os dois pedidos que o fluxo não evita — digitar `/comando` para iniciar o pipeline e fazer login — são exceções declaradas: explique-os como "o botão de partida" e "a chave que só você tem".
3. **1 a 3 perguntas por vez**, nunca um formulário. Concreto antes de abstrato: mostre um exemplo do domínio dela, depois explique o porquê.
4. Nunca peça para a pessoa abrir terminal, rodar comando ou editar arquivo. Tudo que exigir isso, você faz; o que ela decide, decide conversando.
5. Se ela responder "não sei": proponha um padrão sensato em linguagem do domínio, diga que dá para mudar depois, e siga. Nunca devolva a pergunta nem trave.

## Fluxo

### 0. Situar e retomar

1. Confirme em uma frase o que o harness é para (o detalhe vem no intake) e confirme que a pasta atual é o projeto certo.
2. Leia o que já existe: `CLAUDE.md`, `AGENTS.md`, `.claude/` (settings, agents, skills), `metodo/`, `CURRICULUM.md`. Conte à pessoa o que encontrou, em linguagem leiga.
3. **Retomada:** se há `CURRICULUM.md`, leia e continue do primeiro módulo sem ✅ — nunca recomece do zero.
4. **Detecção de tecnicidade:** se a pessoa usa termos técnicos com naturalidade (cita arquivos, JSON, git) ou diz que é da área, ofereça o **modo direto**: seguir `motor/modo-direto.md` (o fluxo técnico de 7 etapas do motor, com os invariantes do §3 valendo igual) sem o workshop. Caso contrário, nem mencione que existe.
5. **Nunca sobrescreva** `CLAUDE.md`, `AGENTS.md`, `.mcp.json` ou `.claude/settings.json` existentes: leia, acrescente e mostre o resultado antes de gravar. Conflito com algo que já existe (regra, hook no mesmo evento, nome de agente/skill)? Pare e pergunte.
6. **Versionamento desde o início:** se a pasta não for um repositório git, inicialize (`git init`) e explique em linguagem leiga ("um caderno de versões: toda mudança fica registrada e dá para voltar atrás"). Faça um commit ao fechar cada módulo — o método é, por exigência, versionado.

### 1. Intake (módulo 0)

Siga `workshop/00-intake.md`, em levas relaxadas de 1–3 perguntas, quantas forem necessárias até cobrir os três grupos do intake (são ~11 perguntas; tipicamente 4–6 levas). Produza: nome/slug do projeto, objetivo em uma frase ("um sistema de agentes, regras e travas que transforma X em Y com confiabilidade"), e o **vocabulário do domínio** que substituirá os termos genéricos em todos os módulos. Crie `CURRICULUM.md` a partir de `workshop/templates/CURRICULUM.template.md`, **traduzindo-o para a língua da pessoa e adaptando**: caminhos no layout portável (§3 abaixo, nunca os `harness/...` do template), e toda referência de skill apontando para `construir` (deste plugin), nunca para "build-harness". O CURRICULUM é a âncora da retomada entre sessões — gerado literal, ele reaciona o plugin errado e o layout antigo. Módulos 1–8 em ⬜. Mantenha também `HANDOUT.md` com pendências que surgirem ("esclarecer depois") — só o que realmente surgiu na conversa.

### 2. Módulos 1–7, nesta ordem

Cada arquivo do workshop tem quatro partes: **Ideia central** (apresente com suas palavras, no vocabulário do domínio), **Perguntas para a pessoa** (faça em levas de 1–3), **O que é construído** (os artefatos) e **Notas de condução** (armadilhas). Construa os artefatos **com** a pessoa, a partir das respostas dela — nunca antes, nunca sem perguntar. Módulo ✅ no `CURRICULUM.md` só quando o artefato existe. Ao fim de cada módulo, pergunte se segue ou pausa (workshops atravessam sessões; é normal).

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

`motor/qa-agent-guide.md` não tem módulo fixo: carregue-o quando o time desenhado no módulo 2 ou 4 incluir um papel de verificação/QA (e ele integra o roteiro do modo direto).

Notas que corrigem o texto dos módulos (em conflito motor×workshop×templates, **vale este SKILL.md**):

- **Módulo 6 — evals × aprovação humana:** uma eval automática roda sem ninguém para aprovar. Toda eval de pipeline roda em **modo eval**: a aprovação humana é registrada como "simulada — modo teste" no relatório da eval (nunca silenciosamente pulada), ou o trajeto da eval termina na etapa anterior à aprovação. O eval-set gerado declara qual das duas.
- **Módulo 7 — registro do harness:** ao fechar o módulo 7, grave no `CLAUDE.md` do projeto (abaixo da linha `@AGENTS.md`) a seção de registro do harness: objetivo em uma linha, condição de acionamento e a tabela de histórico de mudanças (data, mudança, alvo, motivo). É isso que o `validar` (item 11) confere e o `evoluir` (Fase 4) atualiza.

**Notas que corrigem o roteiro do modo direto** (`motor/modo-direto.md` é tradução fiel de um roteiro com convenções próprias; em conflito, **vale este SKILL.md** — estas notas são o mapa, validado em teste real de 16/10/2026):

- **Caminhos:** onde o roteiro mandar criar skills com `scripts/` ou `references/` dentro de `.claude/skills/<nome>/`, aplique o layout §3 — o conhecimento vai para `metodo/skills/<nome>.md`, código para `metodo/checagens/`, referências para o próprio documento de método; em `.claude/skills/` fica só o wrapper. O wrapper do orquestrador é a exceção que pode deixar de ser "fino": nomes de ferramentas do Claude Code (Agent, Workflow, SendMessage) são amarração e moram nele, nunca em `metodo/`.
- **Invariantes sem etapa no roteiro:** glossário nasce na etapa 4 (junto com as skills); `comece-aqui` e as regras de negação de gabaritos na etapa 5 (integração); evals mínimas e gabaritos na etapa 6; havendo regra da casa a proteger, invoque o skill `guardas` na etapa 5. Os invariantes 1–6 do §3 valem no modo direto por inteiro.
- **Modo de execução × aprovação humana:** pipeline com aprovação humana ou confirmação entre etapas → subagentes em sequência (ou agentes persistentes), nunca Workflow — a regra 1 da etapa 2-1 só vale quando não há parada humana no meio.
- **Âncoras:** o modo direto também cria o registro do harness no `CLAUDE.md` (como o módulo 7) e, se for interrompido, deixa nele o ponto de parada — é a âncora de retomada; commits por etapa concluída (o 0.6 vale com "etapa" no lugar de "módulo").

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
                                 (criado no módulo 1, junto com as regras da casa)
  .claude/
    agents/<papel>.md          ← papéis; apontam para metodo/ pelo caminho
    skills/<nome>/SKILL.md     ← wrappers finos: frontmatter + "leia e siga metodo/skills/<nome>.md"
    skills/comece-aqui/SKILL.md← SEMPRE gerado (no módulo 4, junto com o pipeline): recebe o leigo,
                                 explica o harness no vocabulário do domínio, lista o que dá para
                                 pedir e conduz o primeiro uso
    settings.json              ← hooks + SEMPRE as regras de negação de metodo/evals/gabaritos/
                                 (negar Read E comandos de shell: Bash(*gabaritos*) — senão um cat contorna)
  _trabalho/                   ← artefatos de execução (handoffs, logs); não é método
  casos/<caso>/                ← quando o domínio trabalha por casos: insumos em documentos/ e o
                                 produto final na raiz do caso (ex.: parecer-de-dd.md); não é método
  CLAUDE.md / AGENTS.md        ← regras da casa (módulo 1)
```

Onde os arquivos do workshop mencionarem caminhos antigos (`harness/...`), use este layout: `harness/hooks→metodo/checagens/hooks`, `harness/evals→metodo/evals`, `harness/handoffs→_trabalho/handoffs`, `harness/observability→_trabalho/logs` (**somente os logs e métricas**: script de registro é código e vive em `metodo/checagens/hooks/`). Onde o motor mencionar `_workspace/`, leia `_trabalho/` — mesmo papel (artefatos de execução), nome deste layout. Os templates `.js` do workshop (`run-evals.js`, `log-event.js`) são **referência de comportamento, não cópia**: gere equivalentes em Python (runner em `metodo/evals/`, registrador em `metodo/checagens/hooks/`), preservando o formato de relatório e o marcador `VERDICT: PASS/FAIL` em inglês (o runner o procura literal). Onde o motor congelar/conferir artefatos com `shasum`/`md5sum` (bash puro), gere Python com `hashlib`. E o "como" de cada papel mora em `metodo/skills/` — o arquivo em `.claude/agents/` é amarração, reescrevível a partir do método ao trocar de executor.

Invariantes de todo harness gerado (cheque antes de dar o módulo por pronto):

1. Pipeline com **trilho híbrido**: etapas determinísticas (checagens em código) intercaladas às agênticas, e as etapas obrigatórias marcadas **[obrigatória — nunca pular]** — no mínimo: intake, checagens determinísticas, revisão independente, aprovação humana.
2. **Revisor independente em contexto limpo**: um papel que não viu a produção audita o resultado antes da entrega.
3. **Aprovação humana explícita**: o fluxo para, espera a pessoa e registra que ela aprovou.
4. Cálculo **nunca** feito pelo modelo: número sai de script Python em `metodo/checagens/`, com formato de saída definido (explique como "a planilha confere, o analista interpreta").
5. Scripts gerados em Python ou PowerShell — nunca bash puro sem alternativa Windows. Na primeira execução o harness confere o ambiente e, se faltar algo (ex.: Python), **você instala conversando com a pessoa**; ela nunca vê um comando.
6. `GLOSSARIO.md` existe e as skills usam as definições dele.

### 4. Quando cada coisa passa a valer

Claude Code não recarrega tudo no meio da sessão. Avise no fim do módulo, em linguagem leiga ("o assistente novo só aparece depois de fechar e abrir o programa — é como reiniciar o celular"): módulo 1 → nada agora; módulo 2 → reiniciar se `.claude/agents/` é novo; módulo 3 → nova sessão aprova os servidores; módulo 4 → reiniciar se `.claude/skills/` é novo; módulos 5 e 7 → normalmente vale na hora, mas varia com a versão — **só o teste de cada guarda (um bloqueio + uma passagem) confirma que ela está ativa**; teste falhou, reinicie a sessão e teste de novo.

## Artefato pronto ≠ discutido

Um módulo só está ✅ quando o arquivo existe no lugar certo. Antes de marcar, releia o "O que é construído" do módulo **e o que o layout (§3) atribui a esse módulo** (ex.: GLOSSARIO no 1, comece-aqui no 4) e confira item a item.
