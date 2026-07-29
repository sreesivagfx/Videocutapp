"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import UploadDropzone from "@/components/UploadDropzone";
import { getRecentProjects, RecentProject } from "@/lib/recentProjects";
import { listProjects } from "@/lib/api";
import { FileVideo } from "lucide-react";

export default function DashboardPage() {
  const [recent, setRecent] = useState<RecentProject[]>([]);

  useEffect(() => {
    // Backend is the source of truth (persists across devices/restarts);
    // localStorage is just a same-browser fallback if that fetch fails.
    listProjects()
      .then((projects) =>
        setRecent(
          projects.map((p) => ({
            project_id: p.id,
            filename: p.filename,
            createdAt: p.created_at * 1000,
          }))
        )
      )
      .catch(() => setRecent(getRecentProjects()));
  }, []);

  return (
    <div>
      <TopBar
        title="Dashboard"
        subtitle="Upload a long-form video to auto-detect and cut shorts."
      />
      <div className="mx-auto max-w-4xl px-8 py-8">
        <UploadDropzone />

        <div className="mt-10">
          <h2 className="text-sm font-semibold text-white">Recent projects</h2>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No projects yet — upload a video above to get started.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-surface-border rounded-lg border border-surface-border bg-ink-900">
              {recent.map((p) => (
                <li key={p.project_id}>
                  <Link
                    href={`/editor/${p.project_id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5"
                  >
                    <FileVideo className="h-4 w-4 text-accent-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-200">{p.filename}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
