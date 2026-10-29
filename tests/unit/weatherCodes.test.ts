import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('weatherCodes', () => {
  it.each([
    [0, 'Céu limpo', '☀️'],
    [2, 'Parcialmente nublado', '⛅'],
    [61, 'Chuva leve', '🌧️'],
    [95, 'Trovoada', '⛈️'],
  ] as const)('traduz código %s com ícone e descrição', (code, label, icon) => {
    expect(getWeatherCondition(code)).toEqual({ label, icon });
  });

  it.each([
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
    95, 96, 99,
  ])('cobre o código WMO %s', (code) => {
    expect(getWeatherCondition(code).label).not.toBe('Condição indisponível');
    expect(getWeatherCondition(code).icon).not.toBe('❔');
  });

  it.each([null, -1, 999, 2.5, Number.NaN])('identifica código indisponível %s', (code) => {
    expect(getWeatherCondition(code)).toEqual({
      label: 'Condição indisponível',
      icon: '❔',
    });
  });
});
