# {{PROJECT_NAME}}: Harness Progress

## Goal

{{GOAL_SENTENCE}}

---

## Progress

| # | Module | Status | Harness Artifact |
|---|---|---|---|
| 1 | Context Engineering | ⬜ open | `AGENTS.md`, `CLAUDE.md` |
| 2 | Roles & Subagents | ⬜ open | `.claude/agents/` |
| 3 | Tools & MCP | ⬜ open | `.mcp.json`, `tools:` in each role file |
| 4 | Multi-Agent Design | ⬜ open | `.claude/skills/<pipeline>/SKILL.md`, `harness/handoffs/` |
| 5 | Hooks & Guards | ⬜ open | `harness/hooks/`, `.claude/settings.json` |
| 6 | Evals | ⬜ open | `harness/evals/` |
| 7 | Observability | ⬜ open | `harness/observability/`, `.claude/settings.json` |
| 8 | Observability Dashboard (Bonus) | ⬜ open, only after 5+ real session logs | `index.html` |

**Legend:** ⬜ open · 🔄 in progress · ✅ done

---

## How Sessions Work

Every session:
1. Read this file first: where does progress stand?
2. Continue at the first module that isn't ✅ yet
3. Answer the questions from that module's lesson in the `build-harness` skill, in chat
4. Build the harness artifact together
5. Mark the module as ✅

---

## Reference

This project was set up with the `build-harness` skill, a generalized version of a course on building a multi-agent harness. To continue, start Claude Code in this folder and ask to continue the harness workshop; the lessons come with the skill.
