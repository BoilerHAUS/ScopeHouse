import { z } from "zod";

export const CHANGE_ORDER_STATUS_OPTIONS = [
  { value: "proposed", label: "Proposed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "implemented", label: "Implemented" },
] as const;

function optionalId() {
  return z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));
}

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null));
}

export const changeOrderFormSchema = z.object({
  changeOrderId: z.string().trim().optional(),
  title: z.string().trim().min(2, "Enter a title.").max(160),
  description: z.string().trim().min(8, "Add a short description.").max(1200),
  status: z.enum(
    CHANGE_ORDER_STATUS_OPTIONS.map((option) => option.value) as [
      (typeof CHANGE_ORDER_STATUS_OPTIONS)[number]["value"],
      ...(typeof CHANGE_ORDER_STATUS_OPTIONS)[number]["value"][],
    ],
  ),
  requestedAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date."),
  impactSummary: z.string().trim().min(8, "Summarize the impact.").max(800),
  budgetReference: optionalText(160),
  scheduleReference: optionalText(160),
  scopeItemId: optionalId(),
  budgetLineId: optionalId(),
  scheduleMilestoneId: optionalId(),
  notes: optionalText(500),
});

export type ChangeOrderFormActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<
      | "title"
      | "description"
      | "status"
      | "requestedAt"
      | "impactSummary"
      | "budgetReference"
      | "scheduleReference"
      | "scopeItemId"
      | "budgetLineId"
      | "scheduleMilestoneId"
      | "notes",
      string
    >
  >;
};
