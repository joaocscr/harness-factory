# Module 5: Hooks & Guards

## Core Idea

There's now an assembly line with specialized roles, clear handoffs, and a reviewer.

But agents forget sometimes, without meaning to. A step gets skipped. A check gets left out. A follow-up action doesn't get triggered because nobody happened to think of it in that moment.

**Hooks solve that.** They're deterministic code that automatically runs at certain points, regardless of whether a role remembered to do it.

A hook has no intelligence and never forgets. It simply enforces a rule, every time.

## The Analogy: Bouncer vs. Consultant

A role (agent) is like a consultant: it thinks along, gives recommendations, makes decisions.

A hook is like a bouncer: it checks a single rule and either lets you through or not. No discussion, no exceptions.

```
Agent:  "I finished X and I think Y is up to date too."
Hook:   [checks automatically] "Y was not changed. STOP."
```

The hook always wins in that moment, because it has no opinion, only a rule.

## Pre-Hooks vs. Post-Hooks

**Pre-hook:** runs *before* an action happens, preventing something wrong from being executed.
**Post-hook:** runs *after* an action happens, making sure the result is correct and triggering follow-up actions.

```
Pre-hook  →  [role's action]  →  Post-hook
```

## Deriving Hooks From Hard Rules

A hook comes from asking Module 1 (hard rules) and Module 4 (handoffs) one question: **can a role forget this? If yes, hook.**

Six patterns that show up in almost every field. The concrete implementation follows from the intake, not from this list:

**1. Format/rule check (pre)**
Does the output break a hard rule from `AGENTS.md`? (Analogous to: no hardcoded values)

**2. Reference-existence check (pre)**
Does a role reference something that doesn't exist yet? (Analogous to: referenced token doesn't exist)

**3. Breaking-change check (pre)**
Does a role change or delete something others already consume? (Analogous to: public-API change without a migration order)

**4. Auto-sync hook (post)**
Does something else need to be automatically updated after this change? (Analogous to: re-sync the context layer after every change)

**5. Quality-threshold check (post)**
Is there a measurable quality bar that must be checked every single time? (Analogous to: contrast check against WCAG)

**6. Completeness check (post)**
Is the output complete relative to what it's supposed to cover? (Analogous to: missing documentation stories)

Not every field needs all six. Some need only two, plus one that isn't on this list; that's fine.

## How Hooks Work in Claude Code

Claude Code supports hooks via `settings.json`. Hooks are shell commands or scripts that Claude Code runs automatically on certain events.

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/harness/hooks/<check-name>.js\"" }
        ]
      }
    ]
  }
}
```

So a hook is a script that runs on a specific event. The script itself is plain code, no AI, no agent.

- `PreToolUse` is the pre-hook: it runs before a tool is used and can stop it. `PostToolUse` is the post-hook: the action has already happened, so the script can only report back or trigger a follow-up.
- `matcher` says which tools the hook watches. `Write|Edit` covers both ways a role can change a file; `Write` alone misses every edit to an existing file.
- The script receives the details of the action (which tool, which file, which role) and answers with allow or block plus a reason. The role sees that reason and can correct itself.

Hooks apply to every role automatically, the reviewer and all creator roles included. That's the difference to the `tools` list from Module 3: `tools` decides what a role can touch at all, hooks check what it does with it.

## Hooks vs. Reviewer: the Difference

| | Reviewer (agent) | Hook |
|---|---|---|
| Type | AI agent | Deterministic code |
| Decides on | Quality, context, completeness | A single rule |
| Can forget | Yes (rarely) | No, never |
| Can discuss | Yes | No |
| Costs tokens | Yes | No |
| When | As a step in the pipeline | Automatically on every trigger |

Hooks and reviewer complement each other: the hook catches mechanical mistakes, the reviewer judges quality.

## Questions For You

- What rule must never be broken under any circumstances? (This is almost always the first hook worth building)
- Where has a forgotten step caused the most pain in the past, even without AI?
- Which of the six patterns above fits this field, and which doesn't?

## What Gets Built

- One script per hook, under `harness/hooks/`, e.g. `harness/hooks/<check-name>.js`
- The wiring into `.claude/settings.json`, so the hooks actually run automatically. That file is the single place that says which hook runs when.

## Notes For Running This

- If `.claude/settings.json` already exists, merge the new entry into it and keep everything else. Show the person the result before writing.
- Ask which script runtime is installed (Node, Python, plain shell) and write the hook in that. A hook in a language the machine can't run fails silently.
- Before writing the first script, check the current hook input and output format in the Claude Code docs. Test each hook once with an action that should be blocked and once with one that shouldn't.
- Settings changes are picked up without a restart. `/hooks` shows what's active.
- Start with the one hook that covers the most expensive past failure mode, not all six patterns at once.
- A hook that never triggers isn't a problem. A hook that triggers constantly is a signal of a context problem back in Module 1 or 2 (house rules or a role file), not primarily a hook problem.
