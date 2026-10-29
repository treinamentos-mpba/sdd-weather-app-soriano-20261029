import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';
import ForecastList from '../../src/components/ForecastList';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import type { ForecastDay } from '../../src/types/weather';

afterEach(cleanup);

describe('ForecastList', () => {
  it('associa cinco dias, datas, condições e métricas nos cards do grid responsivo', () => {
    render(<ForecastList forecast={MOCK_WEATHER.forecast} unit="celsius" />);

    expect(screen.getByRole('region', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveClass('grid-cols-2', 'sm:grid-cols-3', 'lg:grid-cols-5');
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(5);
    const labels = ['Hoje', 'Amanhã', 'sábado', 'domingo', 'segunda-feira'];
    const dates = ['29/10', '30/10', '31/10', '01/11', '02/11'];

    cards.forEach((card, index) => {
      expect(within(card).getByRole('heading', { name: labels[index] })).toBeInTheDocument();
      expect(within(card).getByText(dates[index])).toHaveAttribute(
        'datetime',
        MOCK_WEATHER.forecast[index].date,
      );
      expect(within(card).getByText('Máxima')).toBeInTheDocument();
      expect(within(card).getByText('Mínima')).toBeInTheDocument();
      expect(within(card).getByText('Probabilidade de chuva')).toBeInTheDocument();
    });
    expect(within(cards[0]).getByText('30 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('24 °C')).toBeInTheDocument();
    expect(within(cards[0]).getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(within(cards[0]).getByText('⛅')).toHaveAttribute('aria-hidden', 'true');
    expect(within(cards[1]).getByText('90%')).toBeInTheDocument();
    expect(within(cards[4]).getByText('0%')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('converte máxima e mínima de todos os cards a partir do Celsius original', () => {
    const { rerender } = render(
      <ForecastList forecast={MOCK_WEATHER.forecast} unit="fahrenheit" />,
    );
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/°F/)).toHaveLength(10);
    const first = screen.getAllByRole('article')[0];
    expect(within(first).getByText('86 °F')).toBeInTheDocument();
    expect(within(first).getByText('76 °F')).toBeInTheDocument();
    rerender(<ForecastList forecast={MOCK_WEATHER.forecast} unit="celsius" />);
    expect(screen.queryByText(/°F/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/°C/)).toHaveLength(10);
    expect(MOCK_WEATHER.forecast[0].temperatureMaxC).toBe(30.2);
  });

  it('limita a cinco dias quando há dados extras', () => {
    const forecast = [
      ...MOCK_WEATHER.forecast,
      { ...MOCK_WEATHER.forecast[4], date: '2026-11-03' },
    ];
    render(<ForecastList forecast={forecast} unit="celsius" />);
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.queryByText('03/11')).not.toBeInTheDocument();
  });

  it('identifica previsão parcial sem criar dias nem rotular uma lacuna como amanhã', () => {
    render(
      <ForecastList
        forecast={[MOCK_WEATHER.forecast[0], MOCK_WEATHER.forecast[2]]}
        unit="celsius"
        referenceDate="2026-10-29"
      />,
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('Previsão incompleta');
    expect(screen.queryByText('Amanhã')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'sábado' })).toBeInTheDocument();
  });

  it('informa previsão vazia sem renderizar cards', () => {
    render(<ForecastList forecast={[]} unit="celsius" />);
    expect(screen.getByRole('status')).toHaveTextContent('Previsão indisponível');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});

describe('ForecastCard', () => {
  it('identifica medidas ausentes e condição desconhecida sem inventar valores', () => {
    const day: ForecastDay = {
      date: '2026-10-29',
      temperatureMaxC: null,
      temperatureMinC: null,
      precipitationProbability: null,
      weatherCode: 999,
    };
    render(<ForecastCard day={day} unit="celsius" />);
    expect(screen.getAllByText('Indisponível')).toHaveLength(3);
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'quinta-feira' })).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('usa referência explícita para não anunciar Hoje em um snapshot anterior', () => {
    render(
      <ForecastCard day={MOCK_WEATHER.forecast[0]} unit="celsius" referenceDate="2026-10-30" />,
    );
    expect(screen.getByRole('heading', { name: 'quinta-feira' })).toBeInTheDocument();
    expect(screen.queryByText('Hoje')).not.toBeInTheDocument();
  });
});
