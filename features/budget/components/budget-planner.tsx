"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteBudgetCategoryAction } from "@/features/budget/actions/delete-budget-category";
import { deleteBudgetLineAction } from "@/features/budget/actions/delete-budget-line";
import { saveBudgetCategoryAction } from "@/features/budget/actions/save-budget-category";
import { saveBudgetLineAction } from "@/features/budget/actions/save-budget-line";
import {
  formatCurrencyFromCents,
} from "@/features/budget/services/budget-calculations";
import type { getProjectBudgetForUser } from "@/features/budget/queries/get-project-budget";
import type { BudgetCategoryActionState } from "@/features/budget/schemas/budget-category-form";
import type { BudgetLineActionState } from "@/features/budget/schemas/budget-line-form";
import type { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";

type ProjectBudgetData = NonNullable<
  Awaited<ReturnType<typeof getProjectBudgetForUser>>
>;

type ScopeTree = Awaited<ReturnType<typeof getProjectScopeForUser>>;

const initialCategoryState: BudgetCategoryActionState = {};
const initialLineState: BudgetLineActionState = {};

function MoneyCell({ cents }: { cents: number }) {
  return <span>{formatCurrencyFromCents(cents)}</span>;
}

function AmountInput({
  name,
  defaultValue,
  label,
}: {
  name: string;
  defaultValue?: number | null;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue != null ? String(defaultValue / 100) : ""}
        className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
        placeholder="0"
      />
    </label>
  );
}

function CategoryForm({
  projectId,
  category,
}: {
  projectId: string;
  category?: ProjectBudgetData["categories"][number];
}) {
  const [state, formAction, pending] = useActionState(
    saveBudgetCategoryAction.bind(null, projectId),
    initialCategoryState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="categoryId" value={category?.id ?? ""} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Category name</span>
          <input
            type="text"
            name="label"
            defaultValue={category?.label ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Cabinetry and millwork"
            required
          />
          {state.fieldErrors?.label ? (
            <p className="text-destructive text-sm">{state.fieldErrors.label}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select
            name="status"
            defaultValue={category?.status ?? "active"}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={category?.notes ?? ""}
          className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
          placeholder="Optional planning context for this category."
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

      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="rounded-full px-4" disabled={pending}>
          {pending
            ? "Saving..."
            : category
              ? "Save category"
              : "Create category"}
        </Button>
        {category ? (
          <Button
            type="submit"
            formAction={deleteBudgetCategoryAction.bind(null, projectId)}
            variant="outline"
            className="rounded-full px-4"
          >
            Delete category
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function BudgetLineForm({
  projectId,
  categoryId,
  scopeTree,
  line,
}: {
  projectId: string;
  categoryId: string;
  scopeTree: ScopeTree;
  line?: ProjectBudgetData["categories"][number]["lines"][number];
}) {
  const [state, formAction, pending] = useActionState(
    saveBudgetLineAction.bind(null, projectId),
    initialLineState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-[1.25rem] border border-stone-200 bg-stone-50/60 px-4 py-4">
      <input type="hidden" name="lineId" value={line?.id ?? ""} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <label className="block space-y-2">
        <span className="text-sm font-medium">Line item</span>
        <input
          type="text"
          name="label"
          defaultValue={line?.label ?? ""}
          className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          placeholder="Lower cabinet package"
          required
        />
      </label>

      {scopeTree.length > 0 ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium">Linked scope item</span>
          <select
            name="scopeItemId"
            defaultValue={line?.scopeItemId ?? ""}
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
          {state.fieldErrors?.scopeItemId ? (
            <p className="text-destructive text-sm">{state.fieldErrors.scopeItemId}</p>
          ) : null}
        </label>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AmountInput name="estimate" label="Estimate" defaultValue={line?.estimateCents} />
        <AmountInput name="allowance" label="Allowance" defaultValue={line?.allowanceCents} />
        <AmountInput name="quoted" label="Quoted" defaultValue={line?.quotedCents} />
        <AmountInput name="actual" label="Actual" defaultValue={line?.actualCents} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Source reference</span>
          <input
            type="text"
            name="sourceReference"
            defaultValue={line?.sourceReference ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Cabinet quote rev A"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={line?.notes ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
            placeholder="Optional budget context or allowance assumptions."
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

      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="rounded-full px-4" disabled={pending}>
          {pending ? "Saving..." : line ? "Save line" : "Add line"}
        </Button>
        {line ? (
          <Button
            type="submit"
            formAction={deleteBudgetLineAction.bind(null, projectId)}
            variant="outline"
            className="rounded-full px-4"
          >
            Delete line
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function BudgetPlanner({
  projectId,
  budget,
  scopeTree,
}: {
  projectId: string;
  budget: ProjectBudgetData;
  scopeTree: ScopeTree;
}) {
  return (
    <div className="space-y-6">
      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          Budget
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Budget planner
        </h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
          Use categories and planning-first line items to build a first-pass
          budget without turning the app into accounting software.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Estimate total", budget.totals.estimateCents],
            ["Allowance total", budget.totals.allowanceCents],
            ["Quoted total", budget.totals.quotedCents],
            ["Actual total", budget.totals.actualCents],
            ["Planning total", budget.totals.planningCents],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-[1.35rem] border border-stone-200 bg-stone-50 px-4 py-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                {label}
              </p>
              <p className="mt-2 text-lg font-semibold">
                <MoneyCell cents={value as number} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <h3 className="text-xl font-semibold">Add budget category</h3>
        <div className="mt-6">
          <CategoryForm projectId={projectId} />
        </div>
      </section>

      {budget.categories.length === 0 ? (
        <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
          <h3 className="text-xl font-semibold">No budget categories yet</h3>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
            Start with broad categories like demolition, cabinetry, finishes, or
            appliances, then add line items under each one.
          </p>
        </section>
      ) : (
        <section className="space-y-6">
          {budget.categories.map((category) => (
            <div
              key={category.id}
              className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    Category totals
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{category.label}</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {[
                    category.totals.estimateCents,
                    category.totals.allowanceCents,
                    category.totals.quotedCents,
                    category.totals.actualCents,
                    category.totals.planningCents,
                  ].map((value, index) => (
                    <div
                      key={`${category.id}-${index}`}
                      className="rounded-[1.1rem] border border-stone-200 px-3 py-3 text-sm"
                    >
                      <MoneyCell cents={value} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <CategoryForm projectId={projectId} category={category} />
              </div>

              <div className="mt-8 space-y-4">
                {category.lines.map((line) => (
                  <div key={line.id} className="space-y-1">
                    {line.scopeItem ? (
                      <p className="text-muted px-1 text-xs">
                        Scope: {line.scopeItem.phaseName} / {line.scopeItem.areaName} / {line.scopeItem.label}
                      </p>
                    ) : null}
                    <BudgetLineForm
                      projectId={projectId}
                      categoryId={category.id}
                      scopeTree={scopeTree}
                      line={line}
                    />
                  </div>
                ))}
                <BudgetLineForm projectId={projectId} categoryId={category.id} scopeTree={scopeTree} />
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
