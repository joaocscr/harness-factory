# Transcript — teste E2E do skill `construir` (persona: Ricardo, corretor de imóveis comerciais)

- Data: 2026-10-15
- Projeto de teste: `.superpowers/e2e/imoveis/`
- Skill seguido: `skills/construir/SKILL.md` (+ `skills/guardas/SKILL.md` no módulo 5, `skills/validar/SKILL.md` no fechamento do 7)
- Convenção: **Facilitador:** e **Ricardo:** são falas verbatim. Linhas `> [bastidor] ...` são ações internas do facilitador (leitura de arquivos, decisões, gravação) — **não** são mostradas ao Ricardo; ficam aqui para auditoria do teste. Linhas `> [ambiguidade] ...` registram pontos em que o texto do skill era ambíguo ou contraditório e a decisão tomada.

---

## Módulo 0 — Situar e retomar + Intake

> [bastidor] Li `skills/construir/SKILL.md`, `workshop/00-intake.md`, `workshop/templates/CURRICULUM.template.md`. Pasta `imoveis/` criada vazia. Procurei `CLAUDE.md`, `AGENTS.md`, `.claude/`, `metodo/`, `CURRICULUM.md`: nada existe → sem retomada. Conferi o ambiente em silêncio: Python 3.14 e Node 24 instalados (invariante 5 — nada a instalar).

**Facilitador:** Olá, Ricardo! Uma frase para confirmar o rumo: vamos montar juntos uma "equipe" de assistentes de inteligência artificial — cada um especializado numa parte da due diligence —, com regras da casa e travas de segurança, para que a análise de um imóvel comercial saia completa e confiável sem você ter que conduzir cada passo. Esse conjunto todo (equipe + regras + travas) é o que no meu meio se chama de *harness* — literalmente "arreio", aquilo que torna a força do cavalo útil e segura. Daqui pra frente vou chamar só de "o sistema".

Também confirmo o lugar: vou guardar tudo numa pasta deste computador chamada `imoveis` — pense nela como a pasta-arquivo do projeto no seu escritório. Pode ser lá?

Já dei uma olhada nessa pasta: está vazia. Não existe nenhuma regra, assistente ou anotação de trabalho anterior — então começamos do zero, sem nada a aproveitar e sem risco de estragar nada.

**Ricardo:** Isso mesmo. Eu sou corretor de imóvel comercial — galpão, loja, sala, prédio. Toda venda grande precisa de due diligence e hoje eu fico correndo atrás de advogado, despachante, arquiteto, avaliador, e no fim junto tudo num parecer. Quero que isso fique mais rápido e sem esquecer nada. Pode usar essa pasta sim. Não entendo muito dessas coisas de computador, então vai me guiando.

> [bastidor] Detecção de tecnicidade: Ricardo é leigo declarado → modo direto não é mencionado (SKILL §0.4).

**Facilitador:** Vou guiando sim — você só conversa; a parte de computador fica comigo, você nunca vai precisar digitar comando nem abrir arquivo. Três perguntas para começar, sobre o que sai no fim:

1. O que exatamente esse sistema deve entregar no final? Um parecer escrito? Uma lista de pendências? Uma recomendação de "compra / não compra"?
2. Quem usa esse resultado, e para quê? Você, o cliente comprador, o banco que financia?
3. Me conte um caso real e típico — o último imóvel em que você fez due diligence, do jeito que aconteceu.

**Ricardo:** 1. Um parecer de due diligence, umas 3 a 6 páginas, que diz se o imóvel está apto pra negociar, quais os riscos e o que precisa resolver antes da escritura. Eu chamo de "parecer de DD". No fim tem um semáforo: verde, amarelo ou vermelho.
2. Quem lê é o meu cliente, geralmente um investidor ou uma empresa que vai comprar ou alugar pra operar. Às vezes o banco pede também. Eles usam pra decidir se fecham e por quanto.
3. O último foi um galpão logístico em Jundiaí, 4.200 m² de área construída, o vendedor pedia R$ 9,5 milhões. Eu pedi a matrícula atualizada no cartório, as certidões do vendedor (era pessoa jurídica), o IPTU, a certidão de uso do solo da prefeitura e o laudo de avaliação que o cliente encomendou. Deu problema: tinha uma penhora averbada na matrícula por uma dívida trabalhista do vendedor, e a área do laudo era 4.200 m² mas na matrícula só tinha 3.650 m² averbados — o resto era ampliação sem averbação. Quase passou batido.

**Facilitador:** Que caso bom — ele vai virar o nosso "caso-escola". A penhora e a ampliação sem averbação são exatamente o tipo de coisa que o sistema precisa pegar sempre, mesmo quando todo mundo está com pressa. Agora, sobre o que vale no seu ramo:

1. Onde mora a "verdade oficial" de cada assunto? Pelo que entendi: matrícula no cartório de registro de imóveis, certidões nos tribunais e na Receita, zoneamento na prefeitura, valor no laudo. Está certo? Falta alguma fonte?
2. Quais são as "peças" que sempre se repetem num parecer de DD? Por exemplo: ônus da matrícula, certidões do vendedor, débitos do imóvel...
3. Como você organiza e dá nome aos casos hoje? E tudo é em português, imagino?

**Ricardo:** 1. É isso. Só acrescento: a certidão de ônus reais e a vintenária quando o banco pede, e o habite-se e o AVCB, que vêm da prefeitura e dos bombeiros. A matrícula manda — se não está na matrícula, não existe pra efeito de compra.
2. No meu parecer sempre tem: (a) identificação do imóvel e cadeia de proprietários, (b) ônus e gravames — hipoteca, penhora, alienação fiduciária, usufruto, indisponibilidade, (c) débitos do imóvel — IPTU, condomínio quando tem, (d) certidões do vendedor — cível, trabalhista, federal, protesto, (e) zoneamento e regularidade — uso permitido, habite-se, AVCB, área averbada, (f) avaliação — o valor do laudo comparado com o preço pedido, (g) conclusão com o semáforo e as pendências.
3. Uma pasta por imóvel com o nome da cidade e da rua, tipo "Jundiai - Av Antonio Frederico Ozanam 1234". Tudo em português sim.

**Facilitador:** Anotado — vou usar exatamente as suas palavras: "parecer de DD", "semáforo", "ônus e gravames", "área averbada", e as sete peças de (a) a (g). Última rodada do começo, a mais importante:

1. O que um assistente **nunca** pode fazer nesse trabalho, aconteça o que acontecer? Pense no erro mais caro ou mais vergonhoso que poderia acontecer.
2. Quando um humano faz esse trabalho, quem faz o quê? Você citou advogado, despachante, arquiteto e avaliador — me conta a divisão.
3. Que ferramentas ou sistemas você usa no dia a dia para isso? Pode ser qualquer coisa: e-mail, WhatsApp, site do cartório, planilha...

**Ricardo:** 1. Nunca dizer que o imóvel está limpo, "verde", sem ter visto a matrícula atualizada — com no máximo 30 dias. E nunca inventar nada: número de matrícula, valor, nome de credor. Se não está no documento, escreve que não está. E nada vai pro cliente sem eu ler e aprovar — o parecer sai com o meu nome.
2. O despachante tira as certidões e a matrícula. O advogado lê a matrícula e as certidões e me diz os riscos jurídicos. O arquiteto ou engenheiro vê o zoneamento e a regularidade da construção. O avaliador faz o laudo — esse é de fora, contratado pelo cliente. Eu junto tudo e escrevo o parecer.
3. Ferramenta? Uso e-mail, WhatsApp e uma pasta no computador onde jogo os PDFs. Planilha às vezes, pra conta do valor do metro quadrado. Mais do que isso não sei, não sei o que vocês chamam de sistema.

> [bastidor] "Não sei" nº 1 (ferramentas, no intake). SKILL regra 5: propor padrão sensato em linguagem do domínio, dizer que dá para mudar, seguir — sem devolver a pergunta.

**Facilitador:** Perfeito — e essa resposta é a mais comum que eu ouço; você não precisa saber. Proponho o padrão mais simples e seguro: o sistema trabalha **só com os PDFs que você entregar** para cada imóvel — você me manda aqui na conversa, ou joga na pasta do imóvel, como já faz hoje. Ele não entra sozinho em site de cartório, prefeitura ou tribunal. Se um dia valer a pena buscar certidão automaticamente, a gente muda; por ora fica anotado como "ver depois".

Uma última pergunta deste começo: como você reconhece um parecer de DD bem feito e um mal feito? O que um corretor experiente bate o olho e diz "isso está errado"?

**Ricardo:** Mal feito é o que copia o que o vendedor falou sem conferir no documento. É certidão vencida no parecer, é área que não bate entre matrícula, IPTU e laudo e ninguém comenta, é semáforo verde com penhora na matrícula. Bem feito é quando cada afirmação tem o documento e a página do lado, e as pendências vêm com quem resolve e quanto custa mais ou menos.

> [ambiguidade] `00-intake.md` tem 11 perguntas em 3 grupos (o grupo 3 tem 4), mas o SKILL manda "1 a 3 perguntas por vez" e "2–3 levas". Não cabe tudo. Decisão: 3 levas de 3 + uma pergunta avulsa (bem/mal feito) após o "não sei" — 4 levas no total, preservando o limite de 3 perguntas por vez, que é a regra "inegociável".

