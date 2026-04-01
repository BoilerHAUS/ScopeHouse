"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createProjectAction } from "@/features/projects/actions/create-project";
import {
  PROJECT_TYPE_OPTIONS,
  type CreateProjectActionState,
} from "@/features/projects/schemas/create-project";

const initialState: CreateProjectActionState = {};

export function CreateProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProjectAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block space-y-2 lg:col-span-2">
          <span className="text-sm font-medium">Project title</span>
          <input
            type="text"
            name="title"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Main floor kitchen renovation"
            required
          />
          {state.fieldErrors?.title ? (
            <p className="text-destructive text-sm">{state.fieldErrors.title}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Project type</span>
          <select
            name="projectType"
            defaultValue=""
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            required
          >
            <option value="" disabled>
              Select renovation type
            </option>
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.projectType ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.projectType}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Location label</span>
          <input
            type="text"
            name="locationLabel"
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Toronto, ON"
          />
          {state.fieldErrors?.locationLabel ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.locationLabel}
            </p>
          ) : null}
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Project goals</span>
        <textarea
          name="goals"
          rows={5}
          className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
          placeholder="Summarize what success looks like, what needs to change, and any early priorities."
        />
        {state.fieldErrors?.goals ? (
          <p className="text-destructive text-sm">{state.fieldErrors.goals}</p>
        ) : null}
      </label>

      {state.error ? (
        <p className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="rounded-full px-5" disabled={pending}>
          {pending ? "Creating project..." : "Create project"}
        </Button>
        <p className="text-muted text-sm leading-7">
          This creates the project shell first. Guided intake comes next.
        </p>
      </div>
    </form>
  );
}
