import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

const city = MOCK_WEATHER.city;
const otherCity: City = { ...city, id: '2', name: 'Outra cidade' };
const otherWeather: WeatherData = { ...MOCK_WEATHER, city: otherCity };
const searchMock = vi.mocked(searchCities);
const weatherMock = vi.mocked(getWeather);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetAllMocks();
  searchMock.mockResolvedValue([city, otherCity]);
  weatherMock.mockResolvedValue(MOCK_WEATHER);
});

afterEach(cleanup);

describe('useWeather', () => {
  it('inicia idle sem consultar os services; retry inicial não faz nada', async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(() => result.current.retry());
    expect(searchMock).not.toHaveBeenCalled();
    expect(weatherMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('apara a busca, expõe loading e cidades, e carrega o clima da primeira', async () => {
    const pendingCities = deferred<City[]>();
    const pendingWeather = deferred<WeatherData>();
    searchMock.mockReturnValue(pendingCities.promise);
    weatherMock.mockReturnValue(pendingWeather.promise);
    const { result } = renderHook(() => useWeather());
    let pending!: Promise<void>;

    act(() => {
      pending = result.current.search('  Salvador  ');
    });
    expect(result.current).toMatchObject({ status: 'loading', query: 'Salvador', error: null });
    expect(searchMock).toHaveBeenCalledExactlyOnceWith('Salvador', expect.any(AbortSignal));
    expect(weatherMock).not.toHaveBeenCalled();

    await act(async () => pendingCities.resolve([city, otherCity]));
    expect(result.current.cities).toEqual([city, otherCity]);
    expect(result.current.status).toBe('loading');
    expect(weatherMock).toHaveBeenCalledExactlyOnceWith(city, expect.any(AbortSignal));

    await act(async () => {
      pendingWeather.resolve(MOCK_WEATHER);
      await pending;
    });
    expect(result.current).toMatchObject({ status: 'success', data: MOCK_WEATHER, error: null });
  });

  it('retorna empty sem consultar clima quando não há cidades', async () => {
    searchMock.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Inexistente'));

    expect(result.current).toMatchObject({ status: 'empty', data: null, cities: [], error: null });
    expect(weatherMock).not.toHaveBeenCalled();
  });

  it.each(['', '  ', ' a '])('informa validação sem rede para %j', async (name) => {
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search(name));

    expect(result.current).toMatchObject({
      status: 'error',
      query: name.trim(),
      error: 'Digite pelo menos dois caracteres para buscar uma cidade.',
    });
    expect(searchMock).not.toHaveBeenCalled();
    expect(weatherMock).not.toHaveBeenCalled();
  });

  it('seleciona outra cidade preservando a consulta e a lista de resultados', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    weatherMock.mockResolvedValue(otherWeather);

    await act(() => result.current.selectCity(otherCity));

    expect(weatherMock).toHaveBeenLastCalledWith(otherCity, expect.any(AbortSignal));
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(result.current).toMatchObject({
      status: 'success',
      data: otherWeather,
      cities: [city, otherCity],
      query: 'Salvador',
    });
  });

  it('expõe erro de busca e retry repete a busca, limpando o erro anterior', async () => {
    const networkMessage =
      'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.';
    searchMock.mockRejectedValueOnce(new WeatherServiceError(networkMessage, undefined, 'network'));
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: networkMessage,
      data: null,
    });

    await act(() => result.current.retry());

    expect(searchMock).toHaveBeenNthCalledWith(2, 'Salvador', expect.any(AbortSignal));
    expect(result.current).toMatchObject({ status: 'success', error: null, data: MOCK_WEATHER });
  });

  it('retry de busca cujo forecast falhou repete o fluxo completo', async () => {
    const timeoutMessage =
      'A consulta ultrapassou o limite de 10 segundos. Verifique sua conexão e tente novamente.';
    weatherMock.mockRejectedValueOnce(
      new WeatherServiceError(timeoutMessage, undefined, 'timeout'),
    );
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: timeoutMessage,
      cities: [city, otherCity],
    });

    await act(() => result.current.retry());

    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(weatherMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('retry de seleção consulta somente o clima da última cidade selecionada', async () => {
    weatherMock.mockRejectedValueOnce(
      new WeatherServiceError(
        'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
        undefined,
        'network',
      ),
    );
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.selectCity(otherCity));
    expect(result.current.status).toBe('error');
    weatherMock.mockResolvedValue(otherWeather);

    await act(() => result.current.retry());

    expect(searchMock).not.toHaveBeenCalled();
    expect(weatherMock).toHaveBeenNthCalledWith(2, otherCity, expect.any(AbortSignal));
    expect(result.current).toMatchObject({ status: 'success', data: otherWeather, error: null });
  });

  it('uma nova busca limpa o clima e as cidades anteriores', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    searchMock.mockResolvedValue([]);

    await act(() => result.current.search('Inexistente'));

    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      cities: [],
      query: 'Inexistente',
    });
  });

  it('ignora resultado de geocodificação antigo sem iniciar forecast obsoleto', async () => {
    const oldSearch = deferred<City[]>();
    searchMock.mockReturnValueOnce(oldSearch.promise).mockResolvedValueOnce([otherCity]);
    weatherMock.mockResolvedValue(otherWeather);
    const { result } = renderHook(() => useWeather());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('Antiga');
    });
    await act(() => result.current.search('Nova'));

    expect(searchMock.mock.calls[0][1]?.aborted).toBe(true);
    await act(async () => {
      oldSearch.resolve([city]);
      await pending;
    });

    expect(weatherMock).toHaveBeenCalledExactlyOnceWith(otherCity, expect.any(AbortSignal));
    expect(result.current).toMatchObject({
      query: 'Nova',
      data: otherWeather,
      cities: [otherCity],
    });
  });

  it.each([
    'resolve',
    'reject',
  ] as const)('ignora forecast antigo que termina com %s', async (outcome) => {
    const oldWeather = deferred<WeatherData>();
    weatherMock.mockReturnValueOnce(oldWeather.promise).mockResolvedValueOnce(otherWeather);
    const { result } = renderHook(() => useWeather());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.selectCity(city);
    });
    await act(() => result.current.selectCity(otherCity));
    expect(weatherMock.mock.calls[0][1]?.aborted).toBe(true);

    await act(async () => {
      if (outcome === 'resolve') oldWeather.resolve(MOCK_WEATHER);
      else oldWeather.reject(new WeatherServiceError('Falha antiga'));
      await pending;
    });

    expect(result.current).toMatchObject({ status: 'success', data: otherWeather, error: null });
    await act(() => result.current.retry());
    expect(weatherMock).toHaveBeenLastCalledWith(otherCity, expect.any(AbortSignal));
  });

  it('não inicia forecast se a busca termina após desmontar', async () => {
    const pendingCities = deferred<City[]>();
    searchMock.mockReturnValue(pendingCities.promise);
    const { result, unmount } = renderHook(() => useWeather());
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.search('Salvador');
    });
    unmount();
    expect(searchMock.mock.calls[0][1]?.aborted).toBe(true);

    await act(async () => {
      pendingCities.resolve([city]);
      await pending;
    });

    expect(weatherMock).not.toHaveBeenCalled();
  });
});
