import { SectionCard } from "@/components/data-display/section-card";

export function ScopeOverview() {
  return (
    <SectionCard
      eyebrow="Scope"
      title="Phase, room, and work item structure"
      description="Scope is the baseline that the budget planner, quote comparison, and change tracking all depend on."
    >
      <div className="border-border bg-surface-strong/45 text-muted rounded-2xl border px-4 py-4 text-sm leading-7">
        Keep revisions explicit. Treat the AI draft as a first pass. Preserve a
        clean human-reviewed baseline before downstream workflows use it.
      </div>
    </SectionCard>
  );
}
