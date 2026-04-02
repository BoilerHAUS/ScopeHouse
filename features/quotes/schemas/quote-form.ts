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

export const quoteFormSchema = z.object({
  quoteId: z.string().optional(),
  contractor: z.string().trim().min(1, "Enter a contractor name.").max(160),
  amount: centsField,
  scopeReference: z
    .string()
    .max(320, "Keep the scope reference under 320 characters.")
    .optional()
    .transform(optionalText),
  notes: z
    .string()
    .max(800, "Keep the notes under 800 characters.")
    .optional()
    .transform(optionalText),
});

export type QuoteFormActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<"contractor" | "amount" | "scopeReference" | "notes", string>
  >;
};
