"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteScopeItemAction } from "@/features/scope/actions/delete-scope-item";
import { moveScopeItemAction } from "@/features/scope/actions/move-scope-item";
import { saveScopeItemAction } from "@/features/scope/actions/save-scope-item";
import {
  SCOPE_ITEM_STATUS_OPTIONS,
  type ScopeItemFormActionState,
} from "@/features/scope/schemas/scope-item-form";
import type { ProjectScopeItem } from "@/types/scope";

const initialState: ScopeItemFormActionState = {};

type ScopeItemEditorRowProps = {
  projectId: string;
  item: ProjectScopeItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function ScopeItemEditorRow({
  projectId,
  item,
  canMoveUp,
  canMoveDown,
}: ScopeItemEditorRowProps) {
  const [state, formAction, pending] = useActionState(
    saveScopeItemAction.bind(null, projectId),
    initialState,
  );

  return (
    <div className="border-border bg-surface-strong/45 rounded-[1.25rem] border px-4 py-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="itemId" value={item.id} />
        <div className="grid gap-3 xl:grid-cols-[1fr_1fr_1.4fr_220px]">
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Phase
            </span>
            <input
              type="text"
              name="phaseName"
              defaultValue={item.phaseName}
              className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Area
            </span>
            <input
              type="text"
              name="areaName"
              defaultValue={item.areaName}
              className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Work item
            </span>
            <input
              type="text"
              name="label"
              defaultValue={item.label}
              className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              Status
            </span>
            <select
              name="status"
              defaultValue={item.status}
              className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            >
              {SCOPE_ITEM_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Notes
          </span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={item.notes ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
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
            {pending ? "Saving..." : "Save item"}
          </Button>

          <Button
            type="submit"
            formAction={moveScopeItemAction.bind(null, projectId)}
            name="direction"
            value="up"
            variant="outline"
            className="rounded-full px-4"
            disabled={!canMoveUp}
          >
            Move up
          </Button>

          <Button
            type="submit"
            formAction={moveScopeItemAction.bind(null, projectId)}
            name="direction"
            value="down"
            variant="outline"
            className="rounded-full px-4"
            disabled={!canMoveDown}
          >
            Move down
          </Button>

          <Button
            type="submit"
            formAction={deleteScopeItemAction.bind(null, projectId)}
            variant="outline"
            className="rounded-full px-4"
          >
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}
