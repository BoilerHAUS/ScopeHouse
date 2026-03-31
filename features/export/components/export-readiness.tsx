import { SectionCard } from "@/components/data-display/section-card";

export function ExportReadiness() {
  return (
    <SectionCard
      eyebrow="Export"
      title="Project summaries are a first-class output"
      description="Exports should be credible to share with homeowners, contractors, consultants, and design-build teams."
    >
      <div className="grid gap-3 lg:grid-cols-4">
        {[
          "Intake summary",
          "Scope baseline",
          "Budget summary",
          "Decision and change log",
        ].map((item) => (
          <div
            key={item}
            className="border-border bg-surface-strong/45 text-muted rounded-[1.25rem] border px-4 py-4 text-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
