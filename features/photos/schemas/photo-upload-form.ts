import { z } from "zod";

const optionalDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
  .optional()
  .nullable()
  .transform((value) => (value && value.length > 0 ? value : null));

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null));
}

export const photoUploadMetadataSchema = z.object({
  caption: optionalText(280),
  roomTag: optionalText(80),
  phaseTag: optionalText(80),
  takenOn: optionalDateSchema,
});

export type PhotoUploadActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<"file" | "caption" | "roomTag" | "phaseTag" | "takenOn", string>
  >;
};
