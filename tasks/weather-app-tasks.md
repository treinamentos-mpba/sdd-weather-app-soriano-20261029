# Backlog de Tarefas — Weather App

Backlog derivado do [plano técnico](../plans/weather-app-plan.md) e rastreável à
[especificação](../specs/weather-app-spec.md). As dependências indicam pré-
requisitos reais; tarefas sem pré-requisito estão marcadas como “Nenhuma”.
Os critérios de aceite de cada tarefa definem resultados verificáveis; a linha
**Rastreabilidade** associa a tarefa aos RF/RNF e critérios de aceite da spec
correspondentes. Para trabalho de infraestrutura sem critério funcional direto,
a rastreabilidade aponta o requisito de qualidade atendido.

## Ordem de implementação

Os IDs são mantidos para preservar a rastreabilidade. Esta é a ordem canônica de
execução; os critérios de aceite e as dependências de cada tarefa estão no
detalhamento abaixo. A prioridade ordena o trabalho; o tamanho é uma estimativa
relativa de esforço, não duração. P0 e P1 compõem o MVP especificado; P2 agrupa
validações de hardening que devem ocorrer antes do ship. P2 não significa que os
critérios correspondentes possam ser ignorados.

### Sequência sugerida em fatias verticais

| Fatia | Tarefas na sequência | Resultado visível |
| --- | --- | --- |
| 0 — Shell | T-01, T-05 a T-09 | Aplicação inicial renderizada com estrutura e tema, sem depender da API. |
| 1 — Busca e clima atual | T-02 a T-04, T-10 a T-12, T-14 a T-27, T-30, T-32 a T-35, T-53 | Pesquisar, selecionar uma cidade e ver clima atual; inclui loading, vazio, erro/retry e testes da fatia. |
| 2 — Previsão e controles | T-13, T-28, T-29, T-54, T-31, T-36, T-37 | Completar o MVP com previsão de cinco dias, unidades, atualização explícita e layout responsivo. |
| 3 — Fluxos E2E | T-38 a T-45 | Verificar os fluxos completos com endpoints determinísticos no navegador. |
| 4 — Hardening | T-46 a T-52 | Validar acessibilidade, compatibilidade, desempenho, bundle e uso mobile antes do ship. |

Cada fatia respeita as dependências reais listadas nas tarefas. Comece a seguinte
assim que seus pré-requisitos estiverem prontos; não é necessário esperar o fim
de todo o backlog para obter um incremento utilizável.

### Classificação por prioridade e tamanho

Tamanho relativo: **P** = pequeno, **M** = médio, **G** = grande. Prioridades:
**P0** = caminho crítico até a primeira experiência funcional; **P1** = completar
o MVP e validar os fluxos integrados; **P2** = hardening pré-ship.

| Tarefa | Prioridade | Tamanho | Tarefa | Prioridade | Tamanho |
| --- | --- | --- | --- | --- | --- |
| T-01 | P0 | M | T-28 | P1 | M |
| T-02 | P0 | M | T-29 | P1 | M |
| T-03 | P0 | P | T-30 | P0 | M |
| T-04 | P0 | M | T-31 | P1 | M |
| T-05 | P0 | P | T-32 | P0 | G |
| T-06 | P0 | P | T-33 | P0 | M |
| T-07 | P0 | P | T-34 | P0 | P |
| T-08 | P0 | P | T-35 | P0 | P |
| T-09 | P0 | M | T-36 | P1 | M |
| T-10 | P0 | M | T-37 | P1 | M |
| T-11 | P0 | P | T-38 | P1 | M |
| T-12 | P0 | P | T-39 | P1 | M |
| T-13 | P1 | P | T-40 | P1 | M |
| T-14 | P0 | M | T-41 | P1 | P |
| T-15 | P0 | G | T-42 | P1 | M |
| T-16 | P0 | M | T-43 | P1 | M |
| T-17 | P0 | P | T-44 | P1 | M |
| T-18 | P0 | M | T-45 | P1 | M |
| T-19 | P0 | G | T-46 | P2 | M |
| T-20 | P0 | G | T-47 | P2 | M |
| T-21 | P0 | M | T-48 | P2 | M |
| T-22 | P0 | M | T-49 | P2 | P |
| T-23 | P0 | M | T-50 | P2 | M |
| T-24 | P0 | P | T-51 | P2 | P |
| T-25 | P0 | P | T-52 | P2 | M |
| T-26 | P0 | M | T-53 | P0 | P |
| T-27 | P0 | M | T-54 | P1 | M |

### Preparação do projeto

T-01 — Preparar dependências React e Vite; T-05 — Criar o shell inicial da
aplicação; T-06 — Preparar a entrada React; T-07 — Adicionar dependências
Tailwind; T-08 — Configurar processamento Tailwind; T-09 — Definir estilos
globais do tema.

### Tipos

T-02 — Definir contratos de domínio.

### Funções puras

T-03 — Mapear códigos meteorológicos WMO; T-04 — Formatar datas e números no
fuso da localidade; T-10 — Implementar conversão e formatação de temperatura.

### Services

T-14 — Implementar busca e normalização de cidades; T-17 — Garantir timeout da
geocodificação; T-15 — Implementar consulta e normalização da previsão; T-18 —
Garantir timeout e cancelamento do forecast; T-16 — Adicionar cache por
localidade e atualização explícita.

### Hook

T-20 — Orquestrar busca, seleção, consulta e retry; T-21 — Persistir preferência
de unidade.

### Componentes

T-22 — Criar formulário acessível de busca; T-23 — Apresentar resultados
selecionáveis de cidade; T-24 — Implementar estado de carregamento; T-25 —
Implementar estado vazio da busca; T-26 — Implementar estado de erro e dados em
cache; T-27 — Exibir clima atual e medidas indisponíveis; T-28 — Exibir previsão
diária de cinco dias; T-29 — Implementar controles de unidade e atualização.

### Integração

T-30 — Integrar a primeira fatia (busca e clima atual); T-54 — Completar a
composição com previsão e controles; T-31 — Aplicar layout responsivo e
hierarquia visual.

