import { Trash2 } from "lucide-react";

import type { Todo } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li
      className={[
        "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200",
        todo.completed
          ? "border-emerald-500/20 bg-emerald-500/8"
          : "border-black/8 bg-white/75 hover:-translate-y-0.5 hover:border-sky-500/25 hover:bg-white dark:border-white/10 dark:bg-slate-950/70 dark:hover:border-sky-400/30",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        aria-label={
          todo.completed
            ? `Marcar "${todo.text}" como pendiente`
            : `Marcar "${todo.text}" como completada`
        }
        className={[
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
          todo.completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent hover:border-sky-500 dark:border-slate-600 dark:bg-slate-900",
        ].join(" ")}
      >
        <span className="text-sm">✓</span>
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "break-words text-sm transition sm:text-base",
            todo.completed
              ? "text-slate-400 line-through dark:text-slate-500"
              : "text-slate-800 dark:text-slate-100",
          ].join(" ")}
        >
          {todo.text}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Eliminar "${todo.text}"`}
        className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/15"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
