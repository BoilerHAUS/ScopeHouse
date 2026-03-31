import { SectionCard } from "@/components/data-display/section-card";

export function DecisionsOverview() {
  return (
    <SectionCard
      eyebrow="Decisions"
      title="Track what changed and who approved it"
      description="Decision logging is part of the control layer, not an afterthought."
    >
      <div className="text-muted grid gap-2 text-sm">
        <div className="border-border rounded-xl border px-3 py-3">
          Owner, summary, status, date
        </div>
        <div className="border-border rounded-xl border px-3 py-3">
          Link decisions to scope, budget, and change context
        </div>
      </div>
    </SectionCard>
  );
}