### Testes

T-38 — Configurar Playwright; T-39 — Preparar fixtures e interceptação dos
endpoints; T-11 — Testar conversão de unidade com testes unitários; T-12 — Testar
descrições de códigos meteorológicos; T-13 — Testar formatação de datas e
números; T-19 — Testar services e cache com fetch controlado; T-32 — Testar
estados e concorrência do hook; T-33 — Testar busca e seleção de cidade; T-34 —
Testar componente de carregamento; T-35 — Testar componente de erro; T-53 —
Testar componente de estado vazio; T-36 — Testar apresentação meteorológica;
T-37 — Testar controles de unidade e atualização; T-40 — Cobrir o fluxo
principal com E2E em viewport mobile; T-41 — Testar
busca sem resultados e correção com E2E; T-42 — Testar erros e resposta parcial
do forecast com E2E; T-43 — Cobrir cache e atualização explícita com E2E; T-44 —
Testar descarte de resposta obsoleta com E2E; T-45 — Testar unidade e
persistência com E2E.

### Hardening

T-46 — Validar responsividade em diferentes viewports; T-47 — Verificar
acessibilidade da interface; T-48 — Validar compatibilidade entre navegadores;
T-49 — Planejar smoke manual em dispositivos reais; T-50 — Medir desempenho
percebido e carregamento; T-51 — Verificar limite do bundle inicial; T-52 —
Validar sucesso do fluxo principal em uso mobile.

## Entrega 1 — Fundações

### T-01 — Preparar dependências React e Vite
- **Tipo:** Infra
- **Descrição:** Configurar as dependências e scripts-base do projeto React com Vite.
- **Critérios de aceite:**
  - `package.json` declara React, Vite e scripts de desenvolvimento/build necessários ao MVP.
  - `pnpm-lock.yaml` corresponde ao manifesto e permite instalação reproduzível.
- **Dependências:** Nenhuma
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`
- **Rastreabilidade:** RNF-06, RNF-08

### T-02 — Definir contratos de domínio
- **Tipo:** Data
- **Descrição:** Criar os tipos compartilhados de cidade, clima, previsão, cache, unidade e estados de busca/consulta conforme o plano.
- **Critérios de aceite:**
  - `src/types/weather.ts` define `City`, `CurrentWeather`, `DailyForecast`, `WeatherSnapshot`, `CachedWeather`, `TemperatureUnit`, `SearchState`, `WeatherState` e `RequestError`.
  - Ausência de medida meteorológica é representada como `null`; sucesso parcial, cache desatualizado e categorias de erro são representáveis sem valores inventados.
  - Os tipos compilam em TypeScript strict sem casts inseguros.
  - Para a etapa de UI, expor também `Unit`, `ForecastDay` e `WeatherData`, compatíveis com os contratos do plano, e `MOCK_WEATHER` em `src/mocks/weather.ts`, com cidade, clima atual e exatamente cinco dias consecutivos de dados fictícios.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/types/weather.ts`
- **Rastreabilidade:** RF-01 a RF-09, AC-04, AC-18 a AC-23

### T-03 — Mapear códigos meteorológicos WMO
- **Tipo:** Data
- **Descrição:** Criar função pura que traduza códigos meteorológicos WMO para descrições em pt-BR.
- **Critérios de aceite:**
  - Códigos previstos pelo serviço têm descrição em português.
  - Código desconhecido produz uma indicação segura de condição indisponível e não impede a exibição das demais medidas.
  - A função não depende de React, rede ou estado global.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`
- **Rastreabilidade:** RF-03, RF-04, RNF-07, AC-03

### T-04 — Formatar datas e números no fuso da localidade
- **Tipo:** Data
- **Descrição:** Centralizar formatação pt-BR de datas, horários e números meteorológicos, preservando as datas locais fornecidas pela API.
- **Critérios de aceite:**
  - Datas diárias `YYYY-MM-DD` não são interpretadas como instantes UTC nem deslocadas pelo fuso do navegador.
  - Horários recebidos são formatados no fuso da cidade; números usam convenções pt-BR.
  - Funções de formatação são determinísticas e não fazem I/O.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/lib/format.ts`
- **Rastreabilidade:** RF-04, RF-09, RNF-07, AC-05, AC-17

### T-05 — Criar o shell inicial da aplicação
- **Tipo:** UI
- **Descrição:** Criar o componente raiz `App`.
- **Critérios de aceite:**
  - `App` renderiza um shell inicial sem erros.
  - O shell não depende da API.
  - Na etapa mock, o layout reúne marca, busca, unidade e os cinco estados de demonstração; Salvador simula sucesso após 600 ms, outras cidades ficam sem resultados, e o seletor permite testar erro/retry sem rede. A unidade permanece como estado de UI e não altera o mock.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/App.tsx`
- **Rastreabilidade:** RNF-01, RNF-08

### T-06 — Preparar a entrada React
- **Tipo:** Infra
- **Descrição:** Criar a entrada React e a página HTML da SPA.
- **Critérios de aceite:**
  - O documento HTML fornece o ponto de montagem e carrega a entrada React.
  - A entrada monta `App` sem depender de backend ou credenciais.
- **Dependências:** T-01, T-05
- **Arquivos prováveis:** `src/main.tsx`, `index.html`
- **Rastreabilidade:** RNF-06, RNF-08

### T-07 — Adicionar dependências Tailwind
- **Tipo:** Infra
- **Descrição:** Adicionar as dependências Tailwind ao projeto.
- **Critérios de aceite:**
  - As dependências Tailwind são gerenciadas por pnpm e estão disponíveis para configuração no projeto.
- **Dependências:** T-06
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`
- **Rastreabilidade:** RNF-01

### T-08 — Configurar processamento Tailwind
- **Tipo:** Infra
- **Descrição:** Configurar o processamento Tailwind para a aplicação.
- **Critérios de aceite:**
  - Configuração Tailwind e PostCSS processa as classes usadas pela aplicação.