**Facilitador:** Obrigado, Ricardo — com isso já tenho o mapa. Deixa eu devolver em três linhas para você conferir:

- **Nome do projeto:** Due Diligence de Imóveis Comerciais (no computador vou chamar de `due-diligence-imoveis`).
- **Objetivo em uma frase:** *um sistema de assistentes, regras e travas que transforma a pasta de documentos de um imóvel comercial num parecer de DD com semáforo, em que cada afirmação aponta o documento e a página — sem você ter que conduzir cada passo.*
- **As palavras que vou usar daqui pra frente (as suas):** parecer de DD, semáforo (verde/amarelo/vermelho), matrícula, ônus e gravames, área averbada, certidões do vendedor, débitos do imóvel, zoneamento/uso do solo, habite-se, AVCB, laudo de avaliação, pendências.

Está certo? Se estiver, crio agora dois papéis de acompanhamento na pasta: um **quadro de progresso** (mostra em que etapa do workshop estamos, para retomarmos de onde paramos em outro dia) e uma **lista de pendências** (o que ficou para esclarecer depois — só o que surgiu de verdade na conversa).

**Ricardo:** Está certo. Pode criar.

> [bastidor] Criados `imoveis/CURRICULUM.md` (a partir do template, módulos 1–8 em ⬜) e `imoveis/HANDOUT.md` (1 pendência real: fontes online).
> [ambiguidade] O template `CURRICULUM.template.md` está em inglês, aponta caminhos antigos (`harness/hooks/`, `harness/evals/`, `harness/observability/`) e diz que o projeto foi feito com o skill `build-harness`. O SKILL manda "tudo sai na língua da pessoa" e dá o mapa `harness/→metodo/, _trabalho/`. Decisão: traduzi para português, troquei os caminhos pelo layout novo e troquei a referência para o skill `construir` do plugin harness-factory. O template em si não foi alterado.

**Facilitador:** Pronto. Criei o quadro de progresso e a lista de pendências. Na lista já entrou uma coisa: "buscar certidões e matrícula direto nos sites oficiais — por ora não, o sistema só lê os PDFs que você entrega". O resto da lista vai crescendo conforme surgirem dúvidas.

**Facilitador:** Antes de seguir: quer continuar agora para o módulo 1 ou prefere pausar? Se pausar, na próxima vez eu leio o quadro de progresso e retomo daqui.

**Ricardo:** Vamos seguir.

---

## Módulo 1 — Regras da casa (contexto)

> [bastidor] Li `workshop/01-context-engineering.md`. Motor: nenhum para este módulo.

**Facilitador:** Imagine que você contratou um estagiário de corretagem muito inteligente, mas que chega toda manhã **sem memória nenhuma** do dia anterior. Antes de ele abrir a primeira matrícula, o que ele precisa saber para não fazer besteira? As regras da casa, o jeito de nomear as pastas, o que nunca pode fazer, em que ordem se trabalha, o que é e o que não é tarefa dele.

Os assistentes de IA são exatamente assim. O módulo 1 é escrever essa "folha de regras da casa" que eles leem toda vez que começam — no computador ela é um arquivo chamado `AGENTS.md`, mas para você é só "as regras da casa".

Tem um cuidado: cada palavra que o assistente lê tem custo (é cobrado por volume de texto lido) e, pior, texto demais faz ele perder o foco. É como mandar o estagiário ler o arquivo morto inteiro do escritório para responder um WhatsApp. A regra de ouro: **exatamente o que um bom estagiário precisaria no primeiro dia, nem mais, nem menos.**

No seu ramo, o que o assistente precisa saber se divide em quatro tipos:

| Tipo | O que é | No seu caso |
|---|---|---|
| Permanente | Vale sempre, quase não muda | "Nunca semáforo verde sem matrícula de no máximo 30 dias" |
| Do caso | Só para este imóvel | "Galpão em Jundiaí, preço pedido R$ 9,5 milhões" |
| De ofício | O que as palavras significam | "Área averbada é a que consta na matrícula, não a do laudo" |
| De procedimento | Como se faz | "Primeiro a matrícula; se ela tem problema grave, o resto vem depois" |

As regras da casa guardam só o tipo **permanente**. O resto chega com cada caso.

Muito do que preciso você já me contou no começo. Faltam duas coisas:

1. Qual é a ordem do trabalho? O que vem primeiro, o que vem depois?
2. O que está **dentro** do que o sistema faz, e o que fica **de propósito fora**?

**Ricardo:** A ordem é: primeiro matrícula, porque se a matrícula tem problema grave o resto nem importa. Depois certidões e débitos, depois zoneamento e regularidade, depois o laudo, e por último o parecer. Fora: o sistema não tira certidão, não faz laudo, não fala com o cliente nem com o vendedor, e não substitui o advogado — se tiver coisa jurídica séria, o parecer tem que dizer "consultar advogado". Dentro: ler os documentos, apontar os riscos, fazer as contas e escrever o rascunho do parecer pra eu aprovar.

> [bastidor] Rascunho das regras da casa montado a partir do intake + estas respostas. Mostrado ao Ricardo em linguagem leiga, numerado, para a checagem "sinal ou ruído" (nota obrigatória do módulo).

**Facilitador:** Montei o rascunho das regras da casa. Vou ler linha por linha e, para cada uma, você me diz: **sinal** (o estagiário precisa disso para não errar) ou **ruído** (óbvio, ou não ajuda a decidir nada). Ruído sai.

*Material e contas*
1. O material de trabalho são só os documentos da pasta do imóvel. Nada de buscar na internet.
2. Contas (valor do m², diferença de área, prazo de certidão) saem da conferência automática — nunca de cabeça.

*Jeito de fazer*
3. Tudo em português do Brasil.
4. Cada imóvel tem a sua pasta com o nome "Cidade - Rua Número".
5. Toda afirmação traz o documento e a página do lado, por exemplo "(Matrícula 45.678, p. 2, AV.7)".
6. As palavras do ofício (área averbada, ônus, semáforo...) têm um sentido único, escrito num glossário — todo mundo usa igual.
7. Linguagem cordial e profissional.

*O que nunca acontece*
8. Nunca semáforo verde sem certidão de matrícula com no máximo 30 dias.
9. Nunca inventar número de matrícula, valor, nome de credor ou data. Se não está no documento, escrever "não consta nos documentos recebidos".
10. Nada vai para o cliente sem a sua aprovação.
11. Nunca repetir o que o vendedor declarou sem conferir no documento.
12. Nunca dar opinião jurídica conclusiva: questão jurídica séria vira "recomenda-se consulta a advogado".
13. Pendências precisam ser claras.

*Ordem*
14. Matrícula → certidões e débitos → zoneamento e regularidade → laudo → conferência automática → revisão independente → parecer → sua aprovação.

*O que é e o que não é do sistema*
15. Dentro: ler documentos, apontar riscos, fazer as contas pela conferência automática, rascunhar o parecer de DD.
16. Fora: tirar certidão, fazer laudo, falar com cliente ou vendedor, negociar preço, substituir o advogado.

**Ricardo:** A 7 é ruído, isso é óbvio, tira. O resto é tudo sinal. A 11 principalmente — é o erro que mais vejo em parecer de corretor novato. A 13 tá meio genérica, né?

**Facilitador:** Concordo, a 13 do jeito que está não ajuda o estagiário a decidir nada. Me dá um contra-exemplo concreto: como é uma pendência **mal escrita**, que você devolveria?

**Ricardo:** "Regularizar a área construída." Só isso. Não diz quem faz, quanto custa, nem se dá pra fazer a escritura antes ou não.

**Facilitador:** Então a regra vira: *"Toda pendência diz: o que é, quem resolve (vendedor, comprador, cartório, prefeitura...), o custo, e se impede a escritura."* Um cuidado com o custo: a regra 9 proíbe inventar valor. Se o custo não está em nenhum documento — por exemplo, quanto custa averbar uma ampliação — o assistente pode chutar?

**Ricardo:** Não. Se tem o valor no documento, tipo o valor da dívida de IPTU, põe. Se não tem, escreve "a orçar". Chute não.

**Facilitador:** Perfeito: *"custo, se constar em documento; senão 'a orçar'"*. Com isso: tiro a 7, reescrevo a 13, e guardo. Junto das regras crio também o **glossário** — o dicionário do ofício, com o sentido único de cada palavra sua (área averbada, ônus e gravames, semáforo...), para que nenhum assistente use "área" num sentido e outro noutro.

**Ricardo:** Pode guardar.

