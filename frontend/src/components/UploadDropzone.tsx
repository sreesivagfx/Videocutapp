"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { uploadVideo } from "@/lib/api";
import { useRouter } from "next/navigation";
import { rememberProject } from "@/lib/recentProjects";

export default function UploadDropzone() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const res = await uploadVideo(file);
        rememberProject({ project_id: res.project_id, filename: res.filename, createdAt: Date.now() });
        router.push(`/editor/${res.project_id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [router]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-14 text-center transition-colors ${
          dragOver ? "border-accent-500 bg-accent-500/5" : "border-surface-border bg-ink-900"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/x-msvideo"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        ) : (
          <UploadCloud className="h-8 w-8 text-accent-400" />
        )}
        <p className="mt-4 text-sm font-medium text-white">
          {uploading ? "Uploading…" : "Drop a long-form video, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-slate-400">MP4, MOV, MKV, WebM, AVI — up to 2GB</p>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