- **Dependências:** T-07
- **Arquivos prováveis:** `tailwind.config.*`, `postcss.config.*`
- **Rastreabilidade:** RNF-01

### T-09 — Definir estilos globais do tema
- **Tipo:** UI
- **Descrição:** Criar a base visual dark com foco visível e layout sem rolagem horizontal.
- **Critérios de aceite:**
  - Estilos globais oferecem tema dark e foco visível.
  - A base visual não causa rolagem horizontal a partir de 360 px.
- **Dependências:** T-08
- **Arquivos prováveis:** `src/styles/index.css`
- **Rastreabilidade:** RNF-01, RNF-03

### T-10 — Implementar conversão e formatação de temperatura
- **Tipo:** Data
- **Descrição:** Implementar conversão de Celsius canônico para Fahrenheit e formatação arredondada somente na apresentação.
- **Critérios de aceite:**
  - Celsius é preservado sem arredondamento no domínio; Fahrenheit usa `(C × 9/5) + 32`.
  - O arredondamento ao inteiro mais próximo ocorre apenas ao formatar.
  - Casos 0 °C → 32 °F, 100 °C → 212 °F e −40 °C → −40 °F são atendidos sem acumular erro ao alternar unidades.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Rastreabilidade:** RF-05, AC-09, AC-10

### T-11 — Testar conversão de unidade com testes unitários
- **Tipo:** Test
- **Descrição:** Testar unitariamente as funções puras de conversão e arredondamento de temperatura, sem depender de componentes ou da rede.
- **Critérios de aceite:**
  - Testes unitários cobrem conversões conhecidas, valores negativos e fracionários, incluindo 0 °C → 32 °F, 100 °C → 212 °F e −40 °C → −40 °F.
  - Conversão de −17,8 °C é formatada como 0 °F sem alterar o valor canônico.
  - A conversão repetida entre unidades sempre parte do Celsius canônico, sem erro cumulativo.
  - Os testes passam sem acesso à rede, dependência do relógio real ou renderização de UI.
- **Dependências:** T-10
- **Arquivos prováveis:** `src/lib/temperature.test.ts`
- **Rastreabilidade:** RF-05, AC-09, AC-10

### T-12 — Testar descrições de códigos meteorológicos
- **Tipo:** Test
- **Descrição:** Cobrir o mapeamento de códigos WMO para descrições em pt-BR.
- **Critérios de aceite:**
  - Testes cobrem códigos WMO conhecidos e desconhecidos.
  - Os testes passam sem acesso à rede.
- **Dependências:** T-03
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`
- **Rastreabilidade:** RF-03, RF-04, RNF-07, AC-03

### T-13 — Testar formatação de datas e números
- **Tipo:** Test
- **Descrição:** Cobrir a formatação pt-BR e a preservação de datas locais em testes unitários.
- **Critérios de aceite:**
  - Testes verificam números meteorológicos e datas próximas à virada do dia em fuso diferente do navegador.
  - A data local fornecida pela API permanece inalterada, sem dependência do relógio real.
- **Dependências:** T-04
- **Arquivos prováveis:** `src/lib/formatters.test.ts`
- **Rastreabilidade:** RF-04, RF-09, RNF-07, AC-05, AC-17

## Entrega 2 — Integração com Open-Meteo

### T-14 — Implementar busca e normalização de cidades
- **Tipo:** Data
- **Descrição:** Criar o service de geocodificação com validação da resposta e mapeamento para `City`.
- **Critérios de aceite:**
  - Envia consulta aparada para Open-Meteo com `count=5`, `language=pt` e `format=json`; não busca enquanto a pessoa digita.
  - Converte o identificador para string, preserva coordenadas e inclui país, região e fuso somente quando fornecidos.
  - Distingue lista vazia de erro; valida status e estrutura e classifica falha de rede, HTTP, timeout e resposta inválida.
  - A requisição tem limite de 10 segundos e aceita cancelamento.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/services/geocodingService.ts`
- **Rastreabilidade:** RF-01, RF-07, RF-08, RNF-09, RNF-10, AC-01, AC-07, AC-08

### T-15 — Implementar consulta e normalização da previsão
- **Tipo:** Data
- **Descrição:** Criar o service de forecast que consulta clima atual e cinco dias diários e normaliza dados validados para o domínio.
- **Critérios de aceite:**
  - A chamada usa coordenadas selecionadas, métricas especificadas pelo plano, unidades canônicas (`celsius`, `kmh`, `mm`), `timezone=auto` e cinco dias.
  - Medidas ausentes ou inválidas tornam-se `null`; arrays diários são combinados por índice, dias sem data válida são omitidos e blocos ausentes não descartam dados utilizáveis do outro bloco.
  - Preservar o fuso válido da resposta; se ausente ou inválido, usar o fuso válido da cidade ou `UTC`. Nenhuma medida utilizável resulta em erro `unavailable`.
  - HTTP, JSON malformado, estrutura incompatível, rede e timeout são classificados sem apresentar erro como sucesso.
- **Dependências:** T-02, T-03, T-04
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Rastreabilidade:** RF-02 a RF-04, RF-07, RF-09, RNF-10, AC-02 a AC-06, AC-21

### T-16 — Adicionar cache por localidade e atualização explícita
- **Tipo:** Data
- **Descrição:** Implementar cache em memória do snapshot meteorológico por coordenadas, com validade de dez minutos e bypass para atualização.
- **Critérios de aceite:**
  - Seleção normal reutiliza cache fresco até dez minutos, isolado por localidade.
  - Snapshot expirado continua disponível como anterior caso a nova consulta falhe, incluindo instante de recebimento e idade.
  - Atualizar ignora cache mesmo quando fresco e só substitui o snapshot armazenado após resposta bem-sucedida.
  - Falha com cache mantém estado de erro e nunca apresenta o snapshot antigo como atual.
- **Dependências:** T-15
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Rastreabilidade:** RF-09, RNF-08, RNF-09, AC-17 a AC-19, AC-28

