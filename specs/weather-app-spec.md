# Especificação de Produto — Weather App

> **Fase:** Spec  
> **Status:** Decisões do MVP registradas; pronta para planejamento
> **Fonte:** [Discovery](./discovery.md)

## Overview

O Weather App é uma aplicação web responsiva para consultar as condições
meteorológicas de uma cidade e planejar atividades com uma previsão diária de
cinco dias. A pessoa usuária busca e seleciona uma cidade, consulta o clima
atual e a previsão, e pode escolher entre Celsius e Fahrenheit.

O produto prioriza uma consulta rápida em dispositivos móveis, sem deixar de
atender ao planejamento em desktop. A interface será em pt-BR e os dados
meteorológicos virão da Open-Meteo. A spec considera como decisões já tomadas
que os cinco dias incluem o dia atual e seguem o fuso da localidade, e que
Celsius é a unidade inicial.

### Objetivos

- Permitir encontrar e identificar a cidade desejada antes de consultar seus
  dados meteorológicos.
- Apresentar condições atuais e uma visão diária dos próximos cinco dias de
  forma compreensível.
- Atender pessoas que preferem Celsius ou Fahrenheit, incluindo a persistência
  da preferência entre visitas.
- Continuar utilizável e comunicar claramente o estado do serviço quando a
  conexão ou a API estiver lenta ou indisponível.

## Functional Requirements

Recorte do hook neste incremento: por solicitação explícita, a busca carrega
automaticamente o clima da primeira cidade encontrada, mantendo os resultados
disponíveis para selecionar outra cidade. Esta é uma exceção ao fluxo original
de seleção explícita descrito abaixo. O `App` consome o hook e substitui a
demonstração por consultas reais, exibindo os cinco estados da operação.

Complemento para o hero de clima atual: exibir também pressão na superfície em
hPa, ou “Indisponível” quando ausente, preservando as demais métricas de RF-03.

Complemento para RF-04: cada resumo diário inclui probabilidade de chuva em
porcentagem (0 a 100); quando ausente ou inválida, exibir “Indisponível”.

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-01 | Busca de cidades: permitir pesquisar por envio explícito do nome da cidade, com pelo menos dois caracteres após remover espaços externos; apresentar no máximo cinco resultados de geocodificação. Aceitar acentos e caracteres especiais, sem compromisso de corrigir erros de digitação ou equiparar consultas com e sem acento. | Must |
| RF-02 | Seleção de cidade: permitir selecionar um resultado para consultar seus dados meteorológicos. | Must |
| RF-03 | Clima atual: exibir temperatura, condição atual em português, sensação térmica, umidade em porcentagem, vento em km/h, índice UV e precipitação em mm para a cidade selecionada. Os campos de UV e precipitação devem ser apresentados para toda cidade selecionada; quando a API não fornecer um valor, identificá-lo como indisponível. | Must |
| RF-04 | Previsão: exibir cinco resumos diários consecutivos, do dia atual até quatro dias depois no fuso da localidade, com máxima, mínima e condição predominante em cada dia. | Must |
| RF-05 | Unidade de temperatura: permitir alternar entre °C e °F e atualizar todas as temperaturas exibidas, arredondadas ao inteiro mais próximo a partir do valor original. | Must |
| RF-06 | Persistência da unidade: lembrar a unidade escolhida entre visitas. | Should |
| RF-07 | Estados da interface: comunicar carregamento, erro de busca/dados e busca sem resultados; permitir nova tentativa após falha. | Must |
| RF-08 | Desambiguação: apresentar contexto regional dos resultados, como estado/região e país quando disponível. | Should |
| RF-09 | Atualidade e procedência: informar que os dados são da Open-Meteo e quando a aplicação os recebeu. Consultar dados ao selecionar uma cidade e sob solicitação explícita de atualização, sem polling automático. Reutilizar respostas meteorológicas da localidade por até 10 minutos, exceto em atualização explícita; se uma consulta falhar e houver dados em cache, apresentá-los identificados como anteriores e com a idade explícita. | Must |

## User Stories

