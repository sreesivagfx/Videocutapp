// Reference design width (px). Gap, corner radius and font sizes are authored
// against this width, then scaled by (actualRenderWidth / REFERENCE_WIDTH) so
// they look consistent at any preview size or export resolution.
export const REFERENCE_WIDTH = 1000;

export const EXPORT_RESOLUTIONS = [
  { id: "sm", label: "Small", longEdge: 1080 },
  { id: "md", label: "Medium", longEdge: 1600 },
  { id: "hd", label: "HD", longEdge: 2048 },
  { id: "max", label: "Max", longEdge: 3000 },
] as const;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
