"use client";

import { Images, Redo2, Undo2 } from "lucide-react";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";
import ExportMenu from "./ExportMenu";

export default function Toolbar({ editor, ratio }: { editor: CollageEditor; ratio: { w: number; h: number } }) {
  return (
    <header className="relative z-30 flex items-center justify-between border-b border-surface-border bg-ink-950/60 px-6 py-3.5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500/15 text-accent-400">
          <Images className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">Collage Studio</h1>
          <p className="text-[11px] text-slate-500">
            {editor.layout.name} · {ratio.w}:{ratio.h}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={editor.undo}
          disabled={!editor.canUndo}
          title="Undo"
          className="rounded-md border border-surface-border p-2 text-slate-300 hover:text-white disabled:opacity-30"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={editor.redo}
          disabled={!editor.canRedo}
          title="Redo"
          className="rounded-md border border-surface-border p-2 text-slate-300 hover:text-white disabled:opacity-30"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <div className="mx-1 h-6 w-px bg-surface-border" />
        <ExportMenu editor={editor} ratio={ratio} />
      </div>
    </header>
  );
}
