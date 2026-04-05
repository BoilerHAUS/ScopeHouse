import type { ReactNode } from "react";
import Link from "next/link";
import {
  PageShell,
  PageShellBody,
  PageShellContent,
  PageShellSidebar,
} from "@/components/ui/boilerhaus";
import { PrimaryNav } from "@/components/navigation/primary-nav";
import { NAV_ITEMS } from "@/lib/constants/navigation";

type AppShellProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

function DefaultSidebar() {
  return (
    <div className="flex h-full flex-col gap-8">
      <div className="space-y-4 border-b border-white/10 pb-6">
        <p className="font-mono text-xs tracking-[0.28em] text-white/55 uppercase">
          Renovation OS
        </p>
        <div className="space-y-3">
          <h2 className="font-display text-3xl leading-none tracking-[0.08em] text-white uppercase">
            Plan. Price. Run. Track. Finish.
          </h2>
          <p className="text-sm leading-7 text-white/72">
            ScopeHouse stays focused on the control layer serious homeowners and
            small renovation teams actually need.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-mono text-xs tracking-[0.24em] text-white/50 uppercase">
          Main routes
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between border-l border-white/10 py-2 pl-3 transition hover:border-signal hover:pl-4"
            >
              <span className="text-sm text-white/82 group-hover:text-white">
                {item.label}
              </span>
              <span className="font-mono text-[11px] tracking-[0.24em] text-white/38 uppercase">
                0{index + 1}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-3 border-t border-white/10 pt-6">
        <p className="font-mono text-xs tracking-[0.24em] text-white/50 uppercase">
          Core promise
        </p>
        <ul className="space-y-2 text-sm text-white/72">
          <li>Calm working structure instead of feature sprawl.</li>
          <li>Reviewable AI support instead of silent automation.</li>
          <li>Credible exports instead of internal-only dashboards.</li>
        </ul>
      </div>
    </div>
  );
}

export function AppShell({ children, sidebar }: AppShellProps) {
  return (
    <PageShell className="bg-paper text-void">
      <div className="supports-[backdrop-filter]:bg-paper/90 supports-[backdrop-filter]:backdrop-blur">
        <PrimaryNav />
      </div>
      <PageShellBody className="flex-col lg:flex-row">
        <PageShellSidebar className="w-full shrink-0 border-b border-rule bg-ash text-paper lg:min-h-[calc(100vh-var(--topbar-height))] lg:w-[var(--sidebar-width)] lg:border-r lg:border-b-0">
          <div className="flex h-full flex-col p-5 lg:p-6">
            {sidebar ?? <DefaultSidebar />}
          </div>
        </PageShellSidebar>
        <PageShellContent className="min-w-0 bg-transparent">
          <main className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 lg:space-y-8 lg:px-8 lg:py-8">
            {children}
          </main>
        </PageShellContent>
      </PageShellBody>
    </PageShell>
  );
}
