"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveProjectIntakeAction } from "@/features/intake/actions/save-project-intake";
import { PROJECT_TYPE_OPTIONS } from "@/features/projects/schemas/create-project";
import {
  BUDGET_RANGE_OPTIONS,
  CONTRACTOR_INVOLVEMENT_OPTIONS,
  type ProjectIntakeFormValues,
  type SaveProjectIntakeActionState,
} from "@/features/intake/schemas/project-intake";

type GuidedIntakeFormProps = {
  projectId: string;
  initialValues: ProjectIntakeFormValues;
  initialStep: number;
  isCompleted: boolean;
  lastSavedLabel: string | null;
};

const steps = [
  {
    title: "Project basics",
    description: "Confirm the renovation type, rooms, and the main project goals.",
  },
  {
    title: "Planning context",
    description: "Capture priorities, timing expectations, and budget range.",
  },
  {
    title: "Constraints and support",
    description: "Note practical blockers, contractor setup, and planning notes.",
  },
] as const;

function isStepComplete(values: ProjectIntakeFormValues, stepIndex: number) {
  if (stepIndex === 0) {
    return Boolean(
      values.renovationType &&
        values.roomsRaw.trim() &&
        values.goals.trim(),
    );
  }

  if (stepIndex === 1) {
    return Boolean(
      values.prioritiesRaw.trim() &&
        values.timingExpectation.trim() &&
        values.budgetRange,
    );
  }

  return Boolean(
    values.constraintsRaw.trim() && values.contractorInvolvement,
  );
}

