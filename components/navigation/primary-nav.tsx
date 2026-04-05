import Link from "next/link";
import { Badge, PageShellTopbar } from "@/components/ui/boilerhaus";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { NAV_ITEMS } from "@/lib/constants/navigation";
import { getCurrentUser } from "@/server/auth/session";

export async function PrimaryNav() {
  const user = await getCurrentUser();

  return (
    <PageShellTopbar className="h-auto border-b border-rule bg-paper/95 px-4 py-4 backdrop-blur lg:px-6">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="grid size-10 place-items-center border border-void bg-signal text-paper shadow-[var(--shadow-sm)]"
              aria-hidden
            >
              SH
            </span>
            <div>
              <p className="font-mono text-xs tracking-[0.28em] text-smoke uppercase">
                ScopeHouse
              </p>
              <h1 className="font-display text-2xl leading-none tracking-[0.08em] uppercase text-void">
                Renovation Control
              </h1>
            </div>
          </Link>
          <Badge variant="active" className="hidden lg:inline-flex">
            MVP
          </Badge>
        </div>

        <nav className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-rule bg-white/70 px-3 py-2 font-display text-sm tracking-[0.14em] uppercase text-smoke transition hover:border-void hover:bg-white hover:text-void"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right lg:block">
                <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
                  Active user
                </p>
                <p className="text-sm font-medium text-void">
                  {user.name ?? user.email}
                </p>
              </div>
              <form action={signOutAction}>
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </PageShellTopbar>
  );
}
