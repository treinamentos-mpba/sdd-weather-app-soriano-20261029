# Discovery — Weather App

> **Fase:** Discovery (pré-spec)
> **Autor:** Business Analyst (via GitHub Copilot)
> **Data:** 2026-10-29
> **Status:** Rascunho para validação com stakeholders

## 1. Contexto

A empresa solicitou o desenvolvimento de uma **aplicação de previsão do tempo**
voltada a usuários finais. O briefing indica as capacidades essenciais:

- Buscar cidades pelo nome;
- Visualizar o **clima atual** da cidade selecionada;
- Visualizar a **previsão para 5 dias**;
- Alternar a unidade de temperatura entre **Celsius e Fahrenheit**;
- Utilizar a aplicação em **dispositivos móveis**.

O briefing é intencionalmente enxuto e não define público-alvo detalhado,
métricas de sucesso, restrições de orçamento ou prazos. Este documento organiza
o que se sabe, o que se assume e o que precisa ser esclarecido antes da fase de
especificação (`specs/weather-app-spec.md`).

**Contexto técnico já definido pelo projeto** (convenções do repositório):
stack TypeScript + React + Vite, Tailwind CSS (tema dark glassmorphism), dados
da API **Open-Meteo** (geocoding + forecast, sem necessidade de API key),
testes com Vitest e Playwright.

## 2. Requisitos Funcionais

| ID    | Requisito                      | Descrição                                                                                                       | Prioridade |
| ----- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------- |
| RF-01 | Busca de cidades               | O usuário pode digitar o nome de uma cidade e obter uma lista de resultados correspondentes (geocoding).         | Must       |
| RF-02 | Seleção de cidade              | O usuário pode selecionar uma cidade da lista de resultados para carregar os dados meteorológicos.               | Must       |
| RF-03 | Clima atual                    | Exibir condições atuais da cidade selecionada: temperatura, condição (ex.: ensolarado, chuva), e dados básicos como sensação térmica, umidade e vento. | Must       |
| RF-04 | Previsão de 5 dias             | Exibir previsão diária para os próximos 5 dias, com no mínimo temperaturas máxima/mínima e condição predominante. | Must       |
| RF-05 | Alternância de unidade         | O usuário pode alternar entre °C e °F; todas as temperaturas exibidas devem refletir a unidade escolhida.         | Must       |
| RF-06 | Persistência da unidade        | A preferência de unidade deve ser lembrada entre visitas (ex.: `localStorage`).                                   | Should     |
| RF-07 | Estados de interface           | A aplicação deve tratar explicitamente os estados de **loading**, **erro** (falha de rede/API) e **vazio** (busca sem resultados). | Must       |
| RF-08 | Desambiguação de cidades       | Resultados de busca devem exibir informações de contexto (país/estado) para distinguir cidades homônimas.         | Should     |

## 3. Requisitos Não-Funcionais