> [bastidor] Gravados `imoveis/AGENTS.md` (5 seções do mínimo: Material e ferramentas, Convenções, Regras que nunca se quebram, Ordem de trabalho, Escopo), `imoveis/CLAUDE.md` (uma linha `@AGENTS.md`) e `imoveis/metodo/GLOSSARIO.md`.
> [ambiguidade] O SKILL (§3, invariante 6) exige `metodo/GLOSSARIO.md`, e o intake produz o "vocabulário do domínio", mas nenhum módulo lista o glossário em "What Gets Built". Decisão: criado no módulo 1 (é contexto "de ofício"/semântico) e acrescentado à coluna do módulo 1 no CURRICULUM.
> [ambiguidade] O layout do SKILL não diz onde ficam os **documentos de entrada** (PDFs do imóvel) nem o **parecer final** — não são método, nem amarração, e `_trabalho/` é "artefato de execução". Decisão: pasta `casos/<Cidade - Rua Número>/documentos/` para os PDFs e `casos/<...>/parecer-de-dd.md` para a entrega, na raiz do projeto.
> [ambiguidade] Conflito futuro já visível: o módulo 1 manda `CLAUDE.md` com **uma única linha** `@AGENTS.md`, mas o skill `validar` (item 11) exige que o `CLAUDE.md` "registre o harness (condição de acionamento + tabela de mudanças)". Segui o módulo 1 literalmente.

**Facilitador:** Guardado. Ficaram três coisas na pasta: as **regras da casa**, um arquivinho de uma linha que faz o programa ler essas regras sozinho toda vez que abre, e o **glossário**. Nada muda agora — a partir da próxima vez que você abrir o programa nesta pasta, todo assistente já começa lendo as regras. Quer seguir para o módulo 2 ou pausar?

**Ricardo:** Seguir.

---

## Módulo 2 — Papéis (assistentes especializados)

> [bastidor] Li `workshop/02-roles-subagents.md` e, do motor, `team-patterns.md` + `model-selection-guide.md` (leitura interna; nada citado ao Ricardo). Padrão do motor que se encaixa: "produtor–revisor" dentro de uma linha sequencial; revisor com ferramentas só de leitura. Nenhum `.claude/agents/` pré-existente → sem conflito de nome nem sobreposição com papéis antigos.

**Facilitador:** Agora que existem as regras da casa, a pergunta é: **quem** faz o trabalho. Se um único assistente fizer tudo — ler matrícula, certidões, zoneamento, laudo e ainda escrever o parecer —, acontece com ele o que acontece com o faz-tudo de escritório: perde o foco, as instruções dele viram um calhamaço contraditório, e ele faz tudo "mais ou menos".

A saída é a mesma que você já usa com gente: **especialização**. Cada papel vira um **assistente especializado** — pense num profissional contratado para uma função só, com uma "carta de atribuições" curta: quem ele é, qual o único trabalho dele, o que recebe, como trabalha, o que entrega e, tão importante quanto, **o que ele não faz**.

Uma distinção que vai aparecer de novo: existe a **carta de atribuições** (um assistente com função própria, que trabalha numa sala separada e só vê o que lhe entregam) e existe o **manual de procedimento** (o passo a passo que um analista júnior seguiria, lido dentro da conversa que já está acontecendo). A linha de montagem do módulo 4 vai ser um manual; os papéis de agora são assistentes. A sala separada é o que faz o revisor valer a pena: um revisor que acompanhou o raciocínio de quem produziu tende a concordar com ele; um revisor que só vê o resultado enxerga o que passou batido.

Pelo que você me contou da divisão humana, eu proporia estes papéis:

1. **Leitor da matrícula** (o lado "advogado" da matrícula): identificação, cadeia de proprietários, ônus e gravames, área averbada.
2. **Leitor das certidões e débitos** (o lado "advogado" das certidões): certidões do vendedor, IPTU, condomínio.
3. **Analista de zoneamento e regularidade** (o papel do arquiteto): uso do solo, habite-se, AVCB.
4. **Conferente do laudo** — como o avaliador é de fora, alguém precisa conferir o laudo dele.
5. **Redator do parecer** (o seu papel de juntar tudo).
6. **Revisor** — confere tudo antes de chegar a você.

Três perguntas:

1. Essa divisão faz sentido, ou falta/sobra alguém?
2. Hoje o advogado lê matrícula **e** certidões. Prefere um assistente só para as duas coisas, ou dois separados?
3. Vale ter um revisor separado, ou cada assistente confere o próprio trabalho bem o bastante?

**Ricardo:** A divisão faz sentido. Separa sim matrícula e certidões, porque a matrícula é a mais importante e é onde mais se erra. Revisor separado com certeza — hoje quem revisa sou eu e eu deixo passar coisa quando estou cansado. Mas o revisor não pode ser eu, eu sou a aprovação final.

**Facilitador:** Combinado: o revisor é um assistente, e você fica como a aprovação final, fora da linha. Agora o que cada um recebe, entrega e onde para. Minha proposta:

| Papel | Recebe | Entrega | Para onde termina |
|---|---|---|---|
| Leitor da matrícula | A certidão de matrícula | Identificação, cadeia de proprietários, ônus e gravames (ativos e cancelados, com o ato R./AV.), área averbada, data de emissão | Não comenta certidões, laudo nem preço |
| Leitor das certidões e débitos | Certidões do vendedor, IPTU, condomínio | Cada certidão com resultado, emissão e validade; cada débito com valor; área do IPTU | Não lê matrícula; não interpreta juridicamente além do que a certidão diz |
| Analista de zoneamento | Certidão de uso do solo, habite-se, AVCB | Zona, usos permitidos, área do habite-se, validade do AVCB | Não avalia valor |
| Conferente do laudo | O laudo e o preço pedido | Valor do laudo, área considerada, método, data | Não faz contas de cabeça — os números vão para a conferência automática |
| Redator do parecer | Tudo o que os outros entregaram + a conferência automática | O rascunho do parecer de DD com as sete peças e o semáforo | Não descobre fato novo; só usa o que os outros acharam |
| Revisor | Os resultados (nunca o raciocínio de quem produziu) | "Aprovado" ou "Reprovado", com os motivos concretos | Não conserta nada — só aponta |

Quer ajustar algo?

**Ricardo:** Só uma coisa: o de zoneamento tem que receber também o uso que o cliente quer dar. Um galpão pode ser permitido pra depósito e não pra indústria. O resto tá bom.

**Facilitador:** Boa — "uso pretendido pelo cliente" entra como entrada do analista de zoneamento.

Agora a conferência de sobreposição: duas coisas aparecem em mais de um lugar. (1) Uma **penhora** pode estar averbada na matrícula **e** aparecer na certidão trabalhista do vendedor. (2) A **área** aparece na matrícula, no IPTU, no habite-se e no laudo. Quem fala de quê, para ninguém pisar no pé do outro nem deixar cair no vão?

**Ricardo:** Cada um fala do seu documento. O da matrícula fala o que tá na matrícula, o das certidões fala o que tá na certidão. Quem junta e vê se bate é o parecer — e o revisor confere se juntou direito.

**Facilitador:** Fechado — e a comparação de áreas, por ser conta, vai para a conferência automática (módulo 4), não para a cabeça de ninguém.

Último ponto deste módulo, só para você saber: nem todo assistente precisa ser o mais "sênior" (e mais caro). É como não pôr o sócio para tirar xerox. Escolhi assim, e deixei o motivo escrito na carta de cada um:
- **Sênior** para o leitor da matrícula (documento jurídico denso, onde mais se erra), o redator do parecer (junta tudo e escreve para o cliente) e o revisor (precisa desconfiar e cruzar informação).
- **Pleno** para certidões, zoneamento e laudo — é extrair e organizar o que o documento diz, sem muita interpretação.

**Ricardo:** Faz sentido. Pode montar.

> [bastidor] Gravados 6 arquivos em `.claude/agents/`: `leitor-matricula.md` (opus), `leitor-certidoes.md` (sonnet), `analista-zoneamento.md` (sonnet), `conferente-laudo.md` (sonnet), `redator-parecer.md` (opus), `revisor-dd.md` (opus). Todos com `tools: Read, Grep, Glob` (provisório; módulo 3 refina), nenhum com `Agent`. Justificativa de modelo escrita em seção própria em cada arquivo (regra do motor/SKILL: nunca `model:` sem justificativa). Revisor responde começando com `VERDICT: PASS` / `VERDICT: FAIL` (mantido em inglês porque é o marcador que o leitor automático procura — ver ambiguidades).
> [ambiguidade] O motor (`team-patterns.md` §5) traz outro modelo de carta (핵심 역할 / 작업 원칙 / 입력·출력 / 통신 규칙 / 재호출 / 오류 처리 / 협업) diferente da anatomia do workshop (Identity / One Job / Input / Process / Output / Boundaries). O SKILL não diz qual prevalece. Decisão: anatomia do workshop (é a que a pessoa vê) + uma seção "Se faltar algo" vinda do item "오류 처리" do motor.
> [ambiguidade] A palavra-chave `VERDICT: PASS/FAIL` é exigida em inglês pelo workshop (o runner e o log a procuram por regex), e o SKILL manda gerar tudo na língua da pessoa. Mantive o marcador em inglês e expliquei ao Ricardo como "carimbo Aprovado/Reprovado".
> [ambiguidade] O workshop recomenda "2–4 papéis + 1 revisor"; o intake do Ricardo gerou 5 criadores + revisor. Segui o intake ("o número segue do intake, não do template").

