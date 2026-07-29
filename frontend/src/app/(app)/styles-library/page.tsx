"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { listCaptionStyles, listFonts, listTransitions } from "@/lib/api";
import type { CaptionStylePreset, FontEntry, TransitionEntry } from "@/lib/types";
import { Wand2 } from "lucide-react";

export default function StylesLibraryPage() {
  const [captionStyles, setCaptionStyles] = useState<CaptionStylePreset[]>([]);
  const [fonts, setFonts] = useState<FontEntry[]>([]);
  const [transitions, setTransitions] = useState<TransitionEntry[]>([]);

  useEffect(() => {
    listCaptionStyles().then(setCaptionStyles);
    listFonts().then(setFonts);
    listTransitions().then(setTransitions);
  }, []);

  return (
    <div>
      <TopBar
        title="Style Library"
        subtitle="Free, ready-to-use caption styles, fonts, and transitions."
      />

      <div className="mx-auto max-w-6xl space-y-10 px-8 py-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-white">Caption styles</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {captionStyles.map((s) => (
              <div key={s.id} className="rounded-lg border border-surface-border bg-ink-900 p-3">
                <div
                  className="flex h-16 items-center justify-center rounded-md bg-black/60 text-xs font-bold"
                  style={{ fontFamily: s.font_family, textTransform: s.uppercase ? "uppercase" : "none", color: "#fff" }}
                >
                  {s.name}
                </div>
                <p className="mt-2 text-xs font-medium text-slate-200">{s.name}</p>
                <p className="text-[11px] text-slate-500">{s.font_family}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-white">Fonts</h2>
          <div className="overflow-hidden rounded-lg border border-surface-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-900 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Family</th>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">License</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-ink-950">
                {fonts.map((f) => (
                  <tr key={f.family}>
                    <td className="px-4 py-2.5 font-medium text-slate-200" style={{ fontFamily: f.family }}>
                      {f.family}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{f.source}</td>
                    <td className="px-4 py-2.5 text-slate-400">{f.license}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-white">Transitions &amp; effects</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {transitions.map((t) => (
              <div
                key={t.id}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-surface-border bg-ink-900 p-4 text-center"
              >
                <Wand2 className="h-5 w-5 text-accent-400" />
                <p className="text-xs font-medium text-slate-200">{t.name}</p>
                <p className="truncate text-[10px] text-slate-500">{t.ffmpeg_filter}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
