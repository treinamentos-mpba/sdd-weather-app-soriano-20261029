import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

function mockResponse(body: unknown, status = 200) {
  const json = vi.fn().mockResolvedValue(body);
  const fetchMock = vi.fn().mockResolvedValue({ ok: status < 400, status, json });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, json };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const city: City = {
  id: '5391959',
  name: 'San Francisco',
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: 'America/Los_Angeles',
};

function forecastResponse() {
  return {
    timezone: 'America/Los_Angeles',
    current: {
      temperature_2m: 17.4,
      apparent_temperature: 17.1,
      relative_humidity_2m: 72,
      wind_speed_10m: 11.5,
      uv_index: 1.2,
      precipitation: 0,
      surface_pressure: 1015.2,
      weather_code: 0,
    },
    daily: {
      time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
      temperature_2m_max: [19.2, 20.1, 18.7, 17.9, 18.4],
      temperature_2m_min: [13.8, 14.2, 13.5, 12.9, 13.1],
      weather_code: [2, 3, 61, 2, 1],
      precipitation_probability_max: [0, 40, 90, 20, 10],
    },
  };
}

describe('getWeather', () => {
  it('consulta coordenadas, métricas e unidades canônicas para cinco dias', async () => {
    const { fetchMock } = mockResponse(forecastResponse());

    await getWeather(city);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(`${url.origin}${url.pathname}`).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '37.7749',
      longitude: '-122.4194',
      current:
        'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index,surface_pressure',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      precipitation_unit: 'mm',
      timezone: 'auto',
      forecast_days: '5',
    });
  });

  it('mapeia current e os arrays paralelos preservando cidade, fuso e datas locais', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-30T01:00:00Z'));
    const body = forecastResponse();
    mockResponse(body);

    const weather = await getWeather(city);

    expect(weather).toEqual({
      city,
      timezone: 'America/Los_Angeles',
      receivedAt: '2026-10-30T01:00:00.000Z',
      current: {
        temperatureC: 17.4,
        apparentTemperatureC: 17.1,
        humidityPercent: 72,
        windSpeedKmh: 11.5,
        uvIndex: 1.2,
        precipitationMm: 0,
        pressureHpa: 1015.2,
        weatherCode: 0,
      },
      forecast: [
        {
          date: '2026-10-29',
          temperatureMaxC: 19.2,
          temperatureMinC: 13.8,
          precipitationProbability: 0,
          weatherCode: 2,
        },
        {
          date: '2026-10-30',
          temperatureMaxC: 20.1,
          temperatureMinC: 14.2,
          precipitationProbability: 40,
          weatherCode: 3,
        },
        {
          date: '2026-10-31',
          temperatureMaxC: 18.7,
          temperatureMinC: 13.5,
          precipitationProbability: 90,
          weatherCode: 61,
        },
        {
          date: '2026-11-01',
          temperatureMaxC: 17.9,
          temperatureMinC: 12.9,
          precipitationProbability: 20,
          weatherCode: 2,
        },
        {
          date: '2026-11-02',
          temperatureMaxC: 18.4,
          temperatureMinC: 13.1,
          precipitationProbability: 10,
          weatherCode: 1,
        },
      ],
    });
    expect(weather.forecast).toHaveLength(5);
  });

  it('limita o retorno a cinco dias quando a API envia mais datas', async () => {
    const body = forecastResponse();
    body.daily.time.push('2026-11-03');
    mockResponse(body);

    expect((await getWeather(city)).forecast).toHaveLength(5);
  });

  it('normaliza medidas ausentes ou inválidas para null sem inventar valores', async () => {
    const body = forecastResponse();
    mockResponse({
      ...body,
      current: { temperature_2m: 0, apparent_temperature: '17', uv_index: Number.NaN },
      daily: {
        time: body.daily.time,
        temperature_2m_max: [0, null, '20', Number.POSITIVE_INFINITY],
      },
    });

    const weather = await getWeather(city);

    expect(weather.current).toEqual({
      temperatureC: 0,
      apparentTemperatureC: null,
      humidityPercent: null,
      windSpeedKmh: null,
      uvIndex: null,
      precipitationMm: null,
      pressureHpa: null,
      weatherCode: null,
    });
    expect(weather.forecast.map((day) => day.temperatureMaxC)).toEqual([0, null, null, null, null]);
    expect(weather.forecast.every((day) => day.temperatureMinC === null)).toBe(true);
    expect(weather.forecast.every((day) => day.precipitationProbability === null)).toBe(true);
    expect(weather.forecast.every((day) => day.weatherCode === null)).toBe(true);
  });

  it('preserva null como indisponível e zero como valor de precipitação', async () => {
    const body = forecastResponse();
    mockResponse({
      ...body,
      current: { ...body.current, precipitation: null },
      daily: {
        ...body.daily,
        precipitation_probability_max: [null, 0, 90, 20, 10],
      },
    });

    const weather = await getWeather(city);

    expect(weather.current.precipitationMm).toBeNull();
    expect(weather.forecast.map((day) => day.precipitationProbability)).toEqual([
      null,
      0,
      90,
      20,
      10,
    ]);
  });

  it.each([
    {},
    { current: {} },
    { daily: {} },
    { current: null, daily: {} },
    { current: {}, daily: null },
    { current: [], daily: {} },
    { current: {}, daily: [] },
    null,
  ])('lança WeatherServiceError quando current ou daily está ausente ou inválido: %j', async (body) => {
    mockResponse(body);

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('mantém os dias disponíveis quando a previsão tem menos de cinco datas', async () => {
    const body = forecastResponse();
    mockResponse({
      ...body,
      daily: { ...body.daily, time: body.daily.time.slice(0, 2) },
    });

    const weather = await getWeather(city);

    expect(weather.forecast).toHaveLength(2);
    expect(weather.forecast.map((day) => day.date)).toEqual(['2026-10-29', '2026-10-30']);
  });

  it.each([
    { time: undefined, expectedDates: [] },
    { time: [null, null, null, null, null], expectedDates: [] },
    {
      time: ['2026-02-30', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
      expectedDates: ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
    },
  ])('ignora datas inválidas ou ausentes sem descartar o clima atual: %j', async ({
    time,
    expectedDates,
  }) => {
    mockResponse({ ...forecastResponse(), daily: { time } });

    const weather = await getWeather(city);

    expect(weather.current.temperatureC).toBe(17.4);
    expect(weather.forecast.map((day) => day.date)).toEqual(expectedDates);
  });

  it('mantém a previsão quando o bloco current está ausente', async () => {
    const body = forecastResponse();
    mockResponse({
      ...body,
      current: null,
      daily: { ...body.daily, temperature_2m_max: [20, 21, 22, 23, 24] },
    });

    const weather = await getWeather(city);

    expect(Object.values(weather.current)).toEqual(Array(8).fill(null));
    expect(weather.forecast.map((day) => day.temperatureMaxC)).toEqual([20, 21, 22, 23, 24]);
  });

  it('mantém o clima atual quando o bloco daily está ausente', async () => {
    mockResponse({ ...forecastResponse(), daily: null });

    const weather = await getWeather(city);

    expect(weather.current.temperatureC).toBe(17.4);
    expect(weather.forecast).toEqual([]);
  });

  it('usa o fuso da cidade ou UTC quando timezone está ausente ou inválido', async () => {
    mockResponse({ ...forecastResponse(), timezone: null });
    await expect(getWeather(city)).resolves.toMatchObject({ timezone: city.timezone });

    mockResponse({ ...forecastResponse(), timezone: 'fuso-invalido' });
    await expect(getWeather({ ...city, timezone: undefined })).resolves.toMatchObject({
      timezone: 'UTC',
    });
  });

  it('rejeita resposta sem medidas utilizáveis com mensagem amigável', async () => {
    mockResponse({
      timezone: 'America/Los_Angeles',
      current: {},
      daily: {
        time: ['2026-10-29', '2026-10-30'],
      },
    });

    await expect(getWeather(city)).rejects.toMatchObject({
      kind: 'unavailable',
      message: 'Não há dados meteorológicos disponíveis para essa cidade. Tente novamente mais tarde.',
    });
  });

  it.each([400, 429, 500])('rejeita HTTP %s antes de ler o JSON', async (status) => {
    const { json } = mockResponse({}, status);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'api',
      status,
      message:
        status === 429
          ? 'O serviço recebeu muitas consultas. Aguarde um pouco e tente novamente.'
          : 'O serviço de clima está indisponível no momento. Tente novamente mais tarde.',
    });
    expect(json).not.toHaveBeenCalled();
  });

  it('normaliza JSON malformado sem expor detalhes técnicos', async () => {
    const { json } = mockResponse({});
    json.mockRejectedValue(new SyntaxError('Unexpected token'));

    await expect(getWeather(city)).rejects.toMatchObject({
      kind: 'invalid-response',
      message: 'O serviço retornou uma resposta inesperada. Tente novamente mais tarde.',
    });
  });
});

