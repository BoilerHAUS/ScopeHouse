"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  generateProjectProgressSummaryAction,
  type ProjectProgressSummaryActionState,
} from "@/features/ai/actions/generate-project-progress-summary";
import type { getLatestProjectProgressSummaryForUser } from "@/features/ai/queries/get-latest-project-progress-summary";

type LatestSummary = Awaited<
  ReturnType<typeof getLatestProjectProgressSummaryForUser>
>;

const initialState: ProjectProgressSummaryActionState = {};

export function ProjectProgressSummaryPanel({
  projectId,
  latestSummary,
}: {
  projectId: string;
  latestSummary: LatestSummary;
}) {
  const [state, formAction, pending] = useActionState(
    generateProjectProgressSummaryAction.bind(null, projectId),
    initialState,
  );

  return (
    <section className="break-inside-avoid rounded-[1.75rem] border border-stone-200 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(28,25,23,0.06)] print:rounded-none print:border-stone-300 print:shadow-none">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-900">
            AI project summary
          </h2>
          <p className="mt-4 text-sm leading-7 text-stone-700">
            Generate a structured progress summary from intake, scope, decisions,
            and change orders, then review it here before using the export.
          </p>
        </div>
        <form action={formAction} className="print:hidden">
          <Button type="submit" className="rounded-full px-5" disabled={pending}>
            {pending ? "Generating summary..." : "Generate AI summary"}
          </Button>
        </form>
      </div>

      {state.error ? (
        <p className="mt-5 rounded-[1.25rem] bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {latestSummary ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-[1.25rem] border border-stone-200 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Summary
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-800">
              {latestSummary.output.summary}
            </p>
            <p className="mt-3 text-xs text-stone-500">
              Generated {latestSummary.createdAt.toLocaleString()} ·{" "}
              {latestSummary.model} · {latestSummary.promptVersion}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {[
              { title: "Progress", items: latestSummary.output.progress },
              { title: "Blockers", items: latestSummary.output.blockers },
              { title: "Next actions", items: latestSummary.output.nextActions },
            ].map((section) => (
              <div
                key={section.title}
                className="rounded-[1.25rem] border border-stone-200 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  {section.title}
                </p>
                {section.items.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-stone-800">
                    {section.items.map((item) => (
                      <li key={`${section.title}-${item}`}>• {item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    No {section.title.toLowerCase()} recorded.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
          No AI summary has been generated yet. The export still works with the
          structured project data below.
        </p>
      )}
    </section>
  );
}
