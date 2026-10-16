#!/usr/bin/env node
// Executor de evals para um projeto build-harness.
// Fica em harness/evals/run-evals.js. Lê harness/evals/eval-set.md, inicia
// o pipeline uma vez por eval pelo modo não interativo do Claude Code, confere
// os critérios que um script consegue conferir e registra o desfecho.
//
//   node harness/evals/run-evals.js                  roda todas as evals
//   node harness/evals/run-evals.js --only E01,E04   roda algumas
//   node harness/evals/run-evals.js --list           mostra o que rodaria, não inicia nada
//
// Opções: --pipeline <nome>    pipeline para as evals que não indicam um
//         --timeout-min <n>    desiste de uma eval depois de n minutos (padrão 20)
//         --allow-dirty        roda mesmo com mudanças sem commit no projeto
//
// Cada eval roda o pipeline real, então grava arquivos reais. Comece de um estado
// git limpo e revise ou descarte as mudanças depois.
//
// Grava: harness/evals/runs/<timestamp>/<id>.md   um relatório por eval
//        harness/evals/results.md                 uma linha por eval, acrescentada ao fim

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
    else fail(`Opção desconhecida: ${argv[i]}`);
  }
  return args;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

// Formato do eval-set.md, um bloco por eval:
//
//   ## E01: Título curto
//   Category: role
//   Pipeline: <nome-do-pipeline>
//   Input: A tarefa, em uma linha, exatamente como seria digitada.
//   Criteria:
//   - [check: verdict pass] O revisor dá PASS
//   - [manual] O tom combina com o cliente
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

// Os vereditos do revisor nesta execução, em ordem. Do log da sessão se o
// Módulo 7 estiver no lugar; caso contrário, dos arquivos de handoff que a execução criou.
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

// Devolve { ok: true|false|null, note }. null significa "não pôde ser conferido".
function runCheck(check, context) {
  const [name, ...rest] = check.split(/\s+/);
  const arg = rest.join(' ');
  const all = verdicts(context.log, context.handoffDirs);
  switch (name.toLowerCase()) {
    case 'verdict': {
      if (all.length === 0) return { ok: false, note: 'nenhum veredito do revisor encontrado' };
      const last = all[all.length - 1];
      return { ok: last === arg.toLowerCase(), note: `veredito final: ${last}` };
    }
    case 'max-review-fails': {
      const fails = all.filter((verdict) => verdict === 'fail').length;
      return { ok: fails <= Number(arg), note: `${fails} FAIL(s) do revisor` };
    }
    case 'hook-blocked': {
      if (!context.log) return { ok: null, note: 'precisa do log da sessão do Módulo 7' };
      const hit = context.log.some((event) => event.type === 'hook' && event.hook === arg && event.blocked);
      return { ok: hit, note: hit ? `${arg} bloqueou uma ação` : `${arg} não disparou` };
    }
    case 'no-hook-blocked': {
      if (!context.log) return { ok: null, note: 'precisa do log da sessão do Módulo 7' };
      const blocks = context.log.filter((event) => event.type === 'hook' && event.blocked);
      return { ok: blocks.length === 0, note: `${blocks.length} bloqueio(s) de hook` };
    }
    case 'file-exists': {
      const exists = fs.existsSync(path.resolve(PROJECT_DIR, arg));
      return { ok: exists, note: exists ? 'arquivo existe' : 'arquivo ausente' };
    }
    default:
      return { ok: null, note: `checagem desconhecida "${name}"` };
  }
}

function runPipeline(pipeline, input, timeoutMin) {
  const result = spawnSync(
    CLAUDE_BIN,
    ['-p', `/${pipeline} ${input}`, '--permission-mode', 'acceptEdits', '--output-format', 'json'],
    { cwd: PROJECT_DIR, encoding: 'utf8', timeout: timeoutMin * 60000, maxBuffer: 64 * 1024 * 1024 }
  );
  if (result.error && result.error.code === 'ENOENT') {
    fail(`Não foi possível iniciar "${CLAUDE_BIN}". Defina a variável de ambiente CLAUDE_BIN com o caminho do executável claude.`);
  }
  if (result.error) return { error: result.error.code === 'ETIMEDOUT' ? `tempo esgotado após ${timeoutMin} min` : result.error.message };
  try {
    const parsed = JSON.parse(result.stdout);
    // --output-format json imprime um objeto de resultado, ou uma lista que termina com ele.
    const final = Array.isArray(parsed) ? parsed.filter((item) => item.type === 'result').pop() : parsed;
    if (!final) return { error: 'nenhum resultado na saída do Claude Code' };
    return {
      sessionId: final.session_id || null,
      text: final.result || '',
      costUsd: typeof final.total_cost_usd === 'number' ? final.total_cost_usd : null,
      error: final.is_error ? final.result || 'o Claude Code relatou um erro' : null,
    };
  } catch {
    return { error: `saída ilegível do Claude Code: ${(result.stderr || result.stdout || '').slice(0, 300)}` };
  }
}