- **US-01 — Marina, rotina urbana (RF-01, RF-02, RF-03):** Como Marina, pessoa
  de rotina urbana, quero buscar e selecionar minha cidade para consultar
  rapidamente o clima atual e decidir como me preparar antes de sair.
- **US-02 — Rafael, planejamento de passeios (RF-04):** Como Rafael, pessoa que
  planeja passeios, quero comparar as condições e as temperaturas máxima e
  mínima dos próximos cinco dias para escolher quando fazer uma atividade ao ar
  livre.
- **US-03 — Alex, viajante habituado a Fahrenheit (RF-05, RF-08):** Como Alex,
  viajante habituado a Fahrenheit, quero distinguir cidades com o mesmo nome e
  alternar as temperaturas para °F para entender a previsão do destino sem
  conversões mentais.
- **US-04 — Alex, viajante habituado a Fahrenheit (RF-06):** Como Alex,
  viajante habituado a Fahrenheit, quero que minha unidade de temperatura
  escolhida seja lembrada entre visitas para consultar os dados do destino sem
  precisar configurá-la novamente.
- **US-05 — Marina, rotina urbana (RF-07, RF-09):** Como Marina, pessoa de
  rotina urbana, quero saber quando uma consulta está carregando, falhou ou
  mostra dados anteriores e quando esses dados foram atualizados para decidir
  se posso confiar neles.

Marina é a persona prioritária. Sua meta inicial de sucesso no mobile é
encontrar a cidade e compreender temperatura e condição atuais em até 15
segundos; esse alvo está incluído nos critérios de aceite.

## Acceptance Criteria

Cada critério abaixo usa Given/When/Then e referencia o requisito funcional
correspondente.

### US-01 — Busca e clima atual (RF-01, RF-02, RF-03)

- **AC-01 (RF-01):**
  - **Given** um nome de cidade com pelo menos dois caracteres após remover
    espaços externos e uma resposta de geocodificação com correspondências
  - **When** a pessoa usuária envia explicitamente a busca
  - **Then** são apresentados uma única vez no máximo cinco resultados, e cada
    resultado pode ser selecionado.
- **AC-02 (RF-02):**
  - **Given** uma lista de resultados de busca
  - **When** a pessoa usuária seleciona um resultado
  - **Then** a cidade selecionada é identificada e os dados meteorológicos
    solicitados e exibidos correspondem às coordenadas desse resultado.
- **AC-03 (RF-03):**
  - **Given** uma cidade selecionada e uma resposta com dados atuais disponíveis
  - **When** os dados meteorológicos são exibidos
  - **Then** a interface apresenta temperatura, condição atual, sensação
    térmica, umidade, vento, índice UV e precipitação, cada qual com rótulo e
    unidade quando aplicável.
- **AC-04 (RF-03):**
  - **Given** uma cidade selecionada e um ou mais campos de dados atuais ausentes,
    incluindo índice UV ou precipitação
  - **When** os dados meteorológicos são exibidos
  - **Then** cada campo ausente é identificado como “Indisponível”, sem ser
    apresentado como um valor meteorológico conhecido ou inventado.

### US-02 — Planejamento dos próximos dias (RF-04)

- **AC-05 (RF-04):**
  - **Given** uma cidade selecionada e uma previsão diária com cinco dias
    disponíveis
  - **When** a previsão é exibida
  - **Then** são apresentados exatamente cinco resumos para as datas locais da
    cidade selecionada, do dia atual até quatro dias depois, cada um com data,
    temperatura máxima, temperatura mínima e condição predominante.
- **AC-06 (RF-04):**
  - **Given** os cinco resumos diários exibidos
  - **When** a pessoa usuária consulta a previsão
  - **Then** a data, a máxima, a mínima e a condição de cada resumo são
    associadas claramente ao mesmo dia.

### US-03 — Destino e unidade (RF-05, RF-08)

- **AC-07 (RF-08):**
  - **Given** resultados de busca com informação regional e de país fornecida
    pelo serviço
  - **When** os resultados são exibidos
  - **Then** essa informação aparece junto ao nome de cada resultado que a
    possui.
