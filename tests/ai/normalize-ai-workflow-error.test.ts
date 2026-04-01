import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAiWorkflowError } from "@/server/ai/errors";

test("normalizeAiWorkflowError detects missing OpenAI configuration", () => {
  const result = normalizeAiWorkflowError(
    new Error("Missing required environment variable: OPENAI_API_KEY"),
    "AI project summary generation",
  );

  assert.equal(result.code, "configuration-missing");
  assert.equal(result.retryable, false);
  assert.equal(result.httpStatus, 503);
  assert.match(result.message, /OPENAI_API_KEY/);
});

test("normalizeAiWorkflowError maps provider outages to safe retryable errors", () => {
  const result = normalizeAiWorkflowError(
    new Error("APIConnectionError: fetch failed"),
    "AI project summary generation",
  );

  assert.equal(result.code, "provider-unavailable");
  assert.equal(result.retryable, true);
  assert.equal(result.httpStatus, 503);
  assert.doesNotMatch(result.message, /fetch failed/i);
});

test("normalizeAiWorkflowError maps missing source data cleanly", () => {
  const result = normalizeAiWorkflowError(
    new Error("Project summary source data was not found."),
    "AI project summary generation",
  );

  assert.equal(result.code, "source-data-missing");
  assert.equal(result.retryable, false);
  assert.equal(result.httpStatus, 400);
});
