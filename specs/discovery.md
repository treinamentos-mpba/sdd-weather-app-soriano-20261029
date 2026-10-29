# Discovery — Weather App

> **Fase:** Discovery (pré-spec)
> **Autor:** Business Analyst (via GitHub Copilot)
> **Data:** 2026-10-29
> **Status:** Decisões do MVP registradas; pronto para planejamento

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
| RF-01 | Busca de cidades               | Permitir busca por envio explícito após digitar pelo menos dois caracteres e apresentar no máximo cinco resultados de geocodificação; aceitar acentos e caracteres especiais, sem garantir correção de erros de digitação ou equivalência entre consultas com e sem acento. | Must |
| RF-02 | Seleção de cidade              | O usuário pode selecionar uma cidade da lista de resultados para carregar os dados meteorológicos.               | Must       |
| RF-03 | Clima atual                    | Exibir condições atuais da cidade selecionada: temperatura, condição (ex.: ensolarado, chuva), sensação térmica, umidade, vento, índice UV e precipitação; quando a API não fornecer UV ou precipitação, identificá-los como indisponíveis. | Must       |
| RF-04 | Previsão de 5 dias             | Exibir previsão diária para os próximos 5 dias, com no mínimo temperaturas máxima/mínima e condição predominante. | Must       |
| RF-05 | Alternância de unidade         | O usuário pode alternar entre °C e °F; todas as temperaturas exibidas devem refletir a unidade escolhida.         | Must       |
| RF-06 | Persistência da unidade        | A preferência de unidade deve ser lembrada entre visitas (ex.: `localStorage`).                                   | Should     |
| RF-07 | Estados de interface           | A aplicação deve tratar explicitamente os estados de **loading**, **erro** (falha de rede/API) e **vazio** (busca sem resultados). | Must       |
| RF-08 | Desambiguação de cidades       | Resultados de busca devem exibir informações de contexto (país/estado) para distinguir cidades homônimas.         | Should     |

## 3. Requisitos Não-Funcionais

| ID     | Categoria        | Requisito                                                                                                        |
| ------ | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| RNF-01 | Responsividade   | Layout responsivo *mobile-first*, usável de 360px a 1920px de largura sem scroll horizontal; alvos de toque ≥ 44×44px; validação em pelo menos um viewport mobile e um desktop nos testes E2E. |
| RNF-02 | Desempenho       | Metas mensuráveis em conexão 4G: LCP < 2,5s e interativo (TTI) < 3s; bundle inicial < ~200 KB gzip; feedback visual (skeleton/spinner) em até 100ms após qualquer ação que dispare carregamento. |
| RNF-03 | Acessibilidade   | Conformidade com **WCAG 2.1 nível AA**: contraste mínimo 4.5:1 (atenção ao tema dark glassmorphism — ver R-06), foco visível, navegação completa por teclado na busca e resultados, `aria-live` para resultados e estados de loading/erro, validação automatizada de a11y (ex.: axe) nos testes. |
| RNF-04 | Confiabilidade   | A aplicação deve permanecer utilizável e estável durante falhas ou lentidão da API externa (sem telas quebradas ou travamentos). Os comportamentos de tratamento de erro (mensagens, retry) são especificados em RF-07. |
| RNF-05 | Compatibilidade  | Suporte aos navegadores modernos (Chrome, Firefox, Safari, Edge) em suas versões recentes, incluindo mobile.        |
| RNF-06 | Segurança        | Sem coleta de dados pessoais sensíveis; sem segredos no código (a API Open-Meteo dispensa chave).                   |
| RNF-07 | Internacionalização | Interface em pt-BR (idioma do projeto); formatação de datas e números no locale do usuário quando viável.        |
| RNF-08 | Disponibilidade  | Degradação graciosa: em caso de indisponibilidade da Open-Meteo, exibir os últimos dados conhecidos em cache com indicação de atualidade ("atualizado há X min") em vez de tela vazia; a SPA estática deve permanecer carregável independentemente da API. PWA e experiência offline completa estão fora do escopo (S-06). |
| RNF-09 | Uso eficiente da API | Reutilizar respostas meteorológicas por até 10 minutos por cidade, salvo atualização explícita; não atualizar automaticamente; cancelar requisições obsoletas e respeitar os termos de uso da Open-Meteo (ver R-02). |
| RNF-10 | Privacidade      | Aderência à LGPD: nenhum dado pessoal enviado a terceiros além do necessário à Open-Meteo; não coletar nem enviar dados de geolocalização no MVP. |

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
| R-02 | Limites de uso (rate limit) da API gratuita em cenários de alto tráfego | Média         | Médio   | Busca por envio explícito, limite de resultados, cache de respostas recentes e monitoramento dos termos de uso da API. |
| R-03 | Ambiguidade de cidades homônimas gerando dados errados ao usuário      | Média         | Médio   | Exibir país/região nos resultados de busca (RF-08).                                        |
| R-04 | Escopo subestimado por briefing vago (ex.: geolocalização, favoritos)  | Alta          | Médio   | Formalizar escopo na spec; registrar itens fora de escopo explicitamente.                  |
| R-05 | Divergência entre dados da API e expectativa do usuário (precisão da previsão) | Baixa   | Baixo   | Exibir fonte dos dados (Open-Meteo) e horário da última atualização.                       |
| R-06 | Acessibilidade negligenciada no tema dark glassmorphism (contraste)    | Média         | Médio   | Validar contraste nos componentes; incluir verificações de a11y nos testes.                |

## 5. Perguntas em Aberto

