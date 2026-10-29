import { type FormEvent, useId, useState } from 'react';

export interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const query = city.trim();
    if (query.length < 2) {
      setError('Digite pelo menos 2 caracteres para buscar uma cidade.');
      return;
    }

    setError(null);
    onSearch(query);
  }

  return (
    <form
      role="search"
      aria-label="Busca de cidades"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <label htmlFor={inputId} className="mb-2 block font-medium">
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          name="city"
          type="search"
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setError(null);
          }}
          disabled={disabled}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          placeholder="Ex.: Salvador"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-night-900 px-4 py-2 text-white placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="min-h-11 rounded-xl bg-accent-400 px-5 py-2 font-semibold text-night-900 hover:bg-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
