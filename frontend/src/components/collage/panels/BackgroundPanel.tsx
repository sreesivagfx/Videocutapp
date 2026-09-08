"use client";

import type { CollageEditor } from "@/lib/collage/useCollageEditor";
import { GRADIENT_PRESETS, SOLID_SWATCHES, backgroundToCss } from "@/lib/collage/background";
import Slider from "../Slider";

export default function BackgroundPanel({ editor }: { editor: CollageEditor }) {
  const b = editor.state.border;
  const set = (partial: Parameters<CollageEditor["setBorder"]>[0], commit: "immediate" | "debounced" = "debounced") =>
    editor.setBorder(partial, commit);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <Slider label="Photo spacing" value={b.gap} min={0} max={40} suffix="px" onChange={(v) => set({ gap: v })} />
        <Slider label="Corner radius" value={b.radius} min={0} max={60} suffix="px" onChange={(v) => set({ radius: v })} />
        <Slider label="Outer frame" value={b.frameWidth} min={0} max={80} suffix="px" onChange={(v) => set({ frameWidth: v })} />
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-400">Background color</p>
        <div className="flex flex-wrap gap-2">
          {SOLID_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => set({ bg: c }, "immediate")}
              className={`h-7 w-7 rounded-full border-2 ${b.bg === c ? "border-accent-400" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <label
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-dashed border-slate-500 text-[10px] text-slate-400"
            title="Custom color"
          >
            +
            <input
              type="color"
              value={b.bg.startsWith("#") ? b.bg : "#0f1420"}
              onChange={(e) => set({ bg: e.target.value }, "immediate")}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-400">Gradients</p>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g.id}
              onClick={() => set({ bg: g.id }, "immediate")}
              className={`h-9 rounded-md border-2 ${b.bg === g.id ? "border-accent-400" : "border-transparent"}`}
              style={{ background: backgroundToCss(g.id) }}
              title={g.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
