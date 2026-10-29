const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  timeZone: 'UTC',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

function parseLocalDate(date: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError(`Data local inválida: ${date}`);
  }

  // UTC é apenas uma âncora de calendário: não converter para o fuso do navegador.
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new RangeError(`Data local inválida: ${date}`);
  }
  return parsed;
}

export function formatDayLabel(date: string, referenceDate?: string): string {
  const day = parseLocalDate(date);
  if (referenceDate) {
    const difference = (day.getTime() - parseLocalDate(referenceDate).getTime()) / 86_400_000;
    if (difference === 0) return 'Hoje';
    if (difference === 1) return 'Amanhã';
  }
  return weekdayFormatter.format(day);
}

export function formatForecastDate(date: string): string {
  return dateFormatter.format(parseLocalDate(date));
}

export function formatPrecipitationProbability(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value < 0 || value > 100) {
    return 'Indisponível';
  }
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`;
}
