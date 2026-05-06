"use client";

import { CheckCircle2, ListTodo, MoonStar, Sparkles, SunMedium } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import TodoFilter from "@/components/TodoFilter";
import TodoInput from "@/components/TodoInput";
import TodoItem from "@/components/TodoItem";
import type { Todo, TodoFilter as TodoFilterValue } from "@/types/todo";

const TODOS_STORAGE_KEY = "todo-pro-items";
const THEME_STORAGE_KEY = "todo-pro-theme";

function createTodo(text: string): Todo {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    text,
    completed: false,
    createdAt: Date.now(),
  };
}

export default function TodoContainer() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<TodoFilterValue>("all");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedTodos = window.localStorage.getItem(TODOS_STORAGE_KEY);
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      if (savedTodos) {
        try {
          const parsedTodos = JSON.parse(savedTodos) as Todo[];
          setTodos(parsedTodos);
        } catch {
          window.localStorage.removeItem(TODOS_STORAGE_KEY);
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

    setTodos((currentTodos) => [createTodo(trimmedValue), ...currentTodos]);
    setInputValue("");
    setError("");
  };

  const handleToggleTodo = (id: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
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
        </div>
      </div>
    </section>
  );
}