### T-17 — Garantir timeout da geocodificação
- **Tipo:** Data
- **Descrição:** Aplicar timeout e cancelamento à consulta de geocodificação.
- **Critérios de aceite:**
  - Geocodificação aceita `AbortSignal` e encerra operações após dez segundos com erro `timeout`.
  - Cancelamento intencional não é apresentado como erro; HTTP 429 permanece identificável como limite de consultas.
- **Dependências:** T-14
- **Arquivos prováveis:** `src/services/geocodingService.ts`, `src/types/weather.ts`
- **Rastreabilidade:** RF-07, RF-09, RNF-04, RNF-09, AC-22, AC-29

### T-18 — Garantir timeout e cancelamento do forecast
- **Tipo:** Data
- **Descrição:** Aplicar timeout e cancelamento à consulta meteorológica.
- **Critérios de aceite:**
  - Forecast aceita `AbortSignal` e encerra operações após dez segundos com erro `timeout`.
  - Cancelamento intencional não é apresentado como erro; HTTP 429 permanece identificável como limite de consultas.
- **Dependências:** T-15, T-17
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/types/weather.ts`
- **Rastreabilidade:** RF-07, RF-09, RNF-04, RNF-09, AC-22, AC-29

### T-19 — Testar services e cache com fetch controlado
- **Tipo:** Test
- **Descrição:** Testar os services de geocodificação e previsão com `fetch` mockado e relógio controlado, cobrindo endpoints, normalização, erros e regras do cache sem acessar a rede real.
- **Critérios de aceite:**
  - Mocks de `fetch` verificam URLs/parâmetros, coordenadas, unidades, fuso, limite de resultados, cancelamento e número de chamadas por operação.
  - Cobrem sucesso, ausência de resultados, rede, HTTP não-2xx incluindo 429, JSON inválido, estrutura incompatível, resposta parcial e indisponibilidade total.
  - Testam validade imediatamente antes, no limite e após dez minutos, isolamento por cidade, bypass de atualização e timeout.
  - Em falha, verificam idade do cache anterior ou ausência de dados fictícios quando não existe cache.
  - A suíte é determinística e não depende da disponibilidade dos endpoints Open-Meteo.
- **Dependências:** T-14, T-15, T-16, T-17, T-18
- **Arquivos prováveis:** `src/services/geocodingService.test.ts`, `src/services/weatherService.test.ts`
- **Rastreabilidade:** RF-01 a RF-04, RF-07, RF-09, RNF-04, RNF-09

## Entrega 3 — Orquestração e interface

### T-20 — Orquestrar busca, seleção, consulta e retry
> Recorte solicitado neste incremento: expor um único `status` e carregar
> automaticamente o clima da primeira cidade encontrada. `selectCity` permite
> consultar outra cidade e `retry` repete a última ação iniciada. A implementação
> não inclui cache; a integração com o `App` ocorre na T-30/T-54.

- **Tipo:** Data
- **Descrição:** Implementar `useWeather` para coordenar estados da tela, seleção explícita, consultas, retry e proteção contra respostas obsoletas.
- **Critérios de aceite:**
  - O hook expõe estados `idle`, `loading`, `success`, `empty` e `error` para busca e clima, com ações tipadas.
  - Busca válida exige pelo menos dois caracteres após aparar espaços; busca vazia/curta informa validação sem chamar a rede.
  - Resultados não são selecionados automaticamente; seleção consulta as coordenadas correspondentes.
  - Retry repete a busca ou consulta correta; retry de atualização mantém bypass do cache.
  - Requisições concorrentes são canceladas quando possível e identificadores sequenciais impedem respostas antigas de alterar o estado.
- **Dependências:** T-02, T-14, T-15, T-16, T-17, T-18
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Rastreabilidade:** RF-01, RF-02, RF-07, RF-09, AC-01, AC-02, AC-13 a AC-16, AC-22, AC-29

### T-21 — Persistir preferência de unidade
- **Tipo:** Data
- **Descrição:** Integrar ao hook a preferência °C/°F, persistindo somente essa escolha em `localStorage`.
- **Critérios de aceite:**
  - Unidade inicial é °C quando não há valor, quando o valor é inválido ou quando o armazenamento não pode ser acessado.
  - Alterar unidade atualiza estado e persistência sem alterar snapshot/cache ou iniciar `fetch`.
  - Todas as temperaturas derivam do valor original em Celsius e permanecem consistentes após alternâncias repetidas.
- **Dependências:** T-10, T-20
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Rastreabilidade:** RF-05, RF-06, AC-09 a AC-12

### T-22 — Criar formulário acessível de busca
- **Tipo:** UI
- **Descrição:** Criar formulário com envio explícito, mensagens de validação associadas ao campo e suporte a botão e Enter.
- **Critérios de aceite:**
  - Campo tem rótulo acessível; espaços externos são removidos e consulta inválida não inicia requisição.
  - Envio explícito por botão ou Enter inicia busca; digitação isolada não inicia rede.
  - Erro de validação é anunciado e associado ao campo sem depender apenas de cor.
- **Dependências:** T-06, T-20
- **Arquivos prováveis:** `src/components/SearchBar.tsx`
- **Contrato da UI:** `onSearch(city: string)` recebe a consulta válida sem espaços externos; `disabled` bloqueia edição e envio. O formulário expõe `role="search"`.
- **Rastreabilidade:** RF-01, RNF-03, RNF-09, AC-01, AC-20

### T-23 — Apresentar resultados selecionáveis de cidade
- **Tipo:** UI
- **Descrição:** Exibir resultados de geocodificação com contexto regional e seleção explícita por teclado ou toque.
- **Critérios de aceite:**
  - Cada resultado exibe nome e metadados regionais/país somente quando disponíveis.
  - Cada item pode ser selecionado sem seleção automática e informa claramente a cidade escolhida.
  - A lista permite navegação por teclado, foco visível e alvos de interação de pelo menos 44 × 44 px.
- **Dependências:** T-06, T-20
- **Arquivos prováveis:** `src/components/CityResults.tsx`
- **Rastreabilidade:** RF-02, RF-08, RNF-01, RNF-03, AC-02, AC-07, AC-08

### T-24 — Implementar estado de carregamento
- **Tipo:** UI
- **Descrição:** Implementar o componente acessível de carregamento da busca e da consulta meteorológica.
- **Critérios de aceite:**
  - Carregamento é anunciado acessivelmente e removido ao concluir ou falhar.
  - `LoadingState` usa `role="status"`, recebe `message` opcional e respeita movimento reduzido; o pai controla sua montagem.
- **Dependências:** T-06, T-20
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`
- **Rastreabilidade:** RF-07, RNF-03, AC-13 a AC-16

