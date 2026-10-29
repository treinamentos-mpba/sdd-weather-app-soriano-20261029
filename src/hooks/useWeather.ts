import { useCallback, useEffect, useRef, useState } from 'react';
import {
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
  error: string | null;
  query: string;
}

type Operation = { type: 'search'; name: string } | { type: 'select'; city: City };

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
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
    setState((previous) => ({
      ...previous,
      status: 'loading',
      data: null,
      error: null,
      query: operation.type === 'search' ? operation.name : previous.query,
      cities: operation.type === 'search' ? [] : previous.cities,
    }));

    try {
      let city: City;
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
          setState((previous) => ({ ...previous, status: 'empty' }));
          return;
        }
        city = firstCity;
      } else {
        city = operation.city;
      }

      const data = await getWeather(city, controller.signal);
      if (id !== requestId.current) return;
      setState((previous) => ({ ...previous, status: 'success', data }));
    } catch (error) {
      if (id !== requestId.current || controller.signal.aborted) return;
      setState((previous) => ({
        ...previous,
        status: 'error',
        error:
          error instanceof WeatherServiceError
            ? error.message
            : 'Não foi possível concluir a consulta. Tente novamente.',
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
  const retry = useCallback(async (): Promise<void> => {
    if (lastOperation.current) await execute(lastOperation.current);
  }, [execute]);

  return { ...state, search, selectCity, retry };
}
