# Fábrica de Harness — Documento de Design

15/10/2026 · João (joaocscr) + Claude · v1 para aprovação

## 1. Intenção e porquê

Construir um **plugin próprio de Claude Code que constrói harnesses de agentes** — "fábrica de harness" — vivendo em um repositório GitHub do João. A motivação central é **independência**: todo o código vendorizado (copiado para dentro) no repositório próprio, de modo que nenhum terceiro possa desligar, quebrar ou descontinuar a ferramenta. A fábrica reaproveita ao máximo trabalho publicado de qualidade, em vez de reinventar.

O fio que une os casos de uso: *a equity-research-fleet é o protótipo de um método; a fábrica é o laboratório que industrializa métodos; a Annalisa é o produto que um dia os executa.*

**Papel da fleet — importante:** a fleet é caso de uso e fonte de conhecimento de domínio (o método Múltiplos Justos, os papéis de análise), **não modelo de arquitetura**. Ela foi construída no bom senso por quem não conhecia engenharia de agentes; funciona, mas sua estrutura técnica não serve de base para nada neste projeto. A arquitetura de referência da fábrica vem exclusivamente das fontes absorvidas (§6.1–6.3). Ao operar sobre a fleet, a fábrica aplica os padrões *dela*, inclusive propondo reestruturações onde a fleet destoar deles.

## 2. Objetivos

1. **Construir harnesses novos** para qualquer domínio intelectual, a partir de uma conversa com um usuário **leigo em tecnologia** (analistas, bankers, gestores — gente que não sabe o que é API, não distingue tipos de arquivo e nunca abriu um terminal).
2. **Evoluir harnesses existentes** (caso imediato: a equity-research-fleet) a partir do uso real.
3. **Gerar métodos portáveis**: o conhecimento de domínio do harness gerado (skills, checagens, evals, glossário) vive em um pacote próprio, versionado, separado da infraestrutura Claude Code que o executa — exigência nº 2 da seção 12 do briefing da Annalisa.
4. **Ser agnóstico de modelo de LLM no que gera**: o método gerado é markdown + código, cálculos sempre em código, evals executáveis contra qualquer modelo, nenhum agente com modelo fixado sem justificativa escrita.
5. Servir aos três casos de uso declarados: (a) manter/evoluir a equity-research-fleet; (b) criar o harness de trabalho do João (acompanhar deals, montar apresentações e modelos financeiros, pesquisas e análises); (c) servir de construtor para o laboratório da Annalisa.

## 3. Não-objetivos

- **Não é a plataforma da Annalisa.** Gateway de modelos, BYOK, multi-tenant, trilha de auditoria imutável e execução fora do laptop são infraestrutura de software (etapas E5+ do roadmap da Annalisa), fora deste plugin. A fábrica apenas *não atrapalha*: gera o método no formato portável que a plataforma executará um dia.
- **Não é um wrapper.** Não dependemos dos repositórios de origem em tempo de execução; atualizações futuras deles são puxadas manualmente, se e quando o João quiser.
- Não cobre domínios de software/engenharia como foco (funciona, mas o público-alvo é trabalho intelectual não técnico).

## 4. Anti-objetivos (fracasso mesmo funcionando)

- Um harness gerado que só funciona se o usuário entender código, terminal ou estrutura de arquivos.
- Condução que despeja 10 perguntas de uma vez ou explica com jargão ("configure o MCP server no settings.json").
- Métodos gerados presos ao Claude Code ou a um modelo específico, impossíveis de levar para a plataforma da Annalisa.
- Cópia que viole licença das fontes.

## 5. Restrições

- **Licenças:** revfactory/harness é Apache-2.0 e muratcankoylan/Agent-Skills-for-Context-Engineering é MIT — cópia integral permitida com atribuição (arquivo `ATTRIBUTION.md` + preservação das licenças). Os plugins oficiais da Anthropic (plugin-dev, hookify) não têm licença SPDX detectada: usamos como **referência de estrutura e inspiração**, reescrevendo as peças; cópia literal só se a licença for confirmada.
- O ambiente do João é Windows; scripts gerados não podem assumir bash/unix sem alternativa.
- Idioma de condução: o da pessoa (português primeiro). O corpo técnico dos skills copiados pode permanecer em inglês; a *facilitação* é sempre na língua do usuário.

## 6. Decisões de arquitetura

### 6.1 Espinha dorsal: revfactory/harness v2, absorvida (decisão do João)

Fork absorvido: os skills `harness` e `evolve` do revfactory v2 são copiados para o repositório e passam a ser nossos. Eles trazem: os 3 modos de execução nativos (workflow determinístico, agentes persistentes, sub-agent delegation), os 6 padrões de arquitetura de time, geração de agents/skills com Progressive Disclosure, padrões de qualidade (adversarial verification, produtor-revisor, judge panels), verificação/evals e o mecanismo de evolução (`/evolve`).

### 6.2 Enxertos (decisão do João; curadoria é do construtor)

| Fonte | O que entra | Como |
|---|---|---|
| muratcankoylan (MIT) | subconjunto curado dos 18 skills (evals, memory systems, context compression, multi-agent patterns, tool design) | copiado como **biblioteca de referência** que a fábrica consulta ao decidir arquitetura |
| build-harness v2.0.0 (Philipp Jeroma, MIT) | a condução estilo workshop: intake, módulos 1–7, CURRICULUM/HANDOUT, regras de facilitação para leigos | copiado com atribuição e adaptado como camada de facilitação (§6.3) |
| hookify (Anthropic) | o conceito: gerar hooks/guardas a partir de linguagem natural na etapa de guardas do harness | reescrito como skill próprio, inspirado na estrutura |
| plugin-dev (Anthropic) | validação do plugin gerado (estrutura, frontmatter, empacotamento) | reescrito como checklist/skill próprio |

