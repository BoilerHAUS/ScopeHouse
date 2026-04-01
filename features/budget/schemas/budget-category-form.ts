import { z } from "zod";

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const budgetCategoryFormSchema = z.object({
  categoryId: z.string().optional(),
  label: z.string().trim().min(2, "Enter a category name.").max(120),
  notes: z
    .string()
    .max(800, "Keep the notes field under 800 characters.")
    .optional()
    .transform(optionalText),
  status: z.enum(["draft", "active"]),
});

export type BudgetCategoryActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<"label" | "notes" | "status", string>>;
};
