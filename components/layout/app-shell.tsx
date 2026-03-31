import type { ReactNode } from "react";
import { PrimaryNav } from "@/components/navigation/primary-nav";

type AppShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export function AppShell({ children, sidebar }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <PrimaryNav />
        {sidebar ? (
          <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-5 lg:self-start">
              {sidebar}
            </aside>
            <main className="min-w-0 space-y-6">{children}</main>
          </div>
        ) : (
          <main className="flex-1 space-y-6 py-6">{children}</main>
        )}
      </div>
    </div>
  );
}
