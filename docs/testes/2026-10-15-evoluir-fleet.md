# Diagnóstico — equity-research-fleet v6.1.0 (2026-10-15)

> Produto da Fase 3 do skill `evoluir`, em **modo auditoria**: nenhum arquivo do harness alvo foi alterado; nada aqui foi aplicado. Cada item só vira mudança com aprovação explícita do dono da fleet, um por vez (Fase 4).

## Contexto da auditoria

- **Alvo:** clone raso de `github.com/joaocscr/equity-research-fleet` (HEAD `0f0c169`, "Update README.md"), em `.superpowers/e2e/fleet`.
- **Formato detectado (Fase 0):** Plugin de Claude Code (`.claude-plugin/plugin.json` + `marketplace.json` na raiz). Peças: 3 skills (`er-analise`, `multiplos-justos`, `relatorio-html`), 5 agentes (`pesquisador`, `operador-mj`, `auditor-mj`, `verificador`, `revisor-comite`), 4 comandos (`/analisar`, `/leitura-de-preco`, `/revisar-relatorio`, `/anexo-financeiro`), 2 scripts de checagem, CI no GitHub. Não é harness v1 (sem `TeamCreate`/`TeamDelete`).
- **Régua:** invariantes do skill `construir` (seção "Layout do que é gerado"): método separado da amarração, trilho híbrido com etapas obrigatórias marcadas, revisor independente em contexto limpo, aprovação humana explícita, cálculo em código, scripts compatíveis com Windows e ambiente conferido, gabaritos protegidos, `GLOSSARIO.md`, `comece-aqui`. A estrutura atual da fleet não foi tomada como referência.
- **Escopo:** a fleet como harness (estrutura, agentes, skills, gatilhos, trilho, evals, glossário). A metodologia financeira (Múltiplos Justos, rotas, gates 0–3, régua de research) **não** foi avaliada.

### Sinais coletados (Fase 1)

| Fonte | O que mostrou |
|---|---|
| Configuração | Lida integralmente: README, MIGRACAO-V6, release v6.1.0, casos de aceitação, os 5 agentes, os 4 comandos, as 3 `SKILL.md`, as referências do `er-analise`, o kernel e os arquivos de roteamento/manutenção do `multiplos-justos`, os 2 scripts e os 2 workflows. |
| Histórico git | Clone raso; consultado também o histórico remoto via API (somente leitura): **3 commits**, todos de 2026-09-19 (release v6.1.0 + dois ajustes de README). A evolução real (v5 → v6 → v6.1, v10 → v10.1 do MJ) está registrada em documentos, não no git. |
| Área de trabalho | Inexistente no repositório: `analises/` está no `.gitignore`. Não há como conferir se os artefatos previstos (`audit.md`, `fact-check.md`, `committee-review.md`, `valuation-case.md`) são produzidos de fato. |
| Execução real (indireta) | `docs/releases/v6.1.0.md`, seção "Diagnóstico que motivou a versão", relata uma execução real (TotalEnergies) com falhas nomeadas: "artefatos superados sobrevivendo ao rerun e revisões executadas no mesmo contexto sem declarar", entre outras. É o sinal observacional mais forte disponível. |
| Execução das checagens | `scripts/validate-plugin.py` rodado de fora do repositório (com `-B`, sem gerar arquivos): **passa** (estrutura, manifests, guardrails de texto, `justos.py selftest`). O comando documentado do motor rodado de uma pasta qualquer: **falha** (ver achado 1). |
| Feedback do dono | Não há (auditoria). Nenhuma correção recorrente relatada; os padrões de repetição abaixo vêm do próprio texto da fleet. |

## O que funciona e deve ser preservado

Antes dos achados, o que a fleet já faz bem — em vários pontos melhor que o mínimo da fábrica:

