# Atribuições

Este repositório incorpora (vendoriza) trabalho de terceiros, conforme as licenças de cada fonte. Nenhuma das fontes endossa este projeto.

## Código/conteúdo copiado

### revfactory/harness (Apache-2.0)
- **Fonte:** https://github.com/revfactory/harness · autor: revfactory · versão base: v2.1.0 (out/2026)
- **Licença:** Apache-2.0 — cópia em [licenses/revfactory-harness-LICENSE](licenses/revfactory-harness-LICENSE)
- **O que foi copiado:** `skills/harness/references/*` → `skills/construir/motor/`; `skills/harness/SKILL.md` → `skills/construir/motor/_original-harness-SKILL.md` (referência intocada); `skills/evolve/SKILL.md` → base de `skills/evoluir/SKILL.md` (reescrito em português).
- **Modificações (exigência da Apache-2.0):** em 16/10/2026 os 9 arquivos do motor foram traduzidos fielmente do coreano para o português e `motor/modo-direto.md` foi criado como tradução de `_original-harness-SKILL.md` (referências internas ajustadas aos caminhos deste repositório). Originais em coreano: no arquivo `_original-*` e no histórico git (commit da vendorização, 8cb4e8e).

### Jeromski62/build-harness (MIT)
- **Fonte:** https://github.com/Jeromski62/build-harness · autor: Philipp Jeroma · versão base: v2.0.0
- **Licença:** MIT — cópia em [licenses/build-harness-LICENSE](licenses/build-harness-LICENSE)
- **O que foi copiado:** `skills/build-harness/reference/*` e `templates/*` → `skills/construir/workshop/`; `SKILL.md` → `skills/construir/workshop/_original-build-harness-SKILL.md` (referência intocada).
- **Modificações:** módulos 00 e 04–07 adaptados ao layout de método portável e às regras deste projeto (v0.1.0–v0.2.0); em 16/10/2026 todos os módulos, o template de CURRICULUM e os comentários dos `.js` foram traduzidos fielmente do inglês para o português. Originais em inglês: no arquivo `_original-*` e no histórico git (commit da vendorização, 3e87e38).

### muratcankoylan/Agent-Skills-for-Context-Engineering (MIT)
- **Fonte:** https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering · autor: Murat Can Koylan
- **Licença:** MIT — cópia em [licenses/muratcankoylan-LICENSE](licenses/muratcankoylan-LICENSE)
- **O que foi copiado:** subconjunto curado de 8 skills → `referencia/` (evaluation, advanced-evaluation, multi-agent-patterns, memory-systems, tool-design, context-fundamentals, context-compression, long-horizon-prompting), pastas copiadas na íntegra.

## Conceitos reescritos (sem cópia de código ou texto)

### anthropics/claude-code — plugins `hookify` e `plugin-dev`
- **Fonte:** https://github.com/anthropics/claude-code/tree/main/plugins · autor: Anthropic
- **Licença da fonte não confirmada** — por isso nada foi copiado literalmente. `skills/guardas/` reescreve do zero o conceito do hookify (regras em linguagem natural → hooks); `skills/validar/` reescreve do zero o conceito de validação de plugin do plugin-dev.
