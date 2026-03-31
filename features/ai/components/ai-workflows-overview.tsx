import { SectionCard } from "@/components/data-display/section-card";

const workflows = ["Scope draft", "Quote comparison", "Progress summary"];

export function AIWorkflowsOverview() {
  return (
    <SectionCard
      eyebrow="AI"
      title="Visible, reviewable AI support"
      description="AI should save time and reduce confusion without silently taking control of the project record."
    >
      <div className="space-y-2">
        {workflows.map((workflow) => (
          <div
            key={workflow}
            className="border-border text-muted rounded-xl border px-3 py-3 text-sm"
          >
            {workflow}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
