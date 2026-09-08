import type { RatioPreset } from "./types";

export const RATIOS: RatioPreset[] = [
  { id: "square", label: "Square (1:1)", group: "Popular", w: 1, h: 1 },
  { id: "story", label: "Story / Reel (9:16)", group: "Popular", w: 9, h: 16 },
  { id: "portrait", label: "Portrait (4:5)", group: "Popular", w: 4, h: 5 },
  { id: "landscape", label: "Landscape (16:9)", group: "Popular", w: 16, h: 9 },

  { id: "ig-post", label: "Instagram Post", group: "Social", w: 1, h: 1 },
  { id: "ig-story", label: "Instagram Story", group: "Social", w: 9, h: 16 },
  { id: "fb-post", label: "Facebook Post", group: "Social", w: 1.91, h: 1 },
  { id: "fb-cover", label: "Facebook Cover", group: "Social", w: 205, h: 78 },
  { id: "pinterest", label: "Pinterest Pin", group: "Social", w: 2, h: 3 },
  { id: "twitter", label: "X / Twitter Post", group: "Social", w: 16, h: 9 },
  { id: "youtube-thumb", label: "YouTube Thumbnail", group: "Social", w: 16, h: 9 },

  { id: "classic-4-3", label: "Classic Photo (4:3)", group: "Print & Photo", w: 4, h: 3 },
  { id: "wide-3-2", label: "Widescreen (3:2)", group: "Print & Photo", w: 3, h: 2 },
  { id: "a4-portrait", label: "A4 Portrait", group: "Print & Photo", w: 210, h: 297 },
  { id: "a4-landscape", label: "A4 Landscape", group: "Print & Photo", w: 297, h: 210 },
  { id: "us-letter", label: "US Letter", group: "Print & Photo", w: 8.5, h: 11 },

  { id: "custom", label: "Custom", group: "Other", w: 1, h: 1 },
];

export function getRatio(id: string): RatioPreset {
  return RATIOS.find((r) => r.id === id) ?? RATIOS[0];
}

export const RATIO_GROUPS = Array.from(new Set(RATIOS.map((r) => r.group)));
