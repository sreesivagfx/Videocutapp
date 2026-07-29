import { Bell, Search } from "lucide-react";

export default function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-surface-border bg-ink-950/60 px-8 py-5 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md border border-surface-border bg-ink-900 px-3 py-1.5 text-sm text-slate-400">
          <Search className="h-4 w-4" />
          <span>Search projects…</span>
        </div>
        <button className="rounded-md border border-surface-border p-2 text-slate-400 hover:text-slate-200">
          <Bell className="h-4 w-4" />
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600" />
      </div>
    </header>
  );
}
