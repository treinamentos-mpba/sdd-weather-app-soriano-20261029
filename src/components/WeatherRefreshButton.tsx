export interface WeatherRefreshButtonProps {
  onRefresh: () => void;
  disabled?: boolean;
}

export default function WeatherRefreshButton({
  onRefresh,
  disabled = false,
}: WeatherRefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={disabled}
      className="min-h-11 rounded-xl border border-white/20 bg-white/5 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Atualizar
    </button>
  );
}
