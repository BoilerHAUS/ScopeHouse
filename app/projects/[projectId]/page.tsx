import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

type ProjectWorkspacePageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    notFound();
  }

  return (
    <PageContainer>
      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
              Project
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              {project.title}
            </h2>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
              The project shell is active. Continue with intake to capture the
              room list, goals, budget range, timing, and constraints that will
              drive the first scope draft.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <div className="bg-surface-strong/55 rounded-[1.5rem] px-4 py-4">
              <p className="text-muted text-xs uppercase tracking-[0.2em]">
                Status
              </p>
              <p className="mt-2 text-base font-semibold capitalize">
                {formatLabel(project.status)}
              </p>
            </div>
            <div className="bg-surface-strong/55 rounded-[1.5rem] px-4 py-4">
              <p className="text-muted text-xs uppercase tracking-[0.2em]">
                Type
              </p>
              <p className="mt-2 text-base font-semibold capitalize">
                {formatLabel(project.projectType)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="border-border rounded-[1.5rem] border px-5 py-5">
            <p className="text-muted text-xs uppercase tracking-[0.2em]">
              Location
            </p>
            <p className="mt-2 text-sm leading-7">
              {project.locationLabel ?? "Location not captured yet."}
            </p>
          </div>
          <div className="border-border rounded-[1.5rem] border px-5 py-5">
            <p className="text-muted text-xs uppercase tracking-[0.2em]">
              Goals
            </p>
            <p className="mt-2 text-sm leading-7">
              {project.goals ??
                "No project goals captured yet. Add them in the next workflow steps."}
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
