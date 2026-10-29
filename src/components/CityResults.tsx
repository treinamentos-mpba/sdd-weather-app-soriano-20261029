import { useId } from 'react';
import type { City } from '../types/weather';

export interface CityResultsProps {
  cities: City[];
  selectedCity: City | null;
  onSelect: (city: City) => void;
  disabled?: boolean;
}

function getCityContext(city: City): string {
  return [city.admin1, city.country].filter(Boolean).join(', ');
}

export default function CityResults({
  cities,
  selectedCity,
  onSelect,
  disabled = false,
}: CityResultsProps) {
  const headingId = useId();
  if (cities.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <h2 id={headingId} className="mb-3 text-lg font-semibold">
        Resultados da busca
      </h2>
      <ul className="space-y-2">
        {cities.map((city) => {
          const context = getCityContext(city);
          const isSelected =
            selectedCity?.id === city.id &&
            selectedCity.latitude === city.latitude &&
            selectedCity.longitude === city.longitude;

          return (
            <li key={`${city.id}-${city.latitude}-${city.longitude}`}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={context ? `${city.name}, ${context}` : city.name}
                disabled={disabled}
                onClick={() => onSelect(city)}
                className="flex min-h-11 w-full flex-col items-start justify-center rounded-xl border border-white/10 px-4 py-2 text-left transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 aria-pressed:border-accent-400 aria-pressed:bg-accent-400/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="font-semibold">{city.name}</span>
                {context && <span className="text-sm text-slate-300">{context}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
