---
name: validar
description: "Confere a qualidade de um harness contra o padrão da fábrica e devolve um relatório em linguagem leiga: o que está certo, o que falta e o que fazer. Use quando a pessoa pedir para 'validar/conferir/checar meu harness', 'o harness está certo?', 'auditoria do harness' — e no fechamento (módulo 7) do skill 'construir'. Não altera nada: só verifica e relata. Para corrigir o que for apontado, 'evoluir' (ajustes) ou 'construir' (estrutura). Conceito inspirado no plugin-dev (Anthropic), reescrito do zero."
---

# Validar — o checklist de qualidade de harness

Rode cada item contra o harness alvo e produza um relatório com três colunas: **✅ ok / ⚠️ atenção / ❌ falta**, cada linha com a evidência (arquivo conferido) e, nas falhas, **o que isso significa na prática para a pessoa** — nunca só o erro técnico.

Antes de tudo, identifique o formato do alvo (método portável, plugin, projeto simples — mesma tabela do skill `evoluir`, Fase 0). Itens estruturais do layout portável **não se aplicam** a um alvo que não o adota: marque "não se aplica (formato X)" e, no fim, ofereça a migração — não dê ❌ pelo formato, nem ✅ geral por engano.

## Checklist

| # | Item | Como verificar | Se falhar, diga à pessoa |
|---|---|---|---|
| 1 | Método separado da amarração | Existem `metodo/` e `.claude/`; os arquivos em `.claude/` referenciam `metodo/`; nenhum arquivo em `metodo/` menciona `.claude/` (grep) | "O conhecimento do seu negócio está misturado com a fiação da ferramenta — se um dia trocar de plataforma, não leva nada junto." |
| 2 | Frontmatter íntegro | Todo `SKILL.md` e agente tem `name` e `description` no cabeçalho YAML, e o `name` bate com a pasta | "Um dos manuais está sem etiqueta — o assistente não consegue encontrá-lo na hora certa." |
| 3 | Glossário vivo | `metodo/GLOSSARIO.md` existe; amostre 3–5 termos definidos nele e confirme que as skills os usam no mesmo sentido (grep por usos divergentes) | "Duas partes do sistema usam a mesma palavra com sentidos diferentes — isso gera análise inconsistente." |
| 4 | Gabaritos protegidos | `metodo/evals/gabaritos/` existe ⇒ `.claude/settings.json` tem regra de negação de leitura cobrindo essa pasta | "As respostas da prova estão ao alcance de quem faz a prova — o teste não prova nada." |
| 5 | Agnóstico de modelo | grep `model:` nos agentes; cada ocorrência tem justificativa escrita no próprio arquivo | "Uma parte do time só funciona com um modelo específico de IA, sem razão registrada — amarra o método a um fornecedor." |
| 6 | Funciona em Windows | Nenhum script `.sh`/bash puro em `metodo/checagens/` ou hooks sem equivalente Python/PowerShell | "Uma das conferências automáticas não roda no seu computador — vai falhar em silêncio." |
| 7 | Porta de entrada para leigos | `.claude/skills/comece-aqui/` existe e explica o harness no vocabulário do domínio, sem jargão | "Quem abrir esse projeto amanhã não vai saber por onde começar." |
| 8 | Etapas obrigatórias marcadas | O pipeline em `metodo/skills/` marca **[obrigatória — nunca pular]** em: intake, checagens determinísticas, revisão independente, aprovação humana | "O fluxo permite pular exatamente as etapas que protegem a qualidade — com pressa, elas serão puladas." |
| 9 | Revisor independente | O pipeline tem um papel de revisão que roda em contexto limpo (não viu a produção) | "Quem produziu é quem confere — os mesmos pontos cegos, duas vezes." |
| 10 | Cálculo em código | Números do método saem de scripts em `metodo/checagens/` com formato de saída definido; nenhuma skill manda o modelo 'calcular' | "Contas feitas de cabeça pela IA: uma hora erram, e não dá para auditar." |
| 11 | Histórico de mudanças | `CLAUDE.md` do alvo registra o harness (condição de acionamento + tabela de mudanças) e bate com os arquivos reais | "O mapa não bate com o território — a próxima sessão vai se perder." |

## Relatório

Feche com: nota geral em uma frase ("pronto para uso", "usável com ressalvas", "precisa de ajustes antes de confiar"), os ❌ primeiro com a correção sugerida e quem a faz (`evoluir` ou `construir`), e a oferta de encaminhar. **Não corrija nada neste skill** — validar que também conserta vira juiz e parte.
