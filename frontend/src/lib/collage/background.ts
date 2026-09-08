export const SOLID_SWATCHES = [
  "#0F1420",
  "#FFFFFF",
  "#F4F1EA",
  "#111111",
  "#1F2937",
  "#7C3AED",
  "#DB2777",
  "#059669",
  "#D97706",
  "#DC2626",
];

export type GradientPreset = { id: string; label: string; colors: [string, string]; angleDeg: number };

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: "grad-sunset", label: "Sunset", colors: ["#FF9966", "#FF5E62"], angleDeg: 135 },
  { id: "grad-ocean", label: "Ocean", colors: ["#2E3192", "#1BFFFF"], angleDeg: 135 },
  { id: "grad-berry", label: "Berry", colors: ["#7F00FF", "#E100FF"], angleDeg: 135 },
  { id: "grad-mint", label: "Mint", colors: ["#00B09B", "#96C93D"], angleDeg: 135 },
  { id: "grad-dusk", label: "Dusk", colors: ["#0F2027", "#2C5364"], angleDeg: 135 },
  { id: "grad-peach", label: "Peach", colors: ["#FFDDE1", "#EE9CA7"], angleDeg: 135 },
  { id: "grad-noir", label: "Noir", colors: ["#232526", "#414345"], angleDeg: 135 },
  { id: "grad-gold", label: "Gold", colors: ["#BF953F", "#FCF6BA"], angleDeg: 135 },
];

export function backgroundToCss(bg: string): string {
  const g = GRADIENT_PRESETS.find((p) => p.id === bg);
  if (g) return `linear-gradient(${g.angleDeg}deg, ${g.colors[0]}, ${g.colors[1]})`;
  return bg;
}

export function paintBackgroundOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: string,
) {
  const g = GRADIENT_PRESETS.find((p) => p.id === bg);
  if (!g) {
    ctx.fillStyle = bg || "#000000";
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const theta = (g.angleDeg * Math.PI) / 180;
  const dx = Math.sin(theta);
  const dy = -Math.cos(theta);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const half = len / 2;
  const cx = w / 2;
  const cy = h / 2;
  const grad = ctx.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half);
  grad.addColorStop(0, g.colors[0]);
  grad.addColorStop(1, g.colors[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}
