# Módulo 8: Painel de observabilidade (bônus)

Este módulo é opcional e só se torna relevante depois que pelo menos 5 sessões reais tiverem sido registradas.

**Pré-requisito:** `harness/observability/logs/` contém pelo menos 5 arquivos de log de sessão com dados reais.

**O que é construído:**
- Um `index.html` local (ou uma segunda aba, se já existir uma página de painel) com uma visão "Métricas"
- Lê os logs de sessão diretamente de `harness/observability/logs/`
- Visualizações: custo em tokens ao longo do tempo, taxa de FAIL do revisor, frequência dos hooks, comparação entre pipelines
- Sem servidor, sem etapa de build; roda localmente no navegador

**Por que só depois de dados reais:**
Um painel com dados fictícios não mostra nada útil. Dados reais mostram o que de fato vale observar, e o que foi suposto incorretamente no início.

**Artefato do harness:** `index.html` (ou um arquivo próprio), o painel de métricas

## Notas de condução

- Se a pessoa perguntar sobre isto antes de existirem 5 logs, explique brevemente por que vale esperar e ofereça rodar uma sessão real agora, para gerar dados.
