"use client";

import {
  CheckCircle2,
  Clock3,
  ListTodo,
  MoonStar,
  Sparkles,
  SunMedium,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import TodoFilter from "@/components/TodoFilter";
import TodoInput from "@/components/TodoInput";
import TodoItem from "@/components/TodoItem";
import type {
  Todo,
  TodoActivity,
  TodoFilter as TodoFilterValue,
  TodoHistoryEntry,
} from "@/types/todo";

const TODOS_STORAGE_KEY = "todo-pro-items";
const TODO_ACTIVITY_STORAGE_KEY = "todo-pro-activity";
const THEME_STORAGE_KEY = "todo-pro-theme";

function createHistoryEntry(
  type: TodoHistoryEntry["type"],
  timestamp = Date.now(),
): TodoHistoryEntry {
  return { type, timestamp };
}

function createTodo(text: string): Todo {
  const timestamp = Date.now();

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${timestamp}`,
    text,
    completed: false,
    createdAt: timestamp,
    history: [createHistoryEntry("created", timestamp)],
  };
}

function normalizeTodo(todo: Todo): Todo {
  const history =
    Array.isArray(todo.history) && todo.history.length > 0
      ? todo.history
      : [createHistoryEntry("created", todo.createdAt)];

  return {
    ...todo,
    history,
  };
}

function createActivity(
  todoId: string,
  todoText: string,
  type: TodoActivity["type"],
): TodoActivity {
  const timestamp = Date.now();

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${todoId}-${timestamp}-${type}`,
    todoId,
    todoText,
    type,
    timestamp,
  };
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(timestamp);
}

export default function TodoContainer() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activity, setActivity] = useState<TodoActivity[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<TodoFilterValue>("all");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedTodos = window.localStorage.getItem(TODOS_STORAGE_KEY);
      const savedActivity = window.localStorage.getItem(
        TODO_ACTIVITY_STORAGE_KEY,
      );
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      if (savedTodos) {
        try {
          const parsedTodos = JSON.parse(savedTodos) as Todo[];
          setTodos(parsedTodos.map(normalizeTodo));
        } catch {
          window.localStorage.removeItem(TODOS_STORAGE_KEY);
        }
      }

      if (savedActivity) {
        try {
          const parsedActivity = JSON.parse(savedActivity) as TodoActivity[];
          setActivity(parsedActivity);
        } catch {
          window.localStorage.removeItem(TODO_ACTIVITY_STORAGE_KEY);
        }
      }

      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }

      setHydrated(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  }, [hydrated, todos]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      TODO_ACTIVITY_STORAGE_KEY,
      JSON.stringify(activity),
    );
  }, [activity, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [hydrated, theme]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [filter, todos]);

  const pendingCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
    }),
    [todos],
  );

  const recentActivity = useMemo(
    () =>
      [...activity]
        .sort((first, second) => second.timestamp - first.timestamp)
        .slice(0, 8),
    [activity],
  );

  const handleAddTodo = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      setError("Escribe una tarea antes de intentar anadirla.");
      return;
    }

    if (trimmedValue.length < 3) {
      setError("La tarea debe tener al menos 3 caracteres.");
      return;
    }

    const nextTodo = createTodo(trimmedValue);

    setTodos((currentTodos) => [nextTodo, ...currentTodos]);
    setActivity((currentActivity) => [
      createActivity(nextTodo.id, nextTodo.text, "created"),
      ...currentActivity,
    ]);
    setInputValue("");
    setError("");
  };

  const handleToggleTodo = (id: string) => {
    let nextActivity: TodoActivity | null = null;

    setTodos((currentTodos) =>
      currentTodos.map((todo) => {
        if (todo.id !== id) {
          return todo;
        }

        const nextCompleted = !todo.completed;
        const actionType = nextCompleted ? "completed" : "reopened";
        nextActivity = createActivity(todo.id, todo.text, actionType);

        return {
          ...todo,
          completed: nextCompleted,
          history: [...todo.history, createHistoryEntry(actionType)],
        };
      }),
    );

    if (nextActivity) {
      setActivity((currentActivity) => [nextActivity!, ...currentActivity]);
    }
  };

  const handleDeleteTodo = (id: string) => {
    let nextActivity: TodoActivity | null = null;

    setTodos((currentTodos) => {
      const todoToDelete = currentTodos.find((todo) => todo.id === id);

      if (todoToDelete) {
        nextActivity = createActivity(todoToDelete.id, todoToDelete.text, "deleted");
      }

      return currentTodos.filter((todo) => todo.id !== id);
    });

    if (nextActivity) {
      setActivity((currentActivity) => [nextActivity!, ...currentActivity]);
    }
  };

  return (
    <section className="w-full max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/75 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/30">
        <div className="border-b border-black/5 bg-linear-to-r from-sky-500 via-cyan-500 to-emerald-400 px-6 py-6 text-white sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Organiza tu dia con foco
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  To-Do Pro
                </h1>
                <p className="max-w-xl text-sm text-white/85 sm:text-base">
                  Gestiona tus tareas, filtra lo importante y conserva todo en
                  tu navegador con una experiencia limpia y rapida.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setTheme((currentTheme) =>
                  currentTheme === "dark" ? "light" : "dark",
                )
              }
              className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/20"
            >
              {theme === "dark" ? (
                <SunMedium className="h-4 w-4" />
              ) : (
                <MoonStar className="h-4 w-4" />
              )}
              {theme === "dark" ? "Modo claro" : "Modo oscuro"}
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          <TodoInput
            value={inputValue}
            error={error}
            onChange={(value) => {
              setInputValue(value);
              if (error) {
                setError("");
              }
            }}
            onSubmit={handleAddTodo}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TodoFilter value={filter} counts={counts} onChange={setFilter} />

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {pendingCount} pendiente{pendingCount === 1 ? "" : "s"}
            </div>
          </div>

          {filteredTodos.length > 0 ? (
            <ul className="space-y-3">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </ul>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300/90 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/60">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm dark:bg-slate-950">
                <ListTodo className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {todos.length === 0
                  ? "Todavia no hay tareas"
                  : "No hay tareas para este filtro"}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {todos.length === 0
                  ? "Crea tu primera tarea para empezar a organizar el dia."
                  : "Prueba con otro filtro o crea una nueva tarea."}
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-black/5 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-900/60">
            <div className="mb-4 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-sky-500" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                Historial reciente
              </h2>
            </div>

            {recentActivity.length > 0 ? (
              <ul className="space-y-2">
                {recentActivity.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-col gap-1 rounded-2xl bg-white px-4 py-3 text-sm dark:bg-slate-950/80 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-slate-700 dark:text-slate-200">
                      <span className="font-medium">{entry.todoText}</span>{" "}
                      {entry.type === "created"
                        ? "fue creada"
                        : entry.type === "completed"
                          ? "fue finalizada"
                          : entry.type === "reopened"
                            ? "volvio a pendiente"
                            : "fue eliminada"}
                    </div>
                    <div
                      className={[
                        "inline-flex items-center gap-1 self-start rounded-full px-2.5 py-1 text-xs",
                        entry.type === "deleted"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300",
                      ].join(" ")}
                    >
                      {entry.type === "deleted" ? (
                        <Trash2 className="h-3 w-3" />
                      ) : (
                        <Clock3 className="h-3 w-3" />
                      )}
                      {formatDate(entry.timestamp)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aun no hay acciones registradas.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