### 6.3 Camada de facilitação para leigos (decisão do João; a mais importante)

A porta de entrada da fábrica é uma **condução estilo workshop**, absorvida do plugin build-harness v2.0.0 (Philipp Jeroma, MIT — cópia permitida com atribuição) e fundida com o motor do revfactory: intake em 2–3 levas de perguntas relaxadas (nunca um formulário), progresso rastreado em um arquivo que sobrevive entre sessões, módulos conduzidos um a um, "concreto antes de abstrato", 1–3 perguntas por vez, e **tradução obrigatória de todo conceito técnico para a linguagem do domínio da pessoa** (ex.: "skill" vira "o manual de procedimento que o seu analista júnior seguiria"). O motor técnico do revfactory roda por baixo; a pessoa nunca vê jargão. Chamada de decisão minha (Claude): usuário técnico detectado no intake pode optar pelo modo direto, sem workshop.

### 6.4 Convenção "método como pacote portável" (decisão do João)

Todo harness gerado separa duas coisas:

```
<projeto>/
  metodo/                ← portável, versionado, agnóstico de infraestrutura
    skills/              ← o conhecimento de domínio
    checagens/           ← código determinístico (cálculos, validações, schemas)
    evals/               ← golden set e critérios (gabaritos fora do alcance dos agentes)
    GLOSSARIO.md         ← definição única de cada termo
  .claude/               ← amarração Claude Code (agents, settings, pipeline)
```

O `.claude/` referencia o `metodo/`; nunca o contrário. Trocar de executor (Claude Code → Agent SDK → plataforma Annalisa) significa reescrever só a amarração.

### 6.5 Chamadas do construtor (decisões do Claude, abertas a veto)

1. **Gabaritos fora do alcance dos agentes:** os gabaritos vivem em `metodo/evals/gabaritos/` e a fábrica gera regras de negação em `.claude/settings.json` que impedem os agentes de produção de lê-los; só o runner de evals (código) acessa. Num laptop isso é proteção por convenção + configuração, não segurança absoluta — suficiente para o laboratório; a plataforma da Annalisa resolve o resto.
2. **Runtime do harness gerado:** o ambiente assumido é o aplicativo desktop do Claude (abrir uma pasta pela interface, sem terminal). Todo harness gerado inclui um skill de entrada ("comece aqui") que recebe o leigo, explica o que o harness faz na linguagem do domínio e o conduz; a configuração inicial é feita conversando com o Claude, nunca por comandos.
3. **Linguagem dos cálculos:** Python como padrão das `checagens/` e `evals/` — padrão da indústria para cálculo numérico (e, por coincidência conveniente, o que a fleet já usa). O harness gerado verifica o ambiente na primeira execução e, se faltar algo, o próprio Claude instala conversando com a pessoa — o leigo nunca vê um comando.
4. **`/evolve` v1 opera em harnesses no formato em que estão** (a fleet é um plugin, não segue §6.4). Migrar a fleet para o formato portável é tarefa separada, oferecida pela fábrica mas fora da v1.

### 6.6 Repositório e distribuição (decisão do João)

Repositório **`joaocscr/harness-factory`, privado**, funcionando como marketplace de plugin do Claude Code (instalável via `/plugin marketplace add`), com `ATTRIBUTION.md`, licenças preservadas (Apache-2.0 do revfactory, MIT do muratcankoylan e do build-harness) e CHANGELOG. Git desde o primeiro dia.

A equity-research-fleet, alvo do critério de pronto nº 4, vive em `joaocscr/equity-research-fleet` (público, verificado em 15/10/2026).

## 7. Requisitos herdados da Annalisa que a fábrica embute nos harnesses gerados

Dos 10 da seção 12 do briefing, os 7 que pertencem ao laboratório: (1) trilho híbrido — etapas determinísticas e agênticas intercaladas, com etapas obrigatórias que não podem ser puladas; (2) método separado do construtor (§6.4); (3) evals como cidadãs de primeira classe, com gabaritos fora do alcance dos agentes; (4) revisor independente em contexto limpo; (5) ponto de aprovação humana explícito; (6) cálculo determinístico em código com schemas nas saídas; (7) glossário único. Gateway, multi-tenant e trilha imutável ficam para a plataforma (§3).

## 8. O que fica para o construtor

- Estrutura exata de pastas do plugin e nomes dos comandos/skills.
- A curadoria: quais dos 18 skills do muratcankoylan entram e quais ficam de fora.
- Como reconciliar vocabulários entre fontes (ex.: "harness-engineering" do muratcankoylan vs. "harness" do revfactory).
- O texto da camada de facilitação (desde que siga §6.3).
- Mecânica de atualização manual a partir dos repositórios de origem.

## 9. Critério de pronto da v1

1. Plugin instala a partir do repositório do João e os comandos aparecem.
2. Um teste de ponta a ponta: construir um harness pequeno de um domínio de exemplo (não software) conduzido inteiramente em linguagem leiga, gerando a estrutura do §6.4.
3. `ATTRIBUTION.md` completo e licenças preservadas.
4. O skill `/evolve` roda contra a equity-research-fleet **no formato atual dela** sem erro e produz um diagnóstico com propostas de melhoria segundo os padrões da fábrica (teste de evolução de harness existente; sem migração; a estrutura atual da fleet não é referência a preservar).
