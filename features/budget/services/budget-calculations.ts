import type { BudgetLine, BudgetLineRollup } from "@/types/budget";

type BudgetAmounts = Pick<
  BudgetLine,
  "estimateCents" | "allowanceCents" | "quotedCents" | "actualCents"
>;

function valueOrZero(value: number | null | undefined) {
  return value ?? 0;
}

export function getBudgetLinePlanningCents(line: BudgetAmounts) {
  if (line.actualCents != null) {
    return line.actualCents;
  }

  if (line.quotedCents != null) {
    return line.quotedCents;
  }

  if (line.allowanceCents != null) {
    return line.allowanceCents;
  }

  if (line.estimateCents != null) {
    return line.estimateCents;
  }

  return 0;
}

export function calculateBudgetRollup(lines: BudgetAmounts[]): BudgetLineRollup {
  return lines.reduce<BudgetLineRollup>(
    (totals, line) => ({
      estimateCents: totals.estimateCents + valueOrZero(line.estimateCents),
      allowanceCents: totals.allowanceCents + valueOrZero(line.allowanceCents),
      quotedCents: totals.quotedCents + valueOrZero(line.quotedCents),
      actualCents: totals.actualCents + valueOrZero(line.actualCents),
      planningCents: totals.planningCents + getBudgetLinePlanningCents(line),
    }),
    {
      estimateCents: 0,
      allowanceCents: 0,
      quotedCents: 0,
      actualCents: 0,
      planningCents: 0,
    },
  );
}

export function formatCurrencyFromCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
