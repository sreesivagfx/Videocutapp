"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { EXPORT_RESOLUTIONS } from "@/lib/collage/constants";
import { downloadBlob, exportCollage } from "@/lib/collage/export";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";

export default function ExportMenu({ editor, ratio }: { editor: CollageEditor; ratio: { w: number; h: number } }) {
  const [open, setOpen] = useState(false);
  const [resId, setResId] = useState<(typeof EXPORT_RESOLUTIONS)[number]["id"]>("hd");
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const longEdge = EXPORT_RESOLUTIONS.find((r) => r.id === resId)?.longEdge ?? 2048;
      const blob = await exportCollage(editor.state, editor.layout, { longEdge, format, ratio });
      downloadBlob(blob, `collage.${format === "png" ? "png" : "jpg"}`);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600"
      >
        <Download className="h-4 w-4" /> Download
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-surface-border bg-ink-900 p-3 shadow-card">
            <p className="mb-1.5 text-xs font-medium text-slate-400">Resolution</p>
            <div className="mb-3 grid grid-cols-2 gap-1.5">
              {EXPORT_RESOLUTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setResId(r.id)}
                  className={`rounded-md border px-2 py-1.5 text-xs ${
                    resId === r.id ? "border-accent-400 bg-accent-500/10 text-accent-300" : "border-surface-border text-slate-300"
                  }`}
                >
                  {r.label}
                  <span className="block text-[10px] text-slate-500">{r.longEdge}px</span>
                </button>
              ))}
            </div>
            <p className="mb-1.5 text-xs font-medium text-slate-400">Format</p>
            <div className="mb-3 grid grid-cols-2 gap-1.5">
              {(["png", "jpeg"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-md border px-2 py-1.5 text-xs uppercase ${
                    format === f ? "border-accent-400 bg-accent-500/10 text-accent-300" : "border-surface-border text-slate-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-500 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {busy ? "Exporting…" : "Export image"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
