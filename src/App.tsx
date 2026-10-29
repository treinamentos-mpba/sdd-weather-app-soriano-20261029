import { useEffect, useMemo, useRef, useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import WeatherRefreshButton from './components/WeatherRefreshButton';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

const UNIT_PREFERENCE_KEY = 'sdd-weather-unit';

function readUnitPreference(): Unit {
  try {
    return window.localStorage.getItem(UNIT_PREFERENCE_KEY) === 'fahrenheit'
      ? 'fahrenheit'
      : 'celsius';
  } catch {
    return 'celsius';
  }
}

function saveUnitPreference(unit: Unit): void {
  try {
    window.localStorage.setItem(UNIT_PREFERENCE_KEY, unit);
  } catch {
    return;
  }
}

function formatCacheAge(ageMs: number): string {
  const totalMinutes = Math.ceil(ageMs / 60_000);
  if (totalMinutes < 1) return 'menos de 1 minuto';
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export default function App() {
  const [unit, setUnit] = useState<Unit>(readUnitPreference);
  const { status, data, cities, selectedCity, error, isStale, cacheAgeMs, search, selectCity, refresh, retry } =
    useWeather();
  const mainRef = useRef<HTMLElement>(null);
  const hadPendingOperation = useRef(false);
  const receivedAt = useMemo(
    () =>
      data
        ? new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: data.timezone,
          }).format(new Date(data.receivedAt))
        : null,
    [data],
  );
  useEffect(() => {
  saveUnitPreference(unit);
  }, [unit]);
  useEffect(() => {
    if (status === 'loading') {
      hadPendingOperation.current = true;
    } else if (hadPendingOperation.current) {
      hadPendingOperation.current = false;
      mainRef.current?.focus();
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-night-900 font-sans text-white">
      <a
        href="#main-content"
        className="sr-only rounded-xl bg-accent-400 p-3 text-night-900 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10"
      >
        Ir para o conteúdo
      </a>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="flex items-center gap-3 text-2xl font-bold">
              <span aria-hidden="true" className="text-sun">
                ☀️
              </span>
              SDD Weather
            </h1>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
          <p className="text-slate-300">Consulte o clima atual e a previsão para sua cidade.</p>
          <SearchBar onSearch={search} disabled={status === 'loading'} />
        </header>
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          aria-busy={status === 'loading'}
          className="flex-1 space-y-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
        >
          {status === 'idle' && (
            <EmptyState
              title="Como está o tempo?"
              hint="Digite o nome de uma cidade para consultar o clima e a previsão."
            />
          )}
          <CityResults
            cities={cities}
            selectedCity={selectedCity}
            onSelect={selectCity}
            disabled={status === 'loading'}
          />
          {selectedCity && (
            <WeatherRefreshButton onRefresh={refresh} disabled={status === 'loading'} />
          )}
          {status === 'loading' && <LoadingState message="Consultando o clima..." />}
          {status === 'empty' && <EmptyState />}
          {status === 'error' && error !== null && <ErrorState message={error} onRetry={retry} />}
          {data && (
            <>
              {isStale && cacheAgeMs !== null && (
                <p role="status" className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-amber-100">
                  Exibindo dados anteriores, recebidos há {formatCacheAge(cacheAgeMs)}.
                </p>
              )}
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList
                forecast={data.forecast}
                unit={unit}
                referenceDate={data.forecast[0]?.date}
              />
              <p className="text-sm text-slate-300">
                Dados recebidos em <time dateTime={data.receivedAt}>{receivedAt}</time> (
                {data.timezone}).
              </p>
            </>
          )}
        </main>
        <footer className="border-t border-white/10 pt-4 text-sm text-slate-300">
          Feito com React e Tailwind CSS · Dados de{' '}
          <a
            href="https://open-meteo.com/"
            className="rounded text-accent-400 underline underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            Open-Meteo
          </a>
          .
        </footer>
      </div>
    </div>
  );
}
