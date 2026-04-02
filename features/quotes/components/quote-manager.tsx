"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { saveQuoteAction } from "@/features/quotes/actions/save-quote";
import type { QuoteFormActionState } from "@/features/quotes/schemas/quote-form";
import { deleteQuoteAction } from "@/features/quotes/actions/delete-quote";
import {
  generateQuoteComparisonAction,
  type QuoteComparisonActionState,
} from "@/features/ai/actions/generate-quote-comparison";
import type { listProjectQuotesForUser } from "@/features/quotes/queries/list-project-quotes";
import type { getLatestQuoteComparisonForUser } from "@/features/ai/queries/get-latest-quote-comparison";

type Quotes = Awaited<ReturnType<typeof listProjectQuotesForUser>>;
type LatestComparison = Awaited<ReturnType<typeof getLatestQuoteComparisonForUser>>;

function formatCents(cents: number | null) {
  if (cents === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const initialQuoteState: QuoteFormActionState = {};
const initialComparisonState: QuoteComparisonActionState = {};

function QuoteForm({
  projectId,
  quote,
  onCancel,
}: {
  projectId: string;
  quote?: Quotes[number] | null;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveQuoteAction.bind(null, projectId),
    initialQuoteState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {quote ? (
        <input type="hidden" name="quoteId" value={quote.id} />
      ) : null}

      <div>
        <label className="block text-xs font-medium text-stone-700">
          Contractor <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="contractor"
          defaultValue={quote?.contractor ?? ""}
          placeholder="e.g. Apex Contracting"
          maxLength={160}
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          required
        />
        {state.fieldErrors?.contractor ? (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.contractor}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-700">
          Amount (optional)
        </label>
        <input
          type="text"
          name="amount"
          defaultValue={
            quote?.amountCents != null ? String(quote.amountCents / 100) : ""
          }
          placeholder="e.g. 45000"
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
        />
        {state.fieldErrors?.amount ? (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.amount}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-700">
          Scope reference (optional)
        </label>
        <textarea
          name="scopeReference"
          defaultValue={quote?.scopeReference ?? ""}
          placeholder="Describe what work this quote covers"
          rows={2}
          maxLength={320}
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
        />
        {state.fieldErrors?.scopeReference ? (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.scopeReference}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-700">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          defaultValue={quote?.notes ?? ""}
          placeholder="Allowances, exclusions, or observations"
          rows={2}
          maxLength={800}
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
        />
        {state.fieldErrors?.notes ? (
          <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.notes}</p>
        ) : null}
      </div>

      {state.error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" className="rounded-full px-5" disabled={pending}>
          {pending ? "Saving..." : quote ? "Update quote" : "Add quote"}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-5"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function QuoteComparisonPanel({
  projectId,
  latestComparison,
  aiAvailability,
  hasQuotes,
}: {
  projectId: string;
  latestComparison: LatestComparison;
  aiAvailability: { isConfigured: boolean; model: string };
  hasQuotes: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    generateQuoteComparisonAction.bind(null, projectId),
    initialComparisonState,
  );

  const isConfigurationBlocked = !aiAvailability.isConfigured;
  const errorToneClass = state.errorCode?.startsWith("configuration")
    ? "bg-amber-50 text-amber-800"
    : "bg-rose-50 text-rose-700";

  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(28,25,23,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-900">
            AI quote comparison
          </h2>
          <p className="mt-4 text-sm leading-7 text-stone-700">
            Compare quotes against your project scope to identify coverage gaps,
            overlaps, and risks. Review the output before acting on it.
          </p>
        </div>
        <form action={formAction}>
          <Button
            type="submit"
            className="rounded-full px-5"
            disabled={pending || isConfigurationBlocked || !hasQuotes}
          >
            {pending ? "Comparing quotes..." : "Compare quotes"}
          </Button>
        </form>
      </div>

      {!hasQuotes ? (
        <p className="mt-5 rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
          Add at least one quote above to run the AI comparison.
        </p>
      ) : null}

      {isConfigurationBlocked && hasQuotes ? (
        <div className="mt-5 rounded-[1.25rem] bg-amber-50 px-4 py-4 text-sm text-amber-800">
          <p className="font-medium">AI comparison is not configured here.</p>
          <p className="mt-2 leading-7">
            Add <code>OPENAI_API_KEY</code> to enable live comparisons. This environment
            will use <code>{aiAvailability.model}</code> once that key is set.
          </p>
        </div>
      ) : null}

      {state.error ? (
        <div className={`mt-5 rounded-[1.25rem] px-4 py-4 text-sm ${errorToneClass}`}>
          {state.errorTitle ? <p className="font-medium">{state.errorTitle}</p> : null}
          <p className={state.errorTitle ? "mt-2 leading-7" : "leading-7"}>
            {state.error}
          </p>
          {state.helpText ? <p className="mt-2 leading-7">{state.helpText}</p> : null}
        </div>
      ) : null}

      {latestComparison ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-[1.25rem] border border-stone-200 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Summary</p>
            <p className="mt-3 text-sm leading-7 text-stone-800">
              {latestComparison.output.summary}
            </p>
            <p className="mt-3 text-xs text-stone-500">
              Generated {latestComparison.createdAt.toLocaleString()} ·{" "}
              {latestComparison.model} · {latestComparison.promptVersion}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { title: "Coverage gaps", items: latestComparison.output.coverageGaps },
              { title: "Overlaps", items: latestComparison.output.overlaps },
              { title: "Risks", items: latestComparison.output.risks },
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
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-stone-600">None noted.</p>
                )}
              </div>
            ))}
          </div>

          {latestComparison.output.quoteNotes.length > 0 ? (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                Per-quote notes
              </p>
              <div className="mt-3 space-y-3">
                {latestComparison.output.quoteNotes.map((qn) => (
                  <div
                    key={qn.vendor}
                    className="rounded-[1.25rem] border border-stone-200 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-stone-900">{qn.vendor}</p>
                    {qn.notes.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm leading-7 text-stone-700">
                        {qn.notes.map((note) => (
                          <li key={note}>• {note}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : hasQuotes && !state.error ? (
        <p className="mt-6 rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
          No comparison has been generated yet. Click{" "}
          <span className="font-medium">Compare quotes</span> to analyse your quotes
          against the project scope.
        </p>
      ) : null}
    </section>
  );
}

export function QuoteManager({
  projectId,
  quotes,
  latestComparison,
  aiAvailability,
}: {
  projectId: string;
  quotes: Quotes;
  latestComparison: LatestComparison;
  aiAvailability: { isConfigured: boolean; model: string };
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(28,25,23,0.06)]">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-stone-900">
          Quotes
        </h2>
        <p className="mt-4 text-sm leading-7 text-stone-700">
          Record contractor quotes to compare coverage against your project scope.
        </p>

        {quotes.length > 0 ? (
          <div className="mt-6 space-y-3">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="rounded-[1.25rem] border border-stone-200 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-900">
                      {quote.contractor}
                    </p>
                    {quote.amountCents != null ? (
                      <p className="mt-1 text-sm text-stone-700">
                        {formatCents(quote.amountCents)}
                      </p>
                    ) : null}
                    {quote.scopeReference ? (
                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        {quote.scopeReference}
                      </p>
                    ) : null}
                    {quote.notes ? (
                      <p className="mt-1 text-sm leading-6 text-stone-500">{quote.notes}</p>
                    ) : null}
                  </div>
                  <form
                    action={deleteQuoteAction.bind(null, projectId)}
                    className="shrink-0"
                  >
                    <input type="hidden" name="quoteId" value={quote.id} />
                    <button
                      type="submit"
                      className="rounded-lg px-3 py-1.5 text-xs text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-[1.25rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
            No quotes yet. Add a quote below.
          </p>
        )}

        <div className="mt-6 rounded-[1.25rem] border border-stone-200 px-4 py-4">
          <p className="mb-4 text-sm font-semibold text-stone-800">Add a quote</p>
          <QuoteForm projectId={projectId} />
        </div>
      </section>

      <QuoteComparisonPanel
        projectId={projectId}
        latestComparison={latestComparison}
        aiAvailability={aiAvailability}
        hasQuotes={quotes.length > 0}
      />
    </div>
  );
}
