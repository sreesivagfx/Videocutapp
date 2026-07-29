import TopBar from "@/components/TopBar";

const PROVIDER_ROWS = [
  { group: "Transcription", env: "WHISPER_MODEL_SIZE", note: "tiny|base|small|medium|large-v3 — runs locally, no key needed." },
  { group: "Translation", env: "TRANSLATE_PROVIDER / DEEPL_API_KEY", note: "Defaults to a local stub; set to 'deepl' with a key for real translations." },
  { group: "Text-to-speech", env: "TTS_PROVIDER / ELEVENLABS_API_KEY", note: "Defaults to a free local engine; set to 'elevenlabs' for higher quality." },
  { group: "Voice cloning", env: "VOICE_CLONE_PROVIDER / VOICE_CLONE_API_KEY", note: "Disabled by default. Requires an external GPU-backed provider and explicit per-request consent." },
  { group: "Storage", env: "STORAGE_BACKEND / S3_*", note: "Defaults to local disk; switch to S3-compatible storage for production." },
];

export default function SettingsPage() {
  return (
    <div>
      <TopBar title="Settings" subtitle="Provider configuration for this deployment." />
      <div className="mx-auto max-w-3xl space-y-6 px-8 py-8">
        <div className="rounded-xl border border-surface-border bg-ink-900 p-5">
          <p className="text-sm text-slate-300">
            This MVP has no authentication or multi-tenant settings storage
            yet, so provider credentials are configured server-side via the
            backend's <code className="rounded bg-black/40 px-1 py-0.5 text-xs">.env</code> file
            (see <code className="rounded bg-black/40 px-1 py-0.5 text-xs">backend/.env.example</code>),
            not from this page. This keeps API keys off the browser entirely.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-surface-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-900 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Feature</th>
                <th className="px-4 py-2">Env var(s)</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-ink-950">
              {PROVIDER_ROWS.map((r) => (
                <tr key={r.group}>
                  <td className="px-4 py-2.5 font-medium text-slate-200">{r.group}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-accent-400">{r.env}</td>
                  <td className="px-4 py-2.5 text-slate-400">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
