import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getCachedWeather,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface WeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  selectedCity: City | null;
  error: string | null;
  query: string;
  isStale: boolean;
  cacheAgeMs: number | null;
}

type Operation =
  | { type: 'search'; name: string }
  | { type: 'select'; city: City; forceRefresh?: boolean };

function isSameCity(first: City | null, second: City): boolean {
  return (
    first?.id === second.id &&
    first.latitude === second.latitude &&
    first.longitude === second.longitude
  );
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    selectedCity: null,
    error: null,
    query: '',
    isStale: false,
    cacheAgeMs: null,
  });
  const lastOperation = useRef<Operation | null>(null);
  const requestId = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      requestId.current += 1;
      activeRequest.current?.abort();
    };
  }, []);

  const execute = useCallback(async (operation: Operation): Promise<void> => {
    const id = ++requestId.current;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    lastOperation.current = operation;
    setState((previous) => {
      const selectedCity = operation.type === 'select' ? operation.city : null;
      const keepSnapshot =
        selectedCity !== null && isSameCity(previous.selectedCity, selectedCity);
      return {
        ...previous,
        status: 'loading',
        data: keepSnapshot ? previous.data : null,
        selectedCity,
        error: null,
        query: operation.type === 'search' ? operation.name : previous.query,
        cities: operation.type === 'search' ? [] : previous.cities,
        isStale: keepSnapshot ? previous.isStale : false,
        cacheAgeMs: keepSnapshot ? previous.cacheAgeMs : null,
      };
    });

    let city: City | undefined;
    try {
      if (operation.type === 'search') {
        if (operation.name.length < 2) {
          setState((previous) => ({
            ...previous,
            status: 'error',
            error: 'Digite pelo menos dois caracteres para buscar uma cidade.',
          }));
          return;
        }

        const cities = await searchCities(operation.name, controller.signal);
        if (id !== requestId.current) return;
        setState((previous) => ({ ...previous, cities }));
        const firstCity = cities[0];
        if (!firstCity) {
          setState((previous) => ({
            ...previous,
            status: 'empty',
            selectedCity: null,
          }));
          return;
        }
        city = firstCity;
        setState((previous) => ({ ...previous, selectedCity: firstCity }));
      } else {
        city = operation.city;
      }

      if (!city) return;
      const data =
        operation.type === 'select' && operation.forceRefresh
          ? await getWeather(city, controller.signal, { forceRefresh: true })
          : await getWeather(city, controller.signal);
      if (id !== requestId.current) return;
      setState((previous) => ({
        ...previous,
        status: 'success',
        data,
        isStale: false,
        cacheAgeMs: null,
      }));
    } catch (error) {
      if (id !== requestId.current || controller.signal.aborted) return;
      const cached = city ? getCachedWeather(city) : null;
      setState((previous) => ({
        ...previous,
        status: 'error',
        data:
          cached?.data ??
          (operation.type === 'select' && operation.forceRefresh ? previous.data : null),
        error:
          error instanceof WeatherServiceError
            ? error.message
            : 'Não foi possível concluir a consulta. Tente novamente.',
        isStale:
          cached !== null ||
          (operation.type === 'select' &&
            operation.forceRefresh === true &&
            previous.data !== null),
        cacheAgeMs:
          cached?.ageMs ??
          (operation.type === 'select' && operation.forceRefresh && previous.data
            ? Math.max(0, Date.now() - Date.parse(previous.data.receivedAt))
            : null),
      }));
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }, []);

  const search = useCallback(
    (name: string) => execute({ type: 'search', name: name.trim() }),
    [execute],
  );
  const selectCity = useCallback((city: City) => execute({ type: 'select', city }), [execute]);
  const refresh = useCallback(async (): Promise<void> => {
    if (state.selectedCity) {
      await execute({ type: 'select', city: state.selectedCity, forceRefresh: true });
    }
  }, [execute, state.selectedCity]);
  const retry = useCallback(async (): Promise<void> => {
    if (lastOperation.current) await execute(lastOperation.current);
  }, [execute]);

  return { ...state, search, selectCity, refresh, retry };
}
