# Módulo 0: Intake, o seu domínio

## Ideia central

Todo harness, seja ele produtor de design tokens, contratos, relatórios financeiros, respostas de suporte ou código, tem a mesma estrutura de base: contexto, papéis, ferramentas, sequência, guardas, critérios de qualidade, visibilidade.

A estrutura é a mesma em qualquer domínio; o que muda é o **conteúdo** que preenche cada espaço. Antes de o Módulo 1 começar, você precisa saber o suficiente sobre o domínio da pessoa para preencher os marcadores genéricos dos módulos seguintes com termos reais.

A função do intake é preparar o terreno para os sete módulos centrais que vêm a seguir, não produzir um artefato próprio.

## Perguntas para a pessoa

Faça estas perguntas em levas de 1-3, quantas levas forem necessárias para cobrir os três grupos abaixo (tipicamente 4-6), nunca todas de uma vez. Mantenha a leveza de uma conversa, não de um formulário.

**Grupo 1: O que sai disto?**
- O que o harness deve produzir, no fim das contas? (Código, texto, decisões, dados, documentos, designs …)
- Quem usa esse resultado, e para quê? (Outra equipe? Clientes? Um sistema mais adiante no fluxo?)
- Qual é um bom exemplo de tarefa típica que o harness deveria acabar dando conta? (Uma concreta e real, não um desejo)

**Grupo 2: O que vale neste domínio?**
- Qual é a fonte da verdade? Uma ferramenta, um repositório, um documento, um sistema: onde fica o estado atual e oficial?
- Que blocos/categorias recorrentes existem? (Num design system: categorias de tokens. No jurídico: cláusulas contratuais. Em finanças: categorias de contas. Qual é o equivalente aqui?)
- Que convenção de nomes ou de estrutura já está em uso, ou deveria estar?
- Que língua se usa em nomes, comentários, documentação?

**Grupo 3: O que nunca pode acontecer, e quem trabalha em quê?**
- O que um agente neste domínio **nunca** deve fazer? (As regras mais duras, inegociáveis; mesmo que seja só uma, esta é a frase mais importante de todo o intake)
- Que etapas de trabalho/papéis diferentes existem normalmente quando um humano faz esse trabalho? (Isso vira a planta dos papéis no Módulo 2)
- Como se reconhece um bom trabalho neste domínio, e um ruim? O que uma pessoa experiente na área apontaria na hora como erro?
- A que ferramentas/sistemas o agente precisa ter acesso? (Uma ferramenta de design, um repositório de código, um banco de dados, uma API externa …)

## O que é construído

As respostas não produzem um artefato independente, e sim:
- Um **nome/slug do projeto** (ex.: `legal-review-harness`, `support-macro-harness`)
- Um **objetivo em uma frase**, que vai para o `CURRICULUM.md`, seguindo o padrão: *"Um sistema de agentes, regras, ferramentas e guardas que transforma [entrada] em [saída] com confiabilidade, sem que [pessoa] precise conduzir cada passo pessoalmente."*
- Um primeiro `CURRICULUM.md`, seguindo `templates/CURRICULUM.template.md`, com a frase de objetivo e os módulos 1-8 marcados ⬜

## Notas de condução

- Se as respostas ficarem vagas ("automatizar tudo de algum jeito"), aprofunde usando o exemplo concreto do Grupo 1. Respostas abstratas ficam concretas quando você percorre um caso real.
- Se a pessoa já tem um fluxo de trabalho informal (mesmo sem IA), pergunte sobre ele explicitamente. Muitas vezes é a melhor fonte para os papéis e a sequência do Módulo 4.
- Se "o que nunca pode acontecer" vier vazio, insista: "Qual seria o erro mais constrangedor/caro que um agente poderia cometer aqui?" Quase todo domínio tem pelo menos uma resposta para isso.
- Anote os termos exatos que a pessoa usa, não as suas reformulações. Você vai querer levá-los 1:1 para o `AGENTS.md` no Módulo 1.
