"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import { translateText } from "@/lib/api";
import { Languages } from "lucide-react";

const LANGUAGES = [
  { code: "ES", label: "Spanish" },
  { code: "FR", label: "French" },
  { code: "DE", label: "German" },
  { code: "PT", label: "Portuguese" },
  { code: "HI", label: "Hindi" },
  { code: "AR", label: "Arabic" },
  { code: "JA", label: "Japanese" },
  { code: "ZH", label: "Chinese" },
];

export default function TranslatePage() {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("ES");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const translated = await translateText(text, target);
      setResult(translated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar
        title="Translate"
        subtitle="Translate captions or scripts for regional audiences and dubbing."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-8 py-8">
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-sm text-amber-300">
          Running on the free default provider (no API key configured), which
          returns tagged source text so you can verify the flow end-to-end.
          Add a DeepL or Google Translate key in Settings for real translations.
        </div>

        <section className="rounded-xl border border-surface-border bg-ink-900 p-5">
          <label className="text-xs font-medium text-slate-400">Text or caption script</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Paste transcript or caption text here…"
            className="mt-2 w-full rounded-md border border-surface-border bg-ink-950 p-3 text-sm text-slate-200"
          />

          <div className="mt-4 flex items-center gap-3">
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="rounded-md border border-surface-border bg-ink-950 px-3 py-2 text-sm text-slate-200"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button
              onClick={run}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50"
            >
              <Languages className="h-4 w-4" />
              {loading ? "Translating…" : "Translate"}
            </button>
          </div>
        </section>

        {result && (
          <section className="rounded-xl border border-surface-border bg-ink-900 p-5">
            <h2 className="text-xs font-medium text-slate-400">Result</h2>
            <p className="mt-2 text-sm text-slate-200">{result}</p>
          </section>
        )}
      </div>
    </div>
  );
}
