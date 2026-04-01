import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { requireCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { getProjectIntakeForUser } from "@/features/intake/queries/get-project-intake";
import { listProjectActivityForUser } from "@/features/projects/queries/list-project-activity";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

type OverviewCardProps = {
  href: Route;
  title: string;
  status: string;
  summary: string;
  cta: string;
};

function OverviewCard({ href, title, status, summary, cta }: OverviewCardProps) {
  return (
    <Link
      href={href}
      className="border-border bg-surface hover:border-accent block rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)] transition"
    >
      <p className="text-muted text-xs uppercase tracking-[0.2em]">{title}</p>
      <p className="mt-3 text-lg font-semibold">{status}</p>
      <p className="text-muted mt-3 text-sm leading-7">{summary}</p>
      <p className="mt-5 text-sm font-medium">{cta}</p>
    </Link>
  );
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
  const [project, intakeRecord, activity] = await Promise.all([
    getProjectForUser(projectId, user.id),
    getProjectIntakeForUser(projectId, user.id),
    listProjectActivityForUser(projectId, user.id),
  ]);

  if (!project) {
    notFound();
  }

  const intakeCompleted = Boolean(intakeRecord?.intake?.completedAt);
  const intakeStarted = Boolean(intakeRecord?.intake);
  const scopeReady = intakeCompleted;
  const hasDecisions = false;

  const overviewCards: OverviewCardProps[] = [
    {
      href: `/projects/${projectId}/intake` as Route,
      title: "Intake",
      status: intakeCompleted
        ? "Complete and ready for scope drafting"
        : intakeStarted
          ? "In progress"
          : "Not started",
      summary: intakeCompleted
        ? "Renovation context is captured and ready to drive the first draft scope."
        : intakeStarted
          ? "The intake record exists but still needs answers before it can support AI scope drafting."
          : "Start guided intake to capture rooms, priorities, budget context, timing, and constraints.",
      cta: intakeCompleted ? "Review intake" : "Continue intake",
    },
    {
      href: `/projects/${projectId}/scope` as Route,
      title: "Scope",
      status: scopeReady ? "Ready for first draft" : "Waiting on intake",
      summary: scopeReady
        ? "The scope route is the next working area. Use intake as the structured source of truth."
        : "Scope drafting should wait until intake is completed so the baseline is credible.",
      cta: scopeReady ? "Open scope route" : "Finish intake first",
    },
    {
      href: `/projects/${projectId}/decisions` as Route,
      title: "Decisions",
      status: hasDecisions ? "Decision log started" : "No decisions logged yet",
      summary:
        "Use the decisions log to record approvals, deferrals, and owner responsibilities once planning choices start to accumulate.",
      cta: "Open decisions",
    },
    {
      href: `/projects/${projectId}/export` as Route,
      title: "Export readiness",
      status: intakeCompleted
        ? "Intake ready, other modules pending"
        : "Not ready for export yet",
      summary: intakeCompleted
        ? "A summary export can start taking shape once scope, decisions, and supporting evidence are added."
        : "Exports should stay thin until the intake baseline is complete and reviewable.",
      cta: "Review export route",
    },
  ];

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

      <section className="grid gap-4 xl:grid-cols-2">
        {overviewCards.map((card) => (
          <OverviewCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <div className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
          <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
            Next actions
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7">
            <p>
              {intakeCompleted
                ? "Intake is complete. The next useful move is generating or drafting the first scope structure."
                : "Finish intake before trying to draft scope, compare quotes, or export a project summary."}
            </p>
            <p>
              Keep this overview page as the control center for module state and
              route entry, not a bloated dashboard.
            </p>
          </div>
        </div>

        <div className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
          <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
            Recent activity
          </p>
          <div className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <p className="text-muted text-sm leading-7">
                No project activity has been recorded yet.
              </p>
            ) : (
              activity.slice(0, 6).map((entry) => (
                <div
                  key={entry.id}
                  className="border-border rounded-[1.35rem] border px-4 py-4"
                >
                  <p className="text-sm font-medium">{entry.summary}</p>
                  <p className="text-muted mt-2 text-xs leading-5">
                    {entry.actor?.name ?? "Unknown actor"} ·{" "}
                    {entry.createdAt.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
