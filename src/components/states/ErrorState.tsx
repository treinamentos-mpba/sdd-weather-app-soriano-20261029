export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 font-sans text-white shadow-glass backdrop-blur-md">
      <div role="alert">
        <h2 className="text-xl font-semibold text-red-300">Não foi possível concluir a consulta</h2>
        <p className="mt-2 break-words text-slate-300">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => onRetry()}
        className="mt-4 min-h-11 rounded-xl bg-accent-400 px-5 py-2 font-semibold text-night-900 transition-colors hover:bg-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        Tentar novamente
      </button>
    </div>
  );
}
