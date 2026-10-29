import type { WeatherData } from '../types/weather';

export const MOCK_WEATHER: WeatherData = {
  city: {
    id: '3450554',
    name: 'Salvador',
    latitude: -12.9711,
    longitude: -38.5108,
    country: 'Brasil',
    admin1: 'Bahia',
    timezone: 'America/Bahia',
  },
  timezone: 'America/Bahia',
  current: {
    temperatureC: 28.4,
    apparentTemperatureC: 31.2,
    humidityPercent: 74,
    windSpeedKmh: 18.5,
    uvIndex: 8.2,
    precipitationMm: 0,
    pressureHpa: 1015.2,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-10-29',
      temperatureMaxC: 30.2,
      temperatureMinC: 24.3,
      precipitationProbability: 20,
      weatherCode: 2,
    },
    {
      date: '2026-10-30',
      temperatureMaxC: 29.5,
      temperatureMinC: 24.1,
      precipitationProbability: 90,
      weatherCode: 61,
    },
    {
      date: '2026-10-31',
      temperatureMaxC: 28.8,
      temperatureMinC: 23.8,
      precipitationProbability: 40,
      weatherCode: 3,
    },
    {
      date: '2026-11-01',
      temperatureMaxC: 30.6,
      temperatureMinC: 24.5,
      precipitationProbability: 10,
      weatherCode: 1,
    },
    {
      date: '2026-11-02',
      temperatureMaxC: 31.1,
      temperatureMinC: 24.7,
      precipitationProbability: 0,
      weatherCode: 0,
    },
  ],
  receivedAt: '2026-10-29T15:00:00Z',
};
