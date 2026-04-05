import type { ReactNode } from "react";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui/boilerhaus";

type AuthFormShellProps = {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthFormShell({
  title,
  description,
  footer,
  children,
}: AuthFormShellProps) {
  return (
    <Card className="mx-auto w-full max-w-md border-rule bg-white/92 shadow-[var(--shadow-xl)]">
      <CardHeader className="flex-col items-start gap-4 border-b border-rule px-6 py-6">
        <Badge variant="active">ScopeHouse</Badge>
        <div className="space-y-2">
          <h1 className="font-display text-3xl leading-none tracking-[0.08em] uppercase text-void">
            {title}
          </h1>
          <p className="text-sm leading-7 text-smoke">{description}</p>
        </div>
      </CardHeader>
      <CardBody className="px-6 py-6">
        <div>{children}</div>
        {footer ? <div className="mt-5">{footer}</div> : null}
      </CardBody>
    </Card>
  );
}
