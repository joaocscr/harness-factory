# Module 6: Evals

## Core Idea

Hooks check individual rules. The reviewer checks individual outputs. But who checks whether the **harness as a whole** works reliably?

That's the job of evals.

A classic test checks whether code compiles. An eval checks something different: whether the harness makes the right decisions, stays consistent, and still behaves as expected after a change.

The question an eval answers:
> "Given this input, does the harness reliably produce the right output?"

## The Analogy: Test Drives

A car gets built. Hooks check whether the brakes are mounted correctly. The reviewer checks whether the steering wheel sits straight. But nobody has driven the car yet.

An eval is the test drive. A defined route, under defined conditions, checking whether the car behaves the way it should.

Swap the engine, redo the test drive. Add a new road, add a new test to the route.

## Output Eval vs. Trajectory Eval

**Output eval**
Checks the end result: is the outcome correct? Are all expected parts present? Is it complete?
Easier to write, covers most cases.

**Trajectory eval**
Checks the path: did the role search for something similar before creating something new? Was an existence check done before building?
Harder, but important. A correct result reached the wrong way is a ticking time bomb.

**For a start:** begin with output evals. Trajectory evals come once the harness is running.

## Anatomy of an Eval

Every eval has three parts:

**1. Input:** what does the harness receive? A concrete, realistic task, the way it would actually be sent in real operation.
**2. Expected Output:** what should come out? Not a vague description, concrete, checkable criteria.
**3. Rubric:** how is it scored? Pass/fail per criterion, no overall score without individual evaluation.

## Deriving Eval Categories

Categories follow from the roles (Module 2) and the pipeline (Module 4), not from a fixed list:

**1. Role evals:** one category per creator role, checks whether that role works correctly
**2. Pipeline evals:** checks whether the whole assembly line runs correctly (order, handoffs, FAIL to correction)
**3. Edge-case evals:** checks whether unexpected or borderline inputs are handled correctly

A worked example, as a pattern for your own eval:

```markdown
## E01: <short title>
Category: role
Pipeline: <pipeline-name>
Input: <a realistic task from the intake, on one line, as it would be typed>
Criteria:
- [check: verdict pass] Reviewer gives PASS in the end
- [check: file-exists <path/to/expected/output>] The output file exists
- [manual] Output follows the naming/structure convention from AGENTS.md
- [manual] Role first checked whether something similar already exists

## E02: <short title>
Category: edge-case
Pipeline: <pipeline-name>
Input: <an input that would violate a hard rule>
Criteria:
- [check: hook-blocked <hook-name>] The guard stopped the violation
- [manual] Role refuses or asks, instead of breaking the rule
```

The actual evals emerge from conversation about the real roles, rules, and examples of this harness, not from copying the example above.

The format is fixed because a script reads it (next section): one `## <ID>: <title>` heading per eval, one `Input:` line, and every criterion marked either `[check: ...]` or `[manual]`.

## Two Kinds of Criteria

| | `[check: ...]` | `[manual]` |
|---|---|---|
| Decided by | The script | You |
| Good for | Facts: a verdict, a file, a hook | Judgment: tone, reasoning, fit |
| Example | "Reviewer gives PASS" | "The reply sounds like us" |

The checks the script knows:

| Check | Passes when |
|---|---|
| `verdict pass` / `verdict fail` | The reviewer's final verdict is that one |
| `max-review-fails <n>` | The reviewer said FAIL at most n times |
| `file-exists <path>` | That file exists after the run |
| `hook-blocked <hook-name>` | That guard from Module 5 blocked something |
| `no-hook-blocked` | No guard had to step in |

The two hook checks read the session log, which only exists after Module 7. Until then the script hands them back to you as manual.

The more criteria you can phrase as a check, the less there is to do by hand. "The result is good" can't be checked; "Reviewer gives PASS" can.

## The Eval Set

An eval set is a collection of evals that together cover the harness.

**10-15 evals** is a good starting point: enough to catch regressions, not so many that they never actually get run.

Rule of thumb: 3-4 per creator role, 2-3 pipeline evals, 3-4 edge-case evals.

