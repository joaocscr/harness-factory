#!/usr/bin/env node
// Eval runner for a build-harness project.
// Lives at harness/evals/run-evals.js. Reads harness/evals/eval-set.md, starts
// the pipeline once per eval through Claude Code's non-interactive mode, checks
// the criteria a script can check, and records the outcome.
//
//   node harness/evals/run-evals.js                  run every eval
//   node harness/evals/run-evals.js --only E01,E04   run some
//   node harness/evals/run-evals.js --list           show what would run, start nothing
//
// Options: --pipeline <name>   pipeline for evals that don't name one
//          --timeout-min <n>   give up on one eval after n minutes (default 20)
//          --allow-dirty       run even with uncommitted changes in the project
//
// Each eval runs the real pipeline, so it writes real files. Start from a clean
// git state and review or discard the changes afterwards.
//
// Writes: harness/evals/runs/<timestamp>/<id>.md   one report per eval
//         harness/evals/results.md                 one row per eval, appended

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const EVAL_DIR = __dirname;
const PROJECT_DIR = path.resolve(EVAL_DIR, '..', '..');
const EVAL_SET = path.join(EVAL_DIR, 'eval-set.md');
const RESULTS = path.join(EVAL_DIR, 'results.md');
const HANDOFF_DIR = path.join(PROJECT_DIR, 'harness', 'handoffs');
const LOG_DIR = path.join(PROJECT_DIR, 'harness', 'observability', 'logs');
const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';

function parseArgs(argv) {
  const args = { only: null, pipeline: null, timeoutMin: 20, allowDirty: false, list: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--only') args.only = argv[++i].split(',').map((id) => id.trim());
    else if (argv[i] === '--pipeline') args.pipeline = argv[++i];
    else if (argv[i] === '--timeout-min') args.timeoutMin = Number(argv[++i]);
    else if (argv[i] === '--allow-dirty') args.allowDirty = true;
    else if (argv[i] === '--list') args.list = true;
    else fail(`Unknown option: ${argv[i]}`);
  }
  return args;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

// eval-set.md format, one block per eval:
//
//   ## E01: Short title
//   Category: role
//   Pipeline: <pipeline-name>
//   Input: The task, on one line, exactly as it would be typed.
//   Criteria:
//   - [check: verdict pass] Reviewer gives PASS
//   - [manual] The tone fits the customer
function parseEvalSet(text) {
  const evals = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = /^##\s+([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (heading) {
      current = { id: heading[1], title: heading[2], pipeline: null, input: null, criteria: [] };
      evals.push(current);
      continue;
    }
    if (!current) continue;
    const field = /^(Pipeline|Input):\s*(.+)$/i.exec(line);
    if (field) {
      current[field[1].toLowerCase()] = field[2].trim();
      continue;
    }
    const criterion = /^-\s*\[(manual|check:\s*[^\]]+)\]\s*(.+)$/i.exec(line);
    if (criterion) {
      const tag = criterion[1].trim();
      current.criteria.push({
        text: criterion[2].trim(),
        check: /^manual$/i.test(tag) ? null : tag.replace(/^check:\s*/i, '').trim(),
      });
    }
  }
  return evals;
}

function listDirs(dir) {
  try {
    return fs.readdirSync(dir).filter((name) => fs.statSync(path.join(dir, name)).isDirectory());
  } catch {
    return [];
  }
}