- **AC-08 (RF-08):**
  - **Given** um resultado de busca sem informação regional ou de país fornecida
    pelo serviço
  - **When** o resultado é exibido
  - **Then** a interface não inventa nem atribui metadados regionais ausentes a
    esse resultado.
- **AC-09 (RF-05):**
  - **Given** temperaturas atuais e da previsão exibidas em °C
  - **When** a pessoa usuária seleciona °F
  - **Then** todas as temperaturas visíveis passam a ser exibidas em °F, sem
    valores em °C misturados, convertidas a partir dos valores originais e
    arredondadas ao inteiro mais próximo; por exemplo, 20 °C é apresentado como
    68 °F e -17,8 °C como 0 °F.
- **AC-10 (RF-05):**
  - **Given** temperaturas atuais e da previsão exibidas em °F
  - **When** a pessoa usuária seleciona °C
  - **Then** todas as temperaturas visíveis passam a ser exibidas em °C, sem
    valores em °F misturados, convertidas a partir dos valores originais e
    arredondadas ao inteiro mais próximo; por exemplo, 68 °F é apresentado como
    20 °C.

### US-04 — Persistência da unidade (RF-06)

- **AC-11 (RF-06):**
  - **Given** que a pessoa usuária selecionou uma unidade e a preferência foi
    salva
  - **When** inicia uma nova visita
  - **Then** a unidade salva é selecionada.
- **AC-12 (RF-06):**
  - **Given** que não há preferência válida salva ou que o armazenamento da
    preferência está indisponível
  - **When** a aplicação inicia
  - **Then** a unidade selecionada é °C e a consulta de cidades e clima continua
    disponível.

### US-05 — Falhas e atualidade (RF-07, RF-09)

- **AC-13 (RF-07):**
  - **Given** uma busca ou consulta meteorológica iniciada e ainda sem resposta
  - **When** a operação está em andamento
  - **Then** a interface comunica o estado de carregamento.
- **AC-14 (RF-07):**
  - **Given** uma busca concluída com zero cidades correspondentes
  - **When** a resposta é apresentada
  - **Then** a interface comunica um estado vazio distinto de uma mensagem de
    erro.
- **AC-15 (RF-07):**
  - **Given** uma falha na busca ou na consulta meteorológica
  - **When** a operação termina sem sucesso
  - **Then** a interface apresenta uma mensagem de erro e uma ação para tentar
    novamente, sem permanecer em carregamento nem apresentar a falha como
    sucesso.
- **AC-16 (RF-07):**
  - **Given** uma falha anterior e a ação para tentar novamente disponível
  - **When** a pessoa usuária solicita nova tentativa
  - **Then** uma nova operação de busca ou consulta é iniciada.
- **AC-17 (RF-09):**
  - **Given** dados meteorológicos apresentados
  - **When** a interface exibe esses dados
  - **Then** identifica a Open-Meteo como fonte e informa quando a aplicação
    recebeu a resposta, em data e horário legíveis no fuso da localidade; esse
    horário representa o recebimento, não a hora de observação informada pela
    fonte.
- **AC-18 (RF-09):**
  - **Given** uma consulta meteorológica que falhou e dados anteriores
    disponíveis em cache
  - **When** a interface apresenta esses dados
  - **Then** identifica-os explicitamente como anteriores e informa a idade
    transcorrida desde que a aplicação recebeu a resposta armazenada.
- **AC-19 (RF-09):**
  - **Given** uma consulta meteorológica que falhou e nenhum dado disponível em
    cache
  - **When** a interface apresenta o resultado da operação
  - **Then** comunica a indisponibilidade e não apresenta dados meteorológicos
    inventados.
- **AC-20 (RF-01):**
  - **Given** o campo de busca vazio, contendo apenas espaços ou menos de dois
    caracteres após remover espaços externos
  - **When** a pessoa usuária tenta buscar
  - **Then** nenhuma requisição de geocodificação é iniciada e uma mensagem
    associada ao campo informa que é necessário digitar pelo menos dois
    caracteres.
