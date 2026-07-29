"use client";

export interface RecentProject {
  project_id: string;
  filename: string;
  createdAt: number;
}

const KEY = "videocut.recentProjects";

export function rememberProject(p: RecentProject) {
  if (typeof window === "undefined") return;
  const list = getRecentProjects().filter((x) => x.project_id !== p.project_id);
  list.unshift(p);
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
}

export function getRecentProjects(): RecentProject[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
