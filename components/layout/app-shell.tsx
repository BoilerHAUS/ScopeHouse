import type { ReactNode } from "react";
import { PrimaryNav } from "@/components/navigation/primary-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <PrimaryNav />
        <main className="flex-1 space-y-6 py-6">{children}</main>
      </div>
    </div>
  );
}
