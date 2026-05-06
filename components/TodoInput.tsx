interface TodoInputProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function TodoInput({
  value,
  error,
  onChange,
  onSubmit,
}: TodoInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="todo-input">
          Nueva tarea
        </label>
        <input
          id="todo-input"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder="Escribe una tarea importante..."
          className="min-h-14 flex-1 rounded-2xl border border-black/10 bg-white/80 px-4 text-base text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100"
          maxLength={120}
        />
        <button
          type="button"
          onClick={onSubmit}
          className="min-h-14 rounded-2xl bg-sky-600 px-6 font-medium text-white shadow-lg shadow-sky-600/20 transition hover:-translate-y-0.5 hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/30"
        >
          Anadir tarea
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-rose-500" role="alert">
          {error}
        </p>
        <p className="text-slate-500 dark:text-slate-400">{value.length}/120</p>
      </div>
    </div>
  );
}
