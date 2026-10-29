import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export type WeatherServiceErrorKind =
  | 'network'
  | 'timeout'
  | 'api'
  | 'invalid-response'
  | 'unavailable';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly kind: WeatherServiceErrorKind = 'api',
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

const REQUEST_TIMEOUT_MS = 10_000;
const WEATHER_CACHE_TTL_MS = 10 * 60 * 1_000;
const MAX_WEATHER_CACHE_ENTRIES = 20;
const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.';
const TIMEOUT_ERROR_MESSAGE =
  'A consulta ultrapassou o limite de 10 segundos. Verifique sua conexão e tente novamente.';
const INVALID_RESPONSE_MESSAGE =
  'O serviço retornou uma resposta inesperada. Tente novamente mais tarde.';

interface WeatherCacheEntry {
  data: WeatherData;
  cachedAt: number;
}

export interface CachedWeather {
  data: WeatherData;
  ageMs: number;
}

export interface WeatherRequestOptions {
  forceRefresh?: boolean;
}

const weatherCache = new Map<string, WeatherCacheEntry>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function abortError(): DOMException {
  return new DOMException('A operação foi cancelada.', 'AbortError');
}

function timeoutError(): WeatherServiceError {
  return new WeatherServiceError(TIMEOUT_ERROR_MESSAGE, undefined, 'timeout');
}

function networkError(): WeatherServiceError {
  return new WeatherServiceError(NETWORK_ERROR_MESSAGE, undefined, 'network');
}

function invalidResponseError(): WeatherServiceError {
  return new WeatherServiceError(INVALID_RESPONSE_MESSAGE, undefined, 'invalid-response');
}

function httpError(status: number): WeatherServiceError {
  const message =
    status === 429
      ? 'O serviço recebeu muitas consultas. Aguarde um pouco e tente novamente.'
      : 'O serviço de clima está indisponível no momento. Tente novamente mais tarde.';
  return new WeatherServiceError(message, status, 'api');
}

async function fetchWithTimeout(
  url: string,
  signal?: AbortSignal,
): Promise<{ response: Response; data?: unknown }> {
  if (signal?.aborted) throw abortError();

  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch {
      if (timedOut) throw timeoutError();
      if (signal?.aborted) throw abortError();
      throw networkError();
    }

    if (signal?.aborted) throw abortError();
    if (!response.ok) return { response };

    try {
      return { response, data: await response.json() };
    } catch {
      if (timedOut) throw timeoutError();
      if (signal?.aborted) throw abortError();
      throw invalidResponseError();
    }
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
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
    throw invalidResponseError();
  }

  const city: City = {
    id: String(result.id),
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
  };

  for (const field of ['country', 'admin1', 'timezone'] as const) {
    const value = result[field];
    if (typeof value === 'string' && value.trim()) {
      city[field] = value;
    } else if (value !== undefined && value !== null && typeof value !== 'string') {
      throw invalidResponseError();
    }
  }

  return city;
}

function isValidTimezone(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;

  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value });
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
}

function resolveTimezone(value: unknown, fallback?: string): string {
  if (isValidTimezone(value)) return value;
  return isValidTimezone(fallback) ? fallback : 'UTC';
}

function getWeatherCacheKey(city: City): string {
  return `${city.id}:${city.latitude},${city.longitude}`;
}

export function getCachedWeather(city: City): CachedWeather | null {
  const entry = weatherCache.get(getWeatherCacheKey(city));
  if (!entry) return null;
  return { data: entry.data, ageMs: Math.max(0, Date.now() - entry.cachedAt) };
}

export function clearWeatherCache(): void {
  weatherCache.clear();
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const { response, data } = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`,
    signal,
  );

  if (!response.ok) throw httpError(response.status);
  if (!isRecord(data) || (data.results !== undefined && !Array.isArray(data.results))) {
    throw invalidResponseError();
  }

  return data.results === undefined ? [] : data.results.map(toCity);
}

function toMeasurement(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function dailyMeasurement(value: unknown, index: number): number | null {
  return Array.isArray(value) ? toMeasurement(value[index]) : null;
}

function isForecastDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return (
    Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
  );
}

export async function getWeather(
  city: City,
  signal?: AbortSignal,
  options: WeatherRequestOptions = {},
): Promise<WeatherData> {
  if (signal?.aborted) throw abortError();
  const cacheKey = getWeatherCacheKey(city);
  const cached = weatherCache.get(cacheKey);
  if (
    !options.forceRefresh &&
    cached &&
    Date.now() - cached.cachedAt < WEATHER_CACHE_TTL_MS
  ) {
    return cached.data;
  }

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
  const { response, data } = await fetchWithTimeout(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );

  if (!response.ok) throw httpError(response.status);
  if (!isRecord(data)) throw invalidResponseError();

  const currentData = isRecord(data.current) ? data.current : {};
  const dailyData = isRecord(data.daily) ? data.daily : {};
  const dailyDates = Array.isArray(dailyData.time) ? dailyData.time : [];

  const current: CurrentWeather = {
    temperatureC: toMeasurement(currentData.temperature_2m),
    apparentTemperatureC: toMeasurement(currentData.apparent_temperature),
    humidityPercent: toMeasurement(currentData.relative_humidity_2m),
    windSpeedKmh: toMeasurement(currentData.wind_speed_10m),
    uvIndex: toMeasurement(currentData.uv_index),
    precipitationMm: toMeasurement(currentData.precipitation),
    pressureHpa: toMeasurement(currentData.surface_pressure),
    weatherCode: toMeasurement(currentData.weather_code),
  };
  const forecast: ForecastDay[] = dailyDates
    .flatMap((date: unknown, index: number) =>
      isForecastDate(date)
        ? [
            {
              date,
              temperatureMaxC: dailyMeasurement(dailyData.temperature_2m_max, index),
              temperatureMinC: dailyMeasurement(dailyData.temperature_2m_min, index),
              precipitationProbability: dailyMeasurement(
                dailyData.precipitation_probability_max,
                index,
              ),
              weatherCode: dailyMeasurement(dailyData.weather_code, index),
            },
          ]
        : [],
    )
    .slice(0, 5);

  if (![...Object.values(current), ...forecast.flatMap(Object.values)].some(Number.isFinite)) {
    throw new WeatherServiceError(
      'Não há dados meteorológicos disponíveis para essa cidade. Tente novamente mais tarde.',
      undefined,
      'unavailable',
    );
  }

  const weather: WeatherData = {
    city,
    timezone: resolveTimezone(data.timezone, city.timezone),
    current,
    forecast,
    receivedAt: new Date().toISOString(),
  };
  weatherCache.delete(cacheKey);
  weatherCache.set(cacheKey, { data: weather, cachedAt: Date.now() });
  if (weatherCache.size > MAX_WEATHER_CACHE_ENTRIES) {
    const oldestCacheKey = weatherCache.keys().next().value;
    if (oldestCacheKey !== undefined) weatherCache.delete(oldestCacheKey);
  }
  return weather;
}
