"use client";

import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/TopBar";
import AudioRecorder from "@/components/AudioRecorder";
import { denoiseAudio, generateSpeech, voiceCloneStatus } from "@/lib/api";
import { Volume2, Wand2, ShieldAlert } from "lucide-react";

export default function AudioStudioPage() {
  return (
    <div>
      <TopBar
        title="Audio Studio"
        subtitle="Text-to-speech, noise removal, in-browser recording, and voice cloning."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-8 py-8">
        <TtsPanel />
        <NoiseRemovalPanel />
        <RecordingPanel />
        <VoiceClonePanel />
      </div>
    </div>
  );
}

function TtsPanel() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await generateSpeech(text, "default");
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "TTS generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-surface-border bg-ink-900 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-accent-400" />
        <h2 className="text-sm font-semibold text-white">Text to speech</h2>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Type a script to narrate…"
        className="w-full rounded-md border border-surface-border bg-ink-950 p-3 text-sm text-slate-200"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={run}
          disabled={loading}
          className="rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate speech"}
        </button>
        {audioUrl && (
          <audio controls src={audioUrl} className="h-9 flex-1">
            <track kind="captions" />
          </audio>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <p className="mt-2 text-[11px] text-slate-500">
        Using local free engine by default. Configure ELEVENLABS_API_KEY for higher quality voices.
      </p>
    </section>
  );
}

function NoiseRemovalPanel() {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await denoiseAudio(file);
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Denoise failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-surface-border bg-ink-900 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-accent-400" />
        <h2 className="text-sm font-semibold text-white">Noise removal</h2>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-50"
      >
        {loading ? "Cleaning…" : "Upload noisy audio"}
      </button>
      {audioUrl && (
        <audio controls src={audioUrl} className="mt-3 h-9 w-full">
          <track kind="captions" />
        </audio>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </section>
  );
}

function RecordingPanel() {
  return (
    <section className="rounded-xl border border-surface-border bg-ink-900 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-accent-400" />
        <h2 className="text-sm font-semibold text-white">In-browser recording</h2>
      </div>
      <AudioRecorder />
      <p className="mt-2 text-[11px] text-slate-500">
        Record a voice-over, or a consented sample for voice cloning below.
      </p>
    </section>
  );
}

function VoiceClonePanel() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(false);
  const [speakerName, setSpeakerName] = useState("");

  useEffect(() => {
    voiceCloneStatus()
      .then((r) => setEnabled(r.enabled))
      .catch(() => setEnabled(false));
  }, []);

  return (
    <section className="rounded-xl border border-surface-border bg-ink-900 p-5">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-white">Voice cloning</h2>
      </div>

      {enabled === false && (
        <div className="rounded-md border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300">
          Voice cloning is disabled. It requires a connected provider (e.g.
          ElevenLabs) — set VOICE_CLONE_PROVIDER and VOICE_CLONE_API_KEY in
          the backend .env to enable it. This sandbox has no GPU, so cloning
          can't run locally.
        </div>
      )}

      <div className="mt-4 space-y-3 opacity-90">
        <input
          disabled={!enabled}
          value={speakerName}
          onChange={(e) => setSpeakerName(e.target.value)}
          placeholder="Speaker name"
          className="w-full rounded-md border border-surface-border bg-ink-950 px-3 py-2 text-sm text-slate-200 disabled:opacity-50"
        />
        <label className="flex items-start gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={consent}
            disabled={!enabled}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#4F6BF0]"
          />
          I confirm I have this speaker's explicit permission to clone their voice,
          and will use it only for authorized purposes.
        </label>
        <button
          disabled={!enabled || !consent || !speakerName}
          className="rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-40"
        >
          Create voice clone
        </button>
      </div>
    </section>
  );
}
