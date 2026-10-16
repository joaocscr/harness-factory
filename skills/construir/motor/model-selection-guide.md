# Guia de escolha de modelos Claude

Escolha o modelo de cada agente por quatro critérios: **complexidade, duração prevista, autonomia necessária e velocidade de resposta** do trabalho. O modelo pode ser especificado em `model:` no frontmatter YAML (cabeçalho) do arquivo de definição do agente, no parâmetro `model` da ferramenta `Agent` ou em `opts.model` passado ao `agent()` do `Workflow`. Deixe o motivo da escolha como comentário na definição do agente ou no skill de coordenação.

## Tabela-resumo de decisão

| Modelo | Critério de escolha | Trabalhos típicos |
|------|----------|----------|
| **fable** | Modelo de longa duração e autônomo, que a partir de um objetivo complexo planeja por conta própria e encadeia várias etapas até o artefato final | Raciocínio de alta dificuldade, trabalho criativo, coordenação de agentes, trabalhos muito difíceis que precisam ser entregues do planejamento à execução de longa duração |
| **opus** | Modelo centrado em raciocínio, que analisa a fundo problemas especializados e complexos para chegar a julgamentos e conclusões refinados | Design e arquitetura, geração de código, análises complexas, verificação cruzada, criação |
| **sonnet** | Modelo de uso geral que trata de forma equilibrada a maior parte do trabalho do dia a dia — escrita, programação, análise, pesquisa | Escrita, programação e pesquisa em geral, parsing de logs, conversão de formato, inspeção de arquivos estáticos, execução de scripts de deploy, coleta simples |

## 1. Fable

**Papel principal:** adequado a trabalhos muito difíceis que exigem montar um plano e executá-lo de forma autônoma por longo período. Não se limita a responder de imediato a uma pergunta: entende o objetivo, planeja várias etapas e as encadeia até produzir o artefato final.

### Trabalhos adequados

**① Trabalhos longos com várias etapas encadeadas** — use quando o trabalho não termina numa única resposta e é preciso executar várias tarefas em sequência.
- Pesquisa de mercado → análise de concorrentes → formulação de estratégia → redação de relatório
- Análise de requisitos → design da estrutura do serviço → plano de desenvolvimento → produção do artefato
- Revisão de vários documentos seguida de conclusão consolidada e plano de ação
- Desenho do processo completo de um projeto de longo prazo

O que importa é que as etapas não sejam isoladas: trata-se de **trabalho em que o resultado de uma etapa afeta a seguinte**.

**② Revisão de material volumoso e complexo** — use quando é preciso revisar em conjunto material grande e complexo, como artigos, relatórios, atas de reunião e documentos técnicos. É o caso em que não basta resumir; é preciso fazer também o seguinte.
- Analisar pontos em comum e diferenças entre vários materiais
- Identificar afirmações que se contradizem
- Separar a evidência central da informação periférica
- Consolidar muito material em um único artefato lógico

**③ Transformar ideias vagas em artefatos concretos** — trabalho em que os requisitos não estão definidos e só se tem uma ideia aproximada, e o modelo decide sozinho os detalhes necessários para produzir o artefato.
- Desenvolver a ideia "um serviço com esta cara" em um plano de negócios
- Desenhar a estrutura e o conteúdo de uma apresentação a partir apenas de um tema aproximado
- Concretizar uma ideia de produto incompleta em lista de funcionalidades e plano de desenvolvimento
- Produzir um relatório ou conteúdo completo sem rascunho prévio

Escolha quando importa mais a **capacidade de julgar e preencher as lacunas** do que a capacidade de seguir à risca instruções definidas.

**④ Problemas que exigem ao mesmo tempo raciocínio profundo e planejamento, ajuste e execução de longa duração** — não é que o Fable raciocine sempre mais fundo que o Opus. O Fable é mais adequado a problemas que, além de raciocínio profundo, exigem planejamento, ajuste e execução de longa duração.

### Quando escolher o Fable

- Quando é preciso passar por várias etapas até chegar ao resultado
- Quando é difícil para o usuário especificar todo o procedimento
- Quando o modelo precisa planejar sozinho a ordem do trabalho
- Quando é preciso produzir um artefato completo a partir de material volumoso
- Quando é preciso um resultado do tamanho de um projeto, e não uma resposta curta

## 2. Opus

**Papel principal:** modelo de raciocínio de alto desempenho que analisa a fundo e resolve problemas difíceis. Se o Fable é adequado a planejamento de longo prazo e execução autônoma, o Opus é adequado a se aprofundar em um problema de escopo definido e analisá-lo logicamente.

### Trabalhos adequados

**① Pesquisa e análise complexas** — trabalho que não termina em encontrar informação: é preciso avaliar várias evidências e chegar a uma conclusão lógica.
- Pesquisar a fundo um setor ou mercado complexo
- Análise comparativa de resultados de vários estudos
- Avaliar prós e contras de uma política ou estratégia de negócio
- Analisar causa e efeito com base em dados e documentos
- Redigir uma conclusão que sintetize perspectivas diferentes

