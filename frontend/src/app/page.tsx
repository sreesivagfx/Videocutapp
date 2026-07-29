import Link from "next/link";
import {
  Scissors,
  Captions,
  Languages,
  AudioWaveform,
  Wand2,
  Mic,
  Type,
  ArrowRight,
  Film,
} from "lucide-react";

const FEATURES = [
  {
    icon: Scissors,
    title: "Automatic long-to-short cutting",
    body: "Upload a long-form video and the engine transcribes it, scores moments for hook strength and pacing, and cuts ranked vertical shorts automatically.",
  },
  {
    icon: Captions,
    title: "Auto captions, burned in",
    body: "Word-accurate captions generated from speech, styled from a preset library, with optional word-by-word pop highlighting.",
  },
  {
    icon: Languages,
    title: "Translation & regional audio",
    body: "Translate captions and dub audio for different regions and markets from the same source project.",
  },
  {
    icon: Type,
    title: "Style, font & transition library",
    body: "A growing library of caption styles, free fonts, and transition/effect presets — pick and apply in one click.",
  },
  {
    icon: AudioWaveform,
    title: "Noise removal & recording",
    body: "Clean up noisy audio and record voice-overs directly in the browser.",
  },
  {
    icon: Mic,
    title: "Text-to-speech & voice cloning",
    body: "Generate narration from a script, or — with explicit consent and a connected provider — clone a voice for narration.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500">
            <Film className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">VideoCut</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-slate-300">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#workflow" className="hover:text-white">Workflow</a>
          <Link
            href="/dashboard"
            className="rounded-md bg-accent-500 px-4 py-2 font-medium text-white hover:bg-accent-600"
          >
            Open Studio
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center">
        <span className="inline-block rounded-full border border-surface-border bg-ink-900 px-3 py-1 text-xs font-medium text-accent-400">
          Built for YouTube · Instagram · TikTok · Corporate &amp; Promo
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Turn long videos into
          <span className="text-accent-400"> ready-to-post shorts</span> — automatically
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
          A professional video production platform: automatic highlight detection,
          auto captions, translation, dubbing, noise removal, and a full style/effects
          library — for social content and corporate video alike.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md bg-accent-500 px-5 py-3 text-sm font-medium text-white hover:bg-accent-600"
          >
            Start a project <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="rounded-md border border-surface-border px-5 py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            See what's included
          </a>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-surface-border bg-ink-900 p-6 shadow-card"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/15">
                <f.icon className="h-5 w-5 text-accent-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-2xl border border-surface-border bg-ink-900 p-8">
          <h2 className="text-lg font-semibold text-white">How it works</h2>
          <ol className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-4">
            {[
              ["1", "Upload", "Drop in a long-form video (up to 2GB)."],
              ["2", "Analyze", "Speech is transcribed and scored for highlight-worthy moments."],
              ["3", "Auto-cut", "Top segments are cropped to 9:16 with captions burned in."],
              ["4", "Export", "Review, restyle if needed, and download per platform."],
            ].map(([n, t, d]) => (
              <li key={n}>
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-sm font-semibold text-white">
                  {n}
                </div>
                <p className="text-sm font-medium text-white">{t}</p>
                <p className="mt-1 text-sm text-slate-400">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-surface-border px-6 py-8 text-center text-xs text-slate-500">
        VideoCut Studio — MVP build. Voice cloning requires explicit consent and a connected provider.
      </footer>
    </div>
  );
}
