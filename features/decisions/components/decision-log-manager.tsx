"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteDecisionAction } from "@/features/decisions/actions/delete-decision";
import { saveDecisionAction } from "@/features/decisions/actions/save-decision";
import {
  DECISION_STATUS_OPTIONS,
  type DecisionFormActionState,
} from "@/features/decisions/schemas/decision-form";

const initialState: DecisionFormActionState = {};

type DecisionLogManagerProps = {
  projectId: string;
  decisions: Array<{
    id: string;
    projectId: string;
    summary: string;
    owner: string;
    status: string;
    recordedAt: Date;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

function DecisionForm({
  projectId,
  decision,
}: {
  projectId: string;
  decision?: DecisionLogManagerProps["decisions"][number];
}) {
  const [state, formAction, pending] = useActionState(
    saveDecisionAction.bind(null, projectId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="decisionId" value={decision?.id ?? ""} />
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Summary</span>
          <input
            type="text"
            name="summary"
            defaultValue={decision?.summary ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Select final appliance package"
            required
          />
          {state.fieldErrors?.summary ? (
            <p className="text-destructive text-sm">{state.fieldErrors.summary}</p>
          ) : null}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Owner</span>
          <input
            type="text"
            name="owner"
            defaultValue={decision?.owner ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Homeowner"
            required
          />
          {state.fieldErrors?.owner ? (
            <p className="text-destructive text-sm">{state.fieldErrors.owner}</p>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_220px_minmax(0,1fr)]">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select
            name="status"
            defaultValue={decision?.status ?? "open"}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          >
            {DECISION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Decision date</span>
          <input
            type="date"
            name="recordedAt"
            defaultValue={
              decision ? decision.recordedAt.toISOString().slice(0, 10) : ""
            }
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            required
          />
          {state.fieldErrors?.recordedAt ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.recordedAt}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={decision?.notes ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
            placeholder="Optional context, rationale, or follow-up."
          />
        </label>
      </div>

      {state.error ? (
        <p className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="rounded-full px-4" disabled={pending}>
          {pending
            ? "Saving..."
            : decision
              ? "Save decision"
              : "Create decision"}
        </Button>
        {decision ? (
          <Button
            type="submit"
            formAction={deleteDecisionAction.bind(null, projectId)}
            variant="outline"
            className="rounded-full px-4"
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function DecisionLogManager({
  projectId,
  decisions,
}: DecisionLogManagerProps) {
  return (
    <div className="space-y-6">
      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          Decisions
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Decision log
        </h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
          Record what was approved, rejected, or deferred, who owns the follow-up,
          and when the call was made.
        </p>
        <div className="mt-8">
          <DecisionForm projectId={projectId} />
        </div>
      </section>

      {decisions.length === 0 ? (
        <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
          <h3 className="text-xl font-semibold">No decisions logged yet</h3>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
            Start the log as soon as approvals or open choices begin to affect
            scope, budget, or timing.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {decisions.map((decision) => (
            <div
              key={decision.id}
              className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]"
            >
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="bg-accent-soft rounded-full px-3 py-1 text-xs font-medium capitalize">
                  {decision.status.replaceAll("_", " ")}
                </span>
                <span className="text-muted text-xs">
                  {decision.recordedAt.toLocaleDateString()}
                </span>
              </div>
              <DecisionForm projectId={projectId} decision={decision} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
