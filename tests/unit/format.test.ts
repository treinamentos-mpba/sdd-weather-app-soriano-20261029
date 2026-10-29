import { describe, expect, it } from 'vitest';
import {
  formatDayLabel,
  formatForecastDate,
  formatPrecipitationProbability,
} from '../../src/lib/format';

describe('Datas locais', () => {
  it('formata Hoje e Amanhã pela data, inclusive na virada de mês e ano', () => {
    expect(formatDayLabel('2026-10-29', '2026-10-29')).toBe('Hoje');
    expect(formatDayLabel('2026-11-01', '2026-10-31')).toBe('Amanhã');
    expect(formatDayLabel('2027-01-01', '2026-12-31')).toBe('Amanhã');
    expect(formatDayLabel('2026-10-31', '2026-10-29')).toBe('sábado');
    expect(formatDayLabel('2026-10-29', '2026-10-30')).toBe('quinta-feira');
  });

  it('preserva datas e dias da semana, sem depender de relógio ou fuso do navegador', () => {
    expect(formatForecastDate('2026-11-01')).toBe('01/11');
    expect(formatDayLabel('2026-11-01')).toBe('domingo');
    expect(formatForecastDate('2028-02-29')).toBe('29/02');
    expect(formatDayLabel('2026-03-08')).toBe('domingo');
  });

  it.each([
    '',
    '2026-02-30',
    '2026-13-01',
    '2026-1-01',
    'not-a-date',
  ])('rejeita data inválida %j explicitamente', (date) => {
    expect(() => formatDayLabel(date)).toThrow(RangeError);
    expect(() => formatForecastDate(date)).toThrow(RangeError);
  });
});

describe('Probabilidade de chuva', () => {
  it.each([
    [0, '0%'],
    [100, '100%'],
    [35.5, '35,5%'],
  ] as const)('formata %s como %s', (value, formatted) => {
    expect(formatPrecipitationProbability(value)).toBe(formatted);
  });

  it.each([
    null,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -1,
    101,
  ])('identifica probabilidade indisponível %s', (value) => {
    expect(formatPrecipitationProbability(value)).toBe('Indisponível');
  });
});
