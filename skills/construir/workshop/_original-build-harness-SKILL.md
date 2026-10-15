---
name: build-harness
description: "Guides a person interactively through building their own multi-agent harness for their field in Claude Code, covering Context Engineering, Roles (subagents), Tools/MCP, Multi-Agent Pipeline, Hooks, Evals, and Observability. Domain-independent: design, legal, finance, content, support, engineering, research, anything. Use when someone wants to build an agent harness, set up a multi-agent system, or develop an agentic production line for their field, or calls /build-harness."
---

# Build Harness: Workshop Skill

This skill walks a person through building their **own** multi-agent harness, step by step, starting from their field instead of a prebuilt example. It's the generalized form of a course originally developed for a design-system harness. The structure (an intake, seven core modules, an optional bonus) is domain-independent; only the content is derived from the person's answers.

The domain is open; the output is not. Everything this workshop builds targets Claude Code: roles are subagents in `.claude/agents/`, the pipeline is a skill in `.claude/skills/`, guards are hooks in `.claude/settings.json`. Each module writes its artifact to the place Claude Code actually loads it from.

In this role you (Claude) are **facilitator, not author**. You bring the structure and the agentic-engineering expertise; the person brings the domain knowledge. Don't build anything you haven't clarified with them first.

## Flow

1. **Clarify goal & location.** Ask briefly what the harness is for (details come in the intake). The harness is built into the project root, the folder Claude Code was started in, because that's where `.claude/`, `CLAUDE.md`, and `.mcp.json` are read from. Confirm that this folder is the right project. Then look at what's already there: `CLAUDE.md`, `AGENTS.md`, `.mcp.json`, `.claude/settings.json`, `.claude/agents/`, `.claude/skills/`. Tell the person what you found.

2. **Resume check.** Does a `CURRICULUM.md` already exist at the project root? Read it first, since it shows progress. Pick up at the first module that isn't ✅ yet, instead of starting over. If it lists artifacts under `harness/skills/` or `harness/agents/`, it was made with plugin version 1.x of this workshop, which used a different folder layout: say so, and offer to redo Modules 1-4 so the roles and pipeline land where Claude Code loads them.

3. **Intake (Module 0).** Read `reference/00-intake.md` and ask the questions there, in 2-3 relaxed batches in chat, not as one long form. From the answers, produce:
   - A project name/slug for the harness
   - A one-sentence goal ("A system of agents, rules, tools, and guards that reliably turns X into Y")
   - The domain vocabulary you'll use instead of the generic placeholders in the following modules

   Then create `CURRICULUM.md` at the project root following `templates/CURRICULUM.template.md`, with modules 1-8 marked ⬜.

4. **Modules 1-7 in sequence.** For each module, in this order:
   - `reference/01-context-engineering.md`
   - `reference/02-roles-subagents.md`
   - `reference/03-tools-mcp.md`
   - `reference/04-multi-agent-design.md`
   - `reference/05-hooks-guards.md`
   - `reference/06-evals.md`
   - `reference/07-observability.md`

   Each reference file has four parts: **Core Idea** (the lesson: present it in your own words, translated into the person's domain vocabulary from the intake, not pasted as a wall of text), **Questions For You** (the exercise: ask them in chat, one batch at a time), **What Gets Built** (the concrete artifacts that result), and **Notes For Running This** (pitfalls, what to watch for).
   - Build the artifacts together with the person, based on their answers, not in advance and not without asking.
   - Mark the module ✅ in `CURRICULUM.md` once the artifacts actually exist.
   - Ask whether they want to keep going or pause here. These workshops typically span multiple sessions; that's normal, that's what `CURRICULUM.md` is for.

5. **Module 8 (Bonus, optional).** Only relevant once `harness/observability/logs/` contains at least 5 real session logs. See `reference/08-dashboard-bonus.md`. Mention it at the end of Module 7, but don't push it.

6. **Track open items.** Maintain a `HANDOUT.md` at the project root alongside `CURRICULUM.md`. Log anything that comes up during a module as "to clarify later": pending tool access, open decisions, things that will only make sense once the harness is in real use. Don't invent these; only log what actually comes up in conversation.

## Output structure

```
AGENTS.md               ← Module 1: house rules
CLAUDE.md               ← Module 1: one line, @AGENTS.md
CURRICULUM.md           ← progress tracker, read first in every session
HANDOUT.md              ← open items, grows with each module
.mcp.json               ← Module 3: MCP servers (only if needed)
.claude/
  agents/<role>.md      ← Module 2: one subagent per role; Module 3 sets its tools
  skills/<pipeline>/
    SKILL.md            ← Module 4: the pipeline, started with /<pipeline> <task>
  settings.json         ← Module 5 + 7: hook wiring
harness/
  README.md             ← short map of how the pieces connect
  handoffs/             ← Module 4: handoff files per task
  hooks/                ← Module 5: guard scripts
  evals/                ← Module 6
  observability/        ← Module 7
```

Write `harness/README.md` at the end of Module 4 and keep it current after that: which roles exist, what the pipeline is called, where each kind of file lives.

## Existing files

Several of these files are shared with the rest of the person's project. `harness/` is the only folder that belongs to the workshop alone.

- **Never overwrite** `CLAUDE.md`, `AGENTS.md`, `.mcp.json`, or `.claude/settings.json`. Read the file, add to it, and show the person the result before writing.
- Leave existing files in `.claude/agents/` and `.claude/skills/` untouched, and check new role and pipeline names against them.
- If something already there conflicts with what a module would write (a house rule, a hook on the same event), stop and ask.

## When things take effect

Claude Code doesn't pick up everything mid-session. Say this at the end of the module in question, so a working harness isn't mistaken for a broken one:

| After | What the person does |
|---|---|
| Module 1 | Nothing now; from the next session on, `/context` lists `CLAUDE.md` |
| Module 2 | Restart Claude Code if `.claude/agents/` was newly created |
| Module 3 | Start a new session and approve the servers from `.mcp.json` |
| Module 4 | Run `/reload-skills` or restart if `.claude/skills/` was newly created |
| Module 5, 7 | Nothing; hooks apply right away, `/hooks` shows them |

After a restart, the resume check brings the workshop back to the right module.

## Facilitation rules

- **Concrete before abstract.** Show the thing first (an example from their domain), then explain why it's that way.
- **No question dumps.** The original course asked 1-3 question groups per module, not 10 questions at once. Stick to that.
- **Assume light coding knowledge until proven otherwise.** Explain what a file technically does in plain language before showing it. Adjust once it's clear the person is more technical.
- **Generic stays generic until the person makes it concrete.** Don't invent roles, rules, or tools nobody mentioned. When a reference file shows an example pattern (e.g. "Creator role → Reviewer role"), that's a template to fill in, not finished content.
- **Match the person's language.** These reference files are written in English. Run the workshop in whatever language the person writes to you in; adapt the concepts live, don't just paste the English text.
- **A module is done when the file exists, not when it's been discussed.** Before marking ✅, the artifact must actually be written.
- **Check Claude Code specifics before relying on them.** Frontmatter fields, hook input, and file locations change between versions. Where a reference file names one, confirm it against the current Claude Code docs before building on it, and tell the person if something differs.
