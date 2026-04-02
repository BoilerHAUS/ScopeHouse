"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { applyScopeDraftAction } from "@/features/scope/actions/apply-scope-draft";
import { generateScopeDraftAction } from "@/features/scope/actions/generate-scope-draft";
import type { ScopeActionState } from "@/features/scope/actions/scope-action-state";
import { CreateScopeItemForm } from "@/features/scope/components/create-scope-item-form";
import { ScopeItemEditorRow } from "@/features/scope/components/scope-item-editor-row";
import type { ProjectScopeDraft, ProjectScopeGroup } from "@/types/scope";

type ScopeWorkbenchProps = {
  projectId: string;
  intakeCompleted: boolean;
  appliedScope: ProjectScopeGroup[];
  latestDraft: ProjectScopeDraft | null;
};

const initialState: ScopeActionState = {};

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function ScopeWorkbench({
  projectId,
  intakeCompleted,
  appliedScope,
  latestDraft,
}: ScopeWorkbenchProps) {
  const [generateState, generateAction, generatePending] = useActionState(
    generateScopeDraftAction.bind(null, projectId),
    initialState,
  );
  const [applyState, applyAction, applyPending] = useActionState(
    applyScopeDraftAction.bind(null, projectId),
    initialState,
  );

  return (
    <div className="space-y-6">
      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
              Scope
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              Scope builder and AI draft review
            </h2>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
              Generate a first-pass scope from completed intake, review the
              draft by phase and area, then explicitly apply it to the project
              baseline.
            </p>
            <div className="mt-5">
              <Button asChild variant="outline" className="rounded-full px-4">
                <a href={`/projects/${projectId}/scope/csv`} download>
                  Download scope CSV
                </a>
              </Button>
            </div>
          </div>

          <form action={generateAction}>
            <Button
              type="submit"
              className="rounded-full px-5"
              disabled={!intakeCompleted || generatePending}
            >
              {generatePending ? "Generating draft..." : "Generate AI draft"}
            </Button>
          </form>
        </div>

        {!intakeCompleted ? (
          <p className="bg-accent-soft text-foreground mt-6 rounded-[1.5rem] px-4 py-4 text-sm leading-7">
            Complete guided intake before generating a scope draft. The draft
            quality depends on rooms, priorities, timing, and constraints being
            captured first.
          </p>
        ) : null}

        {generateState.error ? (
          <p className="bg-destructive/10 text-destructive mt-6 rounded-[1.5rem] px-4 py-4 text-sm">
            {generateState.error}
          </p>
        ) : null}
      </section>

      {latestDraft ? (
        <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
                Draft review
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Latest AI scope draft
              </h3>
              <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
                {latestDraft.projectSummary}
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-muted text-xs uppercase tracking-[0.2em]">
                {formatStatusLabel(latestDraft.status)}
              </p>
              {latestDraft.status === "pending_review" ? (
                <form action={applyAction}>
                  <input type="hidden" name="draftId" value={latestDraft.id} />
                  <Button
                    type="submit"
                    className="rounded-full px-5"
                    disabled={applyPending}
                  >
                    {applyPending ? "Applying draft..." : "Apply reviewed draft"}
                  </Button>
                </form>
              ) : (
                <p className="text-muted text-sm leading-7">
                  This draft has already been applied to the project scope.
                </p>
              )}
            </div>
          </div>

          {applyState.error ? (
            <p className="bg-destructive/10 text-destructive mt-6 rounded-[1.5rem] px-4 py-4 text-sm">
              {applyState.error}
            </p>
          ) : null}

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_320px]">
            <div className="space-y-4">
              {latestDraft.phases.map((phase) => (
                <div
                  key={phase.name}
                  className="border-border rounded-[1.5rem] border px-5 py-5"
                >
                  <h4 className="text-lg font-semibold">{phase.name}</h4>
                  <div className="mt-4 space-y-4">
                    {phase.areas.map((area) => (
                      <div key={`${phase.name}-${area.name}`} className="space-y-3">
                        <p className="text-muted text-xs uppercase tracking-[0.2em]">
                          {area.name}
                        </p>
                        <div className="space-y-2">
                          {area.items.map((item) => (
                            <div
                              key={`${phase.name}-${area.name}-${item.label}`}
                              className="bg-surface-strong/45 rounded-[1.25rem] px-4 py-4"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium">{item.label}</p>
                                <span className="text-muted rounded-full bg-background px-2 py-1 text-[11px] uppercase">
                                  {formatStatusLabel(item.status)}
                                </span>
                              </div>
                              {item.notes ? (
                                <p className="text-muted mt-2 text-sm leading-6">
                                  {item.notes}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="border-border rounded-[1.5rem] border px-5 py-5">
                <p className="text-muted text-xs uppercase tracking-[0.2em]">
                  Assumptions
                </p>
                <div className="mt-3 space-y-2">
                  {latestDraft.assumptions.length > 0 ? (
                    latestDraft.assumptions.map((item) => (
                      <p
                        key={item}
                        className="bg-surface-strong/45 rounded-[1.15rem] px-3 py-3 text-sm leading-6"
                      >
                        {item}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted text-sm leading-7">
                      No assumptions were returned.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-border rounded-[1.5rem] border px-5 py-5">
                <p className="text-muted text-xs uppercase tracking-[0.2em]">
                  Risks
                </p>
                <div className="mt-3 space-y-2">
                  {latestDraft.risks.length > 0 ? (
                    latestDraft.risks.map((item) => (
                      <p
                        key={item}
                        className="bg-surface-strong/45 rounded-[1.15rem] px-3 py-3 text-sm leading-6"
                      >
                        {item}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted text-sm leading-7">
                      No risk notes were returned.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
          <h3 className="text-xl font-semibold">No scope draft yet</h3>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
            Generate the first draft after intake is complete. The draft is
            stored for review first and does not overwrite the project scope
            until you apply it.
          </p>
        </section>
      )}

      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <h3 className="text-xl font-semibold">Manual scope editor</h3>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
          Add items manually, refine AI-applied work items, and reorder items
          inside each area without leaving the scope route.
        </p>
        <div className="mt-8">
          <CreateScopeItemForm projectId={projectId} />
        </div>
      </section>

      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <h3 className="text-xl font-semibold">Applied project scope</h3>
        {appliedScope.length === 0 ? (
          <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
            No scope baseline exists yet. Generate a draft or add manual items
            above to create the first structured scope.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            {appliedScope.map((phase) => (
              <div
                key={`${phase.phaseOrder}-${phase.phaseName}`}
                className="border-border rounded-[1.5rem] border px-5 py-5"
              >
                <h4 className="text-lg font-semibold">{phase.phaseName}</h4>
                <div className="mt-4 space-y-4">
                  {phase.areas.map((area) => (
                    <div key={`${area.areaOrder}-${area.areaName}`} className="space-y-3">
                      <p className="text-muted text-xs uppercase tracking-[0.2em]">
                        {area.areaName}
                      </p>
                      <div className="space-y-2">
                        {area.items.map((item, index) => (
                          <ScopeItemEditorRow
                            key={item.id}
                            projectId={projectId}
                            item={item}
                            canMoveUp={index > 0}
                            canMoveDown={index < area.items.length - 1}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