## How Evals Get Run

Nobody copy-pastes fifteen inputs into a chat. A runner script does it:

```
node harness/evals/run-evals.js                  ← the whole set
node harness/evals/run-evals.js --only E01,E04   ← just these
node harness/evals/run-evals.js --list           ← show what would run
```

For each eval, the script starts the pipeline with that eval's input, exactly as if you had typed `/<pipeline-name> <input>`, waits for it to finish, and runs the checks. Then it writes two things:

- **One report per eval** in `harness/evals/runs/<date-time>/<ID>.md`: what the script checked, what's left for you as a tick list, and what the pipeline reported.
- **One row per eval** in `harness/evals/results.md`: result, how many checks passed, how many criteria are yours, tokens and cost.

The result in that row is one of:

| Result | Meaning |
|---|---|
| `PASS` | Every criterion was a check, and all passed |
| `OPEN` | All checks passed; manual criteria are waiting in the report |
| `FAIL` | At least one check failed |
| `ERROR` | The pipeline didn't finish |

After you've gone through the manual criteria of an `OPEN` eval, change its row to `PASS` or `FAIL` yourself.

Where the two numbers in a row come from:

- **Cost (USD)** is reported by Claude Code itself at the end of each run; the script copies it and calculates nothing. It's priced at API rates. If you use Claude Code through a subscription instead of an API key, you don't pay that amount per run; read it as a way to compare runs.
- **Tokens** come from the session log and stay `-` until Module 7 is in place.

Two things to know before the first run:

- **Evals do real work.** The pipeline writes real files, the same as in normal use. The script refuses to start if the project has uncommitted changes, so that afterwards everything an eval run produced is easy to see and to discard.
- **Evals cost tokens.** Each one is a full pipeline run. The cost column in `results.md` shows what a round costs; `--only` runs just the ones a change could have affected.

## When Evals Get Run

- **After every model update:** a new model can behave differently
- **After every harness change:** new rule, new hook, changed role file
- **On unexpected behavior:** the agent does something unexpected, so write an eval, reproduce it, fix it

Evals aren't a one-time setup. They grow with the harness.

## Questions For You

- Which behaviors of the harness are non-negotiable?
- What would be a clear sign the harness has stopped working correctly?
- For each role: what's a realistic test case, and what's the expected result?

## What Gets Built

- `harness/evals/eval-set.md`: 10-15 evals across the three categories, in the format above
- `harness/evals/run-evals.js`: the runner, copied unchanged from this skill's `templates/run-evals.js`
- `harness/evals/results.md` and `harness/evals/runs/`: created by the runner on its first run. Module 7's drift check compares against `results.md`.

## Notes For Running This

- Don't write the runner from scratch; copy `templates/run-evals.js`. It's been tested against real pipeline runs. It needs Node and the `claude` command on the PATH (otherwise set `CLAUDE_BIN`).
- Before the module is marked done: run `--list` to confirm every eval parses, then run one eval for real with `--only` and read its report together with the person. The full set can wait; one real run can't.
- The runner starts Claude Code without a chat window, so nobody is there to approve a permission prompt. File edits are allowed automatically; anything else a role needs (shell commands, MCP tools) must be allowed in `.claude/settings.json` under `permissions`, or the run stalls or fails. If the first real run ends in `ERROR`, check this first.
- If a role writes to an external system through an MCP server, an eval run writes there too, and git can't undo that. Ask about this before the first run. Point such evals at a test environment, or leave them out of the automated set and note it in `HANDOUT.md`.
- A criterion the runner doesn't recognize is handed to the person as manual, with a note. Check `--list` for unexpectedly low check counts.
- For trajectory criteria ("checked for an existing record first"), the handoff files from Module 4 are the evidence. Keep them `[manual]` unless a check can express them.
- Best to start with the evals most rooted in a real, already-experienced failure; those are more concrete than invented ones.
- If an eval is hard to formulate, that's often a sign the underlying rule in `AGENTS.md` is still too vague. A quick trip back to Module 1 usually helps.
