import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import {
  getCachedWeather,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return {
    ...original,
    searchCities: vi.fn(),
    getWeather: vi.fn(),
    getCachedWeather: vi.fn(() => null),
  };
});

const searchMock = vi.mocked(searchCities);
const weatherMock = vi.mocked(getWeather);
const cachedWeatherMock = vi.mocked(getCachedWeather);

beforeEach(() => {
  window.localStorage.clear();
  vi.resetAllMocks();
  searchMock.mockResolvedValue([MOCK_WEATHER.city]);
  weatherMock.mockResolvedValue(MOCK_WEATHER);
  cachedWeatherMock.mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function search(name: string) {
  fireEvent.change(screen.getByRole('searchbox', { name: 'Cidade' }), { target: { value: name } });
  fireEvent.submit(screen.getByRole('search'));
}

describe('App integrado', () => {
  it('inicia com busca, unidade Celsius e orientação sem consultar a rede', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'SDD Weather' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para o conteúdo' })).toHaveAttribute(
      'href',
      '#main-content',
    );
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Graus Celsius' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('main')).toHaveTextContent('Como está o tempo?');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Dados de Open-Meteo');
    expect(searchMock).not.toHaveBeenCalled();
    expect(weatherMock).not.toHaveBeenCalled();
  });

  it('mostra loading até o forecast terminar e converte temperaturas sem novas consultas', async () => {
    let resolveWeather!: (data: WeatherData) => void;
    weatherMock.mockReturnValue(
      new Promise((resolve) => {
        resolveWeather = resolve;
      }),
    );
    render(<App />);

    await act(async () => search('  Salvador  '));

    const main = screen.getByRole('main');
    expect(searchMock).toHaveBeenCalledExactlyOnceWith('Salvador', expect.any(AbortSignal));
    expect(weatherMock).toHaveBeenCalledExactlyOnceWith(
      MOCK_WEATHER.city,
      expect.any(AbortSignal),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Consultando o clima...');
    expect(main).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('searchbox')).toBeDisabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();

    await act(async () => resolveWeather(MOCK_WEATHER));

    expect(main).toHaveAttribute('aria-busy', 'false');
    expect(main).toHaveFocus();
    expect(screen.getByRole('searchbox')).toBeEnabled();
    expect(screen.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('Dados recebidos em', { exact: false })).toHaveTextContent(
      'America/Bahia',
    );
    expect(
      document.querySelector(`time[datetime="${MOCK_WEATHER.receivedAt}"]`),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));
    expect(screen.getByText('83 °F')).toBeInTheDocument();
    expect(screen.getAllByText(/°F/).filter((node) => node.tagName !== 'BUTTON')).toHaveLength(12);
    expect(screen.queryByText(/°C/, { selector: 'p, dd' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Graus Celsius' }));
    expect(screen.getByText('28 °C')).toBeInTheDocument();
    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(weatherMock).toHaveBeenCalledTimes(1);
  });

  it('apresenta os dados retornados em vez do snapshot fixo de Salvador', async () => {
    const city = { ...MOCK_WEATHER.city, id: '2', name: 'Recife' };
    searchMock.mockResolvedValue([city]);
    weatherMock.mockResolvedValue({
      ...MOCK_WEATHER,
      city,
      current: { ...MOCK_WEATHER.current, temperatureC: 19.2 },
      forecast: MOCK_WEATHER.forecast.map((day) => ({ ...day, temperatureMaxC: 21 })),
    });
    render(<App />);

    await act(async () => search('Recife'));

    expect(screen.getByRole('heading', { name: 'Clima atual em Recife' })).toBeInTheDocument();
    expect(screen.getByText('19 °C')).toBeInTheDocument();
    expect(screen.getAllByText('21 °C')).toHaveLength(5);
    expect(
      screen.queryByRole('heading', { name: 'Clima atual em Salvador' }),
    ).not.toBeInTheDocument();
  });

  it('apresenta resultados regionais e consulta a cidade selecionada', async () => {
    const city = {
      ...MOCK_WEATHER.city,
      admin1: 'Bahia',
      country: 'Brasil',
    };
    const otherCity = {
      ...MOCK_WEATHER.city,
      id: '2',
      name: 'Recife',
      latitude: -8.05,
      longitude: -34.9,
      admin1: 'Pernambuco',
      country: 'Brasil',
    };
    const otherWeather = { ...MOCK_WEATHER, city: otherCity };
    searchMock.mockResolvedValue([city, otherCity]);
    weatherMock.mockResolvedValueOnce(MOCK_WEATHER).mockResolvedValueOnce(otherWeather);
    render(<App />);

    await act(async () => search('Salvador'));

    expect(screen.getByRole('button', { name: 'Salvador, Bahia, Brasil' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Recife, Pernambuco, Brasil' })).toBeEnabled();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Recife, Pernambuco, Brasil' })),
    );

    expect(screen.getByRole('heading', { name: 'Clima atual em Recife' })).toBeInTheDocument();
    expect(weatherMock).toHaveBeenLastCalledWith(otherCity, expect.any(AbortSignal));
    expect(searchMock).toHaveBeenCalledTimes(1);
  });

  it('persiste a unidade e restaura a preferência em uma nova montagem', () => {
    const firstRender = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));

    expect(window.localStorage.getItem('sdd-weather-unit')).toBe('fahrenheit');
    firstRender.unmount();
    render(<App />);

    expect(screen.getByRole('button', { name: 'Graus Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('continua com Celsius e permite buscar quando o armazenamento não está disponível', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Acesso negado', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Acesso negado', 'SecurityError');
    });
    render(<App />);

    expect(screen.getByRole('button', { name: 'Graus Celsius' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await act(async () => search('Salvador'));

    expect(screen.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeInTheDocument();
  });

  it('mostra empty sem forecast e permite uma nova busca preservando a unidade', async () => {
    searchMock.mockResolvedValueOnce([]);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));

    await act(async () => search('Inexistente'));

    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeEnabled();
    expect(weatherMock).not.toHaveBeenCalled();

    await act(async () => search('Salvador'));

    expect(screen.getByText('83 °F')).toBeInTheDocument();
  });

  it('mantém o snapshot anterior em falha de atualização e retry ignora cache', async () => {
    weatherMock
      .mockResolvedValueOnce(MOCK_WEATHER)
      .mockRejectedValueOnce(new WeatherServiceError('Falha ao atualizar'))
      .mockResolvedValueOnce(MOCK_WEATHER);
    render(<App />);
    await act(async () => search('Salvador'));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Atualizar' })));

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao atualizar');
    expect(screen.getByRole('status')).toHaveTextContent('Exibindo dados anteriores');
    expect(screen.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeInTheDocument();
    expect(weatherMock).toHaveBeenNthCalledWith(
      2,
      MOCK_WEATHER.city,
      expect.any(AbortSignal),
      { forceRefresh: true },
    );

    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' })),
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Exibindo dados anteriores', { exact: false })).not.toBeInTheDocument();
    expect(weatherMock).toHaveBeenNthCalledWith(
      3,
      MOCK_WEATHER.city,
      expect.any(AbortSignal),
      { forceRefresh: true },
    );
  });

  it.each([
    'search',
    'forecast',
  ])('exibe erro de %s e ErrorState refaz a operação com retry', async (failure) => {
    if (failure === 'search')
      searchMock.mockRejectedValueOnce(
        new WeatherServiceError(
          'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
          undefined,
          'network',
        ),
      );
    else
      weatherMock.mockRejectedValueOnce(
        new WeatherServiceError(
          'A consulta ultrapassou o limite de 10 segundos. Verifique sua conexão e tente novamente.',
          undefined,
          'timeout',
        ),
      );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));

    await act(async () => search('Salvador'));

    expect(screen.getByRole('alert')).toHaveTextContent(
      failure === 'search'
        ? 'Não foi possível conectar ao serviço de clima.'
        : 'A consulta ultrapassou o limite de 10 segundos.',
    );
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeEnabled();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' })),
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('83 °F')).toBeInTheDocument();
    expect(searchMock).toHaveBeenNthCalledWith(2, 'Salvador', expect.any(AbortSignal));
    expect(weatherMock).toHaveBeenCalledTimes(failure === 'search' ? 1 : 2);
  });
});
