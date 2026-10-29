import { describe, expect, it } from 'vitest';
import { formatTemperature, toFahrenheit } from '../../src/lib/temperature';

describe('temperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [20, 68],
    [28.4, 83.12],
  ])('converte %s °C para %s °F sem arredondar', (celsius, fahrenheit) => {
    expect(toFahrenheit(celsius)).toBeCloseTo(fahrenheit);
  });

  it('arredonda somente a apresentação, sem zero negativo ou erro cumulativo', () => {
    for (let count = 0; count < 10; count++) {
      expect(formatTemperature(-17.8, 'fahrenheit')).toBe('0 °F');
      expect(formatTemperature(-17.8, 'celsius')).toBe('-18 °C');
    }
    expect(formatTemperature(28.4, 'celsius')).toBe('28 °C');
    expect(formatTemperature(28.5, 'celsius')).toBe('29 °C');
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