### T-25 — Implementar estado vazio da busca
- **Tipo:** UI
- **Descrição:** Exibir busca sem correspondências como estado distinto de erro e permitir corrigir a consulta.
- **Critérios de aceite:**
  - O estado vazio informa que nenhuma cidade foi encontrada e permite iniciar uma nova busca.
  - O componente não é apresentado como erro técnico.
  - `EmptyState` usa `role="status"` e recebe `title` e `hint` opcionais; por padrão informa ausência de cidades e orienta corrigir a consulta no formulário de busca, que permanece disponível na composição.
- **Dependências:** T-06, T-20
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`
- **Rastreabilidade:** RF-07, RNF-03, AC-14

### T-26 — Implementar estado de erro e dados em cache
- **Tipo:** UI
- **Descrição:** Apresentar falhas de busca/consulta e ação apropriada para tentar novamente.
- **Critérios de aceite:**
  - Erros exibem mensagem pt-BR compreensível e ação de retry sem detalhes técnicos.
  - Cache antigo é identificado como desatualizado e informa horário de recebimento e idade.
  - Timeout e HTTP 429 têm mensagem identificável.
  - `ErrorState` recebe `message` em pt-BR e `onRetry`; anuncia a mensagem com `role="alert"` e oferece botão “Tentar novamente”. Classificação de erros e apresentação do cache ficam a cargo da composição/hook.
- **Dependências:** T-06, T-20
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`
- **Rastreabilidade:** RF-07, RF-09, RNF-03, RNF-04, RNF-08, AC-15 a AC-19

### T-27 — Exibir clima atual e medidas indisponíveis
- **Tipo:** UI
- **Descrição:** Criar apresentação das condições atuais, convertendo todas as temperaturas pela unidade escolhida.
- **Critérios de aceite:**
  - Exibe cidade, temperatura, condição em pt-BR, sensação térmica, umidade, vento, UV e precipitação com rótulos e unidades.
  - O hero recebe `city`, `current` e `unit`; usa `lib/weatherCodes` para condição/ícone e `lib/temperature` para temperaturas. Inclui pressão na superfície (`pressureHpa`) em hPa ou “Indisponível”. Fonte e horário permanecem na composição da tela, pois não fazem parte dessas props.
  - Campo ausente ou inválido, inclusive UV e precipitação, aparece como “Indisponível”, nunca como zero.
  - Todas as temperaturas refletem a unidade atual; fonte Open-Meteo e horário de recebimento são exibidos no fuso local.
- **Dependências:** T-02, T-03, T-04, T-10, T-21
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Rastreabilidade:** RF-03, RF-05, RF-09, RNF-07, AC-03, AC-04, AC-09, AC-10, AC-17, AC-23

### T-28 — Exibir previsão diária de cinco dias
- **Tipo:** UI
- **Descrição:** Criar lista de resumos diários que associa data, máxima, mínima e condição ao mesmo dia.
- **Critérios de aceite:**
  - Com cinco ou mais dias válidos, exibe exatamente cinco dias consecutivos, do dia local atual até quatro dias depois, cada um com data, máxima, mínima e condição.
  - Datas permanecem no fuso da localidade e temperaturas usam a mesma unidade da tela.
  - Com menos de cinco dias válidos, exibe somente os disponíveis, identifica a previsão como incompleta e não cria dias fictícios; campos ausentes aparecem como “Indisponível”.
  - `ForecastList` recebe `forecast`, `unit` e `referenceDate` opcional (data local de hoje; padrão: primeiro dia do snapshot). `ForecastCard` recebe `day`, `unit` e `referenceDate`. O rótulo vem de `lib/format`, com Hoje/Amanhã por diferença de datas e dia da semana nos demais casos.
  - Cada card mostra ícone e condição WMO, máxima/mínima na unidade atual e `precipitationProbability` em porcentagem ou “Indisponível”; a lista usa `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`.
- **Dependências:** T-02, T-03, T-04, T-10, T-21
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`
- **Rastreabilidade:** RF-04, RF-05, RNF-07, AC-05, AC-06, AC-09, AC-21

### T-29 — Implementar controles de unidade e atualização
- **Tipo:** UI
- **Descrição:** Adicionar controles acessíveis para alternar °C/°F e atualizar explicitamente os dados da cidade selecionada.
- **Critérios de aceite:**
  - Controle de unidade identifica a opção selecionada e não inicia requisição.
  - `UnitToggle` recebe `unit: Unit` e `onChange(unit: Unit)`, usa dois botões °C/°F com `aria-pressed` em um `role="group"` nomeado e oferece Tab/Shift+Tab para navegar e Enter/Espaço para ativar. A seleção é controlada pelo componente pai; acionar a opção ativa não emite mudança.
  - Ação “Atualizar” só aparece habilitada com cidade selecionada, comunica carregamento e ignora cache.
  - Se a atualização falhar, retry também ignora cache e o snapshot anterior permanece identificado como desatualizado.
- **Dependências:** T-21, T-24
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/components/WeatherRefreshButton.tsx`
- **Rastreabilidade:** RF-05 a RF-07, RF-09, RNF-03, AC-09 a AC-19, AC-28

### T-30 — Compor a tela principal
- **Tipo:** UI
- **Descrição:** Conectar em `App` a busca, seleção, estados e clima atual ao hook para entregar a primeira fatia funcional.
- **Critérios de aceite:**
  - Busca, seleção e clima atual funcionam nos estados inicial, carregando, vazio, erro e sucesso.
  - A aplicação renderiza e seus recursos estáticos carregam sem disponibilidade da Open-Meteo.