- **AC-21 (RF-03, RF-04):**
  - **Given** uma resposta meteorológica parcial com campos atuais ausentes ou
    menos de cinco dias disponíveis
  - **When** os dados são exibidos
  - **Then** cada campo ausente é identificado como “Indisponível”; os dias
    disponíveis são exibidos sem criar dias fictícios e a previsão é marcada
    como incompleta.
- **AC-22 (RF-01):**
  - **Given** uma busca anterior ainda em andamento e uma busca mais recente
    iniciada
  - **When** as respostas chegam fora de ordem
  - **Then** apenas os resultados da busca mais recente permanecem visíveis.
- **AC-23 (RF-03):**
  - **Given** uma resposta meteorológica com umidade, vento, condição, índice UV
    e precipitação disponíveis
  - **When** os dados atuais são exibidos
  - **Then** a umidade é apresentada em porcentagem, o vento em km/h, a
    precipitação em mm, o índice UV como índice sem unidade e a condição é
    descrita em português.
- **AC-24 (RNF-01):**
  - **Given** a aplicação nos viewports de 360 × 800 px e 1280 × 800 px
  - **When** os fluxos principais são verificados
  - **Then** não há rolagem horizontal e todos os alvos de toque medem pelo
    menos 44 × 44 px.
- **AC-25 (RNF-02):**
  - **Given** uma build de produção, cache frio, viewport de 360 × 800 px e
    perfil de rede 4G
  - **When** são feitas dez medições de desempenho
  - **Then** o percentil 75 do LCP é inferior a 2,5 s, o percentil 75 do TTI é
    inferior a 3 s e o bundle inicial compactado em gzip não excede 200 KB; o
    feedback visual para cada ação de carregamento ocorre em até 100 ms.
- **AC-26 (RNF-03):**
  - **Given** os fluxos de busca, seleção, consulta e troca de unidade
  - **When** são executadas verificações automatizadas e revisão manual de
    acessibilidade
  - **Then** não há violações WCAG 2.1 AA identificadas pela ferramenta nos
    critérios que ela cobre, todos os fluxos são operáveis por teclado e o
    contraste do texto normal é de pelo menos 4,5:1.
- **AC-27 (RNF-04, RNF-05):**
  - **Given** cada navegador estável mais recente listado em RNF-05
  - **When** são executados os fluxos de busca, seleção, consulta e troca de
    unidade, incluindo uma falha da API
  - **Then** esses fluxos continuam utilizáveis; na falha, a aplicação comunica
    o erro e oferece nova tentativa sem travar ou permanecer em carregamento.
- **AC-28 (RF-09):**
  - **Given** uma cidade selecionada e dados meteorológicos carregados
  - **When** a pessoa usuária não solicita atualização explícita
  - **Then** não há atualização automática periódica; ao solicitar atualização,
    uma nova consulta é iniciada sem reutilizar a resposta meteorológica em
    cache.
- **AC-29 (RF-07):**
  - **Given** uma consulta de geocodificação ou meteorológica em andamento
  - **When** a consulta ultrapassa 10 segundos
  - **Then** o carregamento é encerrado, a interface comunica que a consulta
    demorou mais que o esperado e oferece nova tentativa; uma resposta tardia
    não substitui o resultado de uma consulta mais recente.
- **AC-30 (RNF-11):**
  - **Given** uma pessoa participante realizando o fluxo principal em um
    dispositivo móvel
  - **When** inicia a busca e seleciona uma cidade com resultados disponíveis
  - **Then** consegue identificar a cidade e compreender a temperatura e a
    condição atuais em até 15 segundos.

## Non-Functional Requirements

- **RNF-01 — Responsividade:** Layout mobile-first utilizável entre 360 px e
  1920 px de largura, sem rolagem horizontal; alvos de toque com pelo menos
  44 × 44 px. Validar em viewports de 360 × 800 px e 1280 × 800 px.
- **RNF-02 — Desempenho:** Em execução de produção, com cache frio, viewport de
  360 × 800 px e perfil de rede 4G, o percentil 75 de dez medições deve ter LCP
  inferior a 2,5 s e TTI inferior a 3 s; o bundle inicial deve ser de no máximo
  200 KB gzip. Ações que iniciem carregamento devem receber feedback visual em
  até 100 ms.
