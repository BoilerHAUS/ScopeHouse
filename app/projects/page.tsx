import Link from "next/link";
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Stat,
} from "@/components/ui/boilerhaus";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { restoreProjectAction } from "@/features/projects/actions/restore-project";
import { listProjectsForUser } from "@/features/projects/queries/list-projects";
import { requireCurrentUser } from "@/server/auth/session";

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

function getProjectBadge(view: ProjectListView, status: string) {
  if (view === "archived") {
    return "warning";
  }

  if (status.includes("complete")) {
    return "success";
  }

  if (status.includes("active")) {
    return "active";
  }

  return "neutral";
}

function ProjectCard({ project, view }: ProjectCardProps) {
  const restoreProject = restoreProjectAction.bind(null, project.id);

  return (
    <Card className="border-rule bg-white/88 shadow-[var(--shadow-md)]">
      <CardHeader className="flex-col items-start gap-4 border-b border-rule px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={getProjectBadge(view, project.status)}
            className="capitalize"
          >
            {view === "archived" ? "Archived" : formatStatus(project.status)}
          </Badge>
          <span className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
            {formatProjectType(project.projectType)}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl tracking-[0.06em] uppercase text-void">
            {project.title}
          </h3>
          <p className="text-sm leading-7 text-smoke">
            {project.locationLabel ?? "Location not set yet"}
          </p>
        </div>
      </CardHeader>
      <CardBody className="px-5 py-5">
        <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
          {view === "archived" && project.archivedAt
            ? `Archived ${formatDate(project.archivedAt)}`
            : `Updated ${formatDate(project.updatedAt)}`}
        </p>
      </CardBody>
      <CardFooter className="flex flex-wrap gap-3 px-5 py-5">
        <Button asChild variant="outline">
          <Link href={`/projects/${project.id}`}>Open project</Link>
        </Button>
        {view === "archived" ? (
          <form action={restoreProject}>
            <Button type="submit">Restore</Button>
          </form>
        ) : null}
      </CardFooter>
    </Card>
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
        <Card className="border-rule bg-[linear-gradient(140deg,color-mix(in_srgb,var(--color-paper)_92%,white)_0%,color-mix(in_srgb,var(--color-paper)_90%,var(--color-signal))_50%,color-mix(in_srgb,var(--color-paper)_90%,var(--color-signal-alt))_100%)] shadow-[var(--shadow-xl)]">
          <CardHeader className="flex-col gap-5 border-b border-rule px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
            <div>
              <p className="font-mono text-xs tracking-[0.28em] text-smoke uppercase">
                Projects
              </p>
              <h2 className="mt-3 font-display text-4xl leading-none tracking-[0.08em] uppercase text-void lg:text-5xl">
                Project Index
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-smoke lg:text-base">
                {isArchivedView
                  ? "Review archived projects and restore them when they need to return to active work."
                  : "Start a new renovation project or reopen an active one."}
              </p>
            </div>
            <Button asChild>
              <Link href="/projects/new">Create project</Link>
            </Button>
          </CardHeader>
          <CardBody className="space-y-6 px-6 py-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-3">
              <Stat
                label="Active"
                value={activeProjects.length}
                caption="live workspaces"
                className="border border-rule bg-white/72"
              />
              <Stat
                label="Archived"
                value={archivedProjects.length}
                caption="kept intact for reference"
                className="border border-rule bg-white/72"
              />
              <Stat
                label="Current View"
                value={isArchivedView ? "Archive" : "Live"}
                caption="toggle between active and archived"
                className="border border-rule bg-white/72"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant={isArchivedView ? "outline" : "default"}>
                <Link href="/projects">Active projects</Link>
              </Button>
              <Button
                asChild
                variant={isArchivedView ? "default" : "outline"}
              >
                <Link href="/projects?view=archived">Archived projects</Link>
              </Button>
            </div>
          </CardBody>
        </Card>

        {projects.length === 0 ? (
          <Card className="border-rule bg-white/90 shadow-[var(--shadow-lg)]">
            <CardHeader className="flex-col items-start gap-3 border-b border-rule px-6 py-6">
              <Badge variant={isArchivedView ? "warning" : "neutral"}>
                {isArchivedView ? "Archive view" : "Active view"}
              </Badge>
              <h3 className="font-display text-2xl tracking-[0.08em] uppercase text-void">
                {isArchivedView ? "No archived projects" : "No active projects"}
              </h3>
            </CardHeader>
            <CardBody className="px-6 py-6">
              <p className="max-w-2xl text-sm leading-8 text-smoke">
                {isArchivedView
                  ? "Archived projects stay available here until they are restored."
                  : archivedProjects.length > 0
                    ? "Active projects are empty right now. Archived work is still available in the archived view."
                    : "Create the first project shell, then move into guided intake and scope drafting."}
              </p>
            </CardBody>
          </Card>
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
