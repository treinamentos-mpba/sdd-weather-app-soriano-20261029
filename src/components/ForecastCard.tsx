import { useId } from 'react';
import { formatDayLabel, formatForecastDate, formatPrecipitationProbability } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

export interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  referenceDate?: string;
}

export default function ForecastCard({ day, unit, referenceDate }: ForecastCardProps) {
  const headingId = useId();
  const condition = getWeatherCondition(day.weatherCode);

  return (
    <article
      aria-labelledby={headingId}
      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <h3 id={headingId} className="break-words font-semibold">
        {formatDayLabel(day.date, referenceDate)}
      </h3>
      <time dateTime={day.date} className="text-sm text-slate-300">
        {formatForecastDate(day.date)}
      </time>
      <span aria-hidden="true" className="my-3 block text-4xl text-sun">
        {condition.icon}
      </span>
      <p className="mb-3 break-words text-sm text-slate-300">{condition.label}</p>
      <dl className="space-y-2 break-words text-sm">
        <div>
          <dt className="text-slate-300">Máxima</dt>
          <dd className="font-semibold">{formatTemperature(day.temperatureMaxC, unit)}</dd>
        </div>
        <div>
          <dt className="text-slate-300">Mínima</dt>
          <dd className="font-semibold">{formatTemperature(day.temperatureMinC, unit)}</dd>
        </div>
        <div>
          <dt className="text-slate-300">Probabilidade de chuva</dt>
          <dd className="font-semibold">
            {formatPrecipitationProbability(day.precipitationProbability)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
