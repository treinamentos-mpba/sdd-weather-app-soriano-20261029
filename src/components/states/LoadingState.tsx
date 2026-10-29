export interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="h-6 w-6 shrink-0 rounded-full border-2 border-white/20 border-t-accent-400 motion-safe:animate-spin"
      />
      <p className="break-words">{message}</p>
    </div>
  );
}