export function GuidedIntakeForm({
  projectId,
  initialValues,
  initialStep,
  isCompleted,
  lastSavedLabel,
}: GuidedIntakeFormProps) {
  const action = saveProjectIntakeAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState<
    SaveProjectIntakeActionState,
    FormData
  >(action, {});
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [values, setValues] = useState(initialValues);

  const stepStates = steps.map((_, index) => isStepComplete(values, index));
  const canMoveNext = stepStates[currentStep];

  function updateValue<K extends keyof ProjectIntakeFormValues>(
    key: K,
    value: ProjectIntakeFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="border-border bg-surface rounded-[1.75rem] border px-4 py-4 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
          <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
            Intake progress
          </p>
          <div className="mt-4 space-y-3">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isDone = stepStates[index];

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-accent bg-accent-soft"
                      : "border-border bg-surface-strong/40 hover:bg-surface-strong/70"
                  }`}
                >
                  <p className="text-muted text-xs tracking-[0.18em] uppercase">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{step.title}</p>
                  <p className="text-muted mt-1 text-xs leading-5">
                    {isDone ? "Filled in" : "Still needs input"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-border bg-surface rounded-[1.75rem] border px-4 py-4 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
          <p className="text-muted text-sm leading-7">
            {isCompleted
              ? "This intake is marked complete, but you can still revise it."
              : "Save progress at any point and resume later."}
          </p>
          {lastSavedLabel ? (
            <p className="text-muted mt-3 text-xs">Last saved {lastSavedLabel}</p>
          ) : null}
          {state.success ? (
            <p className="mt-3 rounded-2xl bg-emerald-500/10 px-3 py-3 text-sm text-emerald-700">
              {state.success}
            </p>
          ) : null}
        </div>
      </aside>

      <form action={formAction} className="space-y-5">
        <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
          <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
            Step {currentStep + 1}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            {steps[currentStep].title}
          </h2>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
            {steps[currentStep].description}
          </p>

          <input type="hidden" name="renovationType" value={values.renovationType} />
          <input type="hidden" name="roomsRaw" value={values.roomsRaw} />
          <input type="hidden" name="goals" value={values.goals} />
          <input type="hidden" name="prioritiesRaw" value={values.prioritiesRaw} />
          <input
            type="hidden"
            name="timingExpectation"
            value={values.timingExpectation}
          />
          <input type="hidden" name="budgetRange" value={values.budgetRange} />
          <input type="hidden" name="constraintsRaw" value={values.constraintsRaw} />
          <input
            type="hidden"
            name="contractorInvolvement"
            value={values.contractorInvolvement}
          />
          <input type="hidden" name="notes" value={values.notes} />

          <div className="mt-8 space-y-5">
            {currentStep === 0 ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Renovation type</span>
                  <select
                    value={values.renovationType}
                    onChange={(event) =>
                      updateValue("renovationType", event.target.value)
                    }
                    className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                  >
                    <option value="">Select renovation type</option>
                    {PROJECT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {state.fieldErrors?.renovationType ? (
                    <p className="text-destructive text-sm">
                      {state.fieldErrors.renovationType}
                    </p>
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Rooms or areas</span>
                  <textarea
                    rows={5}
                    value={values.roomsRaw}
                    onChange={(event) => updateValue("roomsRaw", event.target.value)}
                    className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
                    placeholder={"Kitchen\nPantry\nMain floor mudroom"}
                  />
                  <p className="text-muted text-xs leading-6">
                    Use one line per room or area.
                  </p>
                  {state.fieldErrors?.roomsRaw ? (
                    <p className="text-destructive text-sm">
                      {state.fieldErrors.roomsRaw}
                    </p>
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Project goals</span>
                  <textarea
                    rows={5}
                    value={values.goals}
                    onChange={(event) => updateValue("goals", event.target.value)}
                    className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
                    placeholder="Describe what needs to change and what success looks like."
                  />
                  {state.fieldErrors?.goals ? (
                    <p className="text-destructive text-sm">
                      {state.fieldErrors.goals}
                    </p>
                  ) : null}
                </label>
              </>
            ) : null}

            {currentStep === 1 ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Top priorities</span>
                  <textarea
                    rows={5}
                    value={values.prioritiesRaw}
                    onChange={(event) =>
                      updateValue("prioritiesRaw", event.target.value)
                    }
                    className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
                    placeholder={"Better storage\nCleaner traffic flow\nDurable finishes"}
                  />
                  <p className="text-muted text-xs leading-6">
                    One line per priority keeps later scope drafting cleaner.
                  </p>
                  {state.fieldErrors?.prioritiesRaw ? (
                    <p className="text-destructive text-sm">
                      {state.fieldErrors.prioritiesRaw}
                    </p>
                  ) : null}
                </label>

                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Budget range</span>
                    <select
                      value={values.budgetRange}
                      onChange={(event) =>
                        updateValue("budgetRange", event.target.value)
                      }
                      className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                    >
                      <option value="">Select budget range</option>
                      {BUDGET_RANGE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {state.fieldErrors?.budgetRange ? (
                      <p className="text-destructive text-sm">
                        {state.fieldErrors.budgetRange}
                      </p>
                    ) : null}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Timing expectations</span>
                    <textarea
                      rows={4}
                      value={values.timingExpectation}
                      onChange={(event) =>
                        updateValue("timingExpectation", event.target.value)
                      }
                      className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
                      placeholder="Target season, hard deadlines, or timing assumptions."
                    />
                    {state.fieldErrors?.timingExpectation ? (
                      <p className="text-destructive text-sm">
                        {state.fieldErrors.timingExpectation}
                      </p>
                    ) : null}
                  </label>
                </div>
              </>
            ) : null}

            {currentStep === 2 ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Constraints or risks</span>
                  <textarea
                    rows={5}
                    value={values.constraintsRaw}
                    onChange={(event) =>
                      updateValue("constraintsRaw", event.target.value)
                    }
                    className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
                    placeholder={"Need to keep kitchen usable\nCondo noise rules\nLead times for custom millwork"}
                  />
                  <p className="text-muted text-xs leading-6">
                    Use one line per constraint, dependency, or risk.
                  </p>
                  {state.fieldErrors?.constraintsRaw ? (
                    <p className="text-destructive text-sm">
                      {state.fieldErrors.constraintsRaw}
                    </p>
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">
                    Contractor involvement
                  </span>
                  <select
                    value={values.contractorInvolvement}
                    onChange={(event) =>
                      updateValue("contractorInvolvement", event.target.value)
                    }
                    className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
                  >
                    <option value="">Select current setup</option>
                    {CONTRACTOR_INVOLVEMENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {state.fieldErrors?.contractorInvolvement ? (
                    <p className="text-destructive text-sm">
                      {state.fieldErrors.contractorInvolvement}
                    </p>
                  ) : null}
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium">Extra planning notes</span>
                  <textarea
                    rows={5}
                    value={values.notes}
                    onChange={(event) => updateValue("notes", event.target.value)}
                    className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
                    placeholder="Anything that would help a later scope draft or project review."
                  />
                  {state.fieldErrors?.notes ? (
                    <p className="text-destructive text-sm">
                      {state.fieldErrors.notes}
                    </p>
                  ) : null}
                </label>
              </>
            ) : null}
          </div>
        </section>

        {state.error ? (
          <p className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5"
              disabled={currentStep === 0 || pending}
              onClick={() =>
                setCurrentStep((step) => (step > 0 ? step - 1 : step))
              }
            >
              Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-5"
                disabled={!canMoveNext || pending}
                onClick={() =>
                  setCurrentStep((step) =>
                    step < steps.length - 1 ? step + 1 : step,
                  )
                }
              >
                Next step
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              name="intent"
              value="save"
              variant="outline"
              className="rounded-full px-5"
              disabled={pending}
            >
              {pending ? "Saving..." : "Save progress"}
            </Button>
            <Button
              type="submit"
              name="intent"
              value="complete"
              className="rounded-full px-5"
              disabled={pending}
            >
              {pending ? "Saving..." : "Complete intake"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
