import { Outlet } from '@tanstack/react-router';

export function AppShell() {
  return (
    <div className="min-h-full bg-white text-zinc-900">
      <Outlet />
    </div>
  );
}
