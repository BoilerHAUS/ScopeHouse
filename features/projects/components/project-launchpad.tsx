import Link from "next/link";
import { SectionCard } from "@/components/data-display/section-card";

const verticalSlice = [
  "Create project",
  "Complete guided intake",
  "Generate AI draft scope",
  "Edit scope",
  "Record decisions",
  "Export project summary PDF",
];

export function ProjectLaunchpad() {
  return (
    <SectionCard
      eyebrow="MVP Slice"
      title="The repo is now shaped around the first proving workflow"
      description="This scaffold follows the project docs: thin routes, domain-first features, explicit AI prompt contracts, and room for budget, schedule, documents, and changes without early chaos."
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {verticalSlice.map((step, index) => (
            <div
              key={step}
              className="rounded-[1.5rem] border border-border bg-surface-strong/55 px-4 py-4"
            >
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">
                Step {index + 1}
              </p>
              <p className="mt-2 text-base font-medium">{step}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Open project routes
          </Link>
          <Link
            href="/projects/new"
            className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-accent-soft"
          >
            Start new project flow
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
