"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteChangeOrderAction } from "@/features/change-orders/actions/delete-change-order";
import { saveChangeOrderAction } from "@/features/change-orders/actions/save-change-order";
import {
  CHANGE_ORDER_STATUS_OPTIONS,
  type ChangeOrderFormActionState,
} from "@/features/change-orders/schemas/change-order-form";

const initialState: ChangeOrderFormActionState = {};

type ChangeOrderManagerProps = {
  projectId: string;
  changeOrders: Array<{
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: string;
    requestedAt: Date;
    impactSummary: string;
    budgetReference: string | null;
    scheduleReference: string | null;
    notes: string | null;
  }>;
};

function ChangeOrderForm({
  projectId,
  changeOrder,
}: {
  projectId: string;
  changeOrder?: ChangeOrderManagerProps["changeOrders"][number];
}) {
  const [state, formAction, pending] = useActionState(
    saveChangeOrderAction.bind(null, projectId),
    initialState,
  );

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

export function ChangeOrderManager({
  projectId,
  changeOrders,
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
          <ChangeOrderForm projectId={projectId} />
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
              <ChangeOrderForm projectId={projectId} changeOrder={changeOrder} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
