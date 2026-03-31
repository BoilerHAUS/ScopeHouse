import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants/navigation";

export function PrimaryNav() {
  return (
    <header className="border-border bg-surface/90 rounded-[2rem] border px-5 py-4 shadow-[0_18px_60px_rgba(54,42,20,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-muted font-mono text-xs tracking-[0.28em] uppercase">
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
              className="border-border text-muted hover:border-accent hover:bg-accent-soft hover:text-foreground rounded-full border px-4 py-2 text-sm transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
