export function AppHome() {
  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Prototype</p>
        <h1 className="text-3xl font-semibold tracking-tight">Hello, this is your canvas.</h1>
        <p className="text-sm text-zinc-500">
          Edit <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.85em]">src/routes/app/home.tsx</code> to start building.
          Drag with your mouse in touch mode to scroll.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-3 gap-3">
        <Breakpoint name="sm" />
        <Breakpoint name="md" />
        <Breakpoint name="lg" />
      </section>

      <section className="mt-8 space-y-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <article
            key={i}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow"
          >
            <div className="flex items-start gap-3">
              <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-zinc-900">Card {i + 1}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                  This is a scrollable list. Drag inside the viewport (in touch mode) to scroll with inertia, just like a phone.
                </p>
              </div>
              <button className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50">
                Open
              </button>
            </div>
          </article>
        ))}
      </section>

      <footer className="mt-10 pb-6 text-center text-xs text-zinc-400">end of list</footer>
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
      className={`rounded-lg border border-zinc-200 px-3 py-2 text-center text-xs font-medium text-zinc-500 ${active[name]}`}
    >
      {name}
    </div>
  );
}