**Facilitador:** Montei os seis assistentes, cada um com a sua carta de atribuições. Por enquanto todos só podem **ler** — no próximo módulo a gente decide o que cada um pode tocar. Um aviso prático: como é a primeira vez que esta pasta ganha assistentes, eles só aparecem para o programa depois que você fechar e abrir de novo — é como reiniciar o celular depois de instalar um aplicativo. Não precisa ser agora; antes do módulo 4 eu te lembro. Seguimos para o módulo 3?

**Ricardo:** Seguimos.

> [bastidor] CURRICULUM: módulo 2 → ✅ (6 arquivos existem em `.claude/agents/`, conferidos contra o What Gets Built).

---

## Módulo 3 — Ferramentas

> [bastidor] Li `workshop/03-tools-mcp.md`. Motor: nenhum para este módulo.

**Facilitador:** Até aqui os assistentes sabem **quem** são e quais são as regras, mas só sabem pensar — ainda não têm mãos. Um assistente sem ferramentas é como um advogado brilhante trancado numa sala sem acesso à pasta do cliente.

**Ferramentas** são essas mãos: abrir e ler um PDF, procurar uma palavra dentro de um documento, guardar um arquivo, rodar uma conta, consultar um sistema de fora. Há dois tipos:

- **As que já vêm de fábrica**: ler, procurar e guardar arquivos na pasta do projeto. Não precisa instalar nada; basta dizer a cada assistente quais ele pode usar.
- **As "tomadas" para sistemas de fora**: existe um padrão de encaixe (o nome técnico é MCP — pense numa tomada padrão de três pinos) que permite plugar o sistema em serviços externos, como um site de cartório ou de prefeitura, se alguém já tiver construído a tomada para aquele serviço.

E tem um ponto de segurança importante: a lista de ferramentas de cada assistente é **uma lista fechada** — ele só pode usar o que está nela. Se a carta do revisor diz "não conserta nada" e a lista dele não tem "guardar arquivo", ele não consegue consertar nem por engano.

Duas perguntas:

1. Além dos PDFs da pasta do imóvel, tem algum sistema que você usa no dia a dia e que os assistentes deveriam acessar — o site do cartório, da prefeitura, uma planilha sua?
2. Você sabe se algum desses serviços já tem essa "tomada pronta" para conectar?

**Ricardo:** Não sei. Eu peço a matrícula pelo site dos cartórios, mas quem faz é o despachante, eu nem tenho a senha. Servidor, tomada, isso eu não sei o que é nem se o cartório tem. A planilha é só uma conta de metro quadrado que eu faço na mão.

> [bastidor] "Não sei" nº 2 (ferramentas / sistemas externos). SKILL regra 5 + nota do módulo 3 ("se não está claro se existe a tomada, diga abertamente; não invente; anote no HANDOUT").

**Facilitador:** Tudo bem — e isso facilita. Proponho este padrão, que dá para mudar depois:

- **Nenhuma conexão com sistema de fora por enquanto.** Os assistentes trabalham só com os PDFs (e fotos) que você entrega na pasta do imóvel. Isso também é mais seguro: nada entra nem sai sem passar por você.
- Sobre a "tomada" para os cartórios: sendo honesto, **eu não sei** se existe uma pronta para o pedido eletrônico de matrícula, e não vou inventar. Anoto na lista de pendências para pesquisar quando o sistema estiver rodando.
- A sua conta de metro quadrado não fica com nenhum assistente: vira a **conferência automática** do próximo módulo — uma planilha que confere, e o assistente só interpreta.

E sobre o que cada um pode tocar, a proposta é a mais restrita possível: **todos os seis só leem** — abrir documento, procurar dentro dele, listar o que tem na pasta. Nenhum assistente guarda, altera ou apaga arquivo. Quem guarda os resultados é a linha de montagem (módulo 4), que funciona como a secretária que arquiva cada relatório na pasta certa. Assim, por exemplo, nenhum deles consegue salvar por cima de uma matrícula sua.

Uma pergunta só: os documentos às vezes chegam como **foto** de celular, em vez de PDF?

**Ricardo:** Chegam, principalmente matrícula antiga que o vendedor manda pelo WhatsApp. E às vezes vem torta, meio apagada.

**Facilitador:** Os assistentes conseguem ler foto também. E a regra de nunca inventar já cobre a foto ruim: trecho que não dá para ler vira "ilegível na página X", nunca um palpite. Vou deixar isso escrito no passo a passo de cada leitor, junto com o momento exato de usar cada ferramenta — por exemplo, "antes de dizer que uma penhora está ativa, releia a matrícula procurando o cancelamento".

**Ricardo:** Ótimo. Pode fazer assim.

> [bastidor] Decisões gravadas: (1) sem `.mcp.json` (nenhum papel precisa de sistema externo — o What Gets Built manda pular nesse caso); (2) `tools: Read, Grep, Glob` confirmado nos 6 papéis — inclusive criadores, porque quem grava os bilhetes é a linha de montagem (módulo 4: "the pipeline saves that note"); (3) frases de uso de ferramenta no Processo de cada papel (listar a pasta com Glob no passo 1; reler a matrícula buscando o cancelamento antes de classificar ônus como ativo; fotos ilegíveis); (4) HANDOUT nº 2 (tomada para cartório) e nº 3 (fotos de baixa qualidade). O arquivo opcional de visão geral de ferramentas para humanos não foi gerado (opcional, e a tabela de papéis do módulo 2 já cobre).
> [ambiguidade] O arquivo opcional `harness/tools/tool-descriptions.md` não tem destino no mapa de caminhos do SKILL (`harness/tools/` não é mapeado). Como era opcional, não foi gerado.

**Facilitador:** Feito. Os seis assistentes continuam só lendo, e cada um agora tem escrito o momento certo de usar cada ferramenta. Nada para você fazer neste módulo — como não ligamos nenhum sistema de fora, não há nenhuma autorização para dar. Anotei duas pendências: pesquisar a "tomada" para cartórios e acompanhar as fotos de baixa qualidade nos primeiros casos.

O próximo módulo é o coração do sistema: a linha de montagem. Como eu tinha avisado, agora é a hora de **fechar e abrir o programa** para os assistentes novos aparecerem. Quando abrir de novo, é só dizer "vamos continuar o workshop" que eu sei exatamente onde paramos.

**Ricardo:** Fechei e abri. Vamos continuar o workshop.

---

## (Nova sessão — retomada) Módulo 4 — Linha de montagem

> [bastidor] Reinício simulado do programa. SKILL §0.3 (retomada): li `CURRICULUM.md` → módulos 1–3 ✅, primeiro sem ✅ = módulo 4. Li também `HANDOUT.md` (3 pendências abertas). Não recomecei do zero.
> [bastidor] Li `workshop/04-multi-agent-design.md` e, do motor, `execution-modes.md`, `workflow-recipes.md`, `team-examples.md`, `orchestrator-template.md` e, para gerar os manuais, `skill-writing-guide.md`. Decisão de motor (interna): modo "delegação a assistentes um por vez" (modo C do motor), em sequência — o modo de roteiro automatizado (modo A) exige que a pessoa peça explicitamente e serve para listas grandes conhecidas de antemão; o modo de equipe que conversa entre si (modo B) não se justifica (não há negociação iterativa entre criadores). Padrão: linha sequencial + produtor–revisor com limite de reprovações (motor sugere 2–3).

**Facilitador:** Bem-vindo de volta, Ricardo! Li o quadro de progresso: já temos as regras da casa (módulo 1), os seis assistentes (módulo 2) e decidimos que eles só leem (módulo 3). Seguimos do **módulo 4, a linha de montagem** — o coração do sistema.

Temos especialistas, mas falta dizer **quem começa, quem passa o quê para quem e quando o próximo entra**. Pense numa linha de produção: matéria-prima → estação 1 → estação 2 → controle de qualidade → produto pronto. Cada estação faz uma coisa só, e nenhuma começa antes da anterior terminar.

Duas coisas tornam a linha confiável:

- **O bilhete de passagem.** Cada assistente trabalha na sua sala e não ouviu nada do que os outros disseram. Então, quando termina, ele deixa um bilhete por escrito — o que leu, o que achou (com documento e página), as pendências e uma ficha com os números — e a linha arquiva esse bilhete numerado na pasta do caso: 01, 02, 03... Nunca se escreve por cima: se o revisor reprova e alguém corrige, a correção vira um bilhete novo. No fim, a pasta é o histórico completo do caso — quem fez o quê, em que ordem.
- **A volta para correção, com limite.** Se o revisor reprova, o trabalho volta para quem fez, com os motivos. Mas precisa de um limite — senão dois assistentes podem ficar discutindo para sempre, e cada rodada custa.

E quem conduz a linha é um **manual de procedimento** que você liga com uma "palavra de comando" digitada na conversa — algo como `/due-diligence Jundiaí, Av. Antônio Frederico Ozanam 1234...`. Ela só liga quando você manda; nunca sozinha.

Pela ordem que você me deu no módulo 1, a linha ficaria assim:

