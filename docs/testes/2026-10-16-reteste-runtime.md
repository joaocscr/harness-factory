# Reteste do modo direto com runtime real — CONCLUÍDO

16/10/2026 · fecha o A17 e o teste de acionamento 6-4 por execução · alvo: harness gerado em `.superpowers/e2e/modo-direto/` · 4 execuções headless reais do Claude Code dentro da pasta do harness (após renovação do login do CLI pelo dono); saída bruta em `.superpowers/e2e/reteste/saida.txt`

## Resultados

| # | Teste | Resultado |
|---|---|---|
| T1 | **A17 — tipos de agente e restrições impostas pelo runtime** | ✅ `revisor-backtest` carregado e delegável; rodou em contexto limpo (15 chamadas); **sem Write/Edit imposto pelo sistema**, não por instrução. Bônus: o método falhou-fechado como desenhado — sem conseguir rodar uma checagem (permissão), o revisor deu **FAIL** em vez de aprovar no escuro, e ainda achou 2 problemas reais no caso (congelamento anterior à correção; frase categórica demais na seção 5). |
| T2 | **Acionamento positivo (6-4 por execução)** | ✅ pedido real de análise carregou o skill `backtest-fator` e descreveu o fluxo com revisor em contexto limpo e parada de aprovação |
| T3 | **Acionamento vizinho (não deve carregar)** | ✅ pergunta conceitual sobre backtesting respondida sem carregar o pipeline |
| T4 | **Eval real pelo runner** | ✅ `rodar_evals.py --only E01` → `VERDICT: PASS`, métricas na tolerância, relatório gravado em `_trabalho/evals/` |

## Achados que viraram regra da fábrica (aplicados na v0.2.2)

1. **`Write(caminho)` não é avaliado pelo sistema de permissões** — o runtime avisou em duas regras do harness gerado; regras de arquivo que impedem gravação devem ser `Edit(caminho)` (cobre todas as ferramentas de edição). → regra nova no `guardas` §4.

## Achados sobre o harness gerado (artefato de teste, fora do release)

- Duas regras `Write(...)` no `settings.json` a trocar por `Edit(...)`.
- Falta regra de permissão liberando `rodar_checagens.py` para o papel revisor — em execução headless as chamadas Bash dele estagnam esperando aprovação (o módulo 6 traduzido já avisa disso; o executor do teste de 16/10 não aplicou ao revisor).
- Congelamento do caso exemplo é anterior à correção do código (apontado pelo próprio revisor em T1).

## O que ficou de fora, com motivo

**Baseline 6-3 (with-skill × baseline):** diferido — é um exercício A/B por harness (mede o ganho da skill num domínio específico), não validação da fábrica; custa várias execuções completas e pertence ao uso real de cada harness.

## Conclusão

As três ressalvas que restavam da rodada de testes de 16/10 estão fechadas: restrições de ferramenta valem **pelo sistema** (A17), o acionamento foi testado **por execução** (6-4) e o runner roda evals reais de ponta a ponta. O harness gerado pelo modo direto funciona no runtime de verdade — inclusive nos seus mecanismos de defesa (fail-closed na revisão, parada de aprovação).
