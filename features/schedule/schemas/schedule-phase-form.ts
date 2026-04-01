import { z } from "zod";

const scheduleDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .optional()
  .nullable()
  .transform((value) => (value && value.length > 0 ? value : null));

export const schedulePhaseFormSchema = z
  .object({
    phaseId: z.string().trim().optional(),
    name: z.string().trim().min(2, "Enter a phase name.").max(120),
    targetStartDate: scheduleDateSchema,
    targetEndDate: scheduleDateSchema,
    notes: z
      .string()
      .trim()
      .max(500, "Keep notes under 500 characters.")
      .optional()
      .nullable()
      .transform((value) => (value && value.length > 0 ? value : null)),
  })
  .superRefine((value, ctx) => {
    if (
      value.targetStartDate &&
      value.targetEndDate &&
      value.targetStartDate > value.targetEndDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetEndDate"],
        message: "End date must be on or after the start date.",
      });
    }
  });

export type SchedulePhaseFormActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<"name" | "targetStartDate" | "targetEndDate" | "notes", string>
  >;
};
