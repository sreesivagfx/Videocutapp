"use client";

import type { CollageEditor } from "@/lib/collage/useCollageEditor";
import Slider from "../Slider";

export default function AdjustPanel({ editor }: { editor: CollageEditor }) {
  const a = editor.state.adjust;
  const set = (partial: Parameters<CollageEditor["setAdjust"]>[0]) => editor.setAdjust(partial, "debounced");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">Adjust</p>
        <button onClick={editor.resetAdjust} className="text-[11px] text-accent-400 hover:underline">
          Reset all
        </button>
      </div>
      <Slider label="Brightness" value={a.brightness} min={50} max={150} onChange={(v) => set({ brightness: v })} />
      <Slider label="Contrast" value={a.contrast} min={50} max={150} onChange={(v) => set({ contrast: v })} />
      <Slider label="Saturation" value={a.saturation} min={0} max={200} onChange={(v) => set({ saturation: v })} />
      <Slider label="Warmth" value={a.warmth} min={-50} max={50} onChange={(v) => set({ warmth: v })} />
      <Slider label="Hue" value={a.hue} min={-180} max={180} suffix="°" onChange={(v) => set({ hue: v })} />
      <Slider label="Black & White" value={a.grayscale} min={0} max={100} onChange={(v) => set({ grayscale: v })} />
      <Slider label="Sepia" value={a.sepia} min={0} max={100} onChange={(v) => set({ sepia: v })} />
      <Slider label="Sharpen" value={a.sharpen} min={0} max={100} onChange={(v) => set({ sharpen: v })} />
      <Slider label="Blur" value={a.blur} min={0} max={8} step={0.1} suffix="px" onChange={(v) => set({ blur: v })} />
      <Slider label="Vignette" value={a.vignette} min={0} max={100} onChange={(v) => set({ vignette: v })} />
      <Slider label="Grain" value={a.grain} min={0} max={100} onChange={(v) => set({ grain: v })} />
    </div>
  );
}
