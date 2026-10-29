import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import type { Unit } from '../../src/types/weather';

afterEach(cleanup);

function TemperatureUnitView() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={MOCK_WEATHER.city}
        current={{ ...MOCK_WEATHER.current, temperatureC: 0, apparentTemperatureC: null }}
        unit={unit}
      />
    </>
  );
}

describe('UnitToggle', () => {
  it.each(['celsius', 'fahrenheit'] as const)('indica a unidade %s em um grupo nomeado', (unit) => {
    render(<UnitToggle unit={unit} onChange={vi.fn()} />);
    const group = screen.getByRole('group', { name: 'Unidade de temperatura' });

    expect(within(group).getAllByRole('button')).toHaveLength(2);
    expect(within(group).getByRole('button', { name: 'Graus Celsius' })).toHaveAttribute(
      'aria-pressed',
      String(unit === 'celsius'),
    );
    expect(within(group).getByRole('button', { name: 'Graus Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      String(unit === 'fahrenheit'),
    );
  });

  it('notifica mudanças nas duas direções e deriva a seleção somente da prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(unit: Unit) => void>();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
    expect(screen.getByRole('button', { name: 'Graus Celsius' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Graus Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Graus Celsius' }));
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('não notifica novamente ao acionar a unidade já ativa', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Graus Celsius' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('permite navegar por Tab e Shift+Tab e selecionar com Enter e Espaço', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);
    const celsius = screen.getByRole('button', { name: 'Graus Celsius' });
    const fahrenheit = screen.getByRole('button', { name: 'Graus Fahrenheit' });

    await user.tab();
    expect(celsius).toHaveFocus();
    await user.tab();
    expect(fahrenheit).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');

    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    await user.tab({ shift: true });
    expect(celsius).toHaveFocus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    expect(onChange).toHaveBeenCalledTimes(2);
    await user.tab({ shift: true });
    expect(celsius).not.toHaveFocus();
    expect(fahrenheit).not.toHaveFocus();
  });

  it('não envia um formulário pai ao selecionar a unidade', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onChange = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <UnitToggle unit="celsius" onChange={onChange} />
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('atualiza o clima atual de 0 °C para 32 °F ao trocar a unidade', async () => {
    const user = userEvent.setup();
    render(<TemperatureUnitView />);
    const weatherRegion = screen.getByRole('region', { name: 'Clima atual em Salvador' });

    expect(within(weatherRegion).getByText('0 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Graus Fahrenheit' }));

    expect(within(weatherRegion).getByText('32 °F')).toBeInTheDocument();
  });
});
