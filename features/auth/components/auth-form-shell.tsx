import type { ReactNode } from "react";

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
    <div className="border-border bg-surface mx-auto w-full max-w-md rounded-[2rem] border px-6 py-7 shadow-[0_22px_60px_rgba(54,42,20,0.08)]">
      <div className="space-y-2">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          ScopeHouse
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
        <p className="text-muted text-sm leading-7">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}
