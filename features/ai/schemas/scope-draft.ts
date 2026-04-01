import { z } from "zod";

export const scopeDraftItemSchema = z.object({
  label: z.string().trim().min(1).max(160),
  status: z.enum(["included", "needs_info", "optional"]),
  notes: z.string().trim().max(500).nullable().default(null),
});

export const scopeDraftAreaSchema = z.object({
  name: z.string().trim().min(1).max(120),
  items: z.array(scopeDraftItemSchema).default([]),
});

export const scopeDraftPhaseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  areas: z.array(scopeDraftAreaSchema).default([]),
});

export const scopeDraftOutputSchema = z.object({
  projectSummary: z.string().trim().min(1).max(1200),
  phases: z.array(scopeDraftPhaseSchema).min(1),
  assumptions: z.array(z.string().trim().min(1).max(400)).default([]),
  risks: z.array(z.string().trim().min(1).max(400)).default([]),
});

export type ScopeDraftOutput = z.infer<typeof scopeDraftOutputSchema>;
