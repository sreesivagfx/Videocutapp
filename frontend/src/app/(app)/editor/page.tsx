import Link from "next/link";
import TopBar from "@/components/TopBar";

export default function EditorIndexPage() {
  return (
    <div>
      <TopBar title="Editor" subtitle="Select a project to open its workspace." />
      <div className="mx-auto max-w-2xl px-8 py-16 text-center">
        <p className="text-sm text-slate-400">
          No project selected. Start from the dashboard to upload a video, or
          open a recent project.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