1. **Abertura do caso** — confere quais documentos chegaram e anota preço pedido e uso pretendido. *(obrigatória — nunca pular)*
2. Leitor da matrícula
3. Leitor das certidões e débitos
4. Analista de zoneamento
5. Conferente do laudo
6. **Conferência automática** — todas as contas. *(obrigatória — nunca pular)*
7. **Revisor** confere as quatro análises. *(obrigatória — nunca pular)*
8. Redator do parecer
9. **Revisor** confere o parecer. *(obrigatória — nunca pular)*
10. **Sua aprovação** — a linha para e espera você. *(obrigatória — nunca pular)*
11. O parecer aprovado é guardado na pasta do imóvel. Ninguém envia nada: quem manda para o cliente é você.

Três perguntas:

1. Essa ordem vale, ou no seu dia a dia é diferente?
2. Você disse que "se a matrícula tem problema grave, o resto nem importa". Quando o leitor da matrícula achar, por exemplo, uma penhora, a linha deve **parar e te perguntar** se continua, ou seguir até o fim mesmo assim?
3. Existe algum caso especial — um pedido que é só um pedaço desse trabalho?

**Ricardo:** 1. A ordem é essa. 2. Parar e me perguntar. Às vezes eu já ligo pro cliente e ele desiste ali mesmo, aí não precisa gastar com o resto. Mas às vezes a penhora é pequena e o vendedor vai quitar, aí eu mando seguir. 3. Tem sim: às vezes o cliente só quer que eu dê uma olhada rápida na matrícula antes de ir visitar o imóvel. Não é parecer, é só pra saber se tem bomba.

**Facilitador:** Ótimo. A parada depois da matrícula entra como um ponto em que a linha te chama. E a "olhada rápida" vira uma **linha curta separada**, com palavra de comando própria (`/olhada-na-matricula ...`): só o leitor da matrícula e o revisor, sem parecer e sem semáforo — com a frase fixa "olhada rápida, não substitui o parecer de DD".

Mais duas perguntas:

4. Quando o revisor reprova, quantas vezes o trabalho pode voltar para correção antes de a linha parar e chamar você?
5. As contas que você faz hoje na mão — quais são, e a partir de que ponto você acende o amarelo ou o vermelho?

**Ricardo:** 4. Não sei, sinceramente. Quantas você acha? Eu não tenho ideia de quanto isso custa nem de quanto demora.
5. As contas: valor do metro quadrado, que é o preço dividido pela área; a diferença entre o preço pedido e o valor do laudo; e se as certidões estão no prazo — matrícula 30 dias, as outras o prazo que vem escrito nelas. Diferença de área acima de 5% eu já aponto. Preço mais de 10% acima do laudo eu aviso o cliente. Penhora, indisponibilidade, arresto: vermelho. Hipoteca e alienação fiduciária: amarelo, porque normalmente quita na escritura. Usufruto: vermelho.

> [bastidor] "Não sei" nº 3 (limite de correções). SKILL regra 5: propor padrão + "dá para mudar" + seguir. Motor (`team-patterns.md` 1-4) recomenda 2–3 tentativas.

**Facilitador:** Proponho **2 correções**: na terceira reprovação do mesmo ponto, a linha para e te entrega os motivos do revisor. É o mesmo que você faria com um estagiário — devolve duas vezes; se na terceira ainda não acertou, o problema não é de capricho, é de algo que precisa de você (um documento confuso, uma regra pouco clara). Dá para mudar depois olhando os casos reais.

Sobre as contas: elas vão para a **conferência automática** — pense numa planilha que confere tudo sozinha, sempre do mesmo jeito; o assistente só interpreta o resultado. Ela também calcula um **"semáforo mínimo"**: com as suas regras, se tem penhora ativa, o parecer **não pode** sair melhor que vermelho, não importa o que o redator ache. Para completar, proponho alguns amarelos que vêm das suas falas do começo: certidão positiva, vencida ou faltando; AVCB vencido; IPTU em aberto; e qualquer número essencial que não conste nos documentos. Concorda?

**Ricardo:** Concordo. E certidão positiva com efeito de negativa não é amarelo, tá? É praticamente negativa.

**Facilitador:** Anotado — "positiva com efeito de negativa" não acende amarelo.

Duas últimas, sobre guarda e teste:

6. Os bilhetes de cada caso ficam guardados na pasta de trabalho. O projeto tem um "histórico de versões" — parecido com o controle de alterações do Word, que permite voltar no tempo e às vezes é compartilhado. Os bilhetes e os documentos do cliente devem entrar nesse histórico, ou ficar de fora por sigilo?
7. Quer fazer agora um teste de verdade da linha, com o caso do galpão de Jundiaí?

**Ricardo:** 6. Fora. Dado de cliente é sigiloso, não quero isso em histórico nenhum. 7. Agora não, eu não tenho os PDFs do galpão aqui, estão no computador do escritório. Na semana que vem eu trago.

> [bastidor] Gravados: `metodo/skills/due-diligence.md` (método completo, 11 passos, 5 marcados **[obrigatória — nunca pular]**, limite de 2 reprovações, parada antecipada após a matrícula, formato do bilhete e da ficha), `metodo/skills/olhada-na-matricula.md` (linha curta), `metodo/checagens/conferir_caso.py` (conferência automática, saída com formato definido), `.claude/skills/due-diligence/SKILL.md` e `.claude/skills/olhada-na-matricula/SKILL.md` (capas finas: frontmatter + "leia e siga metodo/skills/..."), `.claude/skills/comece-aqui/SKILL.md` (porta de entrada para leigos — SKILL §3 manda gerar SEMPRE), `_trabalho/handoffs/.gitkeep`, `.gitignore` (casos/ e bilhetes fora do histórico). Saída de cada papel atualizada para terminar no bilhete com Ficha. Glossário ganhou "semáforo mínimo" e "bilhete de passagem".
> [bastidor] Conferência automática testada com dados do caso-escola contados pelo Ricardo (fichas de teste em `.superpowers/e2e/_fixtures/jundiai`, fora do projeto): semáforo mínimo **vermelho** (penhora AV.7 ativa), área do laudo e do IPTU **+15,07%** sobre a averbada (a ampliação sem averbação), preço 13,10% acima do laudo, certidão de protesto vencida, certidão cível faltante; "positiva com efeito de negativa" sem alerta. Caso limpo → **verde**; bilhete de correção com matrícula vencida → amarelo (o bilhete de número mais alto prevalece). Pasta inexistente → código de saída 1.
> [ambiguidade] O motor (`orchestrator-template.md`, `team-examples.md`) usa `_workspace/{phase}_{agent}_{artifact}` e manda pôr na `description` do orquestrador palavras de acionamento automático ("refazer", "corrigir"...); o workshop usa `_trabalho/handoffs/<task>/NN-<role>.md` e `disable-model-invocation: true` (só liga quando a pessoa digita). Segui o workshop/SKILL (layout e invocação manual); mantive palavras de "refazer/corrigir" na description por inofensivo.
> [ambiguidade] `disable-model-invocation: true` obriga o leigo a **digitar** `/due-diligence ...`. Isso tensiona a regra 4 do SKILL ("nunca peça para a pessoa rodar comando"). Decisão: tratar a palavra de comando como texto de conversa, não comando de terminal, e fazer o `comece-aqui` mostrar a frase exata pronta para copiar.
> [ambiguidade] O SKILL diz que `comece-aqui` é "SEMPRE gerado", mas não diz em que módulo. Gerei no módulo 4 (quando nasce `.claude/skills/`).
> [ambiguidade] As notas do módulo 4 dizem "uma linha que nunca rodou não está pronta" e mandam oferecer um teste real; o SKILL diz que o módulo está ✅ "quando o artefato existe". O Ricardo recusou o teste (sem PDFs). Marquei ✅ (regra do SKILL, artefatos conferidos) e registrei o teste real como pendência nº 4 no HANDOUT.
> [ambiguidade] A nota sobre `.gitignore` cita `harness/handoffs/`; traduzi para `_trabalho/handoffs/` pelo mapa do SKILL. Também ignorei `casos/` (documentos do cliente), decisão do Ricardo.

**Facilitador:** Está montado. Resumo do que ficou pronto:

- A **linha de montagem completa**, ligada pela palavra de comando `/due-diligence`, com as 11 estações, as 5 obrigatórias que nunca podem ser puladas, a parada para te perguntar se a matrícula tiver problema grave, o limite de 2 correções e a parada final para a sua aprovação.
- A **linha curta** `/olhada-na-matricula`.
- A **conferência automática** com as suas regras. Já testei com os números do galpão de Jundiaí que você me contou: ela acendeu **vermelho** pela penhora, apontou que a área do laudo e do IPTU está 15% acima da área averbada — exatamente a ampliação sem averbação que quase passou batido —, e apontou o preço 13% acima do laudo.
- Uma **porta de entrada**: quando qualquer pessoa abrir este projeto e perguntar "como funciona?" ou "por onde começo?", o sistema explica a equipe com as suas palavras e mostra a frase exata para pedir uma DD.
- Os bilhetes e os documentos de cliente ficam **fora do histórico**, como você pediu.

O teste de verdade com o galpão ficou anotado na lista de pendências para quando você trouxer os PDFs — uma linha que nunca rodou com um caso real ainda não está 100% provada.

Como esta é a primeira vez que a pasta ganha manuais de procedimento, eles só aparecem depois de **fechar e abrir o programa** de novo — igual aos assistentes. Quer seguir para o módulo 5 (as travas) ou pausar?

