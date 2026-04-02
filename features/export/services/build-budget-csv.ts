import {
  formatCurrencyFromCents,
  getBudgetLinePlanningCents,
} from "@/features/budget/services/budget-calculations";
import { toCsv } from "@/features/export/services/csv";
import type { getProjectBudgetForUser } from "@/features/budget/queries/get-project-budget";

type ProjectBudgetData = NonNullable<
  Awaited<ReturnType<typeof getProjectBudgetForUser>>
>;

function formatOptionalCurrency(value: number | null) {
  return value == null ? "" : formatCurrencyFromCents(value);
}

export function buildBudgetCsv(budget: ProjectBudgetData) {
  const detailRows: Array<Array<string>> = [
    [
      "Category",
      "Category Status",
      "Category Notes",
      "Line Item",
      "Linked Scope Phase",
      "Linked Scope Area",
      "Linked Scope Item",
      "Estimate",
      "Allowance",
      "Quoted",
      "Actual",
      "Planning",
      "Source Reference",
      "Line Notes",
    ],
  ];

  for (const category of budget.categories) {
    if (category.lines.length === 0) {
      detailRows.push([
        category.label,
        category.status,
        category.notes ?? "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      continue;
    }

    for (const line of category.lines) {
      detailRows.push([
        category.label,
        category.status,
        category.notes ?? "",
        line.label,
        line.scopeItem?.phaseName ?? "",
        line.scopeItem?.areaName ?? "",
        line.scopeItem?.label ?? "",
        formatOptionalCurrency(line.estimateCents),
        formatOptionalCurrency(line.allowanceCents),
        formatOptionalCurrency(line.quotedCents),
        formatOptionalCurrency(line.actualCents),
        formatCurrencyFromCents(getBudgetLinePlanningCents(line)),
        line.sourceReference ?? "",
        line.notes ?? "",
      ]);
    }
  }

  detailRows.push([]);
  detailRows.push(["Totals"]);
  detailRows.push(["Measure", "Amount"]);
  detailRows.push(["Estimate total", formatCurrencyFromCents(budget.totals.estimateCents)]);
  detailRows.push(["Allowance total", formatCurrencyFromCents(budget.totals.allowanceCents)]);
  detailRows.push(["Quoted total", formatCurrencyFromCents(budget.totals.quotedCents)]);
  detailRows.push(["Actual total", formatCurrencyFromCents(budget.totals.actualCents)]);
  detailRows.push(["Planning total", formatCurrencyFromCents(budget.totals.planningCents)]);

  return toCsv(detailRows);
}