describe('searchCities', () => {
  it.each(['', '   ', '\t\n'])('retorna lista vazia sem rede para %j', async (name) => {
    const { fetchMock } = mockResponse({});

    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('apara e codifica o nome com acentos e caracteres especiais', async () => {
    const { fetchMock } = mockResponse({});

    await searchCities('  São Paulo & região?  ');

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o%3F&count=5&language=pt&format=json',
      { signal: expect.any(AbortSignal) },
    );
  });

  it('mapeia resultados para City preservando apenas os campos de domínio', async () => {
    mockResponse({
      results: [
        {
          id: 3448439,
          name: 'São Paulo',
          latitude: -23.55,
          longitude: -46.63,
          country: 'Brasil',
          admin1: 'São Paulo',
          timezone: 'America/Sao_Paulo',
          population: 12300000,
        },
        { id: 0, name: 'Null Island', latitude: 0, longitude: 0 },
      ],
    });

    await expect(searchCities('São Paulo')).resolves.toEqual([
      {
        id: '3448439',
        name: 'São Paulo',
        latitude: -23.55,
        longitude: -46.63,
        country: 'Brasil',
        admin1: 'São Paulo',
        timezone: 'America/Sao_Paulo',
      },
      { id: '0', name: 'Null Island', latitude: 0, longitude: 0 },
    ]);
  });

  it.each([
    {},
    { results: [] },
  ])('retorna lista vazia quando não há resultados: %j', async (body) => {
    mockResponse(body);

    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it.each([
    400, 429, 500,
  ])('lança WeatherServiceError para HTTP %s sem ler JSON', async (status) => {
    const { json } = mockResponse({}, status);

    await expect(searchCities('Salvador')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'api',
      status,
      message:
        status === 429
          ? 'O serviço recebeu muitas consultas. Aguarde um pouco e tente novamente.'
          : 'O serviço de clima está indisponível no momento. Tente novamente mais tarde.',
    });
    expect(json).not.toHaveBeenCalled();
  });

  it.each([
    null,
    [],
    { results: null },
    { results: {} },
    { results: [{}] },
    { results: [{ id: 1, name: 'Cidade', latitude: '0', longitude: 0 }] },
  ])('rejeita estrutura inválida em vez de retornar sucesso vazio: %j', async (body) => {
    mockResponse(body);

    await expect(searchCities('Salvador')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('omite metadados opcionais nulos sem invalidar a cidade', async () => {
    mockResponse({
      results: [
        {
          id: 1,
          name: 'Cidade',
          latitude: 0,
          longitude: 0,
          country: null,
          admin1: null,
          timezone: null,
        },
      ],
    });

    await expect(searchCities('Cidade')).resolves.toEqual([
      { id: '1', name: 'Cidade', latitude: 0, longitude: 0 },
    ]);
  });
});

describe.each([
  {
    name: 'searchCities',
    request: (signal?: AbortSignal) => searchCities('Salvador', signal),
    body: () => ({ results: [] }),
  },
  {
    name: 'getWeather',
    request: (signal?: AbortSignal) => getWeather(city, signal),
    body: forecastResponse,
  },
])('$name com fetchWithTimeout', ({ request, body }) => {
  it('aborta exatamente após 10 segundos e limpa o timer', async () => {
    vi.useFakeTimers();
    const controllerSignals: AbortSignal[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: RequestInit) => {
        const signal = options.signal;
        if (!signal) throw new Error('AbortSignal obrigatório no teste.');
        controllerSignals.push(signal);
        return new Promise<Response>((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            {
              once: true,
            },
          );
        });
      }),
    );
    const pending = request();
    const rejected = expect(pending).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message:
        'A consulta ultrapassou o limite de 10 segundos. Verifique sua conexão e tente novamente.',
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(controllerSignals[0].aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);

    await rejected;
    expect(controllerSignals[0].aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('classifica falha de transporte como possível rede offline', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const pending = request();

    await expect(pending).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message:
        'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('propaga cancelamento intencional sem apresentá-lo como falha', async () => {
    vi.useFakeTimers();
    const externalController = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: RequestInit) => {
        const signal = options.signal;
        if (!signal) throw new Error('AbortSignal obrigatório no teste.');
        return new Promise<Response>((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        });
      }),
    );

    const pending = request(externalController.signal);
    const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    externalController.abort();

    await rejected;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('mantém o timeout ativo enquanto lê o JSON', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: RequestInit) => {
        const signal = options.signal;
        if (!signal) throw new Error('AbortSignal obrigatório no teste.');
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            new Promise((_resolve, reject) => {
              signal.addEventListener(
                'abort',
                () => reject(new DOMException('Aborted', 'AbortError')),
                { once: true },
              );
            }),
        });
      }),
    );

    const pending = request();
    const rejected = expect(pending).rejects.toMatchObject({
      kind: 'timeout',
      message:
        'A consulta ultrapassou o limite de 10 segundos. Verifique sua conexão e tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await rejected;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('limpa o timer no sucesso sem abortar posteriormente', async () => {
    vi.useFakeTimers();
    const { fetchMock } = mockResponse(body());

    await request();

    const options: RequestInit = fetchMock.mock.calls[0][1];
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(options.signal?.aborted).toBe(false);
  });

  it('preserva o erro HTTP e limpa o timer', async () => {
    vi.useFakeTimers();
    mockResponse({}, 429);

    await expect(request()).rejects.toMatchObject({
      name: 'WeatherServiceError',
      status: 429,
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});