- **RNF-03 — Acessibilidade:** Atender WCAG 2.1 AA, incluindo contraste mínimo
  de 4,5:1 para texto normal, foco visível, navegação por teclado na
  busca/resultados e anúncios acessíveis de resultados, carregamento e erros.
  Validar os fluxos principais com ferramenta automatizada e revisão manual de
  teclado e contraste.
- **RNF-04 — Confiabilidade:** Lentidão ou falha da API não deve quebrar a
  interface nem impedir a pessoa usuária de compreender o estado da consulta.
- **RNF-05 — Compatibilidade:** Suportar as versões estáveis mais recentes de
  Chrome, Firefox, Safari e Edge disponíveis na data de lançamento, em desktop
  e nos navegadores móveis correspondentes.
- **RNF-06 — Segurança:** Não coletar dados pessoais sensíveis nem incluir
  segredos no produto.
- **RNF-07 — Idioma e formatação:** Interface, datas e números em pt-BR,
  independentemente do locale configurado no navegador.
- **RNF-08 — Disponibilidade:** A aplicação web deve continuar carregável
  independentemente da disponibilidade da API. Dados anteriores em cache devem
  ser apresentados com indicação de atualidade quando houver falha da API.
- **RNF-09 — Uso eficiente da API:** Considerar recentes por até 10 minutos as
  respostas em cache por localidade; em caso de falha, dados mais antigos ainda
  podem ser exibidos como anteriores, com idade explícita. Não permitir que
  respostas de buscas obsoletas substituam resultados mais recentes e respeitar
  os termos de uso da Open-Meteo.
- **RNF-10 — Privacidade:** Enviar à Open-Meteo somente os dados necessários à
  consulta. Não coletar nem enviar dados de geolocalização no MVP.
- **RNF-11 — Sucesso da tarefa principal:** Em teste de usabilidade mobile, a
  pessoa deve conseguir encontrar sua cidade e compreender temperatura e
  condição atuais em até 15 segundos.

## Traceability Matrix

Cada linha relaciona uma User Story aos critérios de aceite que a verificam e
aos requisitos não funcionais relevantes. Critérios compartilhados aparecem em
mais de uma linha quando cobrem partes de histórias diferentes.

| User Story | Acceptance Criteria relacionados | Requisitos não funcionais relevantes |
| --- | --- | --- |
| **US-01 — Busca e clima atual** | AC-01 a AC-04, AC-20 a AC-23, AC-24 a AC-27, AC-29, AC-30 | RNF-01 (uso mobile e alvos de toque), RNF-02 (carregamento e resposta), RNF-03 (busca acessível por teclado), RNF-04 (falhas da API), RNF-05 (navegadores suportados), RNF-07 (português e formatação), RNF-09 (cache e respostas recentes), RNF-10 (dados enviados à API), RNF-11 (meta de 15 segundos) |
| **US-02 — Planejamento dos próximos dias** | AC-05, AC-06, AC-21, AC-24 a AC-27 | RNF-01 (layout responsivo), RNF-02 (desempenho), RNF-03 (acessibilidade), RNF-04 (falhas da API), RNF-05 (compatibilidade), RNF-07 (datas e números em pt-BR), RNF-08 (disponibilidade), RNF-09 (cache e atualidade) |
| **US-03 — Destino e unidade** | AC-07 a AC-10, AC-20, AC-22, AC-24 a AC-27 | RNF-01 (layout e alvos de toque), RNF-02 (resposta da busca), RNF-03 (seleção acessível), RNF-04 (falhas da consulta), RNF-05 (compatibilidade), RNF-07 (formatação em pt-BR), RNF-09 (resultados recentes e requisições obsoletas), RNF-10 (dados enviados à API) |
| **US-04 — Persistência da unidade** | AC-11, AC-12, AC-24 a AC-27 | RNF-01 (layout responsivo), RNF-02 (desempenho), RNF-03 (controle de unidade acessível), RNF-04 (comportamento consistente), RNF-05 (compatibilidade entre navegadores), RNF-06 (segurança), RNF-07 (rótulos e formatação em pt-BR) |
| **US-05 — Falhas e atualidade** | AC-13 a AC-19, AC-24 a AC-29 | RNF-01 (layout responsivo), RNF-02 (feedback de carregamento), RNF-03 (anúncio acessível de estados), RNF-04 (resiliência), RNF-05 (compatibilidade), RNF-07 (mensagens em pt-BR), RNF-08 (cache em indisponibilidade), RNF-09 (idade e reutilização dos dados) |

