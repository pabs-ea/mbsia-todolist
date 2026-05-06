import type { TodoFilter as TodoFilterValue } from "@/types/todo";

interface TodoFilterProps {
  value: TodoFilterValue;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
  onChange: (filter: TodoFilterValue) => void;
}

const FILTER_LABELS: Record<TodoFilterValue, string> = {
  all: "Todas",
  active: "Pendientes",
  completed: "Completadas",
};

export default function TodoFilter({
  value,
  counts,
  onChange,
}: TodoFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(FILTER_LABELS) as TodoFilterValue[]).map((filter) => {
        const isActive = value === filter;
        const count = counts[filter];

        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition",
              isActive
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-slate-100 dark:text-slate-900"
                : "bg-white/70 text-slate-600 hover:bg-white dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900",
            ].join(" ")}
          >
            {FILTER_LABELS[filter]} ({count})
          </button>
        );
      })}
    </div>
  );
}