**② Revisão de documentos técnicos longos** — trabalho de ler e entender documentos com muita terminologia especializada e estrutura complexa. Incluem-se aqui documentos de design de software, documentos de arquitetura de sistemas, artigos de pesquisa, especificações técnicas, documentos de requisitos de produto e documentação complexa de API e desenvolvimento. É mais adequado a **entender a estrutura lógica e o significado técnico** do que a encurtar o documento.

**③ Revisão de metodologia de pesquisa** — trabalho de examinar não só os resultados de uma pesquisa, mas também se o método usado para obtê-los é válido.
- Verificar se o desenho da pesquisa é adequado, se a amostra é suficiente e se não há viés na amostra
- Verificar se não há problemas no método de medição e nas conclusões estatísticas
- Examinar se a conclusão não está exagerada em relação à evidência real e se não há margem para outra interpretação

**④ Programação que executa por conta própria várias etapas de desenvolvimento** — não se limita a gerar uma ou duas linhas de código: entende o objetivo e executa em sequência várias tarefas de desenvolvimento.
- Analisar uma base de código existente e buscar a causa de erros
- Alterar código em vários arquivos, implementar funcionalidades, escrever testes
- Melhorar a estrutura do código e decidir sozinho a próxima tarefa durante o desenvolvimento

### Quando escolher o Opus

- Quando o problema é especializado e difícil, mas **o escopo é relativamente claro**
- Quando é preciso análise lógica e revisão aprofundadas
- Quando é preciso entender com precisão documentos técnicos ou artigos
- Quando é preciso encontrar falhas em uma pesquisa ou análise
- Quando é preciso resolver problemas de programação ou técnicos complexos

## 3. Sonnet

**Papel principal:** modelo equilibrado de uso geral, que executa de forma estável a maior parte do trabalho do dia a dia. A menos que o trabalho seja muito complexo ou exija julgamento especializado, serve amplamente para escrita, programação, pesquisa e análise.

### Trabalhos adequados

**① Escrita e produção de conteúdo** — adequado a e-mails, posts de blog, rascunhos de relatório, textos publicitários, revisão e reescrita de frases, roteiros de apresentação, planejamento de conteúdo para redes sociais e geração de ideias.

**② Trabalho de programação comum** — adequado a escrever funções, corrigir erros de código, desenvolver programas simples, explicar código existente, refatorar, escrever código de teste e produzir scripts de processamento de dados.

**③ Análise e pesquisa** — adequado a organizar a visão geral de um tema, comparar produtos e serviços, analisar o conteúdo de documentos, pesquisa simples de concorrentes, extrair os argumentos centrais, comparar prós e contras e organizar resultados de análise em tabelas ou relatórios.

**④ Resolução de problemas em várias etapas** — executa um trabalho de escopo claro dividindo-o em várias etapas. Exemplos: resumir um material e depois escrever um discurso; analisar requisitos e depois criar exemplos de código; analisar dados e depois explicar os resultados. Distingue-se dos projetos longos e autônomos entregues ao Fable.

**⑤ Trabalho repetitivo e operacional** — adequado a parsing de logs, conversão de formato, inspeção de arquivos estáticos, execução de scripts de deploy e coleta simples.

### Quando escolher o Sonnet

- Use quando não houver certeza sobre qual modelo escolher. Se a decisão for difícil, adote o sonnet como padrão.
- Use quando for preciso tratar o trabalho do dia a dia de forma rápida e estável.
- Use quando for preciso executar juntos vários tipos de trabalho, como escrita, programação e pesquisa.
- Use ao lidar com problemas nem simples demais nem complexos demais.
- Use quando for preciso considerar tanto a velocidade quanto a qualidade do resultado.

## Critério para distinguir Fable e Opus

- **Fable**: planeja o trabalho inteiro e o executa de forma autônoma por longo período.
- **Opus**: raciocina e analisa a fundo um problema complexo de escopo definido.

Por exemplo, para criticar a fundo um único artigo, o **Opus** é o adequado; para revisar dezenas de artigos, montar uma estratégia de pesquisa e chegar até o relatório final, o **Fable** é o adequado. Se o resultado de uma etapa afeta a seguinte e o modelo precisa encadear sozinho várias etapas, use o Fable. Se é preciso analisar a fundo um único problema de escopo claro, use o Opus.

## Regras de aplicação no harness

1. **Decida pelo trabalho** — não escolha o modelo pelo motivo de "é um agente importante". Escolha o modelo pesando a complexidade, a duração prevista, a autonomia necessária e a velocidade de resposta do trabalho que o agente vai assumir.
2. **Não atribua em bloco o mesmo modelo sem justificativa** — atribuir fable ou opus a todos os agentes só aumenta o custo. Escolha o modelo adequado a cada agente e deixe o motivo como comentário.
3. **Separe a camada de coordenação da camada de execução** — mesmo que a camada responsável por planejamento e coordenação (a sessão principal ou o agente supervisor) use fable, atribua aos agentes de trabalho abaixo dela o modelo adequado a cada tarefa, separadamente. O fato de o agente coordenador ser fable não significa que os agentes de trabalho também precisem ser fable.
4. **Escolha o modelo em cada etapa do workflow** — no script `Workflow`, é possível especificar com `opts.model` um modelo diferente para cada etapa. Use sonnet nas etapas repetitivas de coleta e conversão, opus nas etapas de verificação, julgamento e design aprofundados, e fable na etapa que monta o plano geral e executa por longo período.
