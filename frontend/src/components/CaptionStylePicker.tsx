"use client";

import { useEffect, useState } from "react";
import { listCaptionStyles } from "@/lib/api";
import type { CaptionStylePreset } from "@/lib/types";
import { Check } from "lucide-react";

export default function CaptionStylePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [styles, setStyles] = useState<CaptionStylePreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCaptionStyles()
      .then(setStyles)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading caption styles…</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {styles.map((s) => {
        const active = s.id === value;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={`relative rounded-lg border p-3 text-left transition-colors ${
              active
                ? "border-accent-500 bg-accent-500/10"
                : "border-surface-border bg-ink-900 hover:border-slate-600"
            }`}
          >
            {active && (
              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
            <div
              className="flex h-12 items-center justify-center rounded-md bg-black/60 text-[11px] font-bold"
              style={{
                fontFamily: s.font_family,
                textTransform: s.uppercase ? "uppercase" : "none",
                color: "#fff",
              }}
            >
              {s.name}
            </div>
            <p className="mt-2 text-xs font-medium text-slate-200">{s.name}</p>
            <p className="text-[11px] text-slate-500">{s.font_family} · {s.position}</p>
          </button>
        );
      })}
    </div>
  );
}