## Edge Cases

- **Input vazio ou apenas com espaços:** não realizar requisição. Ao tentar
  buscar, apresentar “Digite o nome de uma cidade” associado ao campo e
  permitir sua correção.
- **Busca com menos de dois caracteres:** não realizar requisição e informar o
  mínimo exigido. Enviar a busca somente por ação explícita da pessoa usuária,
  pelo botão ou pelo envio do formulário.
- **Cidade inexistente ou nome sem correspondências:** apresentar “Nenhuma
  cidade encontrada” e permitir corrigir a busca. Não afirmar que a cidade
  não existe, pois ela pode não constar no serviço; não consultar a previsão
  sem uma cidade selecionada.
- **Geocoding sem resultados:** tratar uma resposta válida sem correspondências
  como estado vazio, não como falha técnica. Sugerir revisar a grafia ou
  informar região/país; não selecionar uma cidade alternativa automaticamente
  nem solicitar previsão para essa busca.
- Vários resultados com o mesmo nome: exibir os metadados regionais fornecidos
  para possibilitar escolha informada; não selecionar automaticamente um deles.
- **Caracteres especiais:** aceitar nomes com acentos, hífens e apóstrofos,
  como “São Paulo”, “Baden-Baden” e “D’Oeste”, sem rejeitá-los apenas por esses
  caracteres. Tratar a entrada como texto, nunca como conteúdo executável.
  Quando não houver correspondências, apresentar o estado vazio, sem travar
  a interface. A equivalência entre nomes com e sem acento, a tolerância a
  erros de digitação e a busca por nome parcial dependem das capacidades do
  serviço; não são garantidas pela aplicação.
- **Falha de API ou de rede:** durante a consulta, comunicar carregamento;
  após a falha, encerrar esse estado, informar a indisponibilidade e oferecer
  “Tentar novamente”. Distinguir limite de consultas quando identificável.
  Se houver dados em cache para a cidade consultada, apresentá-los como
  desatualizados, com sua idade explícita; não confundir erro com busca vazia.
- **Timeout de geocodificação ou previsão:** após 10 segundos, encerrar o
  carregamento, apresentar “A consulta demorou mais que o esperado” e oferecer
  nova tentativa. Uma resposta tardia não deve substituir uma consulta mais
  recente.
- Busca nova iniciada antes de a anterior terminar: resultados da busca antiga
  não devem substituir os resultados mais recentes.
- **Resposta parcial, com dados atuais ou diários ausentes/incompletos:**
  exibir os dados válidos e identificar cada campo ausente como “Indisponível”,
  inclusive índice UV e precipitação, nunca como zero ou outro valor inventado.
  Se houver menos de cinco dias no intervalo previsto, exibir os dias
  disponíveis e informar que a previsão está incompleta, sem criar dias
  fictícios. Se nenhum dado meteorológico utilizável existir, apresentar
  indisponibilidade e oferecer nova tentativa.
- Mudança de unidade com dados carregados ou em carregamento: manter uma única
  unidade consistente em todas as temperaturas visíveis.
- Preferência de unidade ausente, inválida ou inacessível: iniciar em °C; a
  persistência não deve impedir a consulta.
- Datas na virada do dia ou fuso horário distinto: as datas e a janela de cinco
  dias seguem o fuso horário da localidade consultada.
- Sem dados em cache durante indisponibilidade da API: exibir o erro e permitir
  nova tentativa, sem apresentar dados fictícios ou vazios como se fossem atuais.

## Assumptions

As premissas abaixo consolidam decisões do Discovery e hipóteses adicionais;
devem ser revistas se forem invalidadas ou rejeitadas pelos stakeholders:

