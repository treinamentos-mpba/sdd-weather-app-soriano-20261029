import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import type { CurrentWeather as CurrentWeatherData } from '../../src/types/weather';

afterEach(cleanup);

describe('CurrentWeather', () => {
  it('exibe cidade, condição, temperaturas e métricas com unidades em pt-BR', () => {
    render(
      <CurrentWeather city={MOCK_WEATHER.city} current={MOCK_WEATHER.current} unit="celsius" />,
    );

    expect(screen.getByRole('region', { name: 'Clima atual em Salvador' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeInTheDocument();
    expect(screen.getByText('Bahia, Brasil')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('⛅')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('28 °C')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 31 °C')).toBeInTheDocument();
    for (const [label, value] of [
      ['Umidade', '74%'],
      ['Vento', '18,5 km/h'],
      ['Precipitação', '0 mm'],
      ['Pressão', '1.015,2 hPa'],
      ['Índice UV', '8,2'],
    ]) {
      expect(screen.getByText(label).nextElementSibling).toHaveTextContent(value);
    }
  });

  it('converte as duas temperaturas ao alternar unidade sem alterar os valores originais', () => {
    const { rerender } = render(
      <CurrentWeather city={MOCK_WEATHER.city} current={MOCK_WEATHER.current} unit="fahrenheit" />,
    );
    expect(screen.getByText('83 °F')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 88 °F')).toBeInTheDocument();
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
    rerender(
      <CurrentWeather city={MOCK_WEATHER.city} current={MOCK_WEATHER.current} unit="celsius" />,
    );
    expect(screen.getByText('28 °C')).toBeInTheDocument();
    expect(MOCK_WEATHER.current.temperatureC).toBe(28.4);
    expect(MOCK_WEATHER.current.apparentTemperatureC).toBe(31.2);
  });

  it('identifica todas as medidas ausentes e condição indisponível sem inventar valores', () => {
    const current: CurrentWeatherData = {
      temperatureC: null,
      apparentTemperatureC: null,
      humidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      pressureHpa: null,
      uvIndex: null,
      weatherCode: null,
    };
    render(<CurrentWeather city={MOCK_WEATHER.city} current={current} unit="celsius" />);
    expect(screen.getAllByText('Indisponível')).toHaveLength(6);
    expect(screen.getByText('Sensação térmica: Indisponível')).toBeInTheDocument();
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.queryByText(/0 (mm|hPa|km\/h)/)).not.toBeInTheDocument();
    expect(screen.queryByText(/NaN|undefined|null/)).not.toBeInTheDocument();
  });

  it('mantém dados úteis para código desconhecido e identifica medidas não finitas', () => {
    render(
      <CurrentWeather
        city={{ id: 'test', name: 'Teste', latitude: 0, longitude: 0 }}
        current={{
          ...MOCK_WEATHER.current,
          weatherCode: 999,
          humidityPercent: Number.NaN,
          pressureHpa: Number.POSITIVE_INFINITY,
        }}
        unit="celsius"
      />,
    );
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(2);
    expect(screen.getByText('28 °C')).toBeInTheDocument();
    expect(screen.queryByText('Bahia, Brasil')).not.toBeInTheDocument();
  });
});
