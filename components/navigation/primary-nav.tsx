import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants/navigation";

export function PrimaryNav() {
  return (
    <header className="rounded-[2rem] border border-border bg-surface/90 px-5 py-4 shadow-[0_18px_60px_rgba(54,42,20,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
            ScopeHouse
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">
            Renovation planning and control
          </h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-accent hover:bg-accent-soft hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
