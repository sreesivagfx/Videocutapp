import type {
  CaptionStylePreset,
  CreateProjectResponse,
  FontEntry,
  JobStatusResponse,
  TransitionEntry,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function uploadVideo(file: File): Promise<CreateProjectResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/projects/upload`, { method: "POST", body: form });
  return handle(res);
}

export interface StartPipelineOptions {
  project_id: string;
  caption_style_id: string;
  target_aspect: "9:16" | "1:1" | "16:9";
  max_shorts: number;
  min_duration_sec: number;
  max_duration_sec: number;
  burn_captions: boolean;
  denoise_audio: boolean;
}

export async function startPipeline(opts: StartPipelineOptions): Promise<{ job_id: string }> {
  const res = await fetch(`${API_BASE}/pipeline/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  return handle(res);
}

export async function getJob(jobId: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, { cache: "no-store" });
  return handle(res);
}

export function downloadUrl(jobId: string, filename: string): string {
  return `${API_BASE}/jobs/${jobId}/download/${filename}`;
}

export async function listCaptionStyles(): Promise<CaptionStylePreset[]> {
  const res = await fetch(`${API_BASE}/styles/captions`, { cache: "no-store" });
  return handle(res);
}

export async function listFonts(): Promise<FontEntry[]> {
  const res = await fetch(`${API_BASE}/styles/fonts`, { cache: "no-store" });
  return handle(res);
}

export async function listTransitions(): Promise<TransitionEntry[]> {
  const res = await fetch(`${API_BASE}/styles/transitions`, { cache: "no-store" });
  return handle(res);
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_language: targetLanguage }),
  });
  const data = await handle<{ translated_text: string }>(res);
  return data.translated_text;
}

export async function generateSpeech(text: string, voice: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/tts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, language: "en" }),
  });
  if (!res.ok) throw new Error(`TTS error ${res.status}`);
  return res.blob();
}

export async function denoiseAudio(file: File | Blob): Promise<Blob> {
  const form = new FormData();
  form.append("file", file, "audio.wav");
  const res = await fetch(`${API_BASE}/audio/denoise`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Denoise error ${res.status}`);
  return res.blob();
}

export async function voiceCloneStatus(): Promise<{ enabled: boolean }> {
  const res = await fetch(`${API_BASE}/voice-clone/status`, { cache: "no-store" });
  return handle(res);
}
