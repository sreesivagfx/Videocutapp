import type { LayoutTemplate, Rect } from "./types";

// Builds boundary arrays (0..100) so adjacent cells share exact float edges —
// no hairline gaps or overlaps from independently-rounded percentages.
function bounds(n: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i <= n; i++) arr.push((i * 100) / n);
  return arr;
}

function uniformGrid(rows: number, cols: number): Rect[] {
  const xs = bounds(cols);
  const ys = bounds(rows);
  const cells: Rect[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: xs[c],
        y: ys[r],
        w: xs[c + 1] - xs[c],
        h: ys[r + 1] - ys[r],
      });
    }
  }
  return cells;
}

function columns(fractions: number[]): Rect[] {
  const total = fractions.reduce((a, b) => a + b, 0);
  let x = 0;
  const cells: Rect[] = [];
  for (const f of fractions) {
    const w = (f / total) * 100;
    cells.push({ x, y: 0, w, h: 100 });
    x += w;
  }
  return cells;
}

function rows(fractions: number[]): Rect[] {
  const total = fractions.reduce((a, b) => a + b, 0);
  let y = 0;
  const cells: Rect[] = [];
  for (const f of fractions) {
    const h = (f / total) * 100;
    cells.push({ x: 0, y, w: 100, h });
    y += h;
  }
  return cells;
}

// One big cell on `side`, remaining split as a uniform grid on the rest.
function bigPlusGrid(
  side: "left" | "right" | "top" | "bottom",
  bigFraction: number,
  restCount: number,
): Rect[] {
  const bf = bigFraction * 100;
  const rf = 100 - bf;
  const restXs = bounds(restCount);
  const cells: Rect[] = [];
  if (side === "left" || side === "right") {
    const bigX = side === "left" ? 0 : rf;
    const restX0 = side === "left" ? bf : 0;
    cells.push({ x: bigX, y: 0, w: bf, h: 100 });
    for (let i = 0; i < restCount; i++) {
      cells.push({
        x: restX0,
        y: (restXs[i] / 100) * 100,
        w: rf,
        h: restXs[i + 1] - restXs[i],
      });
    }
  } else {
    const bigY = side === "top" ? 0 : rf;
    const restY0 = side === "top" ? bf : 0;
    cells.push({ x: 0, y: bigY, w: 100, h: bf });
    for (let i = 0; i < restCount; i++) {
      cells.push({
        x: restXs[i],
        y: restY0,
        w: restXs[i + 1] - restXs[i],
        h: rf,
      });
    }
  }
  return cells;
}

function tpl(id: string, name: string, cells: Rect[]): LayoutTemplate {
  return { id, name, count: cells.length, cells };
}

const LAYOUTS_1: LayoutTemplate[] = [tpl("1-full", "Full Frame", [{ x: 0, y: 0, w: 100, h: 100 }])];

const LAYOUTS_2: LayoutTemplate[] = [
  tpl("2-split-v", "Side by Side", columns([1, 1])),
  tpl("2-split-h", "Stacked", rows([1, 1])),
  tpl("2-70-30-v", "70/30", columns([7, 3])),
  tpl("2-30-70-v", "30/70", columns([3, 7])),
  tpl("2-60-40-h", "60/40 Stacked", rows([6, 4])),
];

const LAYOUTS_3: LayoutTemplate[] = [
  tpl("3-big-left", "Big Left", bigPlusGrid("left", 0.6, 2)),
  tpl("3-big-right", "Big Right", bigPlusGrid("right", 0.6, 2)),
  tpl("3-big-top", "Big Top", bigPlusGrid("top", 0.55, 2)),
  tpl("3-big-bottom", "Big Bottom", bigPlusGrid("bottom", 0.55, 2)),
  tpl("3-cols", "3 Columns", columns([1, 1, 1])),
  tpl("3-rows", "3 Rows", rows([1, 1, 1])),
];

