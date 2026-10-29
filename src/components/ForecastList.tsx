import { useId } from 'react';
import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

export interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
  /** Data local de referência; por padrão, o primeiro dia do snapshot é hoje. */
  referenceDate?: string;
}

export default function ForecastList({ forecast, unit, referenceDate }: ForecastListProps) {
  const headingId = useId();
  const days = forecast.slice(0, 5);
  const today = referenceDate ?? days[0]?.date;

  return (
    <section aria-labelledby={headingId} className="font-sans text-white">
      <h2 id={headingId} className="mb-4 text-2xl font-semibold">
        Previsão de 5 dias
      </h2>
      {days.length === 0 ? (
        <p role="status" className="text-slate-300">
          Previsão indisponível.
        </p>
      ) : (
        <>
          {days.length < 5 && (
            <p role="status" className="mb-3 text-slate-300">
              Previsão incompleta: exibindo apenas os dias disponíveis.
            </p>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {days.map((day) => (
              <li key={day.date} className="min-w-0">
                <ForecastCard day={day} unit={unit} referenceDate={today} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
