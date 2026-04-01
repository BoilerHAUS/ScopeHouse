import { z } from "zod";

function parseTags(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(
    0,
    8,
  );
}

export const documentUploadMetadataSchema = z.object({
  tags: z
    .string()
    .optional()
    .transform((value) => parseTags(value)),
});

export type DocumentUploadActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<"file" | "tags", string>>;
};