1. **Cálculo em código com autoridade declarada.** `justos.py` é "autoridade para todo cálculo que cobre"; o operador é proibido de replicar fórmula em texto, planilha ou conta mental; há `selftest`, `testes.py` em duas fases e CI que roda tudo a cada push. Isso é exatamente o invariante 4.
2. **Três lentes de revisão independentes e com fronteira nítida** (metodologia / fatos / qualidade de research), cada uma com pergunta única e proibição explícita de invadir a outra. O `revisor-comite` lê só o `relatorio.html`, como o leitor real — contexto limpo de verdade.
3. **Independência declarada quando não pode ser real** ("`modo: mesmo contexto`" no cabeçalho). É uma solução honesta e rara.
4. **Loop `RESEARCH REQUIRED`**: lacuna de evidência volta como mandato, com formato fixo, em vez de virar premissa inventada.
5. **Gabarito oculto fora do repositório e fora do contexto** (`docs/casos-de-aceitacao.md`) — o espírito do "gabaritos protegidos" chegou sozinho.
6. **Nenhum `model:` fixado** nos agentes; **scripts em Python**, que rodam no Windows.
7. **Releases com "o que deliberadamente não entrou"** — registro do porquê das decisões, que é o que permite evoluir sem re-litigar.

---

## Achados

Ordenados por prioridade (impacto no uso real ÷ esforço). Cada um segue: achado com evidência → generalização com o porquê → proposta concreta → esforço e risco.

### 1. As checagens determinísticas apontam para caminhos que só existem para quem desenvolve o plugin

**Achado.** Todos os comandos de script são relativos à raiz do repositório:
- `skills/multiplos-justos/SKILL.md`: `python skills/multiplos-justos/scripts/justos.py selftest`;
- `skills/relatorio-html/SKILL.md`: `python scripts/validate-report.py analises/<TICKER>/<AAAA-MM-DD>/relatorio.html`;
- `references/core/motor.md` usa **outra** convenção, relativa à pasta da skill: `python scripts/justos.py ...`.

Nenhum arquivo usa `${CLAUDE_PLUGIN_ROOT}` nem o diretório base que o Claude Code informa ao carregar a skill. Instalado pelo marketplace (o caminho que o README ensina), o plugin fica numa pasta de cache e a sessão roda na pasta de trabalho do usuário, onde `analises/` é criada. Teste feito: o comando do `SKILL.md` rodado de outra pasta devolve `can't open file ... justos.py: [Errno 2] No such file or directory`. Também não há conferência de ambiente (Python ausente não é tratado; o `selftest` é a única sonda, e falha pelo mesmo motivo de caminho).

**Generalização.** Uma etapa determinística só protege se o caminho resolve **no ambiente de quem usa**, não no de quem constrói. Quando o comando falha, o agente improvisa: procura o arquivo, tenta outro caminho ou — no pior caso — refaz a conta "de cabeça", que é exatamente o que o invariante 4 proíbe. A falha é silenciosa porque o CI roda na raiz do repositório e passa.

**Proposta.**
- Na **amarração**, sem tocar o kernel: em `agents/operador-mj.md` (seção "Antes de calcular") e em `skills/er-analise/SKILL.md` (seção "Valuation é Múltiplos Justos"), uma linha: "O motor está em `<diretório base da skill multiplos-justos>/scripts/justos.py`; os comandos de `motor.md` são relativos a esse diretório. Os scripts do Fleet (`validate-report.py`) estão em `${CLAUDE_PLUGIN_ROOT}/scripts/`." Em `skills/relatorio-html/SKILL.md`, trocar o comando por `python "${CLAUDE_PLUGIN_ROOT}/scripts/validate-report.py" <caminho do relatorio.html>`.
- Em `scripts/validate-plugin.py`: rodar o `selftest` também com `cwd` numa pasta temporária vazia, para que o CI pegue a regressão.
- Primeira execução de `/analisar`: conferir `python --version`; se faltar, o agente oferece instalar conversando com o usuário (invariante 5), sem mandar comando.

**Esforço e risco.** Pequeno. Risco: `${CLAUDE_PLUGIN_ROOT}` não é expandido em todo tipo de texto em todas as versões do Claude Code — por isso a proposta usa o diretório base da skill como referência principal e testa nos dois modos (instalado pelo marketplace e clone local). **Conflito com o histórico:** a v6.1 declara "nenhuma alteração em `multiplos-justos`" e o `.gitattributes` preserva o kernel byte a byte (os anchors de `testes.py` dependem disso). O critério que satisfaz os dois: corrigir na amarração (`er-analise`, agentes, `relatorio-html`), nunca em `motor.md` nem no `SKILL.md` do kernel. A exceção seria a linha do `selftest` no `SKILL.md` do kernel; ela pode ficar como está se o agente souber traduzir o caminho.

