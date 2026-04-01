type AiWorkflowErrorCode =
  | "configuration-missing"
  | "configuration-invalid"
  | "provider-unavailable"
  | "source-data-missing"
  | "generation-failed";

export type NormalizedAiWorkflowError = {
  code: AiWorkflowErrorCode;
  title: string;
  message: string;
  retryable: boolean;
  httpStatus: number;
  configurationHint?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown AI generation error.";
}

export function normalizeAiWorkflowError(
  error: unknown,
  workflowLabel = "AI workflow",
): NormalizedAiWorkflowError {
  const message = getErrorMessage(error);
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("missing required environment variable: openai_api_key")
  ) {
    return {
      code: "configuration-missing",
      title: "AI unavailable in this environment",
      message: `${workflowLabel} is not configured here yet. Add OPENAI_API_KEY to enable live model runs.`,
      retryable: false,
      httpStatus: 503,
      configurationHint: "Set OPENAI_API_KEY in .env.local or the deployment environment.",
    };
  }

  if (
    normalizedMessage.includes("incorrect api key") ||
    normalizedMessage.includes("invalid api key") ||
    normalizedMessage.includes("authentication") ||
    normalizedMessage.includes("401")
  ) {
    return {
      code: "configuration-invalid",
      title: "AI configuration needs attention",
      message: `${workflowLabel} could not reach the provider with the current credentials.`,
      retryable: false,
      httpStatus: 503,
      configurationHint:
        "Check OPENAI_API_KEY and confirm the configured key can access the selected model.",
    };
  }

  if (
    normalizedMessage.includes("source data was not found") ||
    normalizedMessage.includes("change-order data was not found")
  ) {
    return {
      code: "source-data-missing",
      title: "Project data is not ready",
      message: `${workflowLabel} needs project source data that is missing or inaccessible.`,
      retryable: false,
      httpStatus: 400,
    };
  }

  if (
    normalizedMessage.includes("fetch failed") ||
    normalizedMessage.includes("api connection") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("429") ||
    normalizedMessage.includes("500") ||
    normalizedMessage.includes("502") ||
    normalizedMessage.includes("503") ||
    normalizedMessage.includes("504") ||
    normalizedMessage.includes("overloaded") ||
    normalizedMessage.includes("temporarily unavailable") ||
    normalizedMessage.includes("timeout")
  ) {
    return {
      code: "provider-unavailable",
      title: "AI provider is temporarily unavailable",
      message: `${workflowLabel} could not be completed because the provider is unavailable right now.`,
      retryable: true,
      httpStatus: 503,
    };
  }

  return {
    code: "generation-failed",
    title: "AI summary could not be generated",
    message: `${workflowLabel} could not be completed right now.`,
    retryable: true,
    httpStatus: 400,
  };
}
