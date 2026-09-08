"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  AdjustState,
  BorderState,
  CellAssignment,
  CollageState,
  DEFAULT_ADJUST,
  DEFAULT_BORDER,
  TextLayer,
  UploadedImage,
  makeCell,
} from "./types";
import { defaultLayoutForCount, getLayout } from "./layouts";
import { applyPreset, FILTER_PRESETS } from "./filters";

type CommitMode = "immediate" | "debounced" | "none";

function createInitialState(): CollageState {
  const layout = defaultLayoutForCount(3);
  return {
    ratioId: "square",
    customRatio: null,
    layoutId: layout.id,
    images: [],
    cells: layout.cells.map(() => makeCell()),
    adjust: { ...DEFAULT_ADJUST },
    border: { ...DEFAULT_BORDER },
    texts: [],
    filterPresetId: "original",
  };
}

function loadImageMeta(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

let uid = 0;
function nextId(prefix: string) {
  uid += 1;
  return `${prefix}-${Date.now().toString(36)}-${uid}`;
}

export function useCollageEditor() {
  const [state, setState] = useState<CollageState>(() => createInitialState());
  const [past, setPast] = useState<CollageState[]>([]);
  const [future, setFuture] = useState<CollageState[]>([]);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingBeforeRef = useRef<CollageState | null>(null);

  const flushPending = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (pendingBeforeRef.current) {
      const before = pendingBeforeRef.current;
      pendingBeforeRef.current = null;
      setPast((p) => [...p.slice(-49), before]);
      setFuture([]);
    }
  }, []);

  const update = useCallback(
    (updater: (s: CollageState) => CollageState, commit: CommitMode = "immediate") => {
      const before = state;
      const next = updater(before);
      setState(next);
      if (commit === "immediate") {
        flushPending();
        setPast((p) => [...p.slice(-49), before]);
        setFuture([]);
      } else if (commit === "debounced") {
        if (!pendingBeforeRef.current) pendingBeforeRef.current = before;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(flushPending, 500);
      }
    },
    [state, flushPending],
  );

  const undo = useCallback(() => {
    flushPending();
    setPast((p) => {
      if (p.length === 0) return p;
      const prevState = p[p.length - 1];
      setFuture((f) => [...f, state]);
      setState(prevState);
      return p.slice(0, -1);
    });
  }, [state, flushPending]);

  const redo = useCallback(() => {
    flushPending();
    setFuture((f) => {
      if (f.length === 0) return f;
      const nextState = f[f.length - 1];
      setPast((p) => [...p, state]);
      setState(nextState);
      return f.slice(0, -1);
    });
  }, [state, flushPending]);

  // ---- images ----

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (arr.length === 0) return;
      const loaded: UploadedImage[] = [];
      for (const file of arr) {
        const url = URL.createObjectURL(file);
        try {
          const meta = await loadImageMeta(url);
          loaded.push({
            id: nextId("img"),
            url,
            naturalWidth: meta.w,
            naturalHeight: meta.h,
            name: file.name,
          });
        } catch {
          URL.revokeObjectURL(url);
        }
      }
      if (loaded.length === 0) return;
      update((s) => {
        const cells = s.cells.map((c) => ({ ...c }));
        let li = 0;
        for (const img of loaded) {
          while (li < cells.length && cells[li].imageId) li++;
          if (li < cells.length) {
            cells[li].imageId = img.id;
            li++;
          }
        }
        return { ...s, images: [...s.images, ...loaded], cells };
      });
    },
    [update],
  );

  const replaceCellImage = useCallback(
    async (cellIndex: number, file: File) => {
      const url = URL.createObjectURL(file);
      try {
        const meta = await loadImageMeta(url);
        const img: UploadedImage = {
          id: nextId("img"),
          url,
          naturalWidth: meta.w,
          naturalHeight: meta.h,
          name: file.name,
        };
        update((s) => {
          const cells = s.cells.map((c, i) => (i === cellIndex ? { ...makeCell(), imageId: img.id } : c));
          return { ...s, images: [...s.images, img], cells };
        });
      } catch {
        URL.revokeObjectURL(url);
      }
    },
    [update],
  );

  const removeImage = useCallback(
    (imageId: string) => {
      update((s) => ({
        ...s,
        images: s.images.filter((i) => i.id !== imageId),
        cells: s.cells.map((c) => (c.imageId === imageId ? { ...makeCell() } : c)),
      }));
    },
    [update],
  );

  // ---- layout / ratio ----

  const setLayout = useCallback(
    (layoutId: string) => {
      update((s) => {
        const layout = getLayout(layoutId);
        const existingImageIds = s.cells.map((c) => c.imageId);
        const cells: CellAssignment[] = layout.cells.map((_, i) => {
          if (i < existingImageIds.length && existingImageIds[i]) {
            return { ...makeCell(), imageId: existingImageIds[i] };
          }
          return makeCell();
        });
        // Fill any still-empty cells with leftover unassigned images.
        const usedIds = new Set(cells.map((c) => c.imageId).filter(Boolean));
        const unassigned = s.images.filter((img) => !usedIds.has(img.id));
        let ui = 0;
        for (const cell of cells) {
          if (!cell.imageId && ui < unassigned.length) {
            cell.imageId = unassigned[ui].id;
            ui++;
          }
        }
        return { ...s, layoutId, cells };
      });
      setSelectedCellIndex(null);
    },
    [update],
  );

  const setRatio = useCallback(
    (ratioId: string) => {
      update((s) => ({ ...s, ratioId, customRatio: null }));
    },
    [update],
  );

  const setCustomRatio = useCallback(
    (w: number, h: number) => {
      update((s) => ({ ...s, ratioId: "custom", customRatio: { w, h } }));
    },
    [update],
  );

  // ---- cells ----

  const assignImageToCell = useCallback(
    (cellIndex: number, imageId: string | null) => {
      update((s) => {
        const cells = s.cells.map((c, i) => (i === cellIndex ? { ...makeCell(), imageId } : c));
        return { ...s, cells };
      });
    },
    [update],
  );

  const swapCells = useCallback(
    (a: number, b: number) => {
      update((s) => {
        const cells = s.cells.map((c) => ({ ...c }));
        const tmp = cells[a];
        cells[a] = cells[b];
        cells[b] = tmp;
        return { ...s, cells };
      });
    },
    [update],
  );

  const updateCellTransform = useCallback(
    (cellIndex: number, partial: Partial<CellAssignment>, commit: CommitMode = "debounced") => {
      update((s) => {
        const cells = s.cells.map((c, i) => (i === cellIndex ? { ...c, ...partial } : c));
        return { ...s, cells };
      }, commit);
    },
    [update],
  );

  const resetCellTransform = useCallback(
    (cellIndex: number) => {
      update((s) => {
        const cells = s.cells.map((c, i) =>
          i === cellIndex ? { ...makeCell(), imageId: c.imageId } : c,
        );
        return { ...s, cells };
      });
    },
    [update],
  );

  const rotateCell = useCallback(
    (cellIndex: number) => {
      update((s) => {
        const cells = s.cells.map((c, i) =>
          i === cellIndex
            ? { ...c, rotation: (((c.rotation + 90) % 360) as CellAssignment["rotation"]) }
            : c,
        );
        return { ...s, cells };
      });
    },
    [update],
  );

  const flipCell = useCallback(
    (cellIndex: number, axis: "h" | "v") => {
      update((s) => {
        const cells = s.cells.map((c, i) =>
          i === cellIndex
            ? axis === "h"
              ? { ...c, flipH: !c.flipH }
              : { ...c, flipV: !c.flipV }
            : c,
        );
        return { ...s, cells };
      });
    },
    [update],
  );

  // ---- adjust / filters ----

  const setAdjust = useCallback(
    (partial: Partial<AdjustState>, commit: CommitMode = "debounced") => {
      update((s) => ({ ...s, adjust: { ...s.adjust, ...partial }, filterPresetId: "custom" }), commit);
    },
    [update],
  );

  const applyFilterPreset = useCallback(
    (presetId: string) => {
      const preset = FILTER_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      update((s) => ({ ...s, adjust: applyPreset(preset), filterPresetId: preset.id }));
    },
    [update],
  );

  const resetAdjust = useCallback(() => {
    update((s) => ({ ...s, adjust: { ...DEFAULT_ADJUST }, filterPresetId: "original" }));
  }, [update]);

  // ---- border / background ----

  const setBorder = useCallback(
    (partial: Partial<BorderState>, commit: CommitMode = "debounced") => {
      update((s) => ({ ...s, border: { ...s.border, ...partial } }), commit);
    },
    [update],
  );

  // ---- text / stickers ----

  const addText = useCallback(
    (kind: "text" | "emoji", initialText?: string) => {
      const layer: TextLayer = {
        id: nextId("txt"),
        kind,
        text: initialText ?? (kind === "emoji" ? "😀" : "Double-click to edit"),
        x: 50,
        y: 50,
        fontSize: kind === "emoji" ? 90 : 48,
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        align: "center",
        bg: null,
      };
      update((s) => ({ ...s, texts: [...s.texts, layer] }));
      setSelectedTextId(layer.id);
      setSelectedCellIndex(null);
    },
    [update],
  );

  const updateText = useCallback(
    (id: string, partial: Partial<TextLayer>, commit: CommitMode = "debounced") => {
      update((s) => ({
        ...s,
        texts: s.texts.map((t) => (t.id === id ? { ...t, ...partial } : t)),
      }), commit);
    },
    [update],
  );

  const removeText = useCallback(
    (id: string) => {
      update((s) => ({ ...s, texts: s.texts.filter((t) => t.id !== id) }));
      setSelectedTextId((cur) => (cur === id ? null : cur));
    },
    [update],
  );

  const bringTextToFront = useCallback(
    (id: string) => {
      update((s) => {
        const layer = s.texts.find((t) => t.id === id);
        if (!layer) return s;
        return { ...s, texts: [...s.texts.filter((t) => t.id !== id), layer] };
      });
    },
    [update],
  );

  const deleteSelected = useCallback(() => {
    if (selectedTextId) {
      removeText(selectedTextId);
    } else if (selectedCellIndex !== null) {
      assignImageToCell(selectedCellIndex, null);
    }
  }, [selectedTextId, selectedCellIndex, removeText, assignImageToCell]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const layout = useMemo(() => getLayout(state.layoutId), [state.layoutId]);

  return {
    state,
    layout,
    canUndo,
    canRedo,
    undo,
    redo,
    selectedCellIndex,
    setSelectedCellIndex,
    selectedTextId,
    setSelectedTextId,
    addImages,
    replaceCellImage,
    removeImage,
    setLayout,
    setRatio,
    setCustomRatio,
    assignImageToCell,
    swapCells,
    updateCellTransform,
    resetCellTransform,
    rotateCell,
    flipCell,
    setAdjust,
    applyFilterPreset,
    resetAdjust,
    setBorder,
    addText,
    updateText,
    removeText,
    bringTextToFront,
    deleteSelected,
  };
}

export type CollageEditor = ReturnType<typeof useCollageEditor>;
