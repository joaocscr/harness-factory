# Teste do modo direto — persona técnica (lacuna (e) da auditoria)

16/10/2026 · Task 6 do plano de finalização · persona "Marina", analista quantitativa (backtesting de sinais de fator) · roteiro: `motor/modo-direto.md` já traduzido

## Resultado: APROVADO — o modo direto funciona de ponta a ponta

Fluxo 0 do `construir` → detecção de tecnicidade → oferta → aceite → etapas 0–6 do roteiro, gerando um harness mínimo real em `.superpowers/e2e/modo-direto/` (git próprio, 4 commits). Transcript integral com as 17 ambiguidades anotadas (A1–A17): [2026-10-16-teste-modo-direto-transcript.md](2026-10-16-teste-modo-direto-transcript.md).

## O que o teste provou de verdade

- **Oferta do modo direto** decorre naturalmente do fluxo 0.4 quando a pessoa cita git/pandas/CSV.
- **As 7 etapas do roteiro traduzido são executáveis** — nada travou.
- **Invariantes §3: 9/9** — layout portável (nenhum arquivo de `metodo/` cita `.claude`), 10 scripts Python com `ambiente.py`, model pins justificados (`# Por quê:`), revisor independente testado (recebe só caminhos+sha256), aprovação humana testada (script recusa sem PASS ou com artefato alterado), 4 etapas obrigatórias marcadas, GLOSSARIO usado por todas as skills, comece-aqui gerado, negação de gabaritos cobrindo Read/Edit/Write/Bash/PowerShell.
- **Pipeline real passou:** especificador→analista→revisor com recomendação coerente (descartar sinal sem alfa em dados sintéticos); 3 evals determinísticas PASS; 4 cenários de erro barrados por script (look-ahead na spec, tearsheet alterado pós-revisão, veredito FAIL, aprovação em modo teste).
- **Achado extra valioso:** `git autocrlf` altera o sha256 de artefatos congelados num clone — corrigido no harness gerado com `.gitattributes`, confirmado em clone novo. → candidato a regra da fábrica.

## Limites do teste

Papéis emulados com `general-purpose` + "leia sua definição" (tipos de agente do projeto não carregam na sessão que o constrói), então restrições de ferramenta valeram por instrução, não pelo sistema (A17). Baseline comparativo (6-3) e execução real do teste de acionamento (6-4) não foram feitos. Nenhum hook foi criado (A15 — o roteiro não invoca `guardas`).

## Conflitos motor×invariantes e ambiguidades (entrada da revisão final)

8 conflitos: (1) árvore de modos não considera paradas humanas; (2) roteiro manda skills+scripts em `.claude/skills/` contra o layout §3; (3) template de orquestrador põe ferramentas Claude Code dentro de `metodo/` (o teste resolveu engordando o wrapper); (4) congelamento com `shasum` (bash puro); (5) revisor sem ferramentas × QA "com todas"; (6) papéis só em `.claude/agents/` = troca de executor perde definições; (7) política de CLAUDE.md do motor × módulo 1 (resolvido com AGENTS.md + registro); (8) modo direto sem etapas de guardas/evals/glossário/comece-aqui — o executor encaixou por decisão própria. Mais A1 (tom pós-aceite), A2 (commits sem módulos), A3 (sem âncora de retomada no modo direto). Detalhe por item no transcript.
