import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { ProjectProgressSummaryPanel } from "@/features/ai/components/project-progress-summary-panel";
import { PrintProjectSummaryButton } from "@/features/export/components/print-project-summary-button";
import type { getProjectExportSummaryForUser } from "@/features/export/queries/get-project-export-summary";

type ProjectExportSummary = NonNullable<
  Awaited<ReturnType<typeof getProjectExportSummaryForUser>>
>;

type ProjectSummaryExportViewProps = {
  projectId: string;
  summary: ProjectExportSummary;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function ExportSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="break-inside-avoid rounded-[1.75rem] border border-stone-200 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(28,25,23,0.06)] print:rounded-none print:border-stone-300 print:shadow-none">
      <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-900">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
      {children}
    </p>
  );
}

export function ProjectSummaryExportView({
  projectId,
  summary,
}: ProjectSummaryExportViewProps) {
  const { project, intake, scope, decisions, changeOrders, aiSummary, readiness } =
    summary;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#f8f5ef_0%,#fffdf8_58%,#f2eee4_100%)] px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)] print:rounded-none print:border-stone-300 print:bg-white print:shadow-none">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-stone-500">
              Project Summary
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-stone-950">
              {project.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700">
              Shareable project record for review, print, and PDF download.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 print:hidden">
            <PrintProjectSummaryButton />
            <Button asChild className="rounded-full px-5">
              <Link href={`/projects/${projectId}/export/pdf` as Route}>
                Download PDF
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Project status",
              value: formatLabel(project.status),
            },
            {
              label: "Renovation type",
              value: formatLabel(intake.renovationType),
            },
            {
              label: "Scope items",
              value: String(scope.itemCount),
            },
            {
              label: "Decisions logged",
              value: String(decisions.length),
            },
            {
              label: "Changes logged",
              value: String(changeOrders.length),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[1.4rem] border border-stone-200 bg-white/85 px-4 py-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-semibold capitalize text-stone-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ProjectProgressSummaryPanel projectId={projectId} latestSummary={aiSummary} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="space-y-6">
          <ExportSection title="Project details">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Location
                </p>
                <p className="mt-2 text-sm leading-7 text-stone-800">
                  {project.locationLabel ?? "Location not captured yet."}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Last updated
                </p>
                <p className="mt-2 text-sm leading-7 text-stone-800">
                  {project.updatedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                Project goals
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-800">
                {project.goals ?? "Goals have not been captured yet."}
              </p>
            </div>
          </ExportSection>

          <ExportSection title="Intake summary">
            {readiness.intakeReady ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      Rooms and areas
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {intake.rooms.map((room) => (
                        <span
                          key={room}
                          className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                        >
                          {room}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      Budget and timing
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-800">
                      {intake.budgetRange ?? "Budget range not set"} ·{" "}
                      {intake.timingExpectation ?? "Timing not set"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                    Priorities
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-stone-800">
                    {intake.priorities.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                    Constraints and notes
                  </p>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-stone-800">
                    {intake.constraints.map((item) => (
                      <p key={item}>• {item}</p>
                    ))}
                    {intake.notes ? <p>{intake.notes}</p> : null}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState>
                Intake is not complete yet. This export can still be printed, but
                the summary is incomplete until the intake workflow is finished.
              </EmptyState>
            )}
          </ExportSection>

          <ExportSection title="Scope summary">
            {readiness.scopeReady ? (
              <div className="space-y-5">
                {scope.groups.map((phase) => (
                  <div key={`${phase.phaseOrder}-${phase.phaseName}`}>
                    <h3 className="text-base font-semibold text-stone-900">
                      {phase.phaseName}
                    </h3>
                    <div className="mt-3 space-y-4">
                      {phase.areas.map((area) => (
                        <div key={`${area.areaOrder}-${area.areaName}`}>
                          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                            {area.areaName}
                          </p>
                          <ul className="mt-2 space-y-2 text-sm leading-7 text-stone-800">
                            {area.items.map((item) => (
                              <li key={item.id}>
                                • {item.label}
                                {item.notes ? ` — ${item.notes}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>
                No applied scope baseline exists yet. Generate and confirm a scope
                draft or add manual items before using this export as a planning
                record.
              </EmptyState>
            )}
          </ExportSection>

          <ExportSection title="Decision log">
            {decisions.length > 0 ? (
              <div className="space-y-4">
                {decisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="rounded-[1.25rem] border border-stone-200 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs capitalize text-stone-700">
                        {formatLabel(decision.status)}
                      </span>
                      <span className="text-xs text-stone-500">
                        {decision.recordedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-stone-900">
                      {decision.summary}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-700">
                      Owner: {decision.owner}
                    </p>
                    {decision.notes ? (
                      <p className="mt-2 text-sm leading-7 text-stone-700">
                        {decision.notes}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>
                No decisions have been logged yet.
              </EmptyState>
            )}
          </ExportSection>

          <ExportSection title="Change orders">
            {changeOrders.length > 0 ? (
              <div className="space-y-4">
                {changeOrders.map((changeOrder) => (
                  <div
                    key={changeOrder.id}
                    className="rounded-[1.25rem] border border-stone-200 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs capitalize text-stone-700">
                        {formatLabel(changeOrder.status)}
                      </span>
                      <span className="text-xs text-stone-500">
                        {changeOrder.requestedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-stone-900">
                      {changeOrder.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-700">
                      {changeOrder.description}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-stone-700">
                      Impact: {changeOrder.impactSummary}
                    </p>
                    {changeOrder.budgetReference ? (
                      <p className="mt-2 text-sm leading-7 text-stone-700">
                        Budget reference: {changeOrder.budgetReference}
                      </p>
                    ) : null}
                    {changeOrder.scheduleReference ? (
                      <p className="mt-2 text-sm leading-7 text-stone-700">
                        Schedule reference: {changeOrder.scheduleReference}
                      </p>
                    ) : null}
                    {changeOrder.notes ? (
                      <p className="mt-2 text-sm leading-7 text-stone-700">
                        {changeOrder.notes}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>
                No change orders have been logged yet.
              </EmptyState>
            )}
          </ExportSection>
        </div>

        <div className="space-y-6">
          <ExportSection title="Readiness">
            <div className="space-y-3 text-sm leading-7 text-stone-800">
              <p>
                Intake: {readiness.intakeReady ? "ready" : "incomplete"}
              </p>
              <p>Scope baseline: {readiness.scopeReady ? "ready" : "missing"}</p>
              <p>
                Decision log: {readiness.decisionsReady ? "started" : "not started"}
              </p>
              <p>
                Change log:{" "}
                {readiness.changeOrdersReady ? "started" : "not started"}
              </p>
            </div>
          </ExportSection>

          <ExportSection title="Export notes">
            <div className="space-y-3 text-sm leading-7 text-stone-700">
              <p>
                This summary favors confirmed project state and visible gaps over
                filler.
              </p>
              <p>
                Missing sections stay explicit so the PDF remains credible to
                share.
              </p>
            </div>
          </ExportSection>
        </div>
      </div>
    </div>
  );
}