- **S-01:** O produto do MVP é uma aplicação web responsiva (SPA), não um app
  nativo iOS/Android.
- **S-02:** A Open-Meteo fornece geocodificação, clima atual e previsão diária
  necessários sem chave de API.
- **S-03:** Os cinco dias são resumos diários e incluem o dia atual.
- **S-04:** Celsius é a unidade inicial, considerando o idioma inicial pt-BR.
- **S-05:** Não há autenticação nem backend próprio; o estado do usuário fica no
  cliente.
- **S-06:** Geolocalização automática, favoritos, previsão horária e modo
  offline completo não fazem parte do MVP. Também não fazem parte do MVP
  aplicativos nativos, PWA instalável, analytics ou coleta individual de uso.
- **S-07:** Uma cidade é exibida por vez; comparação entre cidades não faz parte
  do MVP.
- **S-08:** O tráfego esperado respeita os limites de uso gratuito da
  Open-Meteo.
- **S-09:** As datas da previsão e os horários exibidos seguem o fuso horário
  informado para a localidade consultada; a interface e a formatação usam pt-BR.
- Persistir a unidade escolhida no cliente é suficiente para atender à
  preferência entre visitas; detalhes de retenção e armazenamento não foram
  definidos.
- As metas de performance e os requisitos de acessibilidade do Discovery são
  metas do produto, sujeitas a validação e medição nos ambientes definidos.
- **S-10:** A busca é enviada explicitamente, exige pelo menos dois caracteres
  após remover espaços externos e apresenta no máximo cinco resultados.
- **S-11:** Dados meteorológicos não são atualizados automaticamente; a
  atualização ocorre na seleção da cidade ou por solicitação explícita. Cache
  recente pode ser reutilizado por até 10 minutos, salvo na atualização explícita.
- **S-12:** Não há data de lançamento definida para o MVP; sua definição não
  bloqueia o planejamento nem a implementação.
- **S-13:** Marina é a persona prioritária. A meta inicial de sucesso é
  encontrar a cidade e compreender o clima atual em até 15 segundos no mobile.

## Risks

| ID | Risco | Probabilidade / impacto | Mitigação prevista |
| --- | --- | --- | --- |
| R-01 | Indisponibilidade ou instabilidade da Open-Meteo. | Média / Alto | Estados de erro claros, tentativa novamente, uso de cache com idade explícita e SPA carregável sem a API. |
| R-02 | Limites da API gratuita em períodos de alto tráfego. | Média / Médio | Busca por envio explícito, limite de cinco resultados, cache, cancelamento de consultas obsoletas e acompanhamento dos termos de uso. |
| R-03 | Cidade homônima levar à consulta de localidade errada. | Média / Médio | Mostrar país e região nos resultados quando disponíveis e exigir seleção explícita. |
| R-04 | Briefing enxuto levar a crescimento ou interpretação incorreta do escopo. | Alta / Médio | Manter os limites e as decisões do MVP explícitos; avaliar novas demandas como mudanças de escopo. |
| R-05 | Dados ou horários de atualização divergirem da expectativa de precisão. | Baixa / Baixo | Identificar a fonte e a atualização dos dados; distinguir dados em cache dos atuais. |
| R-06 | Tema dark glassmorphism comprometer contraste e legibilidade. | Média / Médio | Medir contraste, verificar acessibilidade automatizada e validar foco e leitura nos componentes. |

## Out of Scope

Para o MVP, não estão incluídos:

- Aplicativos nativos iOS ou Android.
- Autenticação, contas de usuário ou sincronização por servidor.
- Geolocalização automática.
- Salvar cidades favoritas, histórico de buscas ou comparar várias cidades.
- Previsão horária.
- Alternância de unidade de vento.
- Experiência offline completa; cache de respostas e apresentação explícita de
  dados anteriores quando disponíveis continuam no escopo.
- Analytics, rastreamento individual de uso ou relatórios de cidades mais
  consultadas.

## Open Questions

Não há perguntas em aberto para o escopo do MVP definido nesta especificação.
