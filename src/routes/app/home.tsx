export function AppHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Prototype</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Hello, this is your canvas.
        </h1>
        <p className="mx-auto max-w-sm text-sm text-zinc-500 sm:text-base">
          Edit <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.85em]">src/routes/app/home.tsx</code> to start building.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Breakpoint name="sm" />
        <Breakpoint name="md" />
        <Breakpoint name="lg" />
      </div>
    </main>
  );
}

function Breakpoint({ name }: { name: 'sm' | 'md' | 'lg' }) {
  const active: Record<typeof name, string> = {
    sm: 'sm:bg-emerald-500 sm:text-white sm:border-emerald-500',
    md: 'md:bg-emerald-500 md:text-white md:border-emerald-500',
    lg: 'lg:bg-emerald-500 lg:text-white lg:border-emerald-500',
  };
  return (
    <div
      className={`rounded-lg border border-zinc-200 px-4 py-3 text-xs font-medium text-zinc-500 ${active[name]}`}
    >
      {name} breakpoint
    </div>
  );
}
