import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/server/auth/session";
import { listProjectsForUser } from "@/features/projects/queries/list-projects";

function formatProjectType(value: string) {
  return value.replaceAll("_", " ");
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default async function ProjectsPage() {
  const user = await requireCurrentUser();
  const projects = await listProjectsForUser(user.id);

  return (
    <AppShell>
      <section className="space-y-6">
        <div className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
                Projects
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Project workspace index
              </h2>
              <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
                Start a new renovation project or reopen an active one.
              </p>
            </div>
            <Button asChild className="rounded-full px-5">
              <Link href="/projects/new">Create project</Link>
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="border-border bg-surface rounded-[2rem] border px-6 py-8 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
            <h3 className="text-xl font-semibold">No projects yet</h3>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
              Create the first project shell, then move into guided intake and
              scope drafting.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="border-border bg-surface hover:border-accent block rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)] transition"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-accent-soft text-foreground rounded-full px-3 py-1 text-xs font-medium capitalize">
                    {formatStatus(project.status)}
                  </span>
                  <span className="text-muted text-xs capitalize">
                    {formatProjectType(project.projectType)}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold">{project.title}</h3>
                <p className="text-muted mt-2 text-sm leading-6">
                  {project.locationLabel ?? "Location not set yet"}
                </p>
                <p className="text-muted mt-4 text-xs">
                  Updated {project.updatedAt.toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
