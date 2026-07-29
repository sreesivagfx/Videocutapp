"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import CaptionStylePicker from "@/components/CaptionStylePicker";
import JobProgress from "@/components/JobProgress";
import { downloadUrl, getJob, startPipeline } from "@/lib/api";
import type { JobStatusResponse } from "@/lib/types";
import { Download, Sparkles, Clock } from "lucide-react";

export default function EditorWorkspace({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);

  const [captionStyle, setCaptionStyle] = useState("clean-bold");
  const [aspect, setAspect] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [maxShorts, setMaxShorts] = useState(5);
  const [minDuration, setMinDuration] = useState(15);
  const [maxDuration, setMaxDuration] = useState(60);
  const [burnCaptions, setBurnCaptions] = useState(true);
  const [denoise, setDenoise] = useState(false);

  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleGenerate = useCallback(async () => {
    setStarting(true);
    setStartError(null);
    setJob(null);
    try {
      const res = await startPipeline({
        project_id: projectId,
        caption_style_id: captionStyle,
        target_aspect: aspect,
        max_shorts: maxShorts,
        min_duration_sec: minDuration,
        max_duration_sec: maxDuration,
        burn_captions: burnCaptions,
        denoise_audio: denoise,
      });
      setJobId(res.job_id);
    } catch (e) {
      setStartError(e instanceof Error ? e.message : "Failed to start job");
    } finally {
      setStarting(false);
    }
  }, [projectId, captionStyle, aspect, maxShorts, minDuration, maxDuration, burnCaptions, denoise]);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const data = await getJob(jobId);
        setJob(data);
        if (data.status === "done" || data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // transient — keep polling
      }
    };

    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobId]);

  return (
    <div>
      <TopBar title="Project workspace" subtitle={`Project ${projectId}`} />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-8 py-8 lg:grid-cols-[360px_1fr]">
        {/* Config panel */}
        <div className="space-y-6">
          <section className="rounded-xl border border-surface-border bg-ink-900 p-5">
            <h2 className="text-sm font-semibold text-white">Auto-shorts settings</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">Target aspect ratio</label>
                <div className="mt-1.5 flex gap-2">
                  {(["9:16", "1:1", "16:9"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAspect(a)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
                        aspect === a
                          ? "border-accent-500 bg-accent-500/10 text-accent-400"
                          : "border-surface-border text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400">Max shorts to generate</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxShorts}
                  onChange={(e) => setMaxShorts(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-md border border-surface-border bg-ink-950 px-3 py-1.5 text-sm text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400">Min duration (s)</label>
                  <input
                    type="number"
                    value={minDuration}
                    onChange={(e) => setMinDuration(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-md border border-surface-border bg-ink-950 px-3 py-1.5 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400">Max duration (s)</label>
                  <input
                    type="number"
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-md border border-surface-border bg-ink-950 px-3 py-1.5 text-sm text-slate-200"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between text-sm text-slate-300">
                Burn in captions
                <input
                  type="checkbox"
                  checked={burnCaptions}
                  onChange={(e) => setBurnCaptions(e.target.checked)}
                  className="h-4 w-4 accent-[#4F6BF0]"
                />
              </label>
              <label className="flex items-center justify-between text-sm text-slate-300">
                Denoise audio
                <input
                  type="checkbox"
                  checked={denoise}
                  onChange={(e) => setDenoise(e.target.checked)}
                  className="h-4 w-4 accent-[#4F6BF0]"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-surface-border bg-ink-900 p-5">
            <h2 className="text-sm font-semibold text-white">Caption style</h2>
            <div className="mt-4">
              <CaptionStylePicker value={captionStyle} onChange={setCaptionStyle} />
            </div>
          </section>

          <button
            onClick={handleGenerate}
            disabled={starting || job?.status === "rendering" || job?.status === "transcribing"}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-500 px-4 py-3 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {starting ? "Starting…" : "Generate shorts"}
          </button>
          {startError && <p className="text-sm text-red-400">{startError}</p>}
        </div>

        {/* Results panel */}
        <div className="space-y-6">
          {job && (
            <JobProgress status={job.status} progress={job.progress} message={job.message} />
          )}

          {job?.error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
              {job.error}
            </div>
          )}

          {job && job.shorts.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-white">
                Detected shorts ({job.shorts.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {job.shorts.map((s) => {
                  const filename = `short_${s.id}.mp4`;
                  const isDone = job.status === "done" && job.outputs.some((o) => o.endsWith(filename));
                  return (
                    <div
                      key={s.id}
                      className="overflow-hidden rounded-xl border border-surface-border bg-ink-900"
                    >
                      {isDone ? (
                        <video
                          controls
                          className="aspect-[9/16] w-full bg-black object-contain"
                          src={downloadUrl(jobId!, filename)}
                        />
                      ) : (
                        <div className="flex aspect-[9/16] w-full items-center justify-center bg-black/60 text-xs text-slate-500">
                          Rendering…
                        </div>
                      )}
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-slate-200">{s.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round(s.end - s.start)}s
                          </span>
                          <span>score {s.score.toFixed(1)}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{s.reason}</p>
                        {isDone && (
                          <a
                            href={downloadUrl(jobId!, filename)}
                            download
                            className="mt-3 flex items-center justify-center gap-2 rounded-md border border-surface-border py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5"
                          >
                            <Download className="h-3 w-3" /> Download
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {!job && (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-surface-border text-sm text-slate-500">
              Configure settings and click "Generate shorts" to analyze this video.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
