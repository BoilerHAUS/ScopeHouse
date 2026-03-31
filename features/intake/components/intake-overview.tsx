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
      <ul className="text-muted space-y-2 text-sm">
        {intakeSignals.map((item) => (
          <li key={item} className="bg-accent-soft/60 rounded-xl px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
