"use client";

import { Grid2x2, ImageIcon, Palette, Sliders, Square, Type } from "lucide-react";

export type PanelTab = "layout" | "ratio" | "photos" | "filters" | "adjust" | "background" | "text";

const TABS: { id: PanelTab; label: string; icon: typeof Grid2x2 }[] = [
  { id: "layout", label: "Layout", icon: Grid2x2 },
  { id: "ratio", label: "Ratio", icon: Square },
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "filters", label: "Filters", icon: Palette },
  { id: "adjust", label: "Adjust", icon: Sliders },
  { id: "background", label: "Frame", icon: Grid2x2 },
  { id: "text", label: "Text", icon: Type },
];

export default function TabRail({ active, onChange }: { active: PanelTab; onChange: (t: PanelTab) => void }) {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-surface-border bg-ink-950 py-3">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex w-14 flex-col items-center gap-1 rounded-md py-2 text-[10px] ${
              isActive ? "bg-accent-500/15 text-accent-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