- **Dependências:** T-06, T-09, T-20, T-21, T-22, T-23, T-24, T-25, T-26, T-27
- **Arquivos prováveis:** `src/App.tsx`
- **Rastreabilidade:** RF-01 a RF-03, RF-07, RF-08, RNF-04, RNF-08

### T-54 — Completar composição com previsão e controles
> Recorte implementado: `App` consome `useWeather`, apresenta os cinco estados,
> conecta `ErrorState` a `retry` e mantém unidade local para clima e previsão.
> O mock e o seletor de demonstração foram removidos da aplicação. Atualização
> explícita, cache e persistência permanecem fora deste incremento.

- **Tipo:** UI
- **Descrição:** Integrar em `App` a previsão diária, a alternância de unidade e a atualização explícita à tela inicial da T-30.
- **Critérios de aceite:**
  - A tela exibe os cinco dias e oferece alternância de unidade e atualização explícita para a cidade selecionada.
  - O fluxo completo permanece funcional em sucesso completo e parcial, sem remover os estados inicial, carregando, vazio e erro da T-30.
- **Dependências:** T-28, T-29, T-30
- **Arquivos prováveis:** `src/App.tsx`
- **Rastreabilidade:** RF-04 a RF-07, RF-09, RNF-04, RNF-08

### T-31 — Aplicar layout responsivo e hierarquia visual
- **Tipo:** UI
- **Descrição:** Ajustar a composição visual da tela para viewports mobile e desktop.
- **Critérios de aceite:**
  - Layout atende viewports de 360 × 800 e 1280 × 800 sem rolagem horizontal ou sobreposição.
  - Texto e controles têm hierarquia clara e contraste compatível com WCAG 2.1 AA.
  - O foco permanece visível com a navegação por teclado.
- **Dependências:** T-09, T-54
- **Arquivos prováveis:** `src/styles/index.css`, `src/App.tsx`
- **Rastreabilidade:** RNF-01, RNF-03

## Entrega 4 — Testes de integração e hardening

### T-32 — Testar estados e concorrência do hook
- **Tipo:** Test
- **Descrição:** Testar transições de estado, retries, preferência e descarte de respostas tardias substituindo os services.
- **Critérios de aceite:**
  - Testes cobrem busca inválida sem rede, busca vazia, sucesso, erro e retry, seleção e consulta do clima.
  - Testes cobrem alternância/persistência de unidade, armazenamento inacessível e ausência de chamadas ao alternar unidade.
  - Busca ou cidade mais recente prevalece quando respostas chegam fora de ordem; loading termina em sucesso ou erro.
- **Dependências:** T-20, T-21
- **Arquivos prováveis:** `src/hooks/useWeather.test.ts`
- **Rastreabilidade:** RF-01, RF-02, RF-05 a RF-07, RF-09, AC-11 a AC-16, AC-22, AC-29

### T-33 — Testar busca e seleção de cidade
- **Tipo:** Test
- **Descrição:** Validar os componentes de busca e seleção de cidade com Testing Library.
- **Critérios de aceite:**
  - Testes verificam os rótulos do formulário e envio por botão/Enter.
  - Testes verificam resultados com contexto regional e seleção explícita por teclado ou toque.
- **Dependências:** T-22, T-23
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `src/components/CityResults.test.tsx`
- **Rastreabilidade:** RF-01, RF-02, RF-08, RNF-03, AC-01, AC-02, AC-07, AC-08, AC-20

### T-34 — Testar componente de carregamento
- **Tipo:** Test
- **Descrição:** Validar isoladamente o componente de carregamento com Testing Library.
- **Critérios de aceite:**
  - Enquanto a operação está pendente, o loading é apresentado e anunciado acessivelmente.
  - Após a operação concluir ou falhar, o loading deixa de ser apresentado.
- **Dependências:** T-24
- **Arquivos prováveis:** `src/components/states/LoadingState.test.tsx`
- **Rastreabilidade:** RF-07, RNF-03, AC-13, AC-16
### T-35 — Testar componente de erro
- **Tipo:** Test
- **Descrição:** Validar isoladamente o componente de erro com Testing Library, incluindo recuperação e dados em cache.
- **Critérios de aceite:**
  - Erros apresentam retry e mensagens identificáveis para timeout e HTTP 429.
  - Quando aplicável, cache antigo informa que os dados estão desatualizados, horário de recebimento e idade.
- **Dependências:** T-26
- **Arquivos prováveis:** `src/components/states/ErrorState.test.tsx`
- **Rastreabilidade:** RF-07, RF-09, RNF-03, RNF-04, AC-15, AC-17 a AC-19
### T-36 — Testar apresentação meteorológica
- **Tipo:** Test
- **Descrição:** Validar conteúdo do clima atual e da previsão diária com Testing Library.
- **Critérios de aceite:**
  - Testes cobrem temperaturas consistentes e medidas indisponíveis.
  - Testes cobrem previsão parcial sem inventar valores ou dias.
- **Dependências:** T-27, T-28
- **Arquivos prováveis:** `src/components/CurrentWeather.test.tsx`, `src/components/ForecastList.test.tsx`
- **Rastreabilidade:** RF-03, RF-04, RF-05, RNF-07, AC-03 a AC-06, AC-09, AC-10

### T-37 — Testar controles de unidade e atualização
- **Tipo:** Test
- **Descrição:** Validar controles de temperatura e atualização explícita com Testing Library.
- **Critérios de aceite:**
  - Controles são alcançáveis e operáveis por teclado.
  - A alternância da unidade e a atualização são identificadas por rótulos acessíveis.
- **Dependências:** T-29
- **Arquivos prováveis:** `src/components/UnitToggle.test.tsx`, `src/components/WeatherRefreshButton.test.tsx`
- **Rastreabilidade:** RF-05, RF-06, RF-09, RNF-03, AC-09 a AC-12, AC-17 a AC-19

