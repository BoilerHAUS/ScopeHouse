"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Badge, PageShellNavItem } from "@/components/ui/boilerhaus";
import { PROJECT_SECTION_ITEMS } from "@/lib/constants/project-sections";

type ProjectSectionsNavProps = {
  projectId: string;
  projectTitle?: string;
  projectStatus?: string;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getStatusVariant(status?: string) {
  if (!status) {
    return "neutral";
  }

  if (status.includes("archived")) {
    return "warning";
  }

  if (status.includes("active")) {
    return "active";
  }

  if (status.includes("complete")) {
    return "success";
  }

  return "neutral";
}

export function ProjectSectionsNav({
  projectId,
  projectTitle,
  projectStatus,
}: ProjectSectionsNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-4 border-b border-white/10 pb-5">
        <p className="font-mono text-xs tracking-[0.24em] text-white/55 uppercase">
          Project Workspace
        </p>
        {projectTitle ? (
          <div className="space-y-3">
            <p className="font-display text-3xl leading-none tracking-[0.08em] text-white uppercase">
              {projectTitle}
            </p>
            {projectStatus ? (
              <Badge variant={getStatusVariant(projectStatus)}>
                {formatLabel(projectStatus)}
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm leading-7 text-white/72">
            Use one navigation rail for intake, scope, planning, evidence, and
            export. Keep the working route structure obvious.
          </p>
        )}
      </div>

      <nav className="space-y-1">
        {PROJECT_SECTION_ITEMS.map((item, index) => {
          const href = item.segment
            ? (`/projects/${projectId}/${item.segment}` as Route)
            : (`/projects/${projectId}` as Route);
          const isActive = pathname === href;

          return (
            <PageShellNavItem
              key={item.label}
              asChild
              active={isActive}
              icon={
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/65">
                  {String(index + 1).padStart(2, "0")}
                </span>
              }
              className="min-h-0 flex-col items-start gap-1 py-3"
            >
              <Link href={href}>
                <span className="text-sm font-medium text-inherit">
                  {item.label}
                </span>
                <span className="text-xs leading-5 text-white/55">
                  {item.description}
                </span>
              </Link>
            </PageShellNavItem>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-5">
        <p className="font-mono text-xs tracking-[0.24em] text-white/50 uppercase">
          Operating rule
        </p>
        <p className="mt-3 text-sm leading-7 text-white/72">
          Keep changes explicit and keep the baseline reviewable before budget,
          quote, or export workflows build on top of it.
        </p>
      </div>
    </div>
  );
}
