# Module 7: Observability

## Core Idea

There's now a complete harness: house rules, roles, tools, pipeline, hooks, evals.

But how do you tell what's actually happening? How much does a session cost? Why did a role make this decision? When did the harness start getting worse?

That's observability: the ability to look inside the running harness.

Without observability, you're working blind. Outputs are visible, but not why they turned out that way. Problems only surface once the damage is already done.

## The Three Layers

**1. Logs: what happened?**
Every action, every decision, every hook call. The complete history of a session.

**2. Traces: why did it happen?**
A role's reasoning path. Which tools did it call, in what order, why?

**3. Metrics: how well is it running?**
Token costs, latency, reviewer PASS/FAIL rate, hook trigger frequency.

## What to Actually Watch

### Token cost per session
Every interaction costs tokens. A session with many roles and several review rounds costs more than one with few. Knowing what a typical session costs makes it easy to spot when something's gone off the rails, e.g. because a role is stuck in a loop.

### Reviewer PASS/FAIL rate
Frequent FAILs have two possible causes: the roles are making more mistakes (adjust role files) or the reviewer is too strict (clarify rules in `AGENTS.md`). Without this number, it's unclear which of the two problems is actually happening.

### Hook trigger frequency
If a hook fires every day, there's a systemic problem that needs fixing in the role file or `AGENTS.md`, not primarily a hook problem, a context problem.

### Drift
Agents can behave differently over time: after model updates, after changes to role files, after long pauses. Drift is hard to spot without a comparison point. The eval set from Module 6 is that comparison point; observability shows when it's worth running.

## What Observability Looks Like in Practice

No complex monitoring system needed. To start, this is enough:

### Who writes the log

Not the agent. An agent asked to report its own token count is guessing, and a role that forgot a step will also forget to log it. The same reasoning as in Module 5 applies: if it can be forgotten, a hook does it.

Claude Code records every session, including each role's run, in a transcript file with the real token counts. A hook reads from that record and writes the log.

### Session log
One file per session, one line per event, written by hooks:

```json
// harness/observability/logs/2026-07-12-<session-id>.jsonl
{"time": "2026-07-12T09:14:02Z", "type": "role", "role": "<role>", "tokens": {"input": 6, "output": 1410, "cache_read": 10740, "cache_write": 6513, "total": 18669}}
{"time": "2026-07-12T09:15:40Z", "type": "role", "role": "reviewer", "tokens": {"total": 12573}, "verdict": "fail"}
{"time": "2026-07-12T09:16:05Z", "type": "hook", "hook": "<hook-name>", "blocked": true, "role": "<role>"}
{"time": "2026-07-12T09:19:31Z", "type": "role", "role": "<role>", "tokens": {"total": 21952}}
{"time": "2026-07-12T09:20:48Z", "type": "role", "role": "reviewer", "tokens": {"total": 14466}, "verdict": "pass"}
{"time": "2026-07-12T09:21:10Z", "type": "session", "main_tokens": {"total": 206361}, "role_tokens": 67660, "total_tokens": 274021, "duration_minutes": 8}
```

(Shortened here; every `tokens` entry has the same five numbers as the first line.)

`total_tokens` is the whole session: the main conversation that ran the pipeline plus all roles. `cache_read` tokens are text Claude Code reused from earlier in the session; they're billed at a fraction of the normal price, so a high total with mostly `cache_read` is cheaper than it looks. 
The session log counts tokens, not money. Claude Code doesn't hand a price to the log script, and the script doesn't carry a price list of its own, because that would go out of date. The one place a dollar figure does appear is the cost column in `harness/evals/results.md` (Module 6): for eval runs, Claude Code reports a cost itself. For a rough cost of a normal session, compare its token total with an eval run of similar size.

Three sources feed it:

