"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scissors,
  Type,
  Languages,
  Mic2,
  Settings,
  Film,
  Images,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/editor", label: "Editor", icon: Scissors },
  { href: "/collage", label: "Collage Studio", icon: Images },
  { href: "/styles-library", label: "Style Library", icon: Type },
  { href: "/translate", label: "Translate", icon: Languages },
  { href: "/audio-studio", label: "Audio Studio", icon: Mic2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-surface-border bg-ink-950">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500">
          <Film className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">VideoCut</p>
          <p className="text-[11px] text-slate-400">Shorts &amp; Corporate Studio</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-500/15 text-accent-400 font-medium"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-lg border border-surface-border bg-ink-900 p-3">
        <p className="text-xs font-medium text-slate-200">Free tier</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Local transcription &amp; TTS active. Add API keys in Settings for
          premium translation, TTS and voice cloning.
        </p>
      </div>
    </aside>
  );
}
