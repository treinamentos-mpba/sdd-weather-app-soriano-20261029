export interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  hint = 'Revise a grafia ou inclua o estado ou país e faça uma nova busca.',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <h2 className="break-words text-xl font-semibold">{title}</h2>
      <p className="mt-2 break-words text-slate-300">{hint}</p>
    </div>
  );
}
