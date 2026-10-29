import { describe, expect, it } from 'vitest';
import {
  convertTemperature,
  formatTemperature,
  toFahrenheit,
  unitLabel,
} from '../../src/lib/temperature';

describe('toFahrenheit', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [20, 68],
    [28.4, 83.12],
  ])('converte %s °C para %s °F sem arredondar', (celsius, fahrenheit) => {
    expect(toFahrenheit(celsius)).toBeCloseTo(fahrenheit);
  });
});

describe('convertTemperature', () => {
  it.each([
    [0, 'celsius', 0],
    [20, 'celsius', 20],
    [0, 'fahrenheit', 32],
    [100, 'fahrenheit', 212],
    [-40, 'fahrenheit', -40],
    [28.4, 'fahrenheit', 83.12],
  ] as const)('converte %s °C para a unidade %s com resultado %s', (celsius, unit, expected) => {
    expect(convertTemperature(celsius, unit)).toBeCloseTo(expected);
  });
});

describe('formatTemperature', () => {
  it.each([
    [28.4, 'celsius', '28 °C'],
    [28.5, 'celsius', '29 °C'],
    [28.4, 'fahrenheit', '83 °F'],
    [28.5, 'fahrenheit', '83 °F'],
  ] as const)('arredonda %s °C e formata em %s como %s', (celsius, unit, expected) => {
    expect(formatTemperature(celsius, unit)).toBe(expected);
  });

  it('arredonda somente a apresentação, sem zero negativo ou erro cumulativo', () => {
    for (let count = 0; count < 10; count++) {
      expect(formatTemperature(-17.8, 'fahrenheit')).toBe('0 °F');
      expect(formatTemperature(-17.8, 'celsius')).toBe('-18 °C');
    }
  });

  it.each([
    null,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('identifica temperatura indisponível %s', (value) => {
    expect(formatTemperature(value, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(value, 'fahrenheit')).toBe('Indisponível');
  });
});

describe('unitLabel', () => {
  it.each([
    ['celsius', '°C'],
    ['fahrenheit', '°F'],
  ] as const)('retorna o rótulo da unidade %s como %s', (unit, label) => {
    expect(unitLabel(unit)).toBe(label);
  });
});
