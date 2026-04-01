import { z } from "zod";

const scheduleDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .optional()
  .nullable()
  .transform((value) => (value && value.length > 0 ? value : null));

export const scheduleMilestoneFormSchema = z.object({
  milestoneId: z.string().trim().optional(),
  phaseId: z.string().trim().min(1, "Select a phase."),
  label: z.string().trim().min(2, "Enter a milestone label.").max(160),
  targetDate: scheduleDateSchema,
  notes: z
    .string()
    .trim()
    .max(500, "Keep notes under 500 characters.")
    .optional()
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export type ScheduleMilestoneFormActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<"label" | "targetDate" | "notes", string>>;
};