### 2. Falhas mecânicas repetidas foram tratadas com mais prosa, não com checagem em código; o trilho obrigatório não é marcado

**Achado.**
- A release v6.1 relata falhas reais de execução: "artefatos superados sobrevivendo ao rerun e revisões executadas no mesmo contexto sem declarar". A resposta foi texto novo em **quatro arquivos** para a mesma regra de versão única/staleness (`er-analise` "Versão única, revisores sobre a versão final"; `operador-mj` "Saída canônica"; `auditor-mj` item "staleness"; `verificador` "mensagem de entrega ... conferida contra `outputs.json`") e em **quatro arquivos** para a regra de declarar o modo de execução.
- O único validador do fluxo, `validate-plugin.py`, confere a **presença de frases** no `SKILL.md` (ex.: o token `'teste de "entendido"'`). Ele protege o texto da regra, não o comportamento.
- `validate-report.py` existe e é bom, mas só roda se o agente lembrar (instrução no fim de `relatorio-html`). Não há `hooks/` no plugin.
- Nenhuma etapa está marcada como obrigatória e não pulável. O `er-analise` diz "Não imponha número de ... agentes" e "Os revisores apontam; você decide" — numa sessão longa e apertada de contexto, nada impede o fechamento sem `auditor-mj`, `verificador` ou `revisor-comite`.

**Generalização.** Regra que **se repete por causa mecânica** (arquivo velho que sobrevive, revisão que não rodou, cabeçalho que falta) se resolve com checagem em código; prosa é para o que exige julgamento. Repetir a mesma regra em quatro lugares é o sinal clássico de "o mesmo tipo de correção pedido 2+ vezes" (Fase 1). Isso **não contradiz** a decisão da v6.1 de não criar "validador de conteúdo do relatório" nem o item 9 do MIGRACAO ("sem transformar julgamento intelectual em hook"): existência de arquivo, data de modificação e hash são fatos, não julgamento.

**Proposta.**
- Novo `scripts/checar-entrega.py <pasta da análise> --modo analisar|leitura|anexo|revisao`, que confere, conforme o modo: (a) `valuation/audit.md`, `review/fact-check.md`, `review/committee-review.md` existem; (b) cada um é posterior ao `outputs.json` e ao `relatorio.html` vigentes (data ou hash registrado no cabeçalho); (c) cada um declara `modo:` no cabeçalho; (d) roda `validate-report.py`. Saída em formato fixo (lista de pendências ou "OK").
- Em `skills/er-analise/SKILL.md`, seção "Fechamento em três lentes", marcar as etapas mínimas como **[obrigatória — nunca pular]**: auditoria metodológica, verificação factual, revisão de comitê, `checar-entrega.py` verde (e a aprovação humana do achado 3). Deixar explícito que a liberdade analítica vale para pesquisa e forma, **não** para o fechamento.
- Opcional, depois de validado: hook `PostToolUse` em `Write` de `relatorio.html` rodando `validate-report.py`, em `hooks/hooks.json` do plugin.
- Com o script no lugar, as quatro cópias da regra de staleness podem ser reduzidas a uma (no `er-analise`) mais "o script confere".

**Esforço e risco.** Médio. Risco: bloquear fluxos legítimos que não têm as três revisões (`/leitura-de-preco` não exige comitê; `/anexo-financeiro` não tem valuation) — daí o `--modo`. Risco de a checagem virar template, que a v6.1 quis evitar: o script não olha conteúdo, só existência, ordem temporal e cabeçalho.

### 3. Não existe aprovação humana explícita antes de o relatório ser dado como final

**Achado.** `er-analise`: "O padrão é autonomia"; os checkpoints com o usuário são só para pesquisa cara, documento que está com ele ou direção de deep dive. `commands/analisar.md`: "Trabalhe com autonomia ... Consulte o usuário apenas nos checkpoints de alto valor". No fechamento, "Os revisores apontam; você decide" — quem decide sobre os findings dos revisores é o próprio agente, e o usuário recebe o produto pronto, sem ver quais findings foram rejeitados. Nada registra que alguém aprovou. A única parada obrigatória que existe é a restrição de investimento em `preferencias-do-dono.md` (vínculo governamental) — prova de que o dono já usa esse mecanismo quando acha importante.