**Ricardo:** Vamos seguir pras travas.

---

## Módulo 5 — Travas (guardas)

> [bastidor] Li `workshop/05-hooks-guards.md`; a tabela do SKILL manda invocar o skill **`guardas`** → li e segui `skills/guardas/SKILL.md` (fluxo: elicitar 1–3 perguntas → traduzir em evento+alvo+ação, sem mostrar a tabela → devolver em linguagem leiga e só gravar com o "sim" → gravar sem sobrescrever, confirmar formato na documentação e testar bloqueia/passa). `.claude/settings.json` não existia → nada a mesclar, sem conflito.
> [bastidor] Formato de hooks confirmado na documentação atual do Claude Code (consulta delegada a um assistente de pesquisa): entrada JSON com `tool_name`/`tool_input.file_path`/`content`; bloqueio por código de saída 2 com motivo no stderr; `${CLAUDE_PROJECT_DIR}` expandido; no Windows o comando roda no Git Bash se instalado; negação de leitura com `/` ancorado na pasta do projeto.

**Facilitador:** As regras da casa dizem o que **combinamos**. Mas assistente, como gente, às vezes esquece — com pressa, um passo é pulado. A **trava** resolve isso: é a diferença entre "combinamos que ninguém entrega sem revisar" e "o sistema **não deixa** entregar sem revisar". A trava não pensa e não discute: confere uma regra, toda vez, e barra ou libera. Pense no porteiro do prédio comercial: não é consultor, só confere o crachá.

Três perguntas, as mesmas que eu faria a um gerente de cartório:

1. O que **nunca** pode acontecer aqui, aconteça o que acontecer?
2. O que **sempre** tem que acontecer antes de o parecer ficar pronto?
3. Onde um passo esquecido já te causou o maior prejuízo — mesmo antes de existir IA?

**Ricardo:** 1. Nunca mexer nos documentos originais. Uma vez a secretária salvou por cima da matrícula um outro arquivo e eu perdi a certidão — tive que pedir de novo e pagar de novo. E nada sai pro cliente sem eu aprovar, isso eu já falei.
2. Sempre: o revisor tem que ter passado, a conta tem que ter sido feita e eu tenho que ter aprovado. E no dia que eu aprovo, as certidões têm que estar no prazo.
3. O pior foi um parecer que eu mandei com a certidão federal vencida havia três dias. O banco devolveu e o cliente ficou bravo comigo. Na hora que eu fiz estava no prazo, mas demorou pra fechar.

**Facilitador:** Esse terceiro caso é ouro — é exatamente o tipo de esquecimento que uma trava pega e uma pessoa cansada não. Uma pergunta sobre a primeira regra: "mexer" inclui **apagar** o documento também, ou só salvar por cima?

**Ricardo:** Apagar também. Nunca. Se veio errado, eu peço outro e guarda os dois.

> [bastidor] Tradução interna (não mostrada): regra 1 → antes de gravar/editar/executar comando (`PreToolUse`, alvo `Write|Edit|MultiEdit|NotebookEdit|Bash|PowerShell`), bloquear alteração ou exclusão de arquivo já existente em `casos/*/documentos/`; guardar arquivo **novo** continua liberado (é como os PDFs entram). Regras 2+3 → antes de gravar `casos/*/parecer-de-dd.md` (`PreToolUse`, `Write|Edit|MultiEdit`): exigir conferência feita, último veredito do revisor PASS, aprovação registrada depois dele, e semáforo do parecer não melhor que o semáforo mínimo **recalculado com a data de hoje** (pega a certidão que venceu entre a conferência e a aprovação); editar parecer já entregue → bloqueado. Ambas precisam de lógica → scripts Python em `metodo/checagens/hooks/`. Mais a regra permanente do SKILL: negar leitura de `metodo/evals/gabaritos/`.

**Facilitador:** Vou devolver em português claro as travas que entendi. Me diga se cobrem o que você descreveu:

**Trava 1 — documentos originais.** Sempre que um assistente tentar **salvar por cima, alterar ou apagar** um documento que já está na pasta de documentos de um imóvel, o sistema **bloqueia e explica o motivo** ("documentos recebidos nunca são alterados nem apagados; peça o documento novo e guarde com outro nome"). Guardar um documento **novo** na pasta continua permitido — é assim que os seus PDFs entram.

**Trava 2 — parecer final.** Sempre que alguém tentar **guardar o parecer de DD na pasta do imóvel** (que é o que vai para o cliente), o sistema confere quatro coisas e **bloqueia** se faltar qualquer uma: (a) a conferência automática foi feita; (b) o último carimbo do revisor é "aprovado"; (c) existe a sua aprovação registrada depois desse carimbo; (d) **refaz as contas de prazo com a data do dia** — se alguma certidão venceu desde a conferência e o parecer ainda diz verde, bloqueia. E um parecer já entregue não pode ser editado: correção volta para a linha.

**Ricardo:** Cobre. A 2 é exatamente o que teria me salvado com o banco. Pode instalar.

> [bastidor] Gravados: `metodo/checagens/hooks/protege_documentos.py`, `metodo/checagens/hooks/trava_parecer_final.py` (reaproveita `conferir_caso.py` para refazer o semáforo mínimo com a data de hoje), `.claude/settings.json` (os dois `PreToolUse` com `python "${CLAUDE_PROJECT_DIR}/..."` + `permissions.deny` de Read/Edit/Write em `/metodo/evals/gabaritos/**`). Exigência nova propagada: o redator escreve `Semáforo: VERDE|AMARELO|VERMELHO` numa linha própria (carta do redator e passo 8 do método).
> [bastidor] Testes (entrada simulada, como o Claude Code envia): trava 1 — sobrescrever existente **bloqueou**; Edit **bloqueou**; `rm` via comando **bloqueou**; caminho absoluto Windows **bloqueou**; guardar arquivo novo **passou**; `ls` **passou**; arquivo fora de `documentos/` **passou**. Trava 2 — sem revisor **bloqueou**; PASS sem aprovação **bloqueou**; VERDE com penhora **bloqueou**; sem linha de semáforo **bloqueou**; Edit **bloqueou**; VERMELHO com tudo cumprido **passou**; matrícula de 01/09 (vencida hoje) com VERDE **bloqueou** e com AMARELO **passou**; outro arquivo **passou**.
> [bastidor] **Defeito real achado no teste e corrigido:** no Windows o Python lia a entrada em cp1252, "Semáforo" chegava corrompido e a trava 2 bloqueava até o caso correto. Corrigido lendo a entrada como UTF-8 e escrevendo o motivo em UTF-8. Retestado: tudo conforme acima.
> [ambiguidade] O módulo 5 manda "perguntar qual linguagem de script está instalada (Node, Python, shell)"; o SKILL diz que a pessoa não sabe o que é isso e que o facilitador confere e instala. Não perguntei ao Ricardo; conferi em silêncio no módulo 0 (Python 3.14).
> [ambiguidade] O exemplo do skill `guardas` usa comando relativo (`python metodo/checagens/hooks/...`) e o módulo 5 usa `${CLAUDE_PROJECT_DIR}`. Usei `${CLAUDE_PROJECT_DIR}` (relativo depende da pasta de onde o programa foi aberto). A documentação atual também traz um formato com `args`/`shell`, mas é de versão mais nova que a instalada (2.1.128) — fiquei na forma mais simples e compatível.
> [ambiguidade] O SKILL manda testar cada trava "uma vez bloqueando, uma passando", mas não diz se é por entrada simulada ou dentro de uma sessão real do programa. Fiz por entrada simulada; o teste em sessão real fica para o módulo 7 (cabe junto com o teste do registro).
> [ambiguidade] Regra de negação de `gabaritos/` exigida "SEMPRE" já no módulo 5, embora a pasta só nasça no módulo 6. Gravei agora, como o SKILL manda. A documentação diz que a negação de leitura não cobre leitura por comando de terminal (ex.: `cat`) — é proteção "de melhor esforço".

**Facilitador:** Instaladas e testadas. Fiz cada trava tentar o errado e o certo: as duas barraram o que deviam e deixaram passar o que é normal. No teste achei um defeito meu — o sistema lia mal a letra "á" de "Semáforo" e barrava até parecer correto — e já consertei. Também deixei pronta uma terceira proteção que faz parte de todo sistema que eu monto: as **respostas da prova** do próximo módulo ficam trancadas, para nenhum assistente "colar".

As travas valem **na hora**, sem precisar reiniciar nada. Seguimos para o módulo 6?

**Ricardo:** Seguimos.

---

## Módulo 6 — Provas do estagiário (evals)

> [bastidor] Li `workshop/06-evals.md` e, do motor, `skill-testing-guide.md`; e `referencia/evaluation/SKILL.md`. Princípios aproveitados (internos): começar pelas provas de resultado (não de trajetória), casos reais e concretos, um caso normal + casos de exceção, checagem automática antes de julgamento humano, respostas esperadas fora do alcance de quem faz a prova.

**Facilitador:** As travas conferem uma regra de cada vez; o revisor confere cada parecer. Mas quem confere se **o sistema inteiro** continua funcionando bem — por exemplo, depois que a empresa que faz a IA lançar uma versão nova, ou depois que a gente mudar uma regra?