| ID     | Categoria        | Requisito                                                                                                        |
| ------ | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Responsividade   | Layout responsivo *mobile-first*, usável de 360px a 1920px de largura sem scroll horizontal; alvos de toque ≥ 44×44px; validação em pelo menos um viewport mobile e um desktop nos testes E2E. |
| RNF-02 | Desempenho       | Metas mensuráveis em conexão 4G: LCP < 2,5s e interativo (TTI) < 3s; bundle inicial < ~200 KB gzip; busca com debounce (~300ms); feedback visual (skeleton/spinner) em até 100ms após qualquer ação que dispare carregamento. |
| RNF-03 | Acessibilidade   | Conformidade com **WCAG 2.1 nível AA**: contraste mínimo 4.5:1 (atenção ao tema dark glassmorphism — ver R-06), foco visível, navegação completa por teclado na busca/autocomplete, `aria-live` para resultados e estados de loading/erro, validação automatizada de a11y (ex.: axe) nos testes. |
| RNF-04 | Confiabilidade   | A aplicação deve permanecer utilizável e estável durante falhas ou lentidão da API externa (sem telas quebradas ou travamentos). Os comportamentos de tratamento de erro (mensagens, retry) são especificados em RF-07. |
| RNF-05 | Compatibilidade  | Suporte aos navegadores modernos (Chrome, Firefox, Safari, Edge) em suas versões recentes, incluindo mobile.        |
| RNF-06 | Segurança        | Sem coleta de dados pessoais sensíveis; sem segredos no código (a API Open-Meteo dispensa chave).                   |
| RNF-07 | Internacionalização | Interface em pt-BR (idioma do projeto); formatação de datas e números no locale do usuário quando viável.        |
| RNF-08 | Disponibilidade  | Degradação graciosa: em caso de indisponibilidade da Open-Meteo, exibir os últimos dados conhecidos em cache com indicação de atualidade ("atualizado há X min") em vez de tela vazia; a SPA estática deve permanecer carregável independentemente da API (ver R-01 e Q-08; PWA/offline completo segue fora do escopo — S-06). |
| RNF-09 | Uso eficiente da API | Cache de respostas recentes (ex.: ~10 min por cidade), cancelamento de requisições obsoletas durante a busca e respeito aos termos de uso da Open-Meteo (ver R-02). |
| RNF-10 | Privacidade      | Aderência à LGPD: nenhum dado pessoal enviado a terceiros além do necessário à Open-Meteo; se geolocalização for aprovada (Q-02), somente com consentimento explícito do usuário. |

### Restrições técnicas (processo / Definition of Done)

> Itens que restringem **como** o software é construído, e não atributos do
> produto percebidos pelo usuário — por isso ficam fora da tabela de RNFs.

| ID    | Restrição                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------ |
| RT-01 | Código TypeScript em modo strict, lint com Biome, cobertura de testes unitários (Vitest) e E2E (Playwright) para os fluxos principais. |

## 4. Riscos

| ID   | Risco                                                                 | Probabilidade | Impacto | Mitigação                                                                                 |
| ---- | --------------------------------------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------ |
| R-01 | Indisponibilidade ou instabilidade da API Open-Meteo                   | Média         | Alto    | Tratamento robusto de erros, retry com backoff, mensagens claras ao usuário.               |
| R-02 | Limites de uso (rate limit) da API gratuita em cenários de alto tráfego | Média         | Médio   | Debounce na busca, cache de respostas recentes, monitorar termos de uso da API.            |
| R-03 | Ambiguidade de cidades homônimas gerando dados errados ao usuário      | Média         | Médio   | Exibir país/região nos resultados de busca (RF-08).                                        |
| R-04 | Escopo subestimado por briefing vago (ex.: geolocalização, favoritos)  | Alta          | Médio   | Formalizar escopo na spec; registrar itens fora de escopo explicitamente.                  |
| R-05 | Divergência entre dados da API e expectativa do usuário (precisão da previsão) | Baixa   | Baixo   | Exibir fonte dos dados (Open-Meteo) e horário da última atualização.                       |
| R-06 | Acessibilidade negligenciada no tema dark glassmorphism (contraste)    | Média         | Médio   | Validar contraste nos componentes; incluir verificações de a11y nos testes.                |

## 5. Perguntas em Aberto

