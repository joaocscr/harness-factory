# Autoteste do `validar` contra o próprio repositório

16/10/2026 · reexecução registrada da verificação da Task 7 (Step 2) do plano de 15/10, que ficou sem artefato (achado importante 3 da auditoria) · alvo: harness-factory @ pós-v0.1.2

## Por que este teste existe

O `validar` precisa provar que **não dá falso "aprovado"** quando o alvo não é um harness no layout método-portável. O próprio repositório da fábrica é um plugin — formato que o checklist deve reconhecer e tratar com "não se aplica", nunca com ✅ geral.

## Resultado por item

| # | Item | Resultado |
|---|---|---|
| 0 | Detecção de formato | **Plugin de Claude Code** (`.claude-plugin/plugin.json` presente) — correto |
| 1 | Método separado da amarração | não se aplica (formato plugin; não há `metodo/`) |
| 2 | Frontmatter íntegro | ✅ 4/4 skills com `name`+`description`, `name` = pasta |
| 3 | Glossário vivo | não se aplica (sem `metodo/GLOSSARIO.md`; o glossário é exigência dos harnesses gerados) |
| 4 | Gabaritos protegidos | não se aplica (sem `metodo/evals/gabaritos/`) |
| 5 | Agnóstico de modelo | ✅ zero `model:` fixado nos skills |
| 6 | Funciona em Windows | ✅ zero scripts `.sh` em `skills/` e `referencia/` |
| 7 | Porta de entrada para leigos | não se aplica como `comece-aqui`; o equivalente do plugin é o README + as descriptions dos skills |
| 8 | Etapas obrigatórias marcadas | não se aplica (o plugin não é um pipeline) |
| 9 | Revisor independente | não se aplica ao formato; registre-se que o *processo* do projeto o teve (revisões de 15 e 16/10) |
| 10 | Cálculo em código | não se aplica (o plugin não calcula) |
| 11 | Registro no CLAUDE.md | ⚠️ o `CLAUDE.md` do repo é contexto de projeto, não registro de harness no formato acionamento+histórico — esperado para um plugin, que não é um harness instalado; o histórico vive no CHANGELOG |

## Veredicto do checklist

**"Não se aplica na maior parte (formato plugin), usável, sem falso aprovado"** — exatamente o comportamento desenhado: 7 itens corretamente declarados não aplicáveis, 3 ✅ verificáveis, 1 ⚠️ explicado. A oferta de migração ao layout portável não cabe (a fábrica é fábrica, não harness).

Itens mecânicos reproduzíveis (formato, frontmatter, model pins, scripts bash, grep do CLAUDE.md) executados por script em 16/10/2026; saída bruta no histórico da sessão de finalização.
