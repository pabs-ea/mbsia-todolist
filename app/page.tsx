import TodoContainer from "@/components/TodoContainer";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_28%)]"
      />
      <TodoContainer />
    </main>
  );
}
