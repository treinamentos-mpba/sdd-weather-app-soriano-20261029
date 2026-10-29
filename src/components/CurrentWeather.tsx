import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

export interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatMetric(value: number | null, suffix: string): string {
  if (value === null || !Number.isFinite(value)) return 'Indisponível';
  return `${numberFormatter.format(value)}${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherCondition(current.weatherCode);
  const temperature = formatTemperature(current.temperatureC, unit);
  const region = [city.admin1, city.country].filter(Boolean).join(', ');
  const metrics = [
    { label: 'Umidade', value: formatMetric(current.humidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, ' km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, ' mm') },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, ' hPa') },
    { label: 'Índice UV', value: formatMetric(current.uvIndex, '') },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 font-sans text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <h2 id={headingId} className="break-words text-2xl font-semibold sm:text-3xl">
        Clima atual em {city.name}
      </h2>
      {region && <p className="mt-1 text-slate-300">{region}</p>}
      <div className="my-6 flex flex-wrap items-center gap-6">
        <span aria-hidden="true" className="text-6xl text-sun sm:text-8xl">
          {condition.icon}
        </span>
        <div className="min-w-0 max-w-full">
          <p
            className={`break-words font-semibold tracking-tight ${temperature === 'Indisponível' ? 'text-2xl sm:text-3xl' : 'text-5xl sm:text-7xl'}`}
          >
            <span className="sr-only">Temperatura: </span>
            {temperature}
          </p>
          <p className="mt-2 text-lg">{condition.label}</p>
          <p className="mt-1 text-slate-300">
            Sensação térmica: {formatTemperature(current.apparentTemperatureC, unit)}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-night-900/50 p-4">
            <dt className="text-sm text-slate-300">{label}</dt>
            <dd className="mt-1 text-lg font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
