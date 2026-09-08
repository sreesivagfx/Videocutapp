"use client";

import { useState } from "react";
import { RATIO_GROUPS, RATIOS } from "@/lib/collage/ratios";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";

export default function RatioPanel({ editor }: { editor: CollageEditor }) {
  const [customW, setCustomW] = useState(editor.state.customRatio?.w ?? 1);
  const [customH, setCustomH] = useState(editor.state.customRatio?.h ?? 1);

  return (
    <div className="space-y-5">
      {RATIO_GROUPS.map((group) => (
        <div key={group}>
          <p className="mb-2 text-xs font-medium text-slate-400">{group}</p>
          <div className="grid grid-cols-3 gap-2">
            {RATIOS.filter((r) => r.group === group).map((r) => {
              const isCustom = r.id === "custom";
              const active = editor.state.ratioId === r.id;
              const boxRatio = r.w / r.h;
              const boxStyle =
                boxRatio >= 1 ? { width: 28, height: 28 / boxRatio } : { width: 28 * boxRatio, height: 28 };
              return (
                <button
                  key={r.id}
                  onClick={() => (isCustom ? editor.setCustomRatio(customW, customH) : editor.setRatio(r.id))}
                  className={`flex flex-col items-center gap-1.5 rounded-md border p-2 text-center ${
                    active ? "border-accent-400 bg-accent-500/10" : "border-surface-border bg-ink-900 hover:border-accent-500/50"
                  }`}
                >
                  <div className="flex h-8 items-center justify-center">
                    <div className="border border-slate-400/70" style={boxStyle} />
                  </div>
                  <span className="text-[10px] leading-tight text-slate-400">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {editor.state.ratioId === "custom" && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">Custom ratio</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={customW}
              onChange={(e) => {
                const v = Math.max(1, Number(e.target.value) || 1);
                setCustomW(v);
                editor.setCustomRatio(v, customH);
              }}
              className="w-full rounded-md border border-surface-border bg-ink-900 px-2 py-1.5 text-sm text-slate-200"
            />
            <span className="text-slate-500">:</span>
            <input
              type="number"
              min={1}
              value={customH}
              onChange={(e) => {
                const v = Math.max(1, Number(e.target.value) || 1);
                setCustomH(v);
                editor.setCustomRatio(customW, v);
              }}
              className="w-full rounded-md border border-surface-border bg-ink-900 px-2 py-1.5 text-sm text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
