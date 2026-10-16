# Harness Factory

Plugin de Claude Code que **constrói e evolui harnesses de agentes** conduzindo o usuário — inclusive quem nunca escreveu uma linha de código — de uma conversa sobre o seu trabalho até um time de agentes funcionando.

Repositório **privado** de João Coutinho (joaocscr). Copyright © 2026 João Coutinho, licença Apache-2.0; incorpora trabalho de terceiros — ver [ATTRIBUTION.md](ATTRIBUTION.md).

## O que ele faz

| Skill | Dispara quando você diz | O que entrega |
|---|---|---|
| `construir` | "construir/montar um harness", "quero um time de agentes para X" | workshop guiado → harness completo no formato método-portável |
| `evoluir` | "evoluir/melhorar/diagnosticar meu harness" | diagnóstico com propostas; só altera com aprovação |
| `guardas` | "criar uma regra/proteção para quando o agente fizer X" | regras em linguagem natural viram hooks |
| `validar` | "validar/conferir meu harness" | checklist de qualidade com relatório em linguagem leiga |

## Documentos que governam o projeto

- **Design (spec):** [docs/superpowers/specs/2026-10-15-fabrica-harness-design.md](docs/superpowers/specs/2026-10-15-fabrica-harness-design.md)
- **Plano de implementação:** [docs/superpowers/plans/2026-10-15-harness-factory.md](docs/superpowers/plans/2026-10-15-harness-factory.md)

## Instalação

```
/plugin marketplace add joaocscr/harness-factory
/plugin install harness-factory@harness-factory
```

> **Importante:** o harness-factory **substitui** o plugin `build-harness` original (Philipp Jeroma). Se ele estiver instalado, desinstale-o ou desabilite-o — os dois disparam nas mesmas frases ("construir um harness", "build a harness") e, concorrendo, podem acionar o fluxo errado.

## Mapa do repositório

Todos os documentos do plugin estão em **português** (o motor foi traduzido do coreano e o workshop do inglês em 16/10/2026; os originais ficam no histórico git — e os dois SKILL de origem, intocados, nos arquivos `_original-*.md`).

```
skills/construir/   skill principal (workshop + motor)
  workshop/         condução para leigos (vendorizado: build-harness, MIT; traduzido)
  motor/            engenharia de agentes (vendorizado: revfactory/harness, Apache-2.0; traduzido)
skills/evoluir/     evolução de harness existente (vendorizado: revfactory, adaptado)
skills/guardas/     geração de hooks (conceito do hookify, reescrito)
skills/validar/     checklist de qualidade (conceito do plugin-dev, reescrito)
referencia/         biblioteca de context engineering (vendorizado: muratcankoylan, MIT)
licenses/           licenças originais das fontes vendorizadas
```

## Atualização manual das fontes

Este repositório é um **fork absorvido**: não depende dos repositórios de origem. Para puxar melhorias futuras, compare manualmente com as fontes listadas em [ATTRIBUTION.md](ATTRIBUTION.md) e copie o que valer a pena, preservando as adaptações locais (listadas no CHANGELOG).
