"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { PROJECT_SECTION_ITEMS } from "@/lib/constants/project-sections";
import { cn } from "@/lib/utils";

type ProjectSectionsNavProps = {
  projectId: string;
  projectTitle?: string;
  projectStatus?: string;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function ProjectSectionsNav({
  projectId,
  projectTitle,
  projectStatus,
}: ProjectSectionsNavProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <div className="border-border bg-surface rounded-[1.75rem] border px-4 py-4 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          Project Workspace
        </p>
        {projectTitle ? (
          <div className="mt-3 space-y-2">
            <p className="text-base font-semibold">{projectTitle}</p>
            {projectStatus ? (
              <p className="text-muted text-xs uppercase tracking-[0.2em]">
                {formatLabel(projectStatus)}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-foreground/80 mt-2 text-sm leading-7">
            Use one navigation rail for intake, scope, planning, evidence, and
            export. Keep the working route structure obvious.
          </p>
        )}
      </div>
      <nav className="border-border bg-surface rounded-[1.75rem] border p-2 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
        <ul className="space-y-1">
          {PROJECT_SECTION_ITEMS.map((item) => {
            const href = item.segment
              ? (`/projects/${projectId}/${item.segment}` as Route)
              : (`/projects/${projectId}` as Route);
            const isActive = pathname === href;

            return (
              <li key={item.label}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-start justify-between rounded-[1.15rem] px-3 py-3 transition",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:bg-surface-strong/65 hover:text-foreground",
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
