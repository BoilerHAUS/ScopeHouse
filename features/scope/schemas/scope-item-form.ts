import { z } from "zod";

export const SCOPE_ITEM_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "needs_info", label: "Needs info" },
] as const;

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const scopeItemFormSchema = z.object({
  itemId: z.string().optional(),
  phaseName: z.string().trim().min(2, "Enter a phase name.").max(120),
  areaName: z.string().trim().min(2, "Enter an area name.").max(120),
  label: z.string().trim().min(3, "Enter a work item label.").max(160),
  notes: z
    .string()
    .max(800, "Keep the notes field under 800 characters.")
    .optional()
    .transform(optionalText),
  status: z.enum(["draft", "active", "needs_info"]),
});

export type ScopeItemFormActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<"phaseName" | "areaName" | "label" | "notes" | "status", string>
  >;
};
