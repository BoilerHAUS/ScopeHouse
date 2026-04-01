"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { saveScopeItemAction } from "@/features/scope/actions/save-scope-item";
import {
  SCOPE_ITEM_STATUS_OPTIONS,
  type ScopeItemFormActionState,
} from "@/features/scope/schemas/scope-item-form";

const initialState: ScopeItemFormActionState = {};

type CreateScopeItemFormProps = {
  projectId: string;
};

export function CreateScopeItemForm({ projectId }: CreateScopeItemFormProps) {
  const [state, formAction, pending] = useActionState(
    saveScopeItemAction.bind(null, projectId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Phase</span>
          <input
            type="text"
            name="phaseName"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Demolition and prep"
            required
          />
          {state.fieldErrors?.phaseName ? (
            <p className="text-destructive text-sm">{state.fieldErrors.phaseName}</p>
          ) : null}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Area</span>
          <input
            type="text"
            name="areaName"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Kitchen"
            required
          />
          {state.fieldErrors?.areaName ? (
            <p className="text-destructive text-sm">{state.fieldErrors.areaName}</p>
          ) : null}
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Work item</span>
        <input
          type="text"
          name="label"
          className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          placeholder="Remove existing cabinets and protect adjacent flooring"
          required
        />
        {state.fieldErrors?.label ? (
          <p className="text-destructive text-sm">{state.fieldErrors.label}</p>
        ) : null}
      </label>

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select
            name="status"
            defaultValue="draft"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          >
            {SCOPE_ITEM_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.status ? (
            <p className="text-destructive text-sm">{state.fieldErrors.status}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            name="notes"
            rows={3}
            className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
            placeholder="Optional context, exclusions, or assumptions."
          />
          {state.fieldErrors?.notes ? (
            <p className="text-destructive text-sm">{state.fieldErrors.notes}</p>
          ) : null}
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

      <Button type="submit" className="rounded-full px-5" disabled={pending}>
        {pending ? "Adding item..." : "Add scope item"}
      </Button>
    </form>
  );
}
