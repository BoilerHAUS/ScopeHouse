import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Stat,
} from "@/components/ui/boilerhaus";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { listProjectChangeOrdersForUser } from "@/features/change-orders/queries/list-project-change-orders";
import { listProjectDecisionsForUser } from "@/features/decisions/queries/list-project-decisions";
import { getProjectIntakeForUser } from "@/features/intake/queries/get-project-intake";
import { archiveProjectAction } from "@/features/projects/actions/archive-project";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { listProjectActivityForUser } from "@/features/projects/queries/list-project-activity";
import { restoreProjectAction } from "@/features/projects/actions/restore-project";
import { requireCurrentUser } from "@/server/auth/session";

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

function getOverviewVariant(status: string) {
  if (status.toLowerCase().includes("ready")) {
    return "success";
  }

  if (status.toLowerCase().includes("waiting")) {
    return "warning";
  }

  if (status.toLowerCase().includes("not")) {
    return "neutral";
  }

  return "active";
}

function OverviewCard({ href, title, status, summary, cta }: OverviewCardProps) {
  return (
    <Card className="border-rule bg-white/88 shadow-[var(--shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]">
      <Link href={href} className="block">
        <CardHeader className="flex-col items-start gap-4 border-b border-rule px-5 py-5">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
              {title}
            </p>
            <Badge variant={getOverviewVariant(status)}>{status}</Badge>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 px-5 py-5">
          <p className="text-sm leading-7 text-smoke">{summary}</p>
          <p className="font-display text-sm tracking-[0.12em] uppercase text-signal-alt">
            {cta}
          </p>
        </CardBody>
      </Link>
    </Card>
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
  const [project, intakeRecord, activity, decisions, changeOrders] =
    await Promise.all([
      getProjectForUser(projectId, user.id),
      getProjectIntakeForUser(projectId, user.id),
      listProjectActivityForUser(projectId, user.id),
      listProjectDecisionsForUser(projectId, user.id),
      listProjectChangeOrdersForUser(projectId, user.id),
    ]);

  if (!project || !changeOrders) {
    notFound();
  }

  const lifecycleAction = project.archivedAt
    ? restoreProjectAction.bind(null, project.id)
    : archiveProjectAction.bind(null, project.id);

  const intakeCompleted = Boolean(intakeRecord?.intake?.completedAt);
  const intakeStarted = Boolean(intakeRecord?.intake);
  const scopeReady = intakeCompleted;
  const hasDecisions = decisions.length > 0;
  const hasChangeOrders = changeOrders.length > 0;
  const readyModules = [
    intakeCompleted,
    scopeReady,
    hasDecisions,
    hasChangeOrders,
  ].filter(Boolean).length;

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
      href: `/projects/${projectId}/change-orders` as Route,
      title: "Changes",
      status: hasChangeOrders ? "Change log started" : "No change orders yet",
      summary:
        "Track scope, budget, and timing changes in one place with impact notes that stay visible during planning.",
      cta: "Open changes",
    },
    {
      href: `/projects/${projectId}/export` as Route,
      title: "Export readiness",
      status: intakeCompleted
        ? "Intake ready, other modules pending"
        : "Not ready for export yet",
      summary: intakeCompleted
        ? "A summary export can start taking shape once scope, decisions, changes, and supporting evidence are added."
        : "Exports should stay thin until the intake baseline is complete and reviewable.",
      cta: "Review export route",
    },
  ];

  return (
    <PageContainer>
      <Card className="border-rule bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-paper)_94%,white)_0%,color-mix(in_srgb,var(--color-paper)_88%,var(--color-signal))_52%,color-mix(in_srgb,var(--color-paper)_90%,var(--color-signal-alt))_100%)] shadow-[var(--shadow-xl)]">
        <CardHeader className="flex-col gap-5 border-b border-rule px-6 py-6 lg:px-8 lg:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs tracking-[0.28em] text-smoke uppercase">
                Project
              </p>
              <h2 className="mt-3 font-display text-4xl leading-none tracking-[0.08em] uppercase text-void lg:text-5xl">
                {project.title}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-smoke lg:text-base">
                {project.archivedAt
                  ? "This project is archived. It stays intact, but it is hidden from the active project list until restored."
                  : "The project shell is active. Continue with intake to capture the room list, goals, budget range, timing, and constraints that will drive the first scope draft."}
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Badge variant={project.archivedAt ? "warning" : "active"}>
                {project.archivedAt ? "Archived workspace" : "Active workspace"}
              </Badge>
              <form action={lifecycleAction}>
                <Button
                  type="submit"
                  variant={project.archivedAt ? "default" : "outline"}
                >
                  {project.archivedAt ? "Restore project" : "Archive project"}
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-6 px-6 py-6 lg:px-8">
          {project.archivedAt ? (
            <div className="border border-rule bg-white/72 px-5 py-4">
              <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
                Archived
              </p>
              <p className="mt-2 text-sm leading-7 text-smoke">
                Archived on {project.archivedAt.toLocaleDateString()}. Restore
                the project when it needs to return to the active workspace
                list.
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Status"
              value={formatLabel(project.status)}
              caption="workspace state"
              className="border border-rule bg-white/72"
            />
            <Stat
              label="Type"
              value={formatLabel(project.projectType)}
              caption="renovation category"
              className="border border-rule bg-white/72"
            />
            <Stat
              label="Ready Modules"
              value={`${readyModules}/4`}
              caption="intake, scope, decisions, change log"
              className="border border-rule bg-white/72"
            />
            <Stat
              label="Activity"
              value={activity.length}
              caption="recent logged events"
              className="border border-rule bg-white/72"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="border border-rule bg-white/72 px-5 py-5">
              <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
                Location
              </p>
              <p className="mt-3 text-sm leading-7 text-smoke">
                {project.locationLabel ?? "Location not captured yet."}
              </p>
            </div>
            <div className="border border-rule bg-white/72 px-5 py-5">
              <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
                Goals
              </p>
              <p className="mt-3 text-sm leading-7 text-smoke">
                {project.goals ??
                  "No project goals captured yet. Add them in the next workflow steps."}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        {overviewCards.map((card) => (
          <OverviewCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
        <Card className="border-rule bg-white/88 shadow-[var(--shadow-md)]">
          <CardHeader className="flex-col items-start gap-3 border-b border-rule px-5 py-5">
            <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
              Next actions
            </p>
          </CardHeader>
          <CardBody className="space-y-3 px-5 py-5 text-sm leading-7 text-smoke">
            <p>
              {intakeCompleted
                ? "Intake is complete. The next useful move is generating or drafting the first scope structure."
                : "Finish intake before trying to draft scope, compare quotes, or export a project summary."}
            </p>
            <p>
              Keep this overview page as the control center for module state and
              route entry, not a bloated dashboard.
            </p>
          </CardBody>
        </Card>

        <Card className="border-rule bg-white/88 shadow-[var(--shadow-md)]">
          <CardHeader className="flex-col items-start gap-3 border-b border-rule px-5 py-5">
            <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
              Recent activity
            </p>
          </CardHeader>
          <CardBody className="space-y-3 px-5 py-5">
            {activity.length === 0 ? (
              <p className="text-sm leading-7 text-smoke">
                No project activity has been recorded yet.
              </p>
            ) : (
              activity.slice(0, 6).map((entry) => (
                <div
                  key={entry.id}
                  className="border border-rule bg-white/60 px-4 py-4"
                >
                  <p className="text-sm font-medium text-void">
                    {entry.summary}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-smoke">
                    {entry.actor?.name ?? "Unknown actor"} ·{" "}
                    {entry.createdAt.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </section>
    </PageContainer>
  );
}
