"use client";

import { useEffect, useState } from "react";
import { useCollageEditor } from "@/lib/collage/useCollageEditor";
import { getRatio } from "@/lib/collage/ratios";
import Toolbar from "@/components/collage/Toolbar";
import TabRail, { PanelTab } from "@/components/collage/TabRail";
import CollageCanvas from "@/components/collage/CollageCanvas";
import CellInspector from "@/components/collage/CellInspector";
import LayoutPanel from "@/components/collage/panels/LayoutPanel";
import RatioPanel from "@/components/collage/panels/RatioPanel";
import PhotosPanel from "@/components/collage/panels/PhotosPanel";
import FiltersPanel from "@/components/collage/panels/FiltersPanel";
import AdjustPanel from "@/components/collage/panels/AdjustPanel";
import BackgroundPanel from "@/components/collage/panels/BackgroundPanel";
import TextPanel from "@/components/collage/panels/TextPanel";

const PANEL_TITLES: Record<PanelTab, string> = {
  layout: "Layout",
  ratio: "Canvas ratio",
  photos: "Photos",
  filters: "Filters",
  adjust: "Adjust",
  background: "Spacing & background",
  text: "Text & stickers",
};

export default function CollagePage() {
  const editor = useCollageEditor();
  const [tab, setTab] = useState<PanelTab>("layout");

  const ratioPreset = getRatio(editor.state.ratioId);
  const ratio = editor.state.ratioId === "custom" && editor.state.customRatio ? editor.state.customRatio : ratioPreset;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      } else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        editor.redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (editor.selectedCellIndex !== null || editor.selectedTextId !== null) {
          e.preventDefault();
          editor.deleteSelected();
        }
      } else if (e.key === "Escape") {
        editor.setSelectedCellIndex(null);
        editor.setSelectedTextId(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.selectedCellIndex, editor.selectedTextId]);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar editor={editor} ratio={ratio} />
      <div className="flex min-h-0 flex-1">
        <TabRail active={tab} onChange={setTab} />
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-surface-border bg-ink-900 p-4 scrollbar-thin">
          <p className="mb-3 text-sm font-semibold text-white">{PANEL_TITLES[tab]}</p>
          {tab === "layout" && <LayoutPanel editor={editor} />}
          {tab === "ratio" && <RatioPanel editor={editor} />}
          {tab === "photos" && <PhotosPanel editor={editor} />}
          {tab === "filters" && <FiltersPanel editor={editor} />}
          {tab === "adjust" && <AdjustPanel editor={editor} />}
          {tab === "background" && <BackgroundPanel editor={editor} />}
          {tab === "text" && <TextPanel editor={editor} />}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_70%)]">
            <CollageCanvas editor={editor} ratio={ratio} />
          </div>
          <CellInspector editor={editor} />
        </div>
      </div>
    </div>
  );
}