const LAYOUTS_4: LayoutTemplate[] = [
  tpl("4-grid", "2 x 2 Grid", uniformGrid(2, 2)),
  tpl("4-cols", "4 Columns", columns([1, 1, 1, 1])),
  tpl("4-rows", "4 Rows", rows([1, 1, 1, 1])),
  tpl("4-big-left", "Big Left + 3", bigPlusGrid("left", 0.55, 3)),
  tpl("4-big-top", "Big Top + 3", bigPlusGrid("top", 0.55, 3)),
  tpl("4-big-right", "Big Right + 3", bigPlusGrid("right", 0.55, 3)),
];

const LAYOUTS_5: LayoutTemplate[] = [
  tpl("5-top-grid", "1 Top + 4 Grid", bigPlusGrid("top", 0.5, 4)),
  tpl("5-bottom-grid", "4 Grid + 1 Bottom", bigPlusGrid("bottom", 0.5, 4)),
  tpl("5-big-left", "Big Left + 4", bigPlusGrid("left", 0.5, 4)),
  tpl("5-cols", "5 Columns", columns([1, 1, 1, 1, 1])),
  tpl("5-2top-3bottom", "2 Top + 3 Bottom", [
    ...columns([1, 1]).map((c) => ({ ...c, h: 50 })),
    ...columns([1, 1, 1]).map((c) => ({ ...c, y: 50, h: 50 })),
  ]),
];

const LAYOUTS_6: LayoutTemplate[] = [
  tpl("6-grid-3x2", "3 x 2 Grid", uniformGrid(2, 3)),
  tpl("6-grid-2x3", "2 x 3 Grid", uniformGrid(3, 2)),
  tpl("6-big-top", "Big Top + 5", bigPlusGrid("top", 0.4, 5)),
  tpl("6-cols", "6 Columns", columns([1, 1, 1, 1, 1, 1])),
];

const LAYOUTS_7: LayoutTemplate[] = [
  tpl("7-big-left", "Big Left + 6 Grid", (() => {
    const big = { x: 0, y: 0, w: 50, h: 100 };
    const grid = uniformGrid(3, 2).map((c) => ({ ...c, x: 50 + c.x / 2, w: c.w / 2 }));
    return [big, ...grid];
  })()),
  tpl("7-grid", "Mosaic 7", (() => {
    const top = bigPlusGrid("top", 0.42, 3);
    const bottomXs = bounds(3);
    const bottom = bottomXs.slice(0, 3).map((x, i) => ({
      x,
      y: 42,
      w: bottomXs[i + 1] - x,
      h: 58,
    }));
    return [top[0], ...top.slice(1), ...bottom].slice(0, 7);
  })()),
];

const LAYOUTS_8: LayoutTemplate[] = [
  tpl("8-grid-4x2", "4 x 2 Grid", uniformGrid(2, 4)),
  tpl("8-grid-2x4", "2 x 4 Grid", uniformGrid(4, 2)),
  tpl("8-big-top", "Big Top + 7", bigPlusGrid("top", 0.35, 7)),
];

const LAYOUTS_9: LayoutTemplate[] = [
  tpl("9-grid-3x3", "3 x 3 Grid", uniformGrid(3, 3)),
  tpl("9-big-left", "Big Left + 8 Grid", (() => {
    const big = { x: 0, y: 0, w: 40, h: 100 };
    const grid = uniformGrid(4, 2).map((c) => ({ ...c, x: 40 + c.x * 0.6, w: c.w * 0.6 }));
    return [big, ...grid];
  })()),
];

export const LAYOUTS_BY_COUNT: Record<number, LayoutTemplate[]> = {
  1: LAYOUTS_1,
  2: LAYOUTS_2,
  3: LAYOUTS_3,
  4: LAYOUTS_4,
  5: LAYOUTS_5,
  6: LAYOUTS_6,
  7: LAYOUTS_7,
  8: LAYOUTS_8,
  9: LAYOUTS_9,
};

export const ALL_LAYOUTS: LayoutTemplate[] = Object.values(LAYOUTS_BY_COUNT).flat();

export function getLayout(id: string): LayoutTemplate {
  return ALL_LAYOUTS.find((l) => l.id === id) ?? LAYOUTS_1[0];
}

export function defaultLayoutForCount(count: number): LayoutTemplate {
  const clamped = Math.max(1, Math.min(9, count));
  return LAYOUTS_BY_COUNT[clamped][0];
}