| Line | Written by | Where the data comes from |
|---|---|---|
| `role` | A hook that runs each time a role finishes (`SubagentStop`) | Which role, its transcript (tokens), and the first line of its reply (`VERDICT: PASS/FAIL` for the reviewer) |
| `hook` | The guard scripts from Module 5 themselves | Each script adds a line when it triggers |
| `session` | A hook that runs when the session ends (`SessionEnd`) | The session transcript (total tokens, first and last timestamp) |

The task and what each role produced aren't repeated here; they're already in `harness/handoffs/<task>/` from Module 4.

### Metrics table
A simple markdown file with one row per session:

```markdown
## Harness Metrics

| Date | Pipeline | Task | Tokens | Reviewer FAILs | Hook blocks | Duration |
|---|---|---|---|---|---|---|
```

Every number in a row is copied from that session's log, never estimated.

### Drift check
Regularly (e.g. weekly): run 3-4 evals from the eval set (`node harness/evals/run-evals.js --only E01,E05,E09`), compare with the earlier entries in `harness/evals/results.md`. More FAILs than before means it's time to adjust the harness.

## What Observability Gives You Over Time

After enough sessions, patterns become visible:
- What a typical session costs
- Which pipeline is the most expensive
- Where the reviewer gives FAIL most often
- Which hooks trigger most often

These numbers are signals for where the harness still isn't configured well enough.

## Observability vs. Hooks vs. Evals

| | Hooks | Evals | Observability |
|---|---|---|---|
| When | Real-time, during a session | On command, after changes | After every session |
| What | A single rule | Overall behavior | Trends over time |
| Reacts to | Mistakes in the moment | Regressions | Drift and cost |
| Output | PASS/FAIL | PASS/FAIL list | Metrics and logs |

All three together give a complete picture.

## Questions For You

- Realistically, how often will sessions happen: daily, weekly?
- Who looks at these metrics later: just the person themselves, or a team?
- What's a realistic rhythm for a drift check (weekly, monthly)?

## What Gets Built

- `harness/observability/logs/.gitkeep`: folder for session logs
- `harness/observability/log-event.js`: the script that writes the log, copied unchanged from this skill's `templates/log-event.js`
- The wiring for it in `.claude/settings.json`, next to the hooks from Module 5:

  ```json
  "SubagentStop": [
    { "hooks": [ { "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/harness/observability/log-event.js\"" } ] }
  ],
  "SessionEnd": [
    { "hooks": [ { "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/harness/observability/log-event.js\"" } ] }
  ]
  ```
- One added line in each guard script from Module 5, at the point where it triggers: `require('../observability/log-event.js').logHook(input, '<hook-name>', blocked)`
- `harness/observability/metrics.md`: metrics table (empty, ready to fill in)
- `harness/observability/drift-check.md`: instructions for the regular drift check

## Notes For Running This

- Don't write the log script from scratch; copy `templates/log-event.js`. It's been tested against a real pipeline run. It needs Node. If the person's machine has no Node, port it to the runtime chosen in Module 5 and keep its behavior: same log lines, same file naming.
- The script reads token counts from Claude Code's transcript files, whose layout can change between versions. It's built to write `null` when it can't read a value. If `tokens` shows up as `null` in a real log, that's the signal the layout changed: check the current Claude Code docs and adjust `sumTokens` in the script. A missing number is fine; an invented one isn't.
- If the guard scripts from Module 5 aren't written in Node, they can't use `logHook` directly. Have them append the same JSON line to the session's log file themselves.
- Test it with one real pipeline run and read the resulting log together with the person. Only mark the module done once a log file with real numbers exists.
- Ask whether logs should be committed. They contain role names, token counts, and verdicts, no task content. Default: commit them, so the metrics have a history.
- Merge into `.claude/settings.json`; don't replace the Module 5 hooks.
- This structure only becomes useful once real sessions have run. The goal here is to put it in place, not to fill it with data immediately.
- Once 5+ real session logs exist, Module 8 (Observability Dashboard, bonus) becomes relevant. See `08-dashboard-bonus.md`.
