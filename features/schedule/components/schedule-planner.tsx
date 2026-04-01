"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deleteScheduleMilestoneAction } from "@/features/schedule/actions/delete-schedule-milestone";
import { deleteSchedulePhaseAction } from "@/features/schedule/actions/delete-schedule-phase";
import { moveScheduleMilestoneAction } from "@/features/schedule/actions/move-schedule-milestone";
import { moveSchedulePhaseAction } from "@/features/schedule/actions/move-schedule-phase";
import { saveScheduleMilestoneAction } from "@/features/schedule/actions/save-schedule-milestone";
import { saveSchedulePhaseAction } from "@/features/schedule/actions/save-schedule-phase";
import type { getProjectScheduleForUser } from "@/features/schedule/queries/get-project-schedule";
import type { ScheduleMilestoneFormActionState } from "@/features/schedule/schemas/schedule-milestone-form";
import type { SchedulePhaseFormActionState } from "@/features/schedule/schemas/schedule-phase-form";
import {
  formatScheduleDate,
  formatScheduleDateRange,
} from "@/features/schedule/utils/format-schedule-date";

type ProjectScheduleData = NonNullable<
  Awaited<ReturnType<typeof getProjectScheduleForUser>>
>;

type SchedulePhaseRecord = ProjectScheduleData["phases"][number];
type ScheduleMilestoneRecord = SchedulePhaseRecord["milestones"][number];

const initialPhaseState: SchedulePhaseFormActionState = {};
const initialMilestoneState: ScheduleMilestoneFormActionState = {};

