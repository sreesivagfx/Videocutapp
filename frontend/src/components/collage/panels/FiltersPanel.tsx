"use client";

import { applyPreset, computeFilterString, FILTER_PRESETS } from "@/lib/collage/filters";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";

export default function FiltersPanel({ editor }: { editor: CollageEditor }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-slate-400">Filters</p>
      <div className="grid grid-cols-3 gap-2">
        {FILTER_PRESETS.map((p) => {
          const active = editor.state.filterPresetId === p.id;
          const filter = computeFilterString(applyPreset(p));
          return (
            <button
              key={p.id}
              onClick={() => editor.applyFilterPreset(p.id)}
              className={`flex flex-col items-center gap-1.5 rounded-md border p-1.5 ${
                active ? "border-accent-400 bg-accent-500/10" : "border-surface-border bg-ink-900 hover:border-accent-500/50"
              }`}
            >
              <div
                className="h-12 w-full rounded"
                style={{
                  filter,
                  background: "linear-gradient(135deg, #ff9a6c 0%, #6c8cff 50%, #3ee0a8 100%)",
                }}
              />
              <span className="text-[10px] text-slate-400">{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
