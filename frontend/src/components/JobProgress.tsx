import type { JobStatus } from "@/lib/types";

const LABELS: Record<JobStatus, string> = {
  queued: "Queued",
  transcribing: "Transcribing speech",
  detecting_highlights: "Detecting highlight-worthy moments",
  rendering: "Rendering shorts",
  done: "Done",
  failed: "Failed",
};

export default function JobProgress({
  status,
  progress,
  message,
}: {
  status: JobStatus;
  progress: number;
  message?: string;
}) {
  const pct = Math.round(progress * 100);
  const failed = status === "failed";
  return (
    <div className="rounded-lg border border-surface-border bg-ink-900 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className={failed ? "text-red-400" : "text-slate-200"}>
          {LABELS[status]}
        </span>
        <span className="text-slate-500">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
        <div
          className={`h-full rounded-full transition-all ${failed ? "bg-red-500" : "bg-accent-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {message && <p className="mt-2 text-xs text-slate-500">{message}</p>}
    </div>
  );
}