Não há perguntas em aberto para o escopo do MVP definido neste discovery. As
decisões registradas na seção seguinte devem ser tratadas como entradas para o
plano técnico.

## 6. Decisões

| Decisão | Justificativa | Perguntas em aberto resolvidas |
| ------- | ------------- | ----------------------------- |
| **Fonte de dados: Open-Meteo**, sem API key. | Permite obter geocoding e dados meteorológicos sem exigir credenciais ou custo de API no MVP. | Define a fonte de dados e confirma S-02; não corresponde a uma pergunta específica da tabela acima. |
| **Previsão de 5 dias: hoje + 4 dias.** | Inclui o dia da consulta e mantém uma janela total de cinco dias. | Resolve Q-01. |
| **Exibir índice UV e precipitação no clima atual quando fornecidos pela API.** | Os dois campos devem aparecer para toda cidade selecionada; quando a API não fornecer um valor, ele será identificado como indisponível, sem inventar dados. | Resolve Q-04. |
| **Busca por envio explícito.** | Exigir pelo menos dois caracteres após remover espaços externos, apresentar no máximo cinco resultados e aceitar acentos e caracteres especiais; não prometer correção de erros de digitação nem equivalência entre consultas com e sem acento. | Resolve Q-10. |
| **Sem geolocalização automática, favoritos, histórico local ou previsão horária.** | A cidade é informada pela pessoa usuária, sem pedir permissão de localização; mantém-se o foco em uma consulta por vez e em resumos diários. | Resolve Q-02, Q-03 e Q-05. |
| **Unidade do vento fixa em km/h.** | Não haverá alternância para mph no MVP. | Resolve Q-06. |
| **Sem prazo de lançamento definido.** | A ausência de uma data ou marco não bloqueia o planejamento nem a implementação do MVP. | Resolve Q-07. |
| **Web responsiva; sem PWA ou experiência offline completa.** | Cache e exibição identificada de dados anteriores continuam previstos; não haverá instalação nem promessa de funcionamento offline. | Resolve Q-08 e Q-11. |
| **Sem analytics ou rastreamento individual.** | Não coletar métricas individuais de uso no MVP. | Resolve Q-09. |
| **Atualização apenas sob demanda.** | Consultar ao selecionar cidade ou quando a pessoa solicitar atualização; não fazer polling. Reutilizar cache meteorológico por até 10 minutos, exceto em atualização explícita. | Resolve Q-13. |
| **Marina é a persona prioritária.** | Adotar como meta inicial encontrar a cidade e compreender temperatura e condição atuais em até 15 segundos no mobile. | Resolve Q-14. |
| **Timeout de 10 segundos por consulta.** | Aplicar a geocodificação e às consultas meteorológicas; encerrar loading, informar timeout e oferecer nova tentativa. Respostas tardias não substituem consultas mais recentes. | Resolve Q-15, registrada durante a elaboração da spec. |
| **Unidade padrão: Celsius.** | É a unidade inicial esperada para a interface em pt-BR; Fahrenheit continua disponível conforme o briefing. | Resolve Q-12. |
| **Sem autenticação e sem persistência no servidor.** | Mantém o MVP sem contas de usuário nem necessidade de backend para armazenar dados. | Delimita persistência no servidor; favoritos e histórico também ficam fora do MVP conforme a decisão acima. |
| **Idioma da UI: pt-BR.** | Oferece interface no idioma definido para o público inicial do produto. | Define o idioma da interface. |

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
| S-06 | Geolocalização automática, favoritos, histórico, previsão horária, PWA instalável, experiência offline completa e analytics estão **fora do escopo do MVP**. |
| S-07 | Apenas uma cidade é exibida por vez; comparação entre cidades está fora do escopo.                            |
| S-08 | O tráfego esperado é compatível com os limites de uso gratuito da Open-Meteo.                                 |

## 8. Personas propostas

> Personas propostas para orientar o produto; a meta de Marina foi adotada como
> objetivo inicial de sucesso do MVP, ainda sujeita a validação em uso.

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso do ponto de vista dela |
| ------- | ------------------ | --------------- | ---------------------------------------- |
| **Marina — rotina urbana** | Consultar o tempo antes de sair para decidir roupa e necessidade de guarda-chuva. | **Mobile**, em consultas rápidas pela manhã, com conexão móvel. | “Em até **15 segundos**, encontro minha cidade e entendo a temperatura e a condição atual.” |
| **Rafael — planejamento de passeios** | Escolher o dia mais adequado para uma atividade ao ar livre usando a previsão de 5 dias. | **Desktop** para planejar; **mobile** para consultar novamente antes de sair. | “Em até **1 minuto**, comparo os cinco dias e identifico o mais adequado com base nas condições e máximas/mínimas.” |
| **Alex — viajante habituado a Fahrenheit** | Consultar o clima do destino sem confundir cidades homônimas nem converter temperaturas mentalmente. | **Mobile** durante a viagem e **desktop** na preparação. | “Em até **30 segundos**, seleciono o destino correto e vejo todas as temperaturas em **°F**, com uma única alternância de unidade.” |

**Priorização:** Marina é a persona primária pela consulta rápida em mobile.
Rafael e Alex são personas secundárias para validar a previsão de cinco dias, a
desambiguação e a alternância de temperatura.

## 9. Próximos passos

1. Produzir o plano técnico a partir de [`specs/weather-app-spec.md`](./weather-app-spec.md) (fase **Plan**).
2. Seguir o pipeline SDD: Plan → Tasks → Code → Test → Review.