### T-38 — Configurar Playwright
- **Tipo:** Infra
- **Descrição:** Preparar a execução E2E no navegador e a matriz de navegadores.
- **Critérios de aceite:**
  - Playwright inicia a aplicação e executa testes em Chromium, Firefox e WebKit.
  - A configuração não requer disponibilidade da Open-Meteo.
- **Dependências:** T-30, T-31
- **Arquivos prováveis:** `playwright.config.ts`
- **Rastreabilidade:** RF-01 a RF-09, RNF-04, RNF-05, RNF-09

### T-39 — Preparar fixtures e interceptação dos endpoints
- **Tipo:** Test
- **Descrição:** Criar dados determinísticos e helpers para interceptar geocoding e forecast nos E2E, sem substituir o hook.
- **Critérios de aceite:**
  - Fixtures cobrem resultados com metadados, dados completos e parciais.
  - Helpers controlam respostas e erros de ambos os endpoints sem rede real ou pausas fixas.
- **Dependências:** T-38
- **Arquivos prováveis:** `tests/e2e/fixtures/`, `tests/e2e/helpers.ts`
- **Rastreabilidade:** RF-01 a RF-09, RNF-04, RNF-09

### T-40 — Cobrir o fluxo principal com E2E em viewport mobile
- **Tipo:** Test
- **Descrição:** Implementar o E2E do fluxo principal de busca, desambiguação e consulta, executando-o em viewport mobile.
- **Critérios de aceite:**
  - Fluxo busca, distingue cidades homônimas, seleciona uma e confere condições atuais, cinco dias, fonte e recebimento.
  - Campos exibidos correspondem à localidade selecionada e às respostas dos endpoints interceptados.
- O fluxo completo passa em viewport de 360 × 800 px, sem rolagem horizontal e com interações utilizáveis por toque.
- **Dependências:** T-30, T-31, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather-search.spec.ts`
- **Rastreabilidade:** RF-01 a RF-04, RF-08, RF-09, RNF-01, AC-01 a AC-08, AC-21, AC-24

### T-41 — Testar busca sem resultados e correção com E2E
- **Tipo:** Test
- **Descrição:** Verificar a recuperação de uma busca válida sem correspondências.
- **Critérios de aceite:**
  - Busca sem resultados apresenta o estado vazio e permite corrigir a consulta.
  - A nova busca bem-sucedida exibe resultados selecionáveis.
  - Falha de geocodificação apresenta retry; uma nova tentativa bem-sucedida exibe resultados.
- **Dependências:** T-30, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather-search-recovery.spec.ts`
- **Rastreabilidade:** RF-01, RF-07, AC-13 a AC-15

### T-42 — Testar erros e resposta parcial do forecast com E2E
- **Tipo:** Test
- **Descrição:** Verificar retry após falha do forecast, timeout e apresentação de resposta parcial.
- **Critérios de aceite:**
  - Erro de forecast oferece retry e uma nova tentativa bem-sucedida atualiza a tela.
  - Timeout encerra o carregamento e mostra erro recuperável.
  - Campos e dias ausentes são identificados como indisponíveis, nunca inventados.
- **Dependências:** T-30, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`
- **Rastreabilidade:** RF-03, RF-04, RF-07, RF-09, AC-03 a AC-06, AC-15 a AC-19

### T-43 — Cobrir cache e atualização explícita com E2E
- **Tipo:** Test
- **Descrição:** Verificar cache, atualização explícita e fallback para dados anteriores.
- **Critérios de aceite:**
  - Cache fresco evita chamada adicional; atualização explícita e retry após falha fazem nova chamada.
  - Falha com cache mostra snapshot antigo com idade; sucesso da atualização substitui snapshot e horário.
  - Os dados anteriores são identificados como cache e não são apresentados como atuais.
- **Dependências:** T-30, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather-freshness.spec.ts`
- **Rastreabilidade:** RF-07, RF-09, RNF-09, AC-17 a AC-19, AC-28, AC-29

### T-44 — Testar descarte de resposta obsoleta com E2E
- **Tipo:** Test
- **Descrição:** Verificar que a seleção mais recente prevalece sobre resposta meteorológica fora de ordem.
- **Critérios de aceite:**
  - Uma resposta atrasada de uma localidade anteriormente selecionada não substitui os dados da seleção atual.
- **Dependências:** T-30, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather-concurrency.spec.ts`
- **Rastreabilidade:** RF-02, RF-09, RNF-09, AC-22, AC-29

### T-45 — Testar unidade e persistência com E2E
- **Tipo:** Test
- **Descrição:** Verificar a conversão de todas as temperaturas e a persistência da unidade escolhida.
- **Critérios de aceite:**
  - Alternar unidade atualiza todas as temperaturas sem nova chamada à API.
  - Recarregar mantém uma preferência válida.
- **Dependências:** T-30, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather-units.spec.ts`
- **Rastreabilidade:** RF-05, RF-06, AC-09 a AC-12

### T-46 — Validar responsividade em diferentes viewports
- **Tipo:** Test
- **Descrição:** Verificar o layout em viewports móveis e desktop.
- **Critérios de aceite:**
- Fluxo principal e estados de loading, erro, vazio e sucesso são verificados em 360 × 800 e 1280 × 800.
- Nenhum viewport apresenta rolagem horizontal ou controles sobrepostos.
- **Dependências:** T-30, T-31, T-38, T-39
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`
- **Rastreabilidade:** RNF-01, AC-24

### T-47 — Verificar acessibilidade da interface
- **Tipo:** Test
- **Descrição:** Validar alvos de toque, teclado, foco, anúncios de estado e contraste.
- **Critérios de aceite:**
  - Nos viewports 360 × 800 e 1280 × 800, todos os alvos interativos medem pelo menos 44 × 44 px.
  - A verificação automatizada não identifica violações WCAG 2.1 AA nas regras cobertas; a revisão manual confirma operação por teclado, foco visível e anúncio de busca, carregamento, resultados e erros.
  - O contraste de texto normal é de pelo menos 4,5:1; as medições e eventuais limitações da ferramenta ficam registradas.
- **Dependências:** T-30, T-31, T-33, T-34, T-35, T-36, T-37, T-38
- **Arquivos prováveis:** `tests/e2e/weather-accessibility.spec.ts`
- **Rastreabilidade:** RNF-01, RNF-03, AC-24, AC-26

### T-48 — Validar compatibilidade entre navegadores
- **Tipo:** Test
- **Descrição:** Executar o fluxo principal na matriz de navegadores automatizada.
- **Critérios de aceite:**
  - Chromium, Firefox e WebKit executam o fluxo principal na suíte.
- **Dependências:** T-38, T-40
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/weather-search.spec.ts`
- **Rastreabilidade:** RNF-05, AC-27

