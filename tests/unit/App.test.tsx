import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

const searchMock = vi.mocked(searchCities);
const weatherMock = vi.mocked(getWeather);

beforeEach(() => {
  vi.resetAllMocks();
  searchMock.mockResolvedValue([MOCK_WEATHER.city]);
  weatherMock.mockResolvedValue(MOCK_WEATHER);
});

afterEach(cleanup);

function search(name: string) {
  fireEvent.change(screen.getByRole('searchbox', { name: 'Cidade' }), { target: { value: name } });
  fireEvent.submit(screen.getByRole('search'));
}

describe('App integrado', () => {
  it('inicia com busca, unidade Celsius e orientação sem consultar a rede', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'SDD Weather' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
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

    expect(searchMock).toHaveBeenCalledExactlyOnceWith('Salvador');
    expect(weatherMock).toHaveBeenCalledExactlyOnceWith(MOCK_WEATHER.city);
    expect(screen.getByRole('status')).toHaveTextContent('Consultando o clima...');
    expect(screen.getByRole('searchbox')).toBeDisabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();

    await act(async () => resolveWeather(MOCK_WEATHER));

    expect(screen.getByRole('searchbox')).toBeEnabled();
    expect(screen.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('Dados recebidos em', { exact: false })).toHaveTextContent(
      'America/Bahia',
    );
    expect(
      document.querySelector(`time[datetime="${MOCK_WEATHER.receivedAt}"]`),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByText('83 °F')).toBeInTheDocument();
    expect(screen.getAllByText(/°F/).filter((node) => node.tagName !== 'BUTTON')).toHaveLength(12);
    expect(screen.queryByText(/°C/, { selector: 'p, dd' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '°C' }));
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

  it('mostra empty sem forecast e permite uma nova busca preservando a unidade', async () => {
    searchMock.mockResolvedValueOnce([]);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '°F' }));

    await act(async () => search('Inexistente'));

    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeEnabled();
    expect(weatherMock).not.toHaveBeenCalled();

    await act(async () => search('Salvador'));

    expect(screen.getByText('83 °F')).toBeInTheDocument();
  });

  it.each([
    'search',
    'forecast',
  ])('exibe erro de %s e ErrorState refaz a operação com retry', async (failure) => {
    if (failure === 'search')
      searchMock.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    else weatherMock.mockRejectedValueOnce(new WeatherServiceError('A requisição demorou demais.'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: '°F' }));

    await act(async () => search('Salvador'));

    expect(screen.getByRole('alert')).toHaveTextContent(
      failure === 'search' ? 'Falha de rede.' : 'A requisição demorou demais.',
    );
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeEnabled();
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' })),
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('83 °F')).toBeInTheDocument();
    expect(searchMock).toHaveBeenNthCalledWith(2, 'Salvador');
    expect(weatherMock).toHaveBeenCalledTimes(failure === 'search' ? 1 : 2);
  });
});
