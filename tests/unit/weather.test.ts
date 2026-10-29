import { describe, expect, expectTypeOf, it } from 'vitest';
import { MOCK_WEATHER } from '../../src/mocks/weather';
import type {
  CurrentWeather,
  DailyForecast,
  ForecastDay,
  TemperatureUnit,
  Unit,
  WeatherData,
  WeatherSnapshot,
} from '../../src/types/weather';

describe('Contratos de clima', () => {
  it('mantém os nomes solicitados compatíveis com o plano', () => {
    expectTypeOf<Unit>().toEqualTypeOf<'celsius' | 'fahrenheit'>();
    expectTypeOf<TemperatureUnit>().toEqualTypeOf<Unit>();
    expectTypeOf<DailyForecast>().toEqualTypeOf<ForecastDay>();
    expectTypeOf<WeatherSnapshot>().toEqualTypeOf<WeatherData>();
    expectTypeOf<CurrentWeather[keyof CurrentWeather]>().toEqualTypeOf<number | null>();
    expectTypeOf<ForecastDay['temperatureMaxC']>().toEqualTypeOf<number | null>();
    expectTypeOf<ForecastDay['temperatureMinC']>().toEqualTypeOf<number | null>();
    expectTypeOf<ForecastDay['weatherCode']>().toEqualTypeOf<number | null>();
    expectTypeOf<ForecastDay['precipitationProbability']>().toEqualTypeOf<number | null>();
  });
});

describe('MOCK_WEATHER', () => {
  it('fornece cidade e clima atual completos sem consultar a API', () => {
    expect(MOCK_WEATHER.city.name).toBe('Salvador');
    expect(MOCK_WEATHER.city.admin1).toBe('Bahia');
    expect(MOCK_WEATHER.city.country).toBe('Brasil');
    expect(MOCK_WEATHER.timezone).toBe(MOCK_WEATHER.city.timezone);
    expect(MOCK_WEATHER.current).toEqual({
      temperatureC: 28.4,
      apparentTemperatureC: 31.2,
      humidityPercent: 74,
      windSpeedKmh: 18.5,
      uvIndex: 8.2,
      precipitationMm: 0,
      pressureHpa: 1015.2,
      weatherCode: 2,
    });
  });

  it('contém exatamente cinco dias consecutivos a partir da data local do recebimento', () => {
    const localDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: MOCK_WEATHER.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(MOCK_WEATHER.receivedAt));

    expect(MOCK_WEATHER.forecast).toHaveLength(5);
    expect(MOCK_WEATHER.forecast.map((day) => day.date)).toEqual([
      localDate,
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ]);

    for (const day of MOCK_WEATHER.forecast) {
      expect(day.temperatureMaxC).toBeTypeOf('number');
      expect(day.temperatureMinC).toBeTypeOf('number');
      expect(day.weatherCode).toBeTypeOf('number');
      expect(day.precipitationProbability).toBeTypeOf('number');
      expect(day.precipitationProbability).toBeGreaterThanOrEqual(0);
      expect(day.precipitationProbability).toBeLessThanOrEqual(100);
      if (day.temperatureMaxC !== null && day.temperatureMinC !== null) {
        expect(day.temperatureMinC).toBeLessThanOrEqual(day.temperatureMaxC);
      }
    }
  });
});
