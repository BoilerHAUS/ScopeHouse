import type { LoggedAiWorkflow } from "@/types/ai";

export const AI_WORKFLOW_CONFIG = {
  scope_draft: {
    promptDirectory: "scope-draft",
    responseType: "object",
  },
  quote_compare: {
    promptDirectory: "quote-compare",
    responseType: "object",
  },
  progress_summary: {
    promptDirectory: "progress-summary",
    responseType: "object",
  },
} as const satisfies Record<
  LoggedAiWorkflow,
  {
    promptDirectory: string;
    responseType: "object";
  }
>;
