"use client";

import { AlignCenter, AlignLeft, AlignRight, Trash2, Type } from "lucide-react";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";
import Slider from "../Slider";

const EMOJIS = [
  "😀", "😂", "😍", "🥳", "😎", "🤩", "😴", "🤔",
  "👍", "🙌", "👏", "🔥", "💯", "❤️", "⭐", "✨",
  "🎉", "🎈", "🎂", "🌸", "🌞", "🌈", "☀️", "❄️",
  "📸", "🎓", "✈️", "🏆", "🐶", "🐱", "🍕", "☕",
];

const FONT_FAMILIES = [
  { label: "Sans", value: "Inter, ui-sans-serif, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "'JetBrains Mono', ui-monospace, monospace" },
  { label: "Rounded", value: "'Segoe UI', system-ui, sans-serif" },
];

const TEXT_COLORS = ["#ffffff", "#000000", "#F97316", "#EC4899", "#3B82F6", "#22C55E", "#FACC15"];

export default function TextPanel({ editor }: { editor: CollageEditor }) {
  const selected = editor.state.texts.find((t) => t.id === editor.selectedTextId) ?? null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => editor.addText("text")}
          className="flex items-center justify-center gap-2 rounded-md border border-surface-border bg-ink-900 py-2 text-sm text-slate-200 hover:border-accent-500/50"
        >
          <Type className="h-4 w-4" /> Add text
        </button>
        <button
          onClick={() => editor.addText("emoji")}
          className="flex items-center justify-center gap-2 rounded-md border border-surface-border bg-ink-900 py-2 text-sm text-slate-200 hover:border-accent-500/50"
        >
          😀 Add emoji
        </button>
      </div>

      {selected ? (
        <div className="space-y-4 rounded-lg border border-surface-border bg-ink-900 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">
              {selected.kind === "emoji" ? "Emoji" : "Text"} settings
            </p>
            <button onClick={() => editor.removeText(selected.id)} className="text-slate-400 hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <Slider
            label="Size"
            value={selected.fontSize}
            min={12}
            max={200}
            onChange={(v) => editor.updateText(selected.id, { fontSize: v }, "debounced")}
          />

          {selected.kind === "text" && (
            <>
              <div>
                <p className="mb-1.5 text-xs text-slate-400">Font</p>
                <select
                  value={selected.fontFamily}
                  onChange={(e) => editor.updateText(selected.id, { fontFamily: e.target.value }, "immediate")}
                  className="w-full rounded-md border border-surface-border bg-ink-950 px-2 py-1.5 text-sm text-slate-200"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1.5 text-xs text-slate-400">Color</p>
                <div className="flex flex-wrap gap-2">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => editor.updateText(selected.id, { color: c }, "immediate")}
                      className={`h-6 w-6 rounded-full border-2 ${
                        selected.color === c ? "border-accent-400" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    editor.updateText(selected.id, { fontWeight: selected.fontWeight >= 700 ? 400 : 700 }, "immediate")
                  }
                  className={`rounded-md border px-3 py-1.5 text-sm font-bold ${
                    selected.fontWeight >= 700
                      ? "border-accent-400 bg-accent-500/10 text-accent-300"
                      : "border-surface-border text-slate-300"
                  }`}
                >
                  B
                </button>
                {(["left", "center", "right"] as const).map((align) => {
                  const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={align}
                      onClick={() => editor.updateText(selected.id, { align }, "immediate")}
                      className={`rounded-md border p-1.5 ${
                        selected.align === align
                          ? "border-accent-400 bg-accent-500/10 text-accent-300"
                          : "border-surface-border text-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
                <button
                  onClick={() => editor.updateText(selected.id, { bg: selected.bg ? null : "rgba(0,0,0,0.55)" }, "immediate")}
                  className={`ml-auto rounded-md border px-2 py-1.5 text-xs ${
                    selected.bg
                      ? "border-accent-400 bg-accent-500/10 text-accent-300"
                      : "border-surface-border text-slate-300"
                  }`}
                >
                  Highlight
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">Emoji</p>
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => editor.addText("emoji", e)}
                className="flex h-7 w-7 items-center justify-center rounded hover:bg-white/10"
              >
                {e}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Select a text or emoji layer on the canvas to edit its size, color and alignment.
          </p>
        </div>
      )}
    </div>
  );
}
