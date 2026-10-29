import type { Unit } from '../types/weather';

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function formatTemperature(celsius: number | null, unit: Unit): string {
  if (celsius === null || !Number.isFinite(celsius)) return 'Indisponível';

  const value = unit === 'fahrenheit' ? toFahrenheit(celsius) : celsius;
  const rounded = Math.round(value);
  return `${Object.is(rounded, -0) ? 0 : rounded} ${unit === 'fahrenheit' ? '°F' : '°C'}`;
}