**Generalização.** O invariante 3 existe porque o julgamento de investimento pertence ao humano e porque o revisor independente perde metade do valor se o próprio autor arbitra as objeções sozinho. A autonomia durante a pesquisa é uma boa escolha (evita questionário) e deve ficar; o que falta é **um** ponto de parada na entrega, onde o humano vê veredicto, objeções materiais não acolhidas e modo de execução, e diz "aprovado".

**Proposta.** Em `skills/er-analise/SKILL.md`, nova subseção depois de "Fechamento em três lentes", marcada **[obrigatória — nunca pular]**: "Antes de declarar o relatório final, apresente ao usuário, numa mensagem: veredicto e faixa (de `outputs.json`), os findings materiais dos três revisores e o que você fez com cada um (acolhido / rejeitado com razão), o modo de execução. O relatório fica com status `rascunho` até o usuário aprovar; registre a aprovação (data, o que foi aprovado) em `aprovacao.md` na pasta da análise." Ajustar `commands/analisar.md` para mencionar essa parada como exceção à autonomia.

**Esforço e risco.** Pequeno. Risco: fricção percebida. **Conflito com o histórico:** a v6.1 enfatiza "consulte o usuário apenas quando a resposta mudar materialmente o trabalho". Critério que satisfaz os dois: a parada de entrega não é pergunta no meio do trabalho, é a própria entrega — custa uma mensagem e não interrompe a pesquisa.

### 4. A independência dos revisores é garantida por instrução, não por permissão

**Achado.** `auditor-mj`, `verificador` e `revisor-comite` têm `disallowedTools: Edit, NotebookEdit`, mas `Write` continua permitido (é necessário para escreverem `audit.md`, `fact-check.md`, `committee-review.md`). Com `Write`, o auditor pode sobrescrever `valuation-case.md` ou `outputs.json` por inteiro; a proibição ("Não mude inputs nem outputs") é só textual. O `pesquisador` e o `operador-mj` não têm restrição nenhuma — o pesquisador poderia editar o `economic-map.md`, que é do Analista ("Não edite a tese, o economic map ou o valuation do Analista").

**Generalização.** Separação de poderes entre papéis deve ser imposta pela ferramenta quando possível e checada depois do fato quando não for. Instrução é a última camada, não a única: um agente em contexto longo esquece; uma permissão, não.

**Proposta.**
- No `checar-entrega.py` do achado 2: registrar o hash de `valuation-case.md`, `outputs.json` e `economic-map.md` antes de despachar cada revisor e conferir depois. Divergência = finding bloqueante.
- Se a versão do Claude Code em uso expuser o tipo de agente à entrada do hook, um hook `PreToolUse` em `Write` que só permite a cada revisor escrever o próprio arquivo de saída (e ao pesquisador, só em `research/`).

**Esforço e risco.** Pequeno (checagem por hash) a médio (hook). Risco baixo; o hook depende de recurso da plataforma — por isso a checagem por hash vem primeiro.

### 5. Não há glossário; termos centrais são sobrecarregados, bilíngues e definidos em um só agente

**Achado.**
- "Gate" designa duas coisas diferentes: os gates de research do `er-analise` e os Gates 0–3 da metodologia. O próprio `er-analise` precisa desambiguar ("Estes gates são de research e não se confundem com os Gates 0 a 3 da metodologia"), sinal de que a confusão aconteceu ou era previsível.
- "Material/materialidade" aparece 31 vezes em `er-analise`, agentes e comandos; a única definição ("Materialidade não é percentual fixo: considere valor esperado, downside e risco de ruína") está no `er-analise`, que os revisores em contexto limpo **não carregam**.
- Os status de premissa observado/derivado/inferido/assumido estão definidos só no `operador-mj`, mas o `auditor-mj` e o `verificador` julgam com base neles.
- Mistura de línguas sem regra: *economic map*, *investment thesis*, *claims*, *staleness*, *valuation-case* ao lado de "fora da cadeia aparente", "teste de entendido", "ponte".

