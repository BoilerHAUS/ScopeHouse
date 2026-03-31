import { SectionCard } from "@/components/data-display/section-card";

export function ScopeOverview() {
  return (
    <SectionCard
      eyebrow="Scope"
      title="Phase, room, and work item structure"
      description="Scope is the baseline that the budget planner, quote comparison, and change tracking all depend on."
    >
      <div className="rounded-2xl border border-border bg-surface-strong/45 px-4 py-4 text-sm leading-7 text-muted">
        Keep revisions explicit. Treat the AI draft as a first pass. Preserve a
        clean human-reviewed baseline before downstream workflows use it.
      </div>
    </SectionCard>
  );
}
