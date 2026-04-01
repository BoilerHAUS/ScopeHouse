import { z } from "zod";

export const DECISION_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "deferred", label: "Deferred" },
] as const;

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const decisionFormSchema = z.object({
  decisionId: z.string().optional(),
  summary: z.string().trim().min(3, "Enter a decision summary.").max(240),
  owner: z.string().trim().min(2, "Enter a decision owner.").max(120),
  status: z.enum(["open", "approved", "rejected", "deferred"]),
  recordedAt: z.string().date("Enter a valid decision date."),
  notes: z
    .string()
    .max(1200, "Keep the notes field under 1200 characters.")
    .optional()
    .transform(optionalText),
});

export type DecisionFormActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<"summary" | "owner" | "status" | "recordedAt" | "notes", string>
  >;
};