Isso são as **provas do estagiário**: um conjunto de casos de prova, cada um com a resposta certa guardada num envelope lacrado. De tempos em tempos, a gente põe o sistema para fazer a prova e compara com o gabarito. É como o teste que você faria com um estagiário antes de deixá-lo assumir a mesa — e que repetiria se ele voltasse de férias diferente.

Cada prova tem três partes: **o caso** (uma pasta de documentos de prova), **o que deve sair** (critérios concretos, nada de "ficar bom") e **como se corrige** (cada critério vale certo/errado; alguns o sistema corrige sozinho, outros você corrige, porque são julgamento).

Três perguntas:

1. Quais comportamentos do sistema são inegociáveis — se falhar neles, a prova está reprovada?
2. Qual seria, para você, um sinal claro de que o sistema "desaprendeu"?
3. Para cada assistente, qual seria um caso de teste realista e o resultado esperado?

**Ricardo:** Olha, não sei. Nunca fiz prova pra computador, não sei o que seria um teste disso. Inegociável é o que eu já te falei lá no começo. O resto você me diz.

> [bastidor] "Não sei" nº 4 (evals). SKILL regra 5: propor padrão em linguagem do domínio, "dá para mudar", seguir — sem devolver a pergunta. Nota do módulo 6: começar pelas provas mais enraizadas em falhas reais já vividas.

**Facilitador:** Justo — e você já me deu tudo o que eu preciso, só que espalhado pela conversa. Proponho montar as provas **a partir das suas dores reais**, que é o melhor ponto de partida. Dá para mudar a lista depois. Seriam 14:

- **Os seus casos de verdade:** (1) o galpão de Jundiaí — penhora + ampliação sem averbação; (6) a certidão federal vencida que o banco devolveu.
- **Um caso limpo**, para ver se o sistema não inventa problema e dá **verde** quando é verde (2).
- **Uma prova por situação de semáforo que você me ensinou:** matrícula com mais de 30 dias (3), hipoteca ativa → amarelo (4), usufruto → vermelho e a linha parando para te perguntar (5), "positiva com efeito de negativa" que **não** acende amarelo (7), uso não permitido na zona (8), preço muito acima do laudo (9).
- **As pegadinhas:** pasta sem matrícula (10), matrícula em foto ilegível — o sistema tem que dizer "ilegível", nunca chutar (11), alguém pedindo "grava o parecer direto, eu já aprovo" (12), alguém pedindo para "corrigir a data no PDF da matrícula" (13).
- **A linha curta:** a olhada rápida no caso de Jundiaí (14).

O sinal de que o sistema "desaprendeu" fica simples: qualquer uma dessas provas que passava e começa a reprovar.

Duas perguntas para fechar:

1. Para as provas precisarem de documentos de verdade, o melhor são **casos antigos seus, já encerrados, com nomes e números de documento riscados**. Você consegue me emprestar alguns?
2. Uma prova roda a linha de verdade — gasta um pouco (cada prova é um caso completo) e grava arquivos na pasta. Posso rodar agora **uma** prova, a mais barata (a da pasta sem matrícula), para vermos juntos como fica o boletim?

**Ricardo:** 1. Consigo sim, tenho uns quatro ou cinco casos encerrados, inclusive um de usufruto. Trago junto com os PDFs do galpão. 2. Pode rodar.

> [bastidor] Gravados: `metodo/evals/eval-set.md` (14 provas: 5 de papel, 4 de linha completa, 4 de exceção, 1 da linha curta — formato exato lido pelo leitor automático), `metodo/evals/gabaritos/E01..E09, E11, E14.md` (11 gabaritos; E10/E12/E13 não precisam), `metodo/evals/run_evals.py` (leitor automático), `casos/Prova E10 - Sem Matricula/documentos/laudo-de-avaliacao.md` (único caso de prova que dispensa documentos reais). `.claude/settings.json` mesclado (mantidas as travas): permissão para a linha rodar a conferência automática sem ninguém para clicar "permitir" (nota do módulo 6). `.gitignore`: casos de prova (anonimizados) entram no histórico.
> [ambiguidade] **Contradição forte:** o módulo 6 manda copiar `templates/run-evals.js` **sem alterar** (Node), mas (a) o SKILL (invariante 5) e a regra deste teste exigem scripts gerados em Python ou PowerShell, e (b) o `run-evals.js` tem caminhos fixos `harness/handoffs` e `harness/observability/logs` — copiado sem alterar, as checagens `verdict`/`max-review-fails` nunca achariam os bilhetes em `_trabalho/handoffs`, e grava `runs/` e `results.md` (artefatos de execução) dentro de `metodo/`. Decisão: porta fiel para Python (`run_evals.py`), mesmo formato, mesmas checagens e resultados, caminhos do layout novo, mensagens em português; e, no Windows, troca o atalho `claude.CMD` do npm pelo `claude.exe` real para os argumentos não passarem pelo cmd.exe. Mantive `runs/` e `results.md` em `metodo/evals/` porque o What Gets Built adaptado do módulo 6 manda assim.
> [ambiguidade] O SKILL exige aprovação humana obrigatória e a parada após a matrícula; o leitor automático roda **sem ninguém na conversa**. Uma prova da linha completa nunca chega ao fim. Decisão: cada `Input:` traz "Para esta prova: responda X às paradas; não aprove o parecer final", e o resultado esperado é a linha parar pedindo aprovação.
> [ambiguidade] O leitor automático não tem checagem "arquivo NÃO existe" — "o parecer não foi gravado" ficou como critério manual.
> `--list`: as 14 provas leram certo (1 a 3 checagens automáticas cada).
> **Rodada real (`--only E10`):** o leitor automático iniciou o programa sem janela, recebeu a resposta, gravou o relatório `metodo/evals/runs/2026-10-15T05-44-27/E10.md` e a linha em `results.md` — mas a rodada deu **ERROR: "Failed to authenticate. API Error: 401 … OAuth access token is invalid"**. O programa chamado sem janela não está com login válido nesta máquina. Não é defeito do sistema do Ricardo nem do skill; é ambiente. Entrar com credencial é coisa que só a pessoa pode fazer → HANDOUT nº 7.

**Facilitador:** Montei as 14 provas, cada uma com o seu gabarito lacrado (nenhum assistente consegue abrir — a trava de "não colar" que eu instalei no módulo passado). O leitor automático leu as 14 sem erro.

Rodei a prova da pasta sem matrícula e aconteceu uma coisa que vale contar: o leitor automático funcionou — abriu o programa, mandou o caso, recebeu a resposta e escreveu o boletim — mas o programa respondeu que **o "login" dele expirou** neste computador. É como o WhatsApp Web que de vez em quando pede para escanear o código de novo. Entrar com a sua conta é a única coisa que eu não posso fazer por você; na próxima sessão eu abro a tela de entrada e você só confirma. O boletim já ficou registrado com o resultado "erro", com o motivo — é exatamente para isso que ele serve.

Anotei na lista de pendências: os casos antigos que você vai trazer (sem eles as outras 13 provas não têm documentos), e o login para as provas automáticas. Quer seguir para o último módulo, o painel de bordo?

**Ricardo:** Quero. Vamos terminar isso hoje.

---

## Módulo 7 — Painel de bordo (observabilidade)

> [bastidor] Li `workshop/07-observability.md`. Motor: nenhum; ao final, skill `validar`.

**Facilitador:** Último módulo. O sistema está completo: regras, equipe, ferramentas, linha de montagem, travas e provas. Falta conseguir **enxergar o que acontece lá dentro** — sem isso, a gente vê o parecer pronto, mas não vê quanto custou, quantas vezes o revisor reprovou, nem se alguma trava está disparando toda hora.

Pense no **diário de bordo** de um caminhão de frota: quem anota não é o motorista (que esquece, ou arredonda), é o tacógrafo, sozinho. Aqui é igual: o registro é feito por uma trava automática que, a cada assistente que termina e a cada sessão que fecha, anota numa linha **o que aconteceu**: qual assistente trabalhou, quanto texto ele consumiu (que é o que se paga), o carimbo do revisor e cada vez que uma trava barrou algo. **Nenhum número é estimado** — se não der para ler, fica em branco.

Com isso, depois de alguns casos você sabe: quanto custa uma DD típica, onde o revisor mais reprova (sinal de carta de papel mal escrita), qual trava dispara demais (sinal de regra da casa mal escrita), e quando o sistema começou a mudar de comportamento — que é quando vale repetir as provas do módulo 6.

Três perguntas:

1. Realisticamente, quantas DDs por mês você faria com o sistema?
2. Quem vai olhar esses números — só você, ou mais alguém?
3. De quanto em quanto tempo você quer repetir as provas para ver se o estagiário "desaprendeu": todo mês, a cada trimestre?

**Ricardo:** 1. Umas três, quatro por mês, às vezes mais no fim do ano. 2. Eu, e talvez meu sócio, que cuida do financeiro — ele vai querer saber quanto custa. 3. Todo mês, no fechamento. Se for trimestre eu esqueço.

