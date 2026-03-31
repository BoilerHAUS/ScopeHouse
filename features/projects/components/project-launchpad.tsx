import Link from "next/link";
import { SectionCard } from "@/components/data-display/section-card";
import { Button } from "@/components/ui/button";

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
              className="border-border bg-surface-strong/55 rounded-[1.5rem] border px-4 py-4"
            >
              <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
                Step {index + 1}
              </p>
              <p className="mt-2 text-base font-medium">{step}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full px-5">
            <Link href="/projects">Open project routes</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-5">
            <Link href="/projects/new">Start new project flow</Link>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
