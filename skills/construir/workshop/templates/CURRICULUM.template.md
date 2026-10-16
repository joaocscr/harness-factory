# {{PROJECT_NAME}}: Progresso do harness

## Objetivo

{{GOAL_SENTENCE}}

---

## Progresso

| # | Módulo | Status | Artefato do harness |
|---|---|---|---|
| 1 | Engenharia de contexto | ⬜ aberto | `AGENTS.md`, `CLAUDE.md` |
| 2 | Papéis e subagentes | ⬜ aberto | `.claude/agents/` |
| 3 | Ferramentas e MCP | ⬜ aberto | `.mcp.json`, `tools:` em cada arquivo de papel |
| 4 | Design multi-agente | ⬜ aberto | `.claude/skills/<pipeline>/SKILL.md`, `harness/handoffs/` |
| 5 | Hooks e guardas | ⬜ aberto | `harness/hooks/`, `.claude/settings.json` |
| 6 | Evals | ⬜ aberto | `harness/evals/` |
| 7 | Observabilidade | ⬜ aberto | `harness/observability/`, `.claude/settings.json` |
| 8 | Painel de observabilidade (bônus) | ⬜ aberto, só depois de 5+ logs de sessões reais | `index.html` |

**Legenda:** ⬜ aberto · 🔄 em andamento · ✅ concluído

---

## Como as sessões funcionam

Em toda sessão:
1. Leia este arquivo primeiro: em que ponto está o progresso?
2. Continue no primeiro módulo que ainda não está ✅
3. Responda no chat às perguntas da lição daquele módulo no skill `build-harness`
4. Construam juntos o artefato do harness
5. Marque o módulo como ✅

---

## Referência

Este projeto foi montado com o skill `build-harness`, uma versão generalizada de um curso sobre construção de um harness multi-agente. Para continuar, abra o Claude Code nesta pasta e peça para continuar o workshop do harness; as lições vêm junto com o skill.
