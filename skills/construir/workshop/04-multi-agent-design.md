# Module 4: Multi-Agent Design

## Core Idea

There are now several specialized roles. Each knows what it does and what it doesn't do.

But who starts? Who hands what off to whom? What happens when a role is done: does the next one start automatically, or does someone have to kick it off?

That's Multi-Agent Design: **the order, the handoffs, and the rules that determine who's up next.**

## The Factory Analogy

Picture an assembly line:

```
Raw material → Station 1 → Station 2 → Quality control → Finished product
```

Each station has one job. No station starts before the previous one is done. Quality control usually happens at the end of a station, not somewhere in the middle where it can get forgotten.

The harness works the same way. The question is: what does this assembly line look like for this field?

## The Two Basic Patterns

**1. Sequence: one after another**
```
Role A → Role B → Role C
```
Each role waits for the output of the previous one. Simple, predictable, easy to debug. Downside: slow if tasks are actually independent of each other.

**2. Parallel: several at once**
```
Role A ──┐
         ├── Reviewer
Role B ──┘
```
Several roles work at the same time, the reviewer checks what they hand back. Faster, but more complex; handoffs need to be precisely defined.

**For a start:** sequence is almost always the right entry point. Parallel comes once the rhythm is known.

## Deriving Your Own Assembly Line

From the roles in Module 2, a pattern like this usually emerges:

```
1. Creator role 1
      ↓
2. Reviewer          ← first quality check
      ↓ (only if PASS)
3. Creator role 2 (if applicable)
      ↓
4. Reviewer          ← second quality check
      ↓ (only if PASS)
5. Documentation/output role (if applicable)
      ↓
6. Context/memory role   ← usually last, keeps the persistent context up to date
```

The reviewer often shows up more than once, once after each creator role. That's not a mistake, it's intentional: catching errors early is cheaper than catching them late.

This is a pattern, not a fixed rule. The real order emerges from the conversation with the person, not from this template.

## Handoffs: the Handover Between Roles

A handoff is the moment a role is done and the next one starts.

A good handoff defines:
- **What gets handed over**: which files/data, what format
- **What the next role does first**, so it doesn't have to guess
- **What happens if something's missing**: the role asks, it doesn't guess

Bad:
```
Role A: "Here's the result."
Role B: [guesses what's meant]
```

Good:
```
Role A output:
- Changed/new artifacts: [concrete list]
- Reviewer gave PASS on: [date]
→ Role B can start
```

### Handoffs Are Files

Each role runs in its own context (Module 2). Role B never saw what Role A thought or said; it only knows what it's handed. So the handoff has to exist as a file:

```
harness/handoffs/<task>/
  01-<role-a>.md       ← what Role A produced and where it is
  02-reviewer.md       ← VERDICT: PASS / FAIL plus reasons
  03-<role-b>.md
  04-reviewer.md
```

The numbers simply count up. If the reviewer says FAIL, the corrected attempt and its review become the next two files; nothing gets overwritten.

Every role ends its work with a short handoff note as its reply. The pipeline saves that note as the next numbered file and gives the following role the path. That includes the reviewer: it can't write files (Module 2), so it replies with its verdict and the pipeline writes it down.

The folder doubles as a record of what happened on a task, which Module 7 builds on.

## What If a Role Gets FAIL?

```
Reviewer: FAIL
  ❌ [concrete reason]

The creator role gets the feedback:
  → Corrects
  → Sends back to reviewer

Reviewer: PASS
  → Next role can start
```

That's a **feedback loop**: the harness corrects itself without constant intervention. That's the core of agentic engineering.

A loop needs an exit. After a fixed number of failed correction attempts, the pipeline stops and hands the task to the human, with the reviewer's last reasons attached. Without that limit, two roles can argue forever on your bill.

## The Pipeline Skill

For all of this to work, someone needs to start the line and call the roles in order. That's the **pipeline skill**: a skill that runs in the main conversation and hands each step to the right role.

```markdown
---
name: <pipeline-name>
description: Runs the <pipeline-name> assembly line for one task.
argument-hint: [task description]
disable-model-invocation: true
---

Task: $ARGUMENTS

Run these steps in order. Use the named subagent for each step; don't do a role's work yourself.

1. Create `harness/handoffs/<task-slug>/`. Save every reply there as the next
   numbered file (`01-<role>.md`, `02-<role>.md`, ...), correction rounds included.
2. Call `<role-a>` with the task. Save its reply.
3. Call `reviewer` with the path to that file. Save its reply.
   - `VERDICT: FAIL`: call `<role-a>` again with the path to the reviewer's file, then the reviewer again. After <N> failed attempts, stop and report to the person.
   - `VERDICT: PASS`: continue.
4. Call `<role-b>` with the path to `<role-a>`'s last handoff. ...
```

The person starts it with one line:

```
/<pipeline-name> <concrete description of the task>
```

`disable-model-invocation: true` means the line only starts when the person types that command, never on Claude's own initiative. `$ARGUMENTS` is replaced by whatever follows the command.

Why a skill and not another role? The pipeline is a procedure for the main conversation to follow (Module 2: a skill adds knowledge to the current context). The main conversation is also the one place that sees every handoff, which is what lets it decide who's up next.

## Questions For You

- Does the pattern above hold for this field, or does the order look different?
- Are there special cases? (Just one partial step without the others, exception workflows …)
- What happens on FAIL: how many correction attempts before a human steps in?
- What exactly gets passed on at each handoff?

## What Gets Built

- `.claude/skills/<pipeline-name>/SKILL.md`: the full assembly line with handoffs and the FAIL limit, started with `/<pipeline-name> <task>`
- `harness/handoffs/.gitkeep`: the folder the pipeline writes handoff files into
- Each role file's Output section, updated so the role ends with the handoff note the next step expects

## Notes For Running This

- The pipeline skill calls the roles; roles never call each other. Keep every step in the skill, even if nesting would look tidier.
- Don't add `context: fork` to the pipeline skill. It has to run in the main conversation to call the roles one after another.
- A special case from the questions (e.g. "just one partial step") becomes its own small pipeline skill, not a branch inside the main one.
- If `.claude/skills/` didn't exist before this module, tell the person to run `/reload-skills` or start a new session before trying `/<pipeline-name>`.
- Ask whether handoff files should be committed. Default: yes, they're the audit trail. If tasks contain sensitive content, add `harness/handoffs/` to `.gitignore` instead.
- Once the files exist, offer one real test run with the example task from the intake. A pipeline that has never run isn't done.
- Start with sequence, even if parallel feels tempting. Debuggability matters more than speed at the start.
- If the reviewer only shows up once, right at the end, ask whether an earlier check wouldn't pay off. It usually does.
