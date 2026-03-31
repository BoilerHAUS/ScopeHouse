import type { ReactNode } from "react";

type SectionCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.06)] sm:px-6">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">{title}</h2>
          {description ? (
            <p className="text-muted max-w-2xl text-sm leading-7">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
