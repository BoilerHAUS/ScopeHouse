import { z } from "zod";

export const progressSummaryOutputSchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  progress: z.array(z.string().trim().min(1).max(400)).default([]),
  blockers: z.array(z.string().trim().min(1).max(400)).default([]),
  nextActions: z.array(z.string().trim().min(1).max(400)).default([]),
});
