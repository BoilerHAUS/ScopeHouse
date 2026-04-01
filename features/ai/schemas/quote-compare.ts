import { z } from "zod";

export const quoteCompareOutputSchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  coverageGaps: z.array(z.string().trim().min(1).max(400)).default([]),
  overlaps: z.array(z.string().trim().min(1).max(400)).default([]),
  risks: z.array(z.string().trim().min(1).max(400)).default([]),
  quoteNotes: z
    .array(
      z.object({
        vendor: z.string().trim().min(1).max(160),
        notes: z.array(z.string().trim().min(1).max(400)).default([]),
      }),
    )
    .default([]),
});
