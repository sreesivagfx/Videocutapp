export type JobStatus =
  | "queued"
  | "transcribing"
  | "detecting_highlights"
  | "rendering"
  | "done"
  | "failed";

export interface ShortCandidate {
  id: string;
  start: number;
  end: number;
  score: number;
  reason: string;
  title: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress: number;
  message: string;
  shorts: ShortCandidate[];
  outputs: string[];
  error?: string | null;
}

export interface CaptionStylePreset {
  id: string;
  name: string;
  font_family: string;
  font_size: number;
  primary_color: string;
  outline_color: string;
  background_box: boolean;
  uppercase: boolean;
  bold: boolean;
  position: "bottom" | "middle" | "top";
  highlight_active_word: boolean;
  highlight_color?: string | null;
}

export interface FontEntry {
  family: string;
  source: string;
  license: string;
}

export interface TransitionEntry {
  id: string;
  name: string;
  ffmpeg_filter: string;
}

export interface CreateProjectResponse {
  project_id: string;
  filename: string;
}
