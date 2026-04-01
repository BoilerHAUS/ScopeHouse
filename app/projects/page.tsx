import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/server/auth/session";
import { restoreProjectAction } from "@/features/projects/actions/restore-project";
import { listProjectsForUser } from "@/features/projects/queries/list-projects";

function formatProjectType(value: string) {
  return value.replaceAll("_", " ");
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: Date) {
  return value.toLocaleDateString();
}

type ProjectListView = "active" | "archived";

type ProjectsPageProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

type ProjectCardProps = {
  project: Awaited<ReturnType<typeof listProjectsForUser>>[number];
  view: ProjectListView;
};

function ProjectCard({ project, view }: ProjectCardProps) {
  const restoreProject = restoreProjectAction.bind(null, project.id);

  return (
    <article className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-accent-soft text-foreground rounded-full px-3 py-1 text-xs font-medium capitalize">
          {view === "archived" ? "Archived" : formatStatus(project.status)}
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
        {view === "archived" && project.archivedAt
          ? `Archived ${formatDate(project.archivedAt)}`
          : `Updated ${formatDate(project.updatedAt)}`}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-full px-4">
          <Link href={`/projects/${project.id}`}>Open project</Link>
        </Button>
        {view === "archived" ? (
          <form action={restoreProject}>
            <Button type="submit" className="rounded-full px-4">
              Restore
            </Button>
          </form>
        ) : null}
      </div>
    </article>
  );
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const user = await requireCurrentUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const currentView: ProjectListView =
    resolvedSearchParams?.view === "archived" ? "archived" : "active";
  const [activeProjects, archivedProjects] = await Promise.all([
    listProjectsForUser(user.id, { archived: false }),
    listProjectsForUser(user.id, { archived: true }),
  ]);

  const projects =
    currentView === "archived" ? archivedProjects : activeProjects;
  const isArchivedView = currentView === "archived";

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
                {isArchivedView
                  ? "Review archived projects and restore them when they need to return to active work."
                  : "Start a new renovation project or reopen an active one."}
              </p>
            </div>
            <Button asChild className="rounded-full px-5">
              <Link href="/projects/new">Create project</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              variant={isArchivedView ? "outline" : "default"}
              className="rounded-full px-4"
            >
              <Link href="/projects">Active projects</Link>
            </Button>
            <Button
              asChild
              variant={isArchivedView ? "default" : "outline"}
              className="rounded-full px-4"
            >
              <Link href="/projects?view=archived">Archived projects</Link>
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="border-border bg-surface rounded-[2rem] border px-6 py-8 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
            <h3 className="text-xl font-semibold">
              {isArchivedView ? "No archived projects" : "No active projects"}
            </h3>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
              {isArchivedView
                ? "Archived projects stay available here until they are restored."
                : archivedProjects.length > 0
                  ? "Active projects are empty right now. Archived work is still available in the archived view."
                  : "Create the first project shell, then move into guided intake and scope drafting."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                view={currentView}
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