| ID   | Pergunta                                                                                              | Impacto se seguir sem resposta                                                                                                                       | Responsável sugerido |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| Q-01 | A "previsão de 5 dias" inclui o dia atual ou são os 5 dias seguintes?                                   | Risco de construir a janela errada (hoje+4 vs. amanhã+5): retrabalho na UI, no contrato com a API e nos testes E2E que validam o número de cartões.      | Product Owner        |
| Q-02 | Deve haver detecção automática da localização do usuário (geolocalização) como ponto de partida?        | Muda o fluxo inicial, exige permissões de navegador e consentimento (LGPD, RNF-10); adicionar depois obriga a redesenhar o onboarding.                   | Product Owner        |
| Q-03 | O usuário deve poder salvar cidades favoritas ou ver histórico de buscas?                               | Afeta persistência local e navegação; descoberta tardia pode exigir redesenho do layout e invalidar S-07 (uma cidade por vez).                           | Product Owner        |
| Q-04 | Quais dados do clima atual são obrigatórios além da temperatura (umidade, vento, UV, precipitação)?     | Define o contrato de dados e o cartão principal; sem resposta, risco de UI poluída ou de faltar dado essencial, com retrabalho de serviço e layout.      | Product Owner / UX   |
| Q-05 | Há necessidade de previsão horária dentro de cada dia, ou apenas o resumo diário?                       | Previsão horária muda volume de dados, performance (RNF-02) e design; assumir só o resumo diário pode frustrar a expectativa do stakeholder.             | Product Owner        |
| Q-06 | Além de °C/°F, há interesse em alternar unidades de vento (km/h / mph)?                                 | Unidades mistas (°F com km/h) parecem defeito ao usuário; decidir tarde força refatorar a camada de conversão e os testes de formatação.                 | Product Owner        |
| Q-07 | Existe meta de lançamento ou marco de demonstração que restrinja o escopo do MVP?                       | Sem marco, o escopo tende a crescer (gold-plating) ou corta-se a funcionalidade errada na pressão do prazo.                                              | Stakeholders         |
| Q-08 | A aplicação deve funcionar offline (PWA) ou degradar graciosamente sem conexão?                         | Suporte offline/PWA (service worker, cache persistente) é caro de adicionar depois; a arquitetura precisa prever isso desde o início.                    | Product Owner / Tech |
| Q-09 | Há requisitos de métricas/analytics para medir uso (buscas, cidades mais consultadas)?                  | Instrumentar depois perde o histórico/baseline do lançamento e pode conflitar com a postura de privacidade (RNF-10).                                     | Stakeholders         |
| Q-10 | Como a busca deve se comportar: autocomplete ao digitar ou submissão explícita? Mínimo de caracteres, nº máximo de resultados e tolerância a acentos/erros ("Sao Paulo")? | A busca é a porta de entrada do app; sem definição, a UX fica inconsistente, há excesso de chamadas à API (agrava R-02) e os testes ficam sem critério objetivo. | Product Owner / UX   |
| Q-11 | "Utilizar em dispositivos móveis" significa web responsiva, PWA instalável ou app nativo iOS/Android?   | É a decisão de maior alcance do briefing: se a suposição S-01 (web responsiva) estiver errada, a stack inteira e o plano técnico são invalidados.         | Stakeholders         |
| Q-12 | Qual é a unidade de temperatura padrão no primeiro acesso (°C ou °F)? Depende do locale do usuário?     | Padrão errado para o público gera fricção logo no primeiro uso; mudar depois afeta a persistência da preferência (RF-06) e os testes.                    | Product Owner        |
| Q-13 | Os dados devem se atualizar automaticamente enquanto a tela está aberta (polling) ou apenas em nova busca/refresh manual? | Polling aumenta consumo da API (R-02) e bateria no mobile; sem definição, dados obsoletos podem ser exibidos como atuais, minando a confiança (R-05).    | Product Owner / Tech |
| Q-14 | Quem é o público-alvo prioritário e quais métricas definem o sucesso do produto?                        | Sem persona e métrica de sucesso, não há critério para priorizar Must vs. Should nem para validar se o MVP cumpriu o objetivo.                           | Stakeholders         |

## 6. Decisões