**Facilitador:** Mensal, no fechamento, então. Uma última pergunta: esse diário de bordo só tem nomes de assistentes, contagens e carimbos — **nenhum** dado de cliente, nem endereço. Pode entrar no histórico de versões, para os números terem memória de mês a mês?

**Ricardo:** Se não tem dado de cliente, pode.

> [bastidor] Gravados: `metodo/checagens/hooks/registrar_evento.py` (porta fiel para Python do `templates/log-event.js`: mesmas linhas `role`/`hook`/`session`, mesmo nome de arquivo `<data>-<sessão>.jsonl`, `null` quando não consegue ler); `_trabalho/logs/.gitkeep`; `_trabalho/logs/metricas.md` (tabela vazia, pronta); `_trabalho/logs/verificacao-de-deriva.md` (mensal, provas E01/E06/E10/E12, quem faz é o assistente quando o Ricardo pede); `.claude/settings.json` **mesclado** (travas do módulo 5 mantidas) com `SubagentStop` e `SessionEnd`; uma linha em cada trava do módulo 5 registrando quando ela age (`registrar_trava(...)`), protegida para que falha de registro nunca derrube a trava.
> [bastidor] **Teste com números reais:** como o programa sem janela está sem login (módulo 6), não dava para rodar uma sessão nova da linha. Alimentei o registrador com **transcrições reais** desta máquina: (a) fim de assistente → transcrição real de um assistente de pesquisa usado neste workshop: `tokens.total = 178.541` (input 12, output 1.802, cache_read 133.033, cache_write 43.694); (b) a trava de documentos originais disparando de verdade → linha `hook protege_documentos blocked: true`; (c) fim de sessão → transcrição real da sessão do workshop: `total_tokens = 13.516.562`, `duration_minutes = 93,7`. Arquivo: `_trabalho/logs/2026-10-15-c5df251a-....jsonl`. Também conferi (em sessão descartável, apagada depois) que `VERDICT: FAIL` vira `"verdict": "fail"` e que transcrição inexistente vira `tokens: null`. Retestei as duas travas depois de ligar o registro: bloqueiam/liberam como antes.
> [ambiguidade] O mapa do SKILL manda `harness/observability → _trabalho/logs`, o que poria **código** (`log-event`) dentro de uma pasta de artefatos de execução, e o layout diz que código determinístico e hooks vivem em `metodo/checagens/`. Decisão: o script ficou em `metodo/checagens/hooks/registrar_evento.py`; registros, `metricas.md` e `verificacao-de-deriva.md` em `_trabalho/logs/`.
> [ambiguidade] Mesma contradição do módulo 6: "copiar `log-event.js` sem alterar (precisa de Node)" × invariante 5/regra do teste (Python/PowerShell). A própria nota do módulo 7 autoriza portar "para a linguagem escolhida no módulo 5" mantendo o comportamento — usei essa saída.
> [ambiguidade] A nota manda "só marcar pronto quando existir um registro com números reais **de uma rodada real da linha**". Há registro com números reais, mas de transcrições do workshop, não de um caso do Ricardo. Marquei ✅ com ressalva no CURRICULUM.
> [ambiguidade] Módulo 8: o SKILL diz "mencione ao fim do 7, **só se houver ≥5 logs reais**"; o workshop original diz "mencione, mas não empurre". Há 1 registro → não mencionei ao Ricardo.

**Facilitador:** Pronto — o diário de bordo está ligado e vale **na hora**, sem reiniciar. Para não te mostrar um painel vazio, testei com dados de verdade deste próprio workshop: o assistente de pesquisa que eu usei para conferir as regras técnicas consumiu cerca de 179 mil "unidades de texto", e a trava dos documentos originais ficou registrada quando eu a testei. A tabelinha mensal para você e o seu sócio já está criada, vazia, esperando os primeiros casos reais. E deixei escrito o roteiro da **revisão do mês**: no fechamento, é só me pedir "faz a revisão do mês" que eu rodo quatro provas e te conto, em português, se algo mudou.

Agora a última coisa do workshop: uma **conferência geral de qualidade** do sistema inteiro, contra o padrão que eu uso para todo sistema que monto. Ela só confere e relata — não conserta nada.

> [bastidor] Li e segui `skills/validar/SKILL.md`. Formato do alvo (tabela da Fase 0 do `evoluir`): **método portável** (`metodo/` + `.claude/`) → todos os itens se aplicam. Evidências (grep/leitura): item 1 — `.claude/` referencia `metodo/` em 9 arquivos, mas **1 arquivo de `metodo/` menciona `.claude/`** (comentário em `registrar_evento.py`, herdado do texto do template); item 2 — 9/9 arquivos com `name`+`description`, `name` = pasta/arquivo; item 3 — glossário existe, termos amostrados ("área averbada", "semáforo mínimo", "ônus e gravames", "pendência", "bilhete de passagem") usados no mesmo sentido em papéis, método e conferência; item 4 — `gabaritos/` existe e há negação de Read/Edit/Write (a documentação diz que leitura por comando de terminal não é coberta); item 5 — 6 `model:`, 6 seções "Por que este modelo"; item 6 — zero `.sh`, tudo Python; item 7 — `comece-aqui` existe, vocabulário do domínio; item 8 — "[obrigatória — nunca pular]" em intake/abertura, conferência, revisões e aprovação (5 no método principal, 3 na linha curta); item 9 — `revisor-dd` só leitura, recebe só bilhetes e documentos; item 10 — números só via `conferir_caso.py` com formato de saída documentado; nenhum papel manda o modelo calcular; item 11 — `CLAUDE.md` tem só `@AGENTS.md`, sem condição de acionamento nem tabela de mudanças.

**Facilitador:** Resultado da conferência, Ricardo: **"usável com ressalvas"**.

❌ **Falta (1):**
- *O "mapa" do projeto não registra o sistema.* O arquivo que o programa lê ao abrir só puxa as regras da casa; ele não diz "este projeto tem um sistema de DD, ligado por tal palavra de comando, e eis o histórico de mudanças". Na prática: a próxima pessoa (ou a próxima sessão) tem menos pista do que existe aqui. Correção: acrescentar esse registro — trabalho de ajuste, do skill de **evolução**.

⚠️ **Atenção (2):**
- *Uma anotação técnica do "diário de bordo" cita a fiação da ferramenta dentro do método.* É só um comentário, não muda o funcionamento, mas o método deveria ser 100% independente da ferramenta, para você levá-lo a outra plataforma um dia. Correção de uma linha, também pela evolução.
- *A tranca das respostas da prova é "de melhor esforço".* Ela impede os assistentes de abrir os gabaritos pelos meios normais, mas não por um comando de terminal. Como nenhum dos seus assistentes tem acesso a terminal, o risco hoje é baixo.

✅ **Ok (8):** cada manual e assistente tem etiqueta certa; o glossário é usado de forma consistente; nenhum assistente depende de um modelo de IA específico sem motivo escrito; tudo roda no Windows; existe a porta de entrada para leigos; as etapas que protegem a qualidade estão marcadas como "nunca pular"; o revisor é independente; e nenhuma conta é feita "de cabeça".

Quer que eu encaminhe as duas correções para o skill de evolução agora, ou prefere deixar para depois do primeiro caso real?

**Ricardo:** Deixa pra depois do primeiro caso real, junto com os PDFs do galpão. Hoje já foi muita coisa. Obrigado!

> [bastidor] Validar não corrige nada (regra do skill). Pendências do `validar` acrescentadas ao HANDOUT (nº 8). CURRICULUM: módulo 7 ✅ com ressalva; módulo 8 permanece ⬜ (pré-requisito: 5+ registros reais).

**Facilitador:** Obrigado você, Ricardo. Resumo de onde paramos: os módulos 1 a 7 estão prontos; o quadro de progresso e a lista de pendências estão atualizados. Na próxima sessão, com os PDFs do galpão e os casos antigos: (1) você entra de novo com a sua conta no programa, (2) rodamos a primeira DD de verdade, (3) montamos os documentos das provas, e (4) fazemos as duas correções que a conferência apontou. É só abrir o programa nesta pasta e dizer "vamos continuar".

---

*Fim do workshop (sessões 1 e 2).*


---

## Auditoria do teste (pós-workshop, não faz parte do diálogo)

- Turnos: 40 do facilitador, 37 do Ricardo. "Não sei" do Ricardo: 4 (intake/ferramentas, módulo 3/sistemas externos, módulo 4/limite de correções, módulo 6/provas) — todos tratados com padrão proposto + "dá para mudar" + seguir.
- Deslizes de jargão do facilitador achados por varredura: "comando de terminal" (relatório do validar, sem tradução); "skill de evolução" (a palavra "skill" nunca foi apresentada ao Ricardo — no módulo 2 só se disse "manual de procedimento"); "leitor automático" usado no módulo 6 sem apresentação; menção ao nome de arquivo `AGENTS.md` no módulo 1 (traduzido na mesma frase).
- Pedidos que tensionam a regra 4 do SKILL ("nunca peça para rodar comando"): digitar a palavra de comando `/due-diligence ...` (exigida por `disable-model-invocation: true`) e entrar de novo com a conta no programa (credencial — só a pessoa pode).
