import { z } from "zod";

export const PROJECT_TYPE_OPTIONS = [
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "addition", label: "Addition" },
  { value: "whole_home", label: "Whole home" },
  { value: "basement", label: "Basement" },
  { value: "outdoor", label: "Outdoor" },
  { value: "other", label: "Other" },
] as const;

const projectTypeValues = PROJECT_TYPE_OPTIONS.map((option) => option.value);

function optionalText(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const createProjectSchema = z.object({
  title: z.string().trim().min(3, "Enter a project title.").max(120),
  projectType: z.enum(projectTypeValues, {
    message: "Choose the renovation type that fits best.",
  }),
  locationLabel: z
    .string()
    .max(120, "Keep the location label under 120 characters.")
    .optional()
    .transform(optionalText),
  goals: z
    .string()
    .max(1000, "Keep the goals summary under 1000 characters.")
    .optional()
    .transform(optionalText),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export type CreateProjectActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof CreateProjectInput, string>>;
};
