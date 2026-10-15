# Module 2: Roles & Subagents

## Core Idea

There's now an `AGENTS.md`, the house rules for all agents. But the work in this field usually consists of several distinct tasks that require different kinds of thinking.

If a single agent is responsible for everything, this happens:
- It loses focus
- Its instructions become huge and contradictory
- It does mediocre work on everything instead of excellent work on one thing

The solution: **specialization through roles**, each one its own subagent.

## What a Role File Is

A role file is a markdown file that defines one subagent. It tells that agent:
- Who it is (role, perspective)
- What its one job is
- How it approaches that job (step by step)
- What it outputs (format, structure)
- What it explicitly does NOT do (this matters just as much)

Think of it as a **precise assignment for a role**, not a manual.

## Role or Skill: the Difference

Both are markdown files, and they're easy to mix up.

| | Skill | Role (subagent) |
|---|---|---|
| What it is | Knowledge or a procedure | A worker with one job |
| Where it runs | In the conversation that's already going | In its own fresh context |
| What it sees | Everything said so far | Only its assignment and the house rules |
| Tools | The same as the conversation | Its own list |
| Lives in | `.claude/skills/<name>/SKILL.md` | `.claude/agents/<name>.md` |

Rule of thumb: a skill adds knowledge to the current context. A role gets a bounded task in its own context with its own tools.

That separation is what makes a reviewer worth having. A reviewer that sits in the same conversation as the creator has already read all the creator's reasoning and tends to agree with it. A reviewer in its own context sees only the result.

The harness uses both: the roles from this module are subagents, and the assembly line that calls them (Module 4) is a skill.

## The Analogy: Roles That Already Exist in the Field

Almost every field already has an informal division of roles, even without AI. That's the best template to draw from:

| Role Pattern | Focus | Doesn't Do |
|---|---|---|
| Creator role(s) | Produces/decides on the core artifact | Doesn't review itself |
| Composer role (if applicable) | Builds something larger out of core artifacts | Doesn't invent new core artifacts |
| Reviewer role | Checks against the rules from `AGENTS.md` | Doesn't build anything itself |

This table becomes concrete from the roles the person named in the intake. Don't invent a role nobody mentioned.

This is exactly how specialized agents work: each one knows its area and respects the boundaries of the others.

## Anatomy of a Role File

```markdown
---
name: <role-name>
description: When this role should be called, in one sentence.
tools: Read, Grep, Glob
---

## Identity
Who you are, in one sentence.

## Your One Job
What you do, precise, not vague.

## Input
What you get to work with.

## Process
Step by step, how you proceed.

## Output
What you produce: format, structure, language.

## Boundaries
What you explicitly do NOT do.
```

The block between the `---` lines is what Claude Code reads to register the role:
- `name`: lowercase, with hyphens. This is how the pipeline calls the role.
- `description`: when to hand work to this role.
- `tools`: the complete list of what this role may use. Anything not listed is unavailable to it. Module 3 fills this in properly; for now, start with `Read, Grep, Glob` (read-only).

Everything below the block is the role's assignment.

## The Reviewer Can't Fix What It Finds

The reviewer's `tools` list stays read-only: `Read, Grep, Glob`, with no `Write`, `Edit`, or `Bash`. A reviewer that can edit will quietly repair a problem instead of reporting it, and the creator role never learns.

The reviewer's reply starts with the line `VERDICT: PASS` or `VERDICT: FAIL`, followed by the concrete reasons. Module 4 picks that up.

## Important: Role Files Don't Repeat AGENTS.md

Every role starts with the house rules already loaded, through the `CLAUDE.md` from Module 1. The role file doesn't need to repeat them; it builds on them.

Bad:
```
## Identity
[A rule that's already in AGENTS.md]  ← noise, duplicated
```

Good:
```
## Identity
You operate within the rules from AGENTS.md.
Your focus: [specific task]
```

What a role does **not** start with: the conversation so far. Whatever it needs for the task has to arrive in its input. That's the subject of the handoffs in Module 4.

## Questions For You

- What recurring roles/work steps exist in this field? (From the intake; concretize here, usually 2-4 roles plus one reviewer)
- For each role: what's the concrete input it receives? What does it produce as output? Where does its responsibility end?
- Does this actually need a separate reviewer role, or does each role check its own work well enough in this field? (A separate reviewer usually pays off, but not always; ask)

## What Gets Built

One role file per identified role, under `.claude/agents/`, e.g. `.claude/agents/<role-name>.md`. Most harnesses end up with at least two creator roles plus a reviewer role, but the exact number follows from the intake, not from this template.

## Notes For Running This

- Overlap check at the end: are there areas where two roles would overlap? Overlap is a signal that the boundaries aren't sharp enough yet. Sharpen them before calling the module done.
- If the person names only one role ("I actually do all of this myself"), it's still worth asking: if you had to delegate this to three different people, how would you split it up? That often surfaces hidden roles.
- Never put `Agent` in a role's `tools` list. Roles don't call other roles; only the pipeline does.
- If `.claude/agents/` already has files, leave them alone and check for name clashes before writing.
- If `.claude/agents/` didn't exist before this module, the roles only become available in a new session. Tell the person to restart Claude Code before Module 4; `CURRICULUM.md` picks up where they left off. Later edits to role files apply within a few seconds, no restart needed.
- If a role needs the same lengthy procedure as another role, that shared procedure is a candidate for a skill of its own. Note it in `HANDOUT.md` instead of building it now.
