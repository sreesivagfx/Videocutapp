"use client";

import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

export default function AudioRecorder({ onRecorded }: { onRecorded?: (blob: Blob) => void }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        onRecorded?.(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Microphone access denied or unavailable in this browser.");
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="rounded-lg border border-surface-border bg-ink-900 p-4">
      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            onClick={start}
            className="flex items-center gap-2 rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600"
          >
            <Mic className="h-4 w-4" /> Record
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex animate-pulse items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Square className="h-4 w-4" /> Stop
          </button>
        )}
        {audioUrl && (
          <audio controls src={audioUrl} className="h-9 flex-1">
            <track kind="captions" />
          </audio>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
