import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (isRecord(error) && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeout);
  }
}

function toCity(result: unknown): City {
  if (
    !isRecord(result) ||
    typeof result.id !== 'number' ||
    !Number.isFinite(result.id) ||
    typeof result.name !== 'string' ||
    typeof result.latitude !== 'number' ||
    !Number.isFinite(result.latitude) ||
    typeof result.longitude !== 'number' ||
    !Number.isFinite(result.longitude)
  ) {
    throw new WeatherServiceError('Resposta de geocodificação inválida.');
  }

  const city: City = {
    id: String(result.id),
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
  };

  for (const field of ['country', 'admin1', 'timezone'] as const) {
    if (result[field] !== undefined) {
      if (typeof result[field] !== 'string') {
        throw new WeatherServiceError('Resposta de geocodificação inválida.');
      }
      city[field] = result[field];
    }
  }

  return city;
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`,
  );

  if (!response.ok) {
    throw new WeatherServiceError(
      `Não foi possível buscar cidades (HTTP ${response.status}).`,
      response.status,
    );
  }

  const data: unknown = await response.json();
  if (!isRecord(data) || (data.results !== undefined && !Array.isArray(data.results))) {
    throw new WeatherServiceError('Resposta de geocodificação inválida.');
  }

  return data.results === undefined ? [] : data.results.map(toCity);
}

function toMeasurement(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function dailyMeasurement(value: unknown, index: number): number | null {
  return Array.isArray(value) ? toMeasurement(value[index]) : null;
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: 'auto',
    forecast_days: '5',
  });
  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Não foi possível consultar o clima (HTTP ${response.status}).`,
      response.status,
    );
  }

  const data: unknown = await response.json();
  if (!isRecord(data) || !isRecord(data.current) || !isRecord(data.daily)) {
    throw new WeatherServiceError('Resposta meteorológica incompleta: current ou daily ausente.');
  }
  if (typeof data.timezone !== 'string' || !data.timezone.trim()) {
    throw new WeatherServiceError('Fuso horário ausente ou inválido na resposta meteorológica.');
  }

  const daily = data.daily;
  if (!Array.isArray(daily.time)) {
    throw new WeatherServiceError('Resposta meteorológica incompleta: datas diárias ausentes.');
  }

  const current: CurrentWeather = {
    temperatureC: toMeasurement(data.current.temperature_2m),
    apparentTemperatureC: toMeasurement(data.current.apparent_temperature),
    humidityPercent: toMeasurement(data.current.relative_humidity_2m),
    windSpeedKmh: toMeasurement(data.current.wind_speed_10m),
    uvIndex: toMeasurement(data.current.uv_index),
    precipitationMm: toMeasurement(data.current.precipitation),
    pressureHpa: toMeasurement(data.current.surface_pressure),
    weatherCode: toMeasurement(data.current.weather_code),
  };
  const forecast: ForecastDay[] = daily.time.slice(0, 5).map((date: unknown, index: number) => {
    if (
      typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
    ) {
      throw new WeatherServiceError('Data inválida na previsão meteorológica.');
    }

    return {
      date,
      temperatureMaxC: dailyMeasurement(daily.temperature_2m_max, index),
      temperatureMinC: dailyMeasurement(daily.temperature_2m_min, index),
      precipitationProbability: dailyMeasurement(daily.precipitation_probability_max, index),
      weatherCode: dailyMeasurement(daily.weather_code, index),
    };
  });

  if (![...Object.values(current), ...forecast.flatMap(Object.values)].some(Number.isFinite)) {
    throw new WeatherServiceError('Resposta meteorológica sem dados utilizáveis.');
  }

  return {
    city,
    timezone: data.timezone,
    current,
    forecast,
    receivedAt: new Date().toISOString(),
  };
}
