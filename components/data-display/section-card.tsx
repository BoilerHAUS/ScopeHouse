import type { ReactNode } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/boilerhaus";

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
    <Card className="border-rule bg-white/88 shadow-[var(--shadow-lg)]">
      <CardHeader className="flex-col items-start gap-4 border-b border-rule px-5 py-5 sm:px-6">
        <div className="h-1 w-14 bg-signal" aria-hidden />
        {eyebrow ? (
          <p className="font-mono text-xs tracking-[0.28em] text-smoke uppercase">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h2 className="font-display text-xl tracking-[0.06em] text-void uppercase sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-smoke sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </CardHeader>
      {children ? (
        <CardBody className="px-5 py-5 sm:px-6">{children}</CardBody>
      ) : null}
    </Card>
  );
}
