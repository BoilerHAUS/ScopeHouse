"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteChangeOrderAction } from "@/features/change-orders/actions/delete-change-order";
import { saveChangeOrderAction } from "@/features/change-orders/actions/save-change-order";
import {
  CHANGE_ORDER_STATUS_OPTIONS,
  type ChangeOrderFormActionState,
} from "@/features/change-orders/schemas/change-order-form";
import type { listProjectChangeOrdersForUser } from "@/features/change-orders/queries/list-project-change-orders";
import type { getProjectBudgetForUser } from "@/features/budget/queries/get-project-budget";
import type { getProjectScheduleForUser } from "@/features/schedule/queries/get-project-schedule";
import type { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";

type ChangeOrder = NonNullable<
  Awaited<ReturnType<typeof listProjectChangeOrdersForUser>>
>[number];

type ScopeTree = Awaited<ReturnType<typeof getProjectScopeForUser>>;
type BudgetCategories = NonNullable<
  Awaited<ReturnType<typeof getProjectBudgetForUser>>
>["categories"];
type SchedulePhases = NonNullable<
  Awaited<ReturnType<typeof getProjectScheduleForUser>>
>["phases"];

type ChangeOrderManagerProps = {
  projectId: string;
  changeOrders: ChangeOrder[];
  scopeTree: ScopeTree;
  budgetCategories: BudgetCategories;
  schedulePhases: SchedulePhases;
};

const initialState: ChangeOrderFormActionState = {};

function ChangeOrderForm({
  projectId,
  changeOrder,
  scopeTree,
  budgetCategories,
  schedulePhases,
}: {
  projectId: string;
  changeOrder?: ChangeOrder;
  scopeTree: ScopeTree;
  budgetCategories: BudgetCategories;
  schedulePhases: SchedulePhases;
}) {
  const [state, formAction, pending] = useActionState(
    saveChangeOrderAction.bind(null, projectId),
    initialState,
  );

  const hasScopeItems = scopeTree.length > 0;
  const hasBudgetLines = budgetCategories.some((c) => c.lines.length > 0);
  const hasMilestones = schedulePhases.some((p) => p.milestones.length > 0);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="changeOrderId" value={changeOrder?.id ?? ""} />

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Title</span>
          <input
            type="text"
            name="title"
            defaultValue={changeOrder?.title ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Add beverage fridge allowance"
            required
          />
          {state.fieldErrors?.title ? (
            <p className="text-destructive text-sm">{state.fieldErrors.title}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select
            name="status"
            defaultValue={changeOrder?.status ?? "proposed"}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          >
            {CHANGE_ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Description</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={changeOrder?.description ?? ""}
          className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
          placeholder="Describe the requested change and what is being added, removed, or revised."
        />
        {state.fieldErrors?.description ? (
          <p className="text-destructive text-sm">{state.fieldErrors.description}</p>
        ) : null}
      </label>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Change date</span>
          <input
            type="date"
            name="requestedAt"
            defaultValue={
              changeOrder ? changeOrder.requestedAt.toISOString().slice(0, 10) : ""
            }
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            required
          />
          {state.fieldErrors?.requestedAt ? (
            <p className="text-destructive text-sm">{state.fieldErrors.requestedAt}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Impact summary</span>
          <textarea
            name="impactSummary"
            rows={3}
            defaultValue={changeOrder?.impactSummary ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
            placeholder="Explain the scope, budget, or timing impact in plain language."
          />
          {state.fieldErrors?.impactSummary ? (
            <p className="text-destructive text-sm">{state.fieldErrors.impactSummary}</p>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Budget reference</span>
          <input
            type="text"
            name="budgetReference"
            defaultValue={changeOrder?.budgetReference ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Cabinetry allowance +$3,200"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Schedule reference</span>
          <input
            type="text"
            name="scheduleReference"
            defaultValue={changeOrder?.scheduleReference ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Adds one week to procurement"
          />
        </label>
      </div>

      {hasScopeItems || hasBudgetLines || hasMilestones ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {hasScopeItems ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium">Linked scope item</span>
              <select
                name="scopeItemId"
                defaultValue={changeOrder?.scopeItemId ?? ""}
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
              >
                <option value="">— None —</option>
                {scopeTree.map((phase) =>
                  phase.areas.map((area) =>
                    area.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {phase.phaseName} / {area.areaName} / {item.label}
                      </option>
                    )),
                  ),
                )}
              </select>
            </label>
          ) : null}

          {hasBudgetLines ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium">Linked budget line</span>
              <select
                name="budgetLineId"
                defaultValue={changeOrder?.budgetLineId ?? ""}
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
              >
                <option value="">— None —</option>
                {budgetCategories.map((category) =>
                  category.lines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {category.label} / {line.label}
                    </option>
                  )),
                )}
              </select>
            </label>
          ) : null}

          {hasMilestones ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium">Linked milestone</span>
              <select
                name="scheduleMilestoneId"
                defaultValue={changeOrder?.scheduleMilestoneId ?? ""}
                className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
              >
                <option value="">— None —</option>
                {schedulePhases.map((phase) =>
                  phase.milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                      {phase.name} / {milestone.label}
                    </option>
                  )),
                )}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={changeOrder?.notes ?? ""}
          className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
          placeholder="Optional context, approvals, or follow-up details."
        />
      </label>

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
            : changeOrder
              ? "Save change order"
              : "Create change order"}
        </Button>
        {changeOrder ? (
          <Button
            type="submit"
            formAction={deleteChangeOrderAction.bind(null, projectId)}
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

function LinkedRecordsBadges({ changeOrder }: { changeOrder: ChangeOrder }) {
  const links = [
    changeOrder.scopeItem
      ? `Scope: ${changeOrder.scopeItem.phaseName} / ${changeOrder.scopeItem.areaName} / ${changeOrder.scopeItem.label}`
      : null,
    changeOrder.budgetLine
      ? `Budget: ${changeOrder.budgetLine.category.label} / ${changeOrder.budgetLine.label}`
      : null,
    changeOrder.scheduleMilestone
      ? `Milestone: ${changeOrder.scheduleMilestone.phase.name} / ${changeOrder.scheduleMilestone.label}`
      : null,
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {links.map((link) => (
        <span
          key={link}
          className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs text-stone-600"
        >
          {link}
        </span>
      ))}
    </div>
  );
}

export function ChangeOrderManager({
  projectId,
  changeOrders,
  scopeTree,
  budgetCategories,
  schedulePhases,
}: ChangeOrderManagerProps) {
  return (
    <div className="space-y-6">
      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          Change orders
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Change tracking
        </h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
          Record requested project changes with clear impact notes so budget and
          schedule drift stay visible without turning this into contract admin.
        </p>
        <div className="mt-8">
          <ChangeOrderForm
            projectId={projectId}
            scopeTree={scopeTree}
            budgetCategories={budgetCategories}
            schedulePhases={schedulePhases}
          />
        </div>
      </section>

      {changeOrders.length === 0 ? (
        <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
          <h3 className="text-xl font-semibold">No change orders logged yet</h3>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
            Add changes as soon as they affect scope, allowances, timing, or
            owner approvals.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {changeOrders.map((changeOrder) => (
            <div
              key={changeOrder.id}
              className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]"
            >
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="bg-accent-soft rounded-full px-3 py-1 text-xs font-medium capitalize">
                  {changeOrder.status.replaceAll("_", " ")}
                </span>
                <span className="text-muted text-xs">
                  {changeOrder.requestedAt.toLocaleDateString()}
                </span>
              </div>
              <LinkedRecordsBadges changeOrder={changeOrder} />
              <ChangeOrderForm
                projectId={projectId}
                changeOrder={changeOrder}
                scopeTree={scopeTree}
                budgetCategories={budgetCategories}
                schedulePhases={schedulePhases}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