**Generalização.** Definição única evita que cada papel reinterprete o termo, e isso pesa mais justamente nos papéis que a fleet isola de propósito: um revisor em contexto limpo só conhece o que lhe é dado. Glossário é a forma de dar contexto mínimo comum sem quebrar a independência.

**Proposta.** Criar `GLOSSARIO.md` na raiz do plugin (em português, com o termo em inglês entre parênteses quando for de uso de mercado), com ~15 entradas: material/materialidade, gate de research × Gate (MJ), economic map, fora da cadeia aparente, claim, ponte, teste de "entendido", conta exploratória, `RESEARCH REQUIRED`, observado/derivado/inferido/assumido, revisão vigente/staleness, modo de execução, pre-mortem, versão única. Cada agente e skill ganha uma linha: "Termos com definição única em `GLOSSARIO.md`". As definições **migram** para lá (não são copiadas), e o arquivo de origem aponta para o glossário. Acrescentar o arquivo à lista `required` do `validate-plugin.py`.

**Esforço e risco.** Pequeno. Risco: duplicação divergente se as definições forem copiadas em vez de movidas.

### 6. O ciclo de aprendizado existe, mas está desconectado e o manual de pouso ficou para trás da arquitetura

**Achado.**
- O histórico do harness está espalhado em quatro lugares: "O que muda" no README, `docs/releases/`, `MIGRACAO-V6.md`, `skills/multiplos-justos/CHANGELOG.md` (61 KB). Não há `CLAUDE.md` nem um histórico de mudanças único; o git tem 3 commits.
- `references/development/round-closing.md` define "Captura de aprendizado — Claude faz, não pergunta" ao fim de cada rodada. **Nenhum arquivo o referencia**: o passo nunca é executado.
- `references/development/manutencao.md` (o "manual de adição de conhecimento") manda pousar regras em `references/aplicacao.md` (6 menções) e no "apêndice J" desse arquivo. Desde a v6, `aplicacao.md` é só um roteador e a jurisprudência está em `theory/jurisprudence.md`. Quem seguir o manual hoje põe a regra num arquivo que o operador não lê — o próprio manual diz que "regra certa no lugar errado não é lida".
- `PACKAGE-MANIFEST.txt` (hashes de integridade) não é verificado por nenhum script: o hash do `README.md` já não confere com o blob commitado (o README mudou depois da release). No Windows, com `core.autocrlf=true`, todos os 34 arquivos fora do kernel divergem em disco (o `.gitattributes` só protege `skills/multiplos-justos/**`).

**Generalização.** O delta entre execuções é o ativo que faz o harness melhorar; ele precisa de **um** lugar de pouso, atual, e de um passo no fluxo que o alimente. Manual de manutenção e artefato de integridade que não acompanham a arquitetura viram armadilha: parecem autoridade e apontam para o lugar errado.

**Proposta.**
- Criar `CLAUDE.md` na raiz (regras da casa curtas + "Histórico de mudanças": data, mudança, alvo, motivo), como ponto único; README, releases e MIGRACAO continuam como narrativa, linkados a partir dele. É também onde a Fase 4 do `evoluir` registra cada mudança aplicada.
- Ligar a captura de aprendizado ao fechamento: no `er-analise`, depois da aprovação (achado 3), uma linha "registre em `docs/aprendizados.md` a regra generalizável que a rodada revelou, ou 'nada novo'", apontando para `round-closing.md`.
- Atualizar o mapa de domicílios de `manutencao.md` para a estrutura modular. Como o kernel é intocável por decisão da v6.1, fazer isso num `docs/manutencao-fleet.md` fora do kernel ("onde o manual diz `aplicacao.md §N`, leia o arquivo indicado em `aplicacao.md`") e referenciá-lo no `SKILL.md` do kernel só quando houver nova versão do MJ.
- Ou verificar `PACKAGE-MANIFEST.txt` no `validate-plugin.py` (normalizando fim de linha), ou removê-lo; artefato de integridade não verificado é pior que nenhum.

**Esforço e risco.** Pequeno a médio. Risco: mais um arquivo de histórico se o `CLAUDE.md` não for de fato o ponto único — por isso ele registra e linka, não duplica.

### 7. Os gatilhos (descriptions) misturam manual com gatilho e têm colisão de nome no ambiente do dono

