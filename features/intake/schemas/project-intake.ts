import { z } from "zod";

export const CONTRACTOR_INVOLVEMENT_OPTIONS = [
  { value: "undecided", label: "Still deciding" },
  { value: "self_managed", label: "Self-managed project" },
  { value: "hiring_gc", label: "Planning to hire a GC" },
  { value: "selected_gc", label: "GC already selected" },
  { value: "design_build", label: "Working with design-build" },
] as const;

export const BUDGET_RANGE_OPTIONS = [
  "Under $25k",
  "$25k - $75k",
  "$75k - $150k",
  "$150k - $300k",
  "$300k+",
  "Still unknown",
] as const;

const contractorInvolvementValues = [
  "undecided",
  "self_managed",
  "hiring_gc",
  "selected_gc",
  "design_build",
] as const;

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function listFromTextarea(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return [];
  }

  return trimmed
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToTextarea(value?: string[] | null) {
  return value?.join("\n") ?? "";
}

export const saveProjectIntakeSchema = z.object({
  intent: z.enum(["save", "complete"]),
  renovationType: z
    .enum([
      "kitchen",
      "bathroom",
      "addition",
      "whole_home",
      "basement",
      "outdoor",
      "other",
    ])
    .optional()
    .nullable(),
  roomsRaw: z.string().optional().transform(listFromTextarea),
  goals: z
    .string()
    .max(1000, "Keep the goals summary under 1000 characters.")
    .optional()
    .transform(optionalText),
  prioritiesRaw: z.string().optional().transform(listFromTextarea),
  timingExpectation: z
    .string()
    .max(800, "Keep timing expectations under 800 characters.")
    .optional()
    .transform(optionalText),
  budgetRange: z
    .enum(BUDGET_RANGE_OPTIONS)
    .optional()
    .nullable()
    .or(z.literal("")),
  constraintsRaw: z.string().optional().transform(listFromTextarea),
  contractorInvolvement: z
    .enum(contractorInvolvementValues)
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1200, "Keep the notes field under 1200 characters.")
    .optional()
    .transform(optionalText),
});

export type SaveProjectIntakeInput = z.infer<typeof saveProjectIntakeSchema>;

export type ProjectIntakeFormValues = {
  renovationType: string;
  roomsRaw: string;
  goals: string;
  prioritiesRaw: string;
  timingExpectation: string;
  budgetRange: string;
  constraintsRaw: string;
  contractorInvolvement: string;
  notes: string;
};

export type SaveProjectIntakeActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<keyof ProjectIntakeFormValues, string>>;
};

export function toProjectIntakeFormValues(input: {
  renovationType?: string | null;
  rooms?: string[] | null;
  goals?: string | null;
  priorities?: string[] | null;
  timingExpectation?: string | null;
  budgetRange?: string | null;
  constraints?: string[] | null;
  contractorInvolvement?: string | null;
  notes?: string | null;
}): ProjectIntakeFormValues {
  return {
    renovationType: input.renovationType ?? "",
    roomsRaw: listToTextarea(input.rooms),
    goals: input.goals ?? "",
    prioritiesRaw: listToTextarea(input.priorities),
    timingExpectation: input.timingExpectation ?? "",
    budgetRange: input.budgetRange ?? "",
    constraintsRaw: listToTextarea(input.constraints),
    contractorInvolvement: input.contractorInvolvement ?? "",
    notes: input.notes ?? "",
  };
}
