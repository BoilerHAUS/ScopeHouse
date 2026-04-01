export type AiWorkflow = "scope-draft" | "quote-compare" | "progress-summary";

export type AiJobStatus = "queued" | "running" | "completed" | "failed";

export type LoggedAiWorkflow = "scope_draft" | "quote_compare" | "progress_summary";

export type AiGenerationLog = {
  id: string;
  projectId: string | null;
  workflow: LoggedAiWorkflow;
  status: "running" | "completed" | "failed";
  model: string;
  promptVersion: string;
  createdAt: Date;
  completedAt: Date | null;
  errorMessage: string | null;
};