**Achado.**
- A `description` do `er-analise` tem cerca de 900 caracteres: metade é método ("só valora quando consegue explicar causalmente..."), não condição de disparo. Ela reivindica "leitura de preço, valuation, anexo financeiro e revisão", que já têm comandos próprios.
- `relatorio-html`: a description diz "USE **somente** depois de ... valuation auditado", mas o corpo abre uma exceção para `/anexo-financeiro`. Quem decide pelo gatilho vê só a description.
- No ambiente onde esta auditoria rodou (instalação do dono), há **duas** skills chamadas `multiplos-justos`: a da fleet ("Também pode ser invocado explicitamente pelo usuário") e uma skill pessoal do usuário com a regra oposta ("Use APENAS quando o usuário invocar explicitamente ... NUNCA deve disparar automaticamente"). Com o mesmo nome e políticas contrárias, o disparo fica incerto.
- Não há registro de teste de gatilho.

**Generalização.** A `description` é o que decide se a skill é chamada; o manual vai no corpo. Gatilho que contradiz o corpo, ou que disputa nome com outra skill instalada, produz o sinal típico de "pedi com outras palavras e não funcionou" ou "disparou quando não devia".

**Proposta.**
- `er-analise`: reduzir a description a quem é e quando usar (initiating coverage, deep dive, tese, valuation de companhia listada) e quando **não** usar (anexo isolado → `/anexo-financeiro`; só formatação de HTML → `relatorio-html`); o método vai para o corpo, onde já está.
- `relatorio-html`: incluir a exceção na description ("... ou para o HTML do anexo financeiro, que não exige valuation").
- Colisão de nome: o dono decide qual das duas `multiplos-justos` é a vigente; a outra é renomeada (ex.: a pessoal vira `mj-avulso`) ou desinstalada.
- Para cada description alterada, teste de gatilho (Fase 4): 3+ frases que devem disparar, 3+ vizinhas que não devem, com o resultado registrado no histórico.

**Esforço e risco.** Pequeno. Risco: mexer em description muda o disparo — por isso o teste é obrigatório antes de dar como pronto.

### 8. Os evals são bons na intenção, mas não deixam registro nem bloqueiam a release

**Achado.**
- `docs/casos-de-aceitacao.md` define método sólido (gabarito oculto, recall, rubrica do `revisor-comite`, comparação v6 × v6.1), mas não há registro de nenhuma rodada: nenhum resultado, nenhuma comparação feita, nenhum lugar previsto para guardá-los.
- `release.yml` roda `pytest tests` ("tests/ ainda não existe") e só confere `plugin.json`; **não** roda `validate-plugin.py` nem `testes.py`. Uma tag pode publicar uma release com o motor quebrado se o CI do push tiver falhado e alguém criar a tag mesmo assim.
- O gabarito oculto fica "fora do repositório" — correto, mas sem local definido; se um dia for posto numa pasta do projeto, nada impede um agente de lê-lo.

**Generalização.** Eval que não deixa registro não protege contra regressão: a próxima mudança não tem com o que se comparar. A release é o ponto onde a checagem tem de bloquear, não só informar.

**Proposta.**
- `evals/eval-set.md`: os 3 casos e as 6 variações como linhas (caso, o que deve aparecer, o que reprova, onde fica o gabarito); `evals/resultados/AAAA-MM-DD-<caso>.md` para cada rodada, com recall, rubrica, custo e versão da fleet.
- Se os gabaritos forem guardados localmente: `evals/gabaritos/` com regra de negação de leitura (em `.claude/settings.json` do projeto do usuário, já que o plugin não carrega settings) e no `.gitignore`.
- `release.yml`: rodar `python scripts/validate-plugin.py` e `testes.py --phase model/cli` antes de empacotar, e remover o passo `pytest tests`.

**Esforço e risco.** Médio (o custo real é rodar os casos, não escrever os arquivos). Risco baixo.

### 9. Não há porta de entrada para quem não construiu a fleet

**Achado.** O README começa com um diagrama de fluxo e comandos de terminal (`/plugin marketplace add ...`); "Depois de instalado, o entry point é `/analisar`." Não existe uma skill que receba quem chega, explique o que a fleet faz no vocabulário de research, liste o que dá para pedir (os 4 comandos e quando usar cada um) e conduza o primeiro uso (incluindo `preferencias-do-dono.md`, que precisa ser editado por cada novo dono).

