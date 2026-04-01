import { z } from "zod";

export const scopeDraftItemSchema = z.object({
  label: z.string().trim().min(1).max(160),
  status: z.enum(["included", "needs_info", "optional"]),
  notes: z.union([z.string().trim().max(500), z.null()]),
});

export const scopeDraftAreaSchema = z.object({
  name: z.string().trim().min(1).max(120),
  items: z.array(scopeDraftItemSchema),
});

export const scopeDraftPhaseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  areas: z.array(scopeDraftAreaSchema),
});

export const scopeDraftOutputSchema = z.object({
  projectSummary: z.string().trim().min(1).max(1200),
  phases: z.array(scopeDraftPhaseSchema).min(1),
  assumptions: z.array(z.string().trim().min(1).max(400)),
  risks: z.array(z.string().trim().min(1).max(400)),
});

export type ScopeDraftOutput = z.infer<typeof scopeDraftOutputSchema>;
