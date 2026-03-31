import { SectionCard } from "@/components/data-display/section-card";

type FeaturePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};

export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
  points,
}: FeaturePlaceholderProps) {
  return (
    <SectionCard eyebrow={eyebrow} title={title} description={description}>
      <ul className="text-muted space-y-3 text-sm leading-7">
        {points.map((point) => (
          <li
            key={point}
            className="border-border bg-surface-strong/50 rounded-2xl border px-4 py-3"
          >
            {point}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