function SchedulePhaseForm({
  projectId,
  phase,
  canMoveUp = false,
  canMoveDown = false,
}: {
  projectId: string;
  phase?: SchedulePhaseRecord;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveSchedulePhaseAction.bind(null, projectId),
    initialPhaseState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="phaseId" value={phase?.id ?? ""} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
        <label className="block space-y-2 xl:col-span-1">
          <span className="text-sm font-medium">Phase name</span>
          <input
            type="text"
            name="name"
            defaultValue={phase?.name ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Design and selections"
            required
          />
          {state.fieldErrors?.name ? (
            <p className="text-destructive text-sm">{state.fieldErrors.name}</p>
          ) : null}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Target start</span>
          <input
            type="date"
            name="targetStartDate"
            defaultValue={phase?.targetStartDate ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          />
          {state.fieldErrors?.targetStartDate ? (
            <p className="text-destructive text-sm">
              {state.fieldErrors.targetStartDate}
            </p>
          ) : null}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Target finish</span>
          <input
            type="date"
            name="targetEndDate"
            defaultValue={phase?.targetEndDate ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          />
          {state.fieldErrors?.targetEndDate ? (
            <p className="text-destructive text-sm">{state.fieldErrors.targetEndDate}</p>
          ) : null}
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={phase?.notes ?? ""}
          className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
          placeholder="Sequence assumptions, permit dependencies, or owner decisions affecting timing."
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
          {pending ? "Saving..." : phase ? "Save phase" : "Create phase"}
        </Button>
        {phase ? (
          <>
            <Button
              type="submit"
              formAction={moveSchedulePhaseAction.bind(null, projectId, phase.id, "up")}
              variant="outline"
              className="rounded-full px-4"
              disabled={!canMoveUp}
            >
              Move up
            </Button>
            <Button
              type="submit"
              formAction={moveSchedulePhaseAction.bind(null, projectId, phase.id, "down")}
              variant="outline"
              className="rounded-full px-4"
              disabled={!canMoveDown}
            >
              Move down
            </Button>
            <Button
              type="submit"
              formAction={deleteSchedulePhaseAction.bind(null, projectId)}
              variant="outline"
              className="rounded-full px-4"
            >
              Delete phase
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}

function ScheduleMilestoneForm({
  projectId,
  phaseId,
  milestone,
  canMoveUp = false,
  canMoveDown = false,
}: {
  projectId: string;
  phaseId: string;
  milestone?: ScheduleMilestoneRecord;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveScheduleMilestoneAction.bind(null, projectId),
    initialMilestoneState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[1.25rem] border border-stone-200 bg-stone-50/60 px-4 py-4"
    >
      <input type="hidden" name="milestoneId" value={milestone?.id ?? ""} />
      <input type="hidden" name="phaseId" value={phaseId} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px]">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Milestone</span>
          <input
            type="text"
            name="label"
            defaultValue={milestone?.label ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
            placeholder="Finalize appliance selections"
            required
          />
          {state.fieldErrors?.label ? (
            <p className="text-destructive text-sm">{state.fieldErrors.label}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Target date</span>
          <input
            type="date"
            name="targetDate"
            defaultValue={milestone?.targetDate ?? ""}
            className="border-border bg-background focus:border-primary w-full rounded-2xl border px-4 py-3 outline-none"
          />
          {state.fieldErrors?.targetDate ? (
            <p className="text-destructive text-sm">{state.fieldErrors.targetDate}</p>
          ) : null}
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={milestone?.notes ?? ""}
          className="border-border bg-background focus:border-primary w-full rounded-[1.5rem] border px-4 py-3 outline-none"
          placeholder="Optional milestone context, dependencies, or owner actions."
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
          {pending ? "Saving..." : milestone ? "Save milestone" : "Add milestone"}
        </Button>
        {milestone ? (
          <>
            <Button
              type="submit"
              formAction={moveScheduleMilestoneAction.bind(
                null,
                projectId,
                milestone.id,
                "up",
              )}
              variant="outline"
              className="rounded-full px-4"
              disabled={!canMoveUp}
            >
              Move up
            </Button>
            <Button
              type="submit"
              formAction={moveScheduleMilestoneAction.bind(
                null,
                projectId,
                milestone.id,
                "down",
              )}
              variant="outline"
              className="rounded-full px-4"
              disabled={!canMoveDown}
            >
              Move down
            </Button>
            <Button
              type="submit"
              formAction={deleteScheduleMilestoneAction.bind(null, projectId)}
              variant="outline"
              className="rounded-full px-4"
            >
              Delete milestone
            </Button>
          </>
        ) : null}
      </div>
    </form>
  );
}

export function SchedulePlanner({
  projectId,
  schedule,
}: {
  projectId: string;
  schedule: ProjectScheduleData;
}) {
  return (
    <div className="space-y-6">
      <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          Schedule
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Schedule planner
        </h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
          Keep the schedule readable and intentional. Define phases, add useful
          milestones, and sequence them without turning the MVP into a gantt tool.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-5 py-5">
            <p className="text-muted text-xs uppercase tracking-[0.18em]">Phases</p>
            <p className="mt-3 text-3xl font-semibold">{schedule.summary.phaseCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-5 py-5">
            <p className="text-muted text-xs uppercase tracking-[0.18em]">Milestones</p>
            <p className="mt-3 text-3xl font-semibold">{schedule.summary.milestoneCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/80 px-5 py-5">
            <p className="text-muted text-xs uppercase tracking-[0.18em]">Next target</p>
            <p className="mt-3 text-base font-semibold">
              {schedule.summary.nextMilestone?.label ?? "No dated milestone yet"}
            </p>
            <p className="text-muted mt-2 text-sm">
              {formatScheduleDate(schedule.summary.nextMilestone?.targetDate)}
            </p>
          </div>
        </div>
      </section>

      <section className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
        <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
          New phase
        </p>
        <div className="mt-4">
          <SchedulePhaseForm projectId={projectId} />
        </div>
      </section>

      {schedule.phases.length === 0 ? (
        <section className="border-border bg-surface rounded-[1.75rem] border px-5 py-8 text-center shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
          <p className="text-lg font-semibold">No schedule phases yet.</p>
          <p className="text-muted mx-auto mt-3 max-w-2xl text-sm leading-7">
            Start with broad phases such as design, procurement, demolition, and
            installation. Add milestones only where they help decision-making.
          </p>
        </section>
      ) : (
        schedule.phases.map((phase, phaseIndex) => (
          <section
            key={phase.id}
            className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-muted text-xs uppercase tracking-[0.2em]">
                  Phase {phaseIndex + 1}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{phase.name}</h3>
                <p className="text-muted mt-2 text-sm">
                  {formatScheduleDateRange(phase.targetStartDate, phase.targetEndDate)}
                </p>
              </div>
              <p className="text-muted text-sm">
                {phase.milestones.length}{" "}
                {phase.milestones.length === 1 ? "milestone" : "milestones"}
              </p>
            </div>

            <div className="mt-5">
              <SchedulePhaseForm
                projectId={projectId}
                phase={phase}
                canMoveUp={phaseIndex > 0}
                canMoveDown={phaseIndex < schedule.phases.length - 1}
              />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
                  Milestones
                </p>
              </div>

              {phase.milestones.length === 0 ? (
                <p className="text-muted rounded-[1.25rem] border border-dashed border-stone-300 px-4 py-4 text-sm leading-7">
                  No milestones added for this phase yet.
                </p>
              ) : (
                phase.milestones.map((milestone, milestoneIndex) => (
                  <div key={milestone.id} className="space-y-2">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-medium">{milestone.label}</p>
                      <p className="text-muted text-xs uppercase tracking-[0.18em]">
                        {formatScheduleDate(milestone.targetDate)}
                      </p>
                    </div>
                    <ScheduleMilestoneForm
                      projectId={projectId}
                      phaseId={phase.id}
                      milestone={milestone}
                      canMoveUp={milestoneIndex > 0}
                      canMoveDown={milestoneIndex < phase.milestones.length - 1}
                    />
                  </div>
                ))
              )}

              <div className="rounded-[1.5rem] border border-dashed border-stone-300 px-4 py-4">
                <p className="text-muted mb-4 text-xs uppercase tracking-[0.18em]">
                  Add milestone
                </p>
                <ScheduleMilestoneForm projectId={projectId} phaseId={phase.id} />
              </div>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
