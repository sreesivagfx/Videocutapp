"use client";

import { useEffect, useRef, useState } from "react";
import type { CollageEditor } from "@/lib/collage/useCollageEditor";
import { REFERENCE_WIDTH } from "@/lib/collage/constants";
import { cellPxRect } from "@/lib/collage/transform";
import { computeFilterString, getGrainTileDataUrl, buildVignetteCss } from "@/lib/collage/filters";
import { backgroundToCss } from "@/lib/collage/background";
import CollageCell from "./CollageCell";
import TextLayerView from "./TextLayerView";

type Props = {
  editor: CollageEditor;
  ratio: { w: number; h: number };
};

export default function CollageCanvas({ editor, ratio }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const replaceCellRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, layout } = editor;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerW(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const aspect = ratio.w / ratio.h;
  const containerH = containerW / aspect;
  const scaleFactor = containerW / REFERENCE_WIDTH;

  const frameWidthPx = state.border.frameWidth * scaleFactor;
  const contentX = frameWidthPx;
  const contentY = frameWidthPx;
  const contentW = containerW - frameWidthPx * 2;
  const contentH = containerH - frameWidthPx * 2;
  const gapPx = state.border.gap * scaleFactor;
  const radiusPx = state.border.radius * scaleFactor;

  const imageMap = new Map(state.images.map((i) => [i.id, i]));

  function openReplaceFor(cellIndex: number) {
    replaceCellRef.current = cellIndex;
    fileInputRef.current?.click();
  }

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    const idx = replaceCellRef.current;
    replaceCellRef.current = null;
    e.target.value = "";
    if (!files || files.length === 0) return;
    if (idx === null) {
      await editor.addImages(files);
      return;
    }
    await editor.replaceCellImage(idx, files[0]);
  }

  const grainUrl = state.adjust.grain > 0 && typeof window !== "undefined" ? getGrainTileDataUrl() : "";

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileInputChange} />
      <div
        ref={stageRef}
        className="relative w-full max-w-3xl shadow-card"
        style={{ aspectRatio: `${ratio.w} / ${ratio.h}` }}
        onClick={() => {
          editor.setSelectedCellIndex(null);
          editor.setSelectedTextId(null);
        }}
      >
        {containerW > 0 && (
          <>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ filter: computeFilterString(state.adjust), background: backgroundToCss(state.border.bg) }}
            >
              {layout.cells.map((rect, i) => {
                const box = cellPxRect(rect, contentX, contentY, contentW, contentH, gapPx);
                const cell = state.cells[i];
                if (!cell) return null;
                return (
                  <CollageCell
                    key={i}
                    index={i}
                    box={box}
                    radiusPx={radiusPx}
                    cell={cell}
                    image={cell.imageId ? imageMap.get(cell.imageId) : undefined}
                    selected={editor.selectedCellIndex === i}
                    onSelect={() => {
                      editor.setSelectedCellIndex(i);
                      editor.setSelectedTextId(null);
                    }}
                    onUpdateTransform={(partial, commit) => editor.updateCellTransform(i, partial, commit)}
                    onRotate={() => editor.rotateCell(i)}
                    onFlip={(axis) => editor.flipCell(i, axis)}
                    onReplace={() => openReplaceFor(i)}
                    onRemove={() => editor.assignImageToCell(i, null)}
                    onSwap={(src) => editor.swapCells(src, i)}
                    onAssignImageId={(imageId) => editor.assignImageToCell(i, imageId)}
                    onFilesDrop={(files) => editor.addImages(files)}
                  />
                );
              })}
            </div>

            {state.adjust.vignette > 0 && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: buildVignetteCss(containerW, containerH, state.adjust.vignette) }}
              />
            )}
            {state.adjust.grain > 0 && grainUrl && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `url(${grainUrl})`,
                  backgroundSize: "96px 96px",
                  backgroundRepeat: "repeat",
                  mixBlendMode: "overlay",
                  opacity: state.adjust.grain / 100,
                }}
              />
            )}

            {state.texts.map((t) => (
              <TextLayerView
                key={t.id}
                layer={t}
                containerW={containerW}
                containerH={containerH}
                scaleFactor={scaleFactor}
                selected={editor.selectedTextId === t.id}
                onSelect={() => {
                  editor.setSelectedTextId(t.id);
                  editor.setSelectedCellIndex(null);
                  editor.bringTextToFront(t.id);
                }}
                onUpdate={(partial, commit) => editor.updateText(t.id, partial, commit)}
                onRemove={() => editor.removeText(t.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