**Generalização.** O layout da fábrica gera `comece-aqui` sempre, porque o usuário típico de um harness construído por leigo competente é outro leigo competente. Conhecimento de uso que vive só na cabeça de quem construiu se perde na primeira passagem de mão.

**Proposta.** `skills/comece-aqui/SKILL.md`: description que dispara em "como uso isso", "o que essa fleet faz", "primeira vez"; corpo com o que a fleet entrega, os 4 comandos com um exemplo cada, o que o usuário precisa decidir (preferências, orçamento, documentos que tem em mãos) e onde ficam os resultados (`analises/<TICKER>/<data>/`).

**Esforço e risco.** Pequeno. Na fronteira do escopo do `evoluir` (é uma skill nova, não um ajuste); se o dono preferir, encaminhar ao `construir`. Risco: gatilho competir com `er-analise` — testar.

### 10. Método e amarração estão no mesmo lugar (encaminhar ao `construir`)

**Achado.** A fleet segue o layout de plugin: o conhecimento de domínio (`er-analise/references/`, kernel MJ) e a amarração ao Claude Code (frontmatter, `disallowedTools`, "carregue a skill X", despacho de subagentes) estão nos mesmos arquivos. Não há `metodo/` separado de `.claude/`. Ponto a favor: o kernel MJ já é quase portável (referências autossuficientes + script), e o `er-analise` já tem um modo "sem despacho" — o autor pensou na troca de executor sem ter o vocabulário para isso.

**Generalização.** Separar método de amarração faz a troca de plataforma custar uma reescrita da amarração, não do método. Como o método aqui é o ativo principal (anos de doutrina MJ), o valor dessa separação é alto.

**Proposta.** Fora do escopo do `evoluir` (redesenho de arquitetura). **Encaminhar ao skill `construir`, fluxo de extensão**, com o pedido: plano de migração para `metodo/` + `.claude/` (ou o equivalente dentro do formato de plugin) que preserve byte a byte o kernel MJ e os anchors de `testes.py`, e que absorva os achados 2, 5 e 8 (checagens, glossário e evals já no lugar certo do novo layout). Recomendação: fazer os achados 1–9 antes; eles independem do layout.

**Esforço e risco.** Grande. Risco: quebrar a resolução de documentos de `testes.py`, que já foi adaptada uma vez na v6 (MIGRACAO, seção "Testes").

---

## Resumo para o dono

| # | Achado | Tipo (Fase 2) | Esforço | Ordem sugerida |
|---|---|---|---|---|
| 1 | Caminhos de script não resolvem com o plugin instalado | Qualidade do resultado / skill | pequeno | 1º |
| 3 | Sem aprovação humana na entrega | Ordem do fluxo / orquestrador | pequeno | 2º |
| 2 | Falhas mecânicas tratadas com prosa; trilho sem etapas obrigatórias | Ordem do fluxo / orquestrador | médio | 3º |
| 4 | Revisores podem sobrescrever o que auditam | Composição/limites dos papéis | pequeno | com o 2 |
| 5 | Sem glossário; termos sobrecarregados | Qualidade do resultado / skills | pequeno | 4º |
| 7 | Gatilhos com método dentro e colisão de nome | Gatilho que não dispara | pequeno | 5º |
| 6 | Aprendizado desconectado; manual de manutenção desatualizado | Orquestrador + histórico | pequeno–médio | 6º |
| 8 | Evals sem registro; release não bloqueia | Evals | médio | 7º |
| 9 | Sem `comece-aqui` | Fronteira com `construir` | pequeno | 8º |
| 10 | Método e amarração juntos | Arquitetura → `construir` | grande | depois dos demais |

**O que esperar se os itens 1–4 forem aplicados:** o motor e o validador passam a rodar na instalação real (não só no repositório); nenhuma análise é dada como final sem as três revisões feitas sobre a versão vigente e sem o "aprovado" do dono; e as falhas relatadas na execução TotalEnergies (artefato superado, revisão não declarada) passam a ser pegas por código, não por memória do agente.

**Não aplicado nada.** Próximo passo, se o dono aprovar: aplicar um item por vez (Fase 4), começando pelo 1, validando cada um e registrando no histórico.
