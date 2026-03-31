import { SectionCard } from "@/components/data-display/section-card";

const intakeSignals = [
  "renovation type",
  "rooms and areas",
  "budget range",
  "timing expectations",
  "constraints and risks",
];

export function IntakeOverview() {
  return (
    <SectionCard
      eyebrow="Intake"
      title="Structured ambiguity reduction"
      description="The intake system converts rough renovation ideas into usable planning inputs."
    >
      <ul className="space-y-2 text-sm text-muted">
        {intakeSignals.map((item) => (
          <li key={item} className="rounded-xl bg-accent-soft/60 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