function mark(ok) {
  return ok === true ? 'PASS' : ok === false ? 'FAIL' : 'NÃO CONFERIDO';
}

function writeReport(runDir, evalCase, run, context, checked) {
  const lines = [
    `# ${evalCase.id}: ${evalCase.title}`,
    '',
    `Entrada: ${evalCase.input}`,
    `Sessão: ${run.sessionId || 'desconhecida'}`,
    `Handoffs: ${context.handoffDirs.map((dir) => `harness/handoffs/${dir}/`).join(', ') || 'nenhum criado'}`,
    '',
    '## Conferido pelo script',
    '',
    ...checked.auto.map((item) => `- ${mark(item.result.ok)}: ${item.text} (${item.result.note})`),
    ...(checked.auto.length ? [] : ['- nenhum']),
    '',
    '## Para você conferir',
    '',
    ...checked.manual.map((item) => `- [ ] ${item.text}`),
    ...(checked.manual.length ? [] : ['- nenhum']),
    '',
    '## O que o pipeline relatou',
    '',
    run.error ? `A execução falhou: ${run.error}` : run.text,
    '',
  ];
  fs.writeFileSync(path.join(runDir, `${evalCase.id}.md`), lines.join('\n'));
}

function appendResult(row) {
  if (!fs.existsSync(RESULTS)) {
    fs.writeFileSync(
      RESULTS,
      '# Resultados das evals\n\n| Data | Eval | Resultado | Checagens do script | Para você conferir | Tokens | Custo (USD) | Relatório |\n|---|---|---|---|---|---|---|---|\n'
    );
  }
  fs.appendFileSync(RESULTS, `| ${row.join(' | ')} |\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(EVAL_SET)) fail(`Nenhum conjunto de evals encontrado em ${EVAL_SET}`);

  let evals = parseEvalSet(fs.readFileSync(EVAL_SET, 'utf8'));
  if (args.only) evals = evals.filter((evalCase) => args.only.includes(evalCase.id));
  if (evals.length === 0) fail('Nenhuma eval para rodar. Confira os títulos "## <ID>: <título>" no eval-set.md.');

  for (const evalCase of evals) {
    evalCase.pipeline = evalCase.pipeline || args.pipeline;
    if (!evalCase.input) fail(`${evalCase.id} não tem linha "Input:".`);
    if (!evalCase.pipeline) fail(`${evalCase.id} não indica pipeline. Acrescente uma linha "Pipeline:" ou passe --pipeline <nome>.`);
  }

  if (args.list) {
    for (const evalCase of evals) {
      const auto = evalCase.criteria.filter((criterion) => criterion.check).length;
      console.log(`${evalCase.id}  /${evalCase.pipeline}  ${auto} checagem(ns) do script, ${evalCase.criteria.length - auto} manual(is)  ${evalCase.title}`);
    }
    return;
  }

  if (!args.allowDirty) {
    const status = spawnSync('git', ['status', '--porcelain'], { cwd: PROJECT_DIR, encoding: 'utf8' });
    if (status.status === 0 && status.stdout.trim()) {
      fail('O projeto tem mudanças sem commit. As evals rodam o pipeline real e gravam arquivos reais.\nFaça commit ou stash antes, ou passe --allow-dirty.');
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
      else if (run.error) checked.auto.push({ ...criterion, result: { ok: false, note: 'a execução falhou' } });
      else {
        const result = runCheck(criterion.check, context);
        // Uma checagem que o script não conseguiu fazer volta para a pessoa.
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
      `${checked.auto.length - autoFailed}/${checked.auto.length} passaram`,
      `${checked.manual.length} em aberto`,
      session && session.total_tokens ? session.total_tokens : '-',
      run.costUsd === null || run.costUsd === undefined ? '-' : run.costUsd.toFixed(2),
      `runs/${stamp}/${evalCase.id}.md`,
    ]);
    console.log(outcome + (run.error ? ` (${run.error})` : ''));
  }

  console.log(`\nRelatórios: ${path.relative(PROJECT_DIR, runDir)}`);
  console.log('OPEN significa que as checagens do script passaram e restam critérios para você conferir no relatório.');
  process.exit(failed ? 1 : 0);
}

main();
