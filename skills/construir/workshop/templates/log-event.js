#!/usr/bin/env node
// Registrador de sessão para um projeto build-harness.
// Fica em harness/observability/log-event.js e escreve uma linha JSON por
// evento em harness/observability/logs/<data>-<id-da-sessao>.jsonl.
//
// Como hook (ligado em .claude/settings.json), lê a entrada do hook no stdin:
//   SubagentStop -> uma linha "role": qual papel rodou, seus tokens, o veredito do revisor
//   SessionEnd   -> uma linha "session": tokens e duração da sessão inteira
//
// A partir de um script de guarda (Módulo 5), para registrar que a guarda disparou:
//   require('../observability/log-event.js').logHook(input, '<nome-do-hook>', blocked)
//
// As contagens de tokens são lidas dos arquivos de transcrição do Claude Code. Esse formato
// não é uma interface estável, então toda leitura é protegida: um valor que não pode ser lido
// é gravado como null, nunca estimado.

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');

function logFile(sessionId) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const suffix = `-${sessionId}.jsonl`;
  const existing = fs.readdirSync(LOG_DIR).find((f) => f.endsWith(suffix));
  if (existing) return path.join(LOG_DIR, existing);
  return path.join(LOG_DIR, new Date().toISOString().slice(0, 10) + suffix);
}

function append(sessionId, event) {
  const line = JSON.stringify({ time: new Date().toISOString(), ...event });
  fs.appendFileSync(logFile(sessionId || 'unknown'), line + '\n');
}

function readEntries(transcriptPath) {
  const entries = [];
  for (const line of fs.readFileSync(transcriptPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
      // pula uma linha que ainda está sendo escrita
    }
  }
  return entries;
}

// Soma o consumo de cada resposta do modelo numa transcrição. Uma resposta pode ocupar
// várias linhas que repetem o mesmo consumo, então as respostas são contadas uma vez por id.
function sumTokens(transcriptPath) {
  try {
    const usageById = new Map();
    for (const entry of readEntries(transcriptPath)) {
      const message = entry.message;
      if (entry.type !== 'assistant' || !message || !message.usage) continue;
      usageById.set(message.id || entry.uuid, message.usage);
    }
    if (usageById.size === 0) return null;
    const tokens = { input: 0, output: 0, cache_read: 0, cache_write: 0 };
    for (const usage of usageById.values()) {
      tokens.input += usage.input_tokens || 0;
      tokens.output += usage.output_tokens || 0;
      tokens.cache_read += usage.cache_read_input_tokens || 0;
      tokens.cache_write += usage.cache_creation_input_tokens || 0;
    }
    tokens.total = tokens.input + tokens.output + tokens.cache_read + tokens.cache_write;
    return tokens;
  } catch {
    return null;
  }
}

function durationMinutes(transcriptPath) {
  try {
    const times = readEntries(transcriptPath)
      .map((entry) => Date.parse(entry.timestamp))
      .filter((time) => !Number.isNaN(time));
    if (times.length < 2) return null;
    return Math.round((Math.max(...times) - Math.min(...times)) / 6000) / 10;
  } catch {
    return null;
  }
}

function verdictOf(text) {
  const match = /VERDICT:\s*(PASS|FAIL)/i.exec(text || '');
  return match ? match[1].toLowerCase() : null;
}

// Tokens que os papéis usaram nesta sessão, tirados das linhas "role" já registradas.
function roleTokensSoFar(sessionId) {
  try {
    return fs
      .readFileSync(logFile(sessionId), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .filter((event) => event.type === 'role' && event.tokens)
      .reduce((sum, event) => sum + event.tokens.total, 0);
  } catch {
    return 0;
  }
}

function logRole(input) {
  const event = {
    type: 'role',
    role: input.agent_type || null,
    tokens: input.agent_transcript_path ? sumTokens(input.agent_transcript_path) : null,
  };
  const verdict = verdictOf(input.last_assistant_message);
  if (verdict) event.verdict = verdict;
  append(input.session_id, event);
}

function logSession(input) {
  const main = input.transcript_path ? sumTokens(input.transcript_path) : null;
  const roles = roleTokensSoFar(input.session_id);
  append(input.session_id, {
    type: 'session',
    main_tokens: main,
    role_tokens: roles,
    total_tokens: main ? main.total + roles : null,
    duration_minutes: input.transcript_path ? durationMinutes(input.transcript_path) : null,
  });
}

function logHook(input, hookName, blocked) {
  append(input && input.session_id, {
    type: 'hook',
    hook: hookName,
    blocked: Boolean(blocked),
    role: (input && input.agent_type) || null,
  });
}

module.exports = { logHook, sumTokens };

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (chunk) => (raw += chunk));
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(raw);
      if (input.hook_event_name === 'SubagentStop') logRole(input);
      else if (input.hook_event_name === 'SessionEnd') logSession(input);
    } catch (error) {
      // Uma falha de registro nunca pode interromper a sessão.
      process.stderr.write(`log-event: ${error.message}\n`);
    }
    process.exit(0);
  });
}
