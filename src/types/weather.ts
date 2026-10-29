export type Unit = 'celsius' | 'fahrenheit';

export type TemperatureUnit = Unit;

export interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

// Temperaturas em Celsius, sem arredondamento; null indica medida indisponível.
export interface CurrentWeather {
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  uvIndex: number | null;
  precipitationMm: number | null;
  pressureHpa: number | null;
  weatherCode: number | null;
}

export interface ForecastDay {
  /** Data local da cidade, no formato YYYY-MM-DD (não é um instante UTC). */
  date: string;
  temperatureMaxC: number | null;
  temperatureMinC: number | null;
  precipitationProbability: number | null;
  weatherCode: number | null;
}

export type DailyForecast = ForecastDay;

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  /** Instante ISO 8601 em que os dados foram recebidos pelo cliente. */
  receivedAt: string;
}

export type WeatherSnapshot = WeatherData;