function readLog(sessionId) {
  try {
    const file = fs.readdirSync(LOG_DIR).find((name) => name.endsWith(`-${sessionId}.jsonl`));
    if (!file) return null;
    return fs
      .readFileSync(path.join(LOG_DIR, file), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return null;
  }
}

// The reviewer's verdicts for this run, in order. From the session log if
// Module 7 is in place, otherwise from the handoff files the run created.
function verdicts(log, handoffDirs) {
  if (log) {
    return log.filter((event) => event.type === 'role' && event.verdict).map((event) => event.verdict);
  }
  const found = [];
  for (const dir of handoffDirs) {
    const full = path.join(HANDOFF_DIR, dir);
    for (const name of fs.readdirSync(full).sort()) {
      const match = /VERDICT:\s*(PASS|FAIL)/i.exec(fs.readFileSync(path.join(full, name), 'utf8'));
      if (match) found.push(match[1].toLowerCase());
    }
  }
  return found;
}

// Returns { ok: true|false|null, note }. null means "couldn't be checked".
function runCheck(check, context) {
  const [name, ...rest] = check.split(/\s+/);
  const arg = rest.join(' ');
  const all = verdicts(context.log, context.handoffDirs);
  switch (name.toLowerCase()) {
    case 'verdict': {
      if (all.length === 0) return { ok: false, note: 'no reviewer verdict found' };
      const last = all[all.length - 1];
      return { ok: last === arg.toLowerCase(), note: `final verdict: ${last}` };
    }
    case 'max-review-fails': {
      const fails = all.filter((verdict) => verdict === 'fail').length;
      return { ok: fails <= Number(arg), note: `${fails} reviewer FAIL(s)` };
    }
    case 'hook-blocked': {
      if (!context.log) return { ok: null, note: 'needs the session log from Module 7' };
      const hit = context.log.some((event) => event.type === 'hook' && event.hook === arg && event.blocked);
      return { ok: hit, note: hit ? `${arg} blocked an action` : `${arg} did not trigger` };
    }
    case 'no-hook-blocked': {
      if (!context.log) return { ok: null, note: 'needs the session log from Module 7' };
      const blocks = context.log.filter((event) => event.type === 'hook' && event.blocked);
      return { ok: blocks.length === 0, note: `${blocks.length} hook block(s)` };
    }
    case 'file-exists': {
      const exists = fs.existsSync(path.resolve(PROJECT_DIR, arg));
      return { ok: exists, note: exists ? 'file exists' : 'file missing' };
    }
    default:
      return { ok: null, note: `unknown check "${name}"` };
  }
}

function runPipeline(pipeline, input, timeoutMin) {
  const result = spawnSync(
    CLAUDE_BIN,
    ['-p', `/${pipeline} ${input}`, '--permission-mode', 'acceptEdits', '--output-format', 'json'],
    { cwd: PROJECT_DIR, encoding: 'utf8', timeout: timeoutMin * 60000, maxBuffer: 64 * 1024 * 1024 }
  );
  if (result.error && result.error.code === 'ENOENT') {
    fail(`Could not start "${CLAUDE_BIN}". Set the CLAUDE_BIN environment variable to the path of the claude executable.`);
  }
  if (result.error) return { error: result.error.code === 'ETIMEDOUT' ? `timed out after ${timeoutMin} min` : result.error.message };
  try {
    const parsed = JSON.parse(result.stdout);
    // --output-format json prints one result object, or a list ending with it.
    const final = Array.isArray(parsed) ? parsed.filter((item) => item.type === 'result').pop() : parsed;
    if (!final) return { error: 'no result in Claude Code output' };
    return {
      sessionId: final.session_id || null,
      text: final.result || '',
      costUsd: typeof final.total_cost_usd === 'number' ? final.total_cost_usd : null,
      error: final.is_error ? final.result || 'Claude Code reported an error' : null,
    };
  } catch {
    return { error: `unreadable output from Claude Code: ${(result.stderr || result.stdout || '').slice(0, 300)}` };
  }
}

function mark(ok) {
  return ok === true ? 'PASS' : ok === false ? 'FAIL' : 'NOT CHECKED';
}

function writeReport(runDir, evalCase, run, context, checked) {
  const lines = [
    `# ${evalCase.id}: ${evalCase.title}`,
    '',
    `Input: ${evalCase.input}`,
    `Session: ${run.sessionId || 'unknown'}`,
    `Handoffs: ${context.handoffDirs.map((dir) => `harness/handoffs/${dir}/`).join(', ') || 'none created'}`,
    '',
    '## Checked by the script',
    '',
    ...checked.auto.map((item) => `- ${mark(item.result.ok)}: ${item.text} (${item.result.note})`),
    ...(checked.auto.length ? [] : ['- none']),
    '',
    '## For you to check',
    '',
    ...checked.manual.map((item) => `- [ ] ${item.text}`),
    ...(checked.manual.length ? [] : ['- none']),
    '',
    '## What the pipeline reported',
    '',
    run.error ? `Run failed: ${run.error}` : run.text,
    '',
  ];
  fs.writeFileSync(path.join(runDir, `${evalCase.id}.md`), lines.join('\n'));
}

function appendResult(row) {
  if (!fs.existsSync(RESULTS)) {
    fs.writeFileSync(
      RESULTS,
      '# Eval Results\n\n| Date | Eval | Result | Script checks | Yours to check | Tokens | Cost (USD) | Report |\n|---|---|---|---|---|---|---|---|\n'
    );
  }
  fs.appendFileSync(RESULTS, `| ${row.join(' | ')} |\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(EVAL_SET)) fail(`No eval set found at ${EVAL_SET}`);

  let evals = parseEvalSet(fs.readFileSync(EVAL_SET, 'utf8'));
  if (args.only) evals = evals.filter((evalCase) => args.only.includes(evalCase.id));
  if (evals.length === 0) fail('No evals to run. Check the "## <ID>: <title>" headings in eval-set.md.');

  for (const evalCase of evals) {
    evalCase.pipeline = evalCase.pipeline || args.pipeline;
    if (!evalCase.input) fail(`${evalCase.id} has no "Input:" line.`);
    if (!evalCase.pipeline) fail(`${evalCase.id} names no pipeline. Add a "Pipeline:" line or pass --pipeline <name>.`);
  }

  if (args.list) {
    for (const evalCase of evals) {
      const auto = evalCase.criteria.filter((criterion) => criterion.check).length;
      console.log(`${evalCase.id}  /${evalCase.pipeline}  ${auto} script check(s), ${evalCase.criteria.length - auto} manual  ${evalCase.title}`);
    }
    return;
  }

  if (!args.allowDirty) {
    const status = spawnSync('git', ['status', '--porcelain'], { cwd: PROJECT_DIR, encoding: 'utf8' });
    if (status.status === 0 && status.stdout.trim()) {
      fail('The project has uncommitted changes. Evals run the real pipeline and write real files.\nCommit or stash first, or pass --allow-dirty.');
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const runDir = path.join(EVAL_DIR, 'runs', stamp);
  fs.mkdirSync(runDir, { recursive: true });
  let failed = 0;

  for (const evalCase of evals) {
    process.stdout.write(`${evalCase.id} ${evalCase.title} ... `);
    const before = new Set(listDirs(HANDOFF_DIR));
    const run = runPipeline(evalCase.pipeline, evalCase.input, args.timeoutMin);
    const context = {
      handoffDirs: listDirs(HANDOFF_DIR).filter((dir) => !before.has(dir)),
      log: run.sessionId ? readLog(run.sessionId) : null,
    };

    const checked = { auto: [], manual: [] };
    for (const criterion of evalCase.criteria) {
      if (!criterion.check) checked.manual.push(criterion);
      else if (run.error) checked.auto.push({ ...criterion, result: { ok: false, note: 'run failed' } });
      else {
        const result = runCheck(criterion.check, context);
        // A check the script couldn't perform goes back to the person.
        if (result.ok === null) checked.manual.push({ text: `${criterion.text} (${result.note})` });
        else checked.auto.push({ ...criterion, result });
      }
    }

    const autoFailed = checked.auto.filter((item) => item.result.ok === false).length;
    const outcome = run.error ? 'ERROR' : autoFailed ? 'FAIL' : checked.manual.length ? 'OPEN' : 'PASS';
    if (outcome === 'ERROR' || outcome === 'FAIL') failed++;

    writeReport(runDir, evalCase, run, context, checked);
    const session = context.log && context.log.find((event) => event.type === 'session');
    appendResult([
      stamp.slice(0, 10),
      evalCase.id,
      outcome,
      `${checked.auto.length - autoFailed}/${checked.auto.length} passed`,
      `${checked.manual.length} open`,
      session && session.total_tokens ? session.total_tokens : '-',
      run.costUsd === null || run.costUsd === undefined ? '-' : run.costUsd.toFixed(2),
      `runs/${stamp}/${evalCase.id}.md`,
    ]);
    console.log(outcome + (run.error ? ` (${run.error})` : ''));
  }

  console.log(`\nReports: ${path.relative(PROJECT_DIR, runDir)}`);
  console.log('OPEN means the script checks passed and criteria remain for you to check in the report.');
  process.exit(failed ? 1 : 0);
}

main();
