"use client";

import { useState } from "react";
import { LAYOUTS_BY_COUNT } from "@/lib/collage/layouts";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";

export default function LayoutPanel({ editor }: { editor: CollageEditor }) {
  const [count, setCount] = useState(editor.layout.count);
  const templates = LAYOUTS_BY_COUNT[count] ?? [];

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-slate-400">Number of photos</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(LAYOUTS_BY_COUNT)
            .map(Number)
            .sort((a, b) => a - b)
            .map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
                  n === count
                    ? "bg-accent-500 text-white"
                    : "bg-ink-800 text-slate-300 hover:bg-ink-700"
                }`}
              >
                {n}
              </button>
            ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-400">Templates</p>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => editor.setLayout(t.id)}
              title={t.name}
              className={`rounded-md border p-1.5 transition-colors ${
                editor.state.layoutId === t.id
                  ? "border-accent-400 bg-accent-500/10"
                  : "border-surface-border bg-ink-900 hover:border-accent-500/50"
              }`}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-ink-950">
                {t.cells.map((c, i) => (
                  <div
                    key={i}
                    className="absolute rounded-[2px] bg-slate-500/70"
                    style={{
                      left: `${c.x}%`,
                      top: `${c.y}%`,
                      width: `${c.w}%`,
                      height: `${c.h}%`,
                      margin: "1.5px",
                    }}
                  />
                ))}
              </div>
              <p className="mt-1 truncate text-[10px] text-slate-400">{t.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