| Decisão | Justificativa | Perguntas em aberto resolvidas |
| ------- | ------------- | ----------------------------- |
| **Fonte de dados: Open-Meteo**, sem API key. | Permite obter geocoding e dados meteorológicos sem exigir credenciais ou custo de API no MVP. | Define a fonte de dados e confirma S-02; não corresponde a uma pergunta específica da tabela acima. |
| **Previsão de 5 dias: hoje + 4 dias.** | Inclui o dia da consulta e mantém uma janela total de cinco dias. | Resolve Q-01. |
| **Unidade padrão: Celsius.** | É a unidade inicial esperada para a interface em pt-BR; Fahrenheit continua disponível conforme o briefing. | Resolve Q-12. |
| **Sem autenticação e sem persistência no servidor.** | Mantém o MVP sem contas de usuário nem necessidade de backend para armazenar dados. | Delimita a persistência no servidor em Q-03; favoritos e histórico local continuam sem decisão. |
| **Idioma da UI: pt-BR.** | Oferece interface no idioma definido para o público inicial do produto. | Define o idioma da interface; Q-14 continua aberta quanto ao público-alvo e às métricas de sucesso. |

## 7. Suposições

> As suposições abaixo complementam as decisões registradas na seção 6.
> Se alguma for invalidada, a spec deve ser revisada.

| ID   | Suposição                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| S-01 | A aplicação é **web responsiva** (SPA); não há necessidade de app nativo iOS/Android no MVP.                  |
| S-02 | A API **Open-Meteo** atende a todos os dados necessários (geocoding, clima atual e previsão diária) sem custo e sem API key. |
| S-03 | "Previsão de 5 dias" significa resumo diário (máx/mín + condição) dos próximos 5 dias, incluindo o dia atual. |
| S-04 | Celsius é a unidade padrão inicial, dado o público presumido em pt-BR.                                        |
| S-05 | Não há autenticação de usuários nem backend próprio no MVP; todo o estado vive no cliente.                    |
| S-06 | Geolocalização automática, favoritos, previsão horária e modo offline estão **fora do escopo do MVP**.        |
| S-07 | Apenas uma cidade é exibida por vez; comparação entre cidades está fora do escopo.                            |
| S-08 | O tráfego esperado é compatível com os limites de uso gratuito da Open-Meteo.                                 |

## 8. Personas propostas

> Hipóteses iniciais a validar com usuários e stakeholders (Q-14). As métricas
> são metas propostas de sucesso na tarefa, não resultados observados nem
> critérios de aceite aprovados.

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso do ponto de vista dela |
| ------- | ------------------ | --------------- | ---------------------------------------- |
| **Marina — rotina urbana** | Consultar o tempo antes de sair para decidir roupa e necessidade de guarda-chuva. | **Mobile**, em consultas rápidas pela manhã, com conexão móvel. | “Em até **15 segundos**, encontro minha cidade e entendo a temperatura e a condição atual.” |
| **Rafael — planejamento de passeios** | Escolher o dia mais adequado para uma atividade ao ar livre usando a previsão de 5 dias. | **Desktop** para planejar; **mobile** para consultar novamente antes de sair. | “Em até **1 minuto**, comparo os cinco dias e identifico o mais adequado com base nas condições e máximas/mínimas.” |
| **Alex — viajante habituado a Fahrenheit** | Consultar o clima do destino sem confundir cidades homônimas nem converter temperaturas mentalmente. | **Mobile** durante a viagem e **desktop** na preparação. | “Em até **30 segundos**, seleciono o destino correto e vejo todas as temperaturas em **°F**, com uma única alternância de unidade.” |

**Priorização sugerida:** Marina como persona primária, pelo foco mobile e pela
consulta rápida; Rafael e Alex ajudam a validar previsão de cinco dias, busca
e alternância de unidades. Essa priorização não encerra Q-14 sem validação.

## 9. Próximos passos

1. Validar perguntas em aberto e suposições com os stakeholders.
2. Produzir a especificação formal em [`specs/weather-app-spec.md`](./weather-app-spec.md) (fase **Spec**).
3. Seguir o pipeline SDD: Spec → Plan → Tasks → Code → Test → Review.
