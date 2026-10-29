import { useEffect, useId, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { MOCK_WEATHER } from './mocks/weather';
import type { Unit } from './types/weather';

const demoStates = [
  { value: 'idle', label: 'Inicial' },
  { value: 'loading', label: 'Carregando' },
  { value: 'empty', label: 'Sem resultados' },
  { value: 'error', label: 'Erro' },
  { value: 'success', label: 'Sucesso' },
] as const;

type DemoStatus = (typeof demoStates)[number]['value'];

const receivedAt = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: MOCK_WEATHER.timezone,
}).format(new Date(MOCK_WEATHER.receivedAt));

export default function App() {
  const demoId = useId();
  const [unit, setUnit] = useState<Unit>('celsius');
  const [status, setStatus] = useState<DemoStatus>('idle');
  const [query, setQuery] = useState(MOCK_WEATHER.city.name);

  useEffect(() => {
    if (status !== 'loading') return;

    const timer = window.setTimeout(() => {
      const matches =
        query.toLocaleLowerCase('pt-BR') === MOCK_WEATHER.city.name.toLocaleLowerCase('pt-BR');
      setStatus(matches ? 'success' : 'empty');
    }, 600);

    return () => window.clearTimeout(timer);
  }, [status, query]);

  function search(city: string) {
    setQuery(city);
    setStatus('loading');
  }

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
          <p className="text-slate-300">
            Demonstração sem API: dados fictícios e fixos de Salvador.
          </p>
          <SearchBar onSearch={search} disabled={status === 'loading'} />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label htmlFor={demoId}>Estado da demonstração</label>
            <select
              id={demoId}
              value={status}
              onChange={(event) => {
                const next = demoStates.find((state) => state.value === event.target.value);
                if (next) {
                  if (next.value === 'loading') setQuery(MOCK_WEATHER.city.name);
                  setStatus(next.value);
                }
              }}
              className="min-h-11 rounded-xl border border-white/10 bg-night-800 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
            >
              {demoStates.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 space-y-6">
          {status === 'idle' && (
            <EmptyState
              title="Como está o tempo?"
              hint="Busque Salvador para explorar o exemplo ou escolha um estado da demonstração."
            />
          )}
          {status === 'loading' && <LoadingState message="Consultando o exemplo de clima..." />}
          {status === 'empty' && (
            <EmptyState hint="Este exemplo contém apenas Salvador. Digite Salvador para ver o clima." />
          )}
          {status === 'error' && (
            <ErrorState
              message="Falha simulada na consulta. Nenhuma API foi acessada."
              onRetry={() => search(query)}
            />
          )}
          {status === 'success' && (
            <>
              <CurrentWeather city={MOCK_WEATHER.city} current={MOCK_WEATHER.current} unit={unit} />
              <ForecastList
                forecast={MOCK_WEATHER.forecast}
                unit={unit}
                referenceDate={MOCK_WEATHER.forecast[0].date}
              />
              <p className="text-sm text-slate-300">
                Snapshot fictício de <time dateTime={MOCK_WEATHER.receivedAt}>{receivedAt}</time> (
                {MOCK_WEATHER.timezone}). Não representa o clima atual.
              </p>
            </>
          )}
        </main>
        <footer className="border-t border-white/10 pt-4 text-sm text-slate-300">
          Feito com React e Tailwind CSS · Integração prevista com{' '}
          <a
            href="https://open-meteo.com/"
            className="rounded text-accent-400 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            Open-Meteo
          </a>
          . Esta demonstração usa somente dados mockados.
        </footer>
      </div>
    </div>
  );
}
