import { z } from "zod";

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function optionalCurrencyToCents(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = Number(trimmed.replace(/[$,]/g, ""));

  if (Number.isNaN(normalized) || normalized < 0) {
    return Number.NaN;
  }

  return Math.round(normalized * 100);
}

const centsField = z
  .string()
  .optional()
  .transform(optionalCurrencyToCents)
  .refine((value) => value === null || !Number.isNaN(value), {
    message: "Enter a valid non-negative amount.",
  });

export const budgetLineFormSchema = z.object({
  lineId: z.string().optional(),
  categoryId: z.string().min(1, "Choose a budget category."),
  label: z.string().trim().min(2, "Enter a line item label.").max(160),
  estimate: centsField,
  allowance: centsField,
  quoted: centsField,
  actual: centsField,
  sourceReference: z
    .string()
    .max(240, "Keep the source reference under 240 characters.")
    .optional()
    .transform(optionalText),
  notes: z
    .string()
    .max(800, "Keep the notes field under 800 characters.")
    .optional()
    .transform(optionalText),
});

export type BudgetLineActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<
      | "categoryId"
      | "label"
      | "estimate"
      | "allowance"
      | "quoted"
      | "actual"
      | "sourceReference"
      | "notes",
      string
    >
  >;
};