### T-49 — Planejar smoke manual em dispositivos reais
- **Tipo:** Test
- **Descrição:** Registrar a validação manual de compatibilidade que não pode ser comprovada por emulação.
- **Critérios de aceite:**
  - O roteiro cobre Chrome, Edge, Safari/iOS e Chrome/Android em dispositivos reais.
  - O registro distingue claramente os resultados de dispositivos reais daqueles da suíte Playwright.
- **Dependências:** T-48
- **Arquivos prováveis:** `tests/e2e/README.md`
- **Rastreabilidade:** RNF-05, AC-27

### T-50 — Medir desempenho percebido e carregamento
- **Tipo:** Test
- **Descrição:** Medir o carregamento e o feedback visual em build de produção.
- **Critérios de aceite:**
  - Em build de produção, viewport 360 × 800, rede 4G e cache frio, dez medições registram p75 LCP < 2,5 s e p75 TTI < 3 s.
  - Ao iniciar busca, consulta meteorológica ou atualização explícita, o indicador visual de carregamento aparece em até 100 ms.
- **Dependências:** T-30, T-31
- **Arquivos prováveis:** `tests/performance/`
- **Rastreabilidade:** RNF-02, AC-25

### T-51 — Verificar limite do bundle inicial
- **Tipo:** Test
- **Descrição:** Medir o tamanho gzip do bundle inicial de produção.
- **Critérios de aceite:**
  - O tamanho do bundle inicial de produção, compactado em gzip, não excede 200 KB.
- **Dependências:** T-06, T-07, T-08, T-09, T-30, T-31
- **Arquivos prováveis:** `package.json`, `vite.config.ts`
- **Rastreabilidade:** RNF-02, AC-25

### T-52 — Validar sucesso do fluxo principal em uso mobile
- **Tipo:** Test
- **Descrição:** Avaliar se a informação principal é encontrada dentro do tempo definido pela spec.
- **Critérios de aceite:**
  - Teste de usabilidade verifica se a pessoa identifica cidade, temperatura e condição atual em até 15 segundos.
- **Dependências:** T-30, T-31
- **Arquivos prováveis:** `tests/usability/`
- **Rastreabilidade:** RNF-11, AC-30
### T-53 — Testar componente de estado vazio
- **Tipo:** Test
- **Descrição:** Validar isoladamente o componente de estado vazio da busca com Testing Library.
- **Critérios de aceite:**
  - O estado vazio informa que a busca não encontrou resultados e é distinguível visual e semanticamente do erro.
  - A ação para corrigir a busca está disponível e pode ser acionada por teclado.
- **Dependências:** T-25
- **Arquivos prováveis:** `src/components/states/EmptyState.test.tsx`
- **Rastreabilidade:** RF-07, RNF-03, AC-14

## Matriz de rastreabilidade dos requisitos funcionais

As tarefas de implementação constroem o comportamento; as tarefas de verificação
cobrem testes automatizados ou validação do comportamento. Os IDs RF e suas
descrições correspondem à seção [Functional Requirements da spec](../specs/weather-app-spec.md#functional-requirements).

| Requisito funcional | Tarefas de implementação | Tarefas de verificação |
| --- | --- | --- |
| RF-01 — Busca de cidades | T-14, T-20, T-22, T-30 | T-19, T-32, T-33, T-40, T-41 |
| RF-02 — Seleção de cidade | T-14, T-15, T-20, T-23, T-30 | T-32, T-33, T-40, T-44 |
| RF-03 — Clima atual | T-03, T-15, T-27, T-30 | T-12, T-36, T-42 |
| RF-04 — Previsão diária | T-04, T-15, T-28, T-54 | T-13, T-36, T-42 |
| RF-05 — Alternância de unidade de temperatura | T-10, T-21, T-27, T-28, T-29, T-54 | T-11, T-32, T-36, T-37, T-45 |
| RF-06 — Persistência da unidade | T-21, T-54 | T-32, T-37, T-45 |
| RF-07 — Estados da interface e nova tentativa | T-14, T-15, T-16, T-17, T-18, T-20, T-24, T-25, T-26, T-29, T-54 | T-19, T-32, T-34, T-35, T-41, T-42, T-53 |
| RF-08 — Desambiguação de cidades | T-14, T-23 | T-33, T-40 |
| RF-09 — Atualidade, procedência e uso eficiente | T-15, T-16, T-20, T-26, T-27, T-29, T-54 | T-19, T-37, T-40, T-43, T-44 |

**Lacunas:** nenhum requisito funcional da spec (RF-01 a RF-09) está sem tarefa
correspondente de implementação e verificação neste backlog.

## Rastreabilidade não funcional resumida

| Requisito não funcional | Tarefas |
| --- | --- |
| RNF-01 a RNF-05 — Qualidade da interface | T-05, T-07, T-08, T-09, T-22, T-23, T-24, T-30, T-31, T-33, T-34, T-35, T-38, T-40, T-46, T-47, T-48, T-49, T-53, T-54 |
| RNF-06 a RNF-10 — Segurança, idioma, disponibilidade, API e privacidade | T-01, T-04, T-05, T-06, T-14, T-15, T-16, T-17, T-19, T-20, T-24, T-30, T-38, T-39, T-40, T-41, T-46, T-54 |
| RNF-11 — Sucesso da tarefa principal | T-52 |
