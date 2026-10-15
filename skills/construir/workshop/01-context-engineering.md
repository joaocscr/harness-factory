# Module 1: Context Engineering

## Core Idea

Imagine hiring someone new for this work. On day one, they sit down in front of a blank page.
What do they need to do good work?

- What context, what tone, what expectations?
- What already exists: which building blocks, which templates?
- What rules apply (structure, naming, boundaries)?
- What has the organization already decided?
- What hasn't worked so far?

An AI agent is exactly the same. It starts every task with no memory, no experience, except what you give it.

**Context Engineering** is the art of supplying exactly the right context. Not too little (the agent makes mistakes), not too much (expensive, slow, the agent loses focus).

## The Token Budget: Why Context Costs Money

Every word an AI agent receives costs tokens. Tokens cost money.
Loading an entire repository or archive into every prompt is like sending a new colleague the whole company wiki every day just so they can answer one Slack message.

**The golden rule:** the agent gets exactly what an experienced new hire would need on day one, no more, no less.

## The 4 Types of Context

| Type | What it is | Example |
|---|---|---|
| **Persistent** | Always present, rarely changes | Core rules, naming conventions |
| **Episodic** | Relevant for this one task | "We're working on this specific case/component right now" |
| **Semantic** | Domain knowledge | "X means Y in this field, not Z" |
| **Procedural** | How things get done | "Clarify A first, then implement B" |

Fill the example column with the terms from the intake; that makes the table immediately tangible instead of abstract.

## What Belongs in a Good AGENTS.md

The `AGENTS.md` is the persistent context: always loaded, always active.

It lives at the project root, next to a `CLAUDE.md` that contains a single line:

```markdown
@AGENTS.md
```

`CLAUDE.md` is the file Claude Code loads at the start of every session; the `@AGENTS.md` line pulls the house rules in. The rules themselves stay in `AGENTS.md`, a plain file other agent tools can read too. Every role built in Module 2 gets this context as well, automatically.

**Minimum content, regardless of domain:**

```
1. Stack & Tools        : What's being worked with? (Tools, systems, formats)
2. Conventions          : Naming, structure, language
3. Hard Rules           : What must NEVER happen
4. Workflow             : What order work happens in
5. Scope                : What's IN this system, what's OUT
```

**What does NOT belong here:**
- Anything that changes per task (belongs in the task prompt)
- Large files or full lists (belong in Tools/MCP, Module 3)
- Explanations for human readers (that's documentation, not agent context)

## The Signal-to-Noise Ratio

The single most important concept in Context Engineering.

Bad context: 80% noise, 20% signal. The agent produces mediocre results.
Good context: 80% signal, 20% structure. The agent produces consistent, high-quality results.

**Recognizing noise:** anything the agent doesn't need to complete *this* task.

## Questions For You

**Your field** (deepen here if not already answered in the intake):
- What's the source of truth?
- What categories/building blocks exist?
- What naming convention?
- What language for comments/docs?

**Your rules:**
- What must an agent NEVER do?
- What's the order? (What comes first, what comes after?)

**Your scope:**
- What belongs to this harness?
- What's DELIBERATELY outside it?

## What Gets Built

- `AGENTS.md` at the project root, following the format above, filled with the answers from the intake and this module
- `CLAUDE.md` at the project root, containing `@AGENTS.md`

## Notes For Running This

- If the project already has an `AGENTS.md` or `CLAUDE.md`, don't overwrite it. Show the person what's there, add the harness rules as their own section, and add the `@AGENTS.md` line to the existing `CLAUDE.md` if it's missing.
- To confirm it loads: in a new session, `/context` lists `CLAUDE.md` under memory files.
- After the first draft, go through it line by line together and ask "signal or noise?" That's the signal check from the lesson; don't skip it.
- If a rule is too vague ("deliver good quality"), ask for a concrete counter-example. What would bad quality look like, specifically?
- This file is the foundation; everything in the following modules builds on it. Shorter and sharp beats long and vague.
