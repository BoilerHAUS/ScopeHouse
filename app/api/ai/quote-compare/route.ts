import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { generateQuoteComparisonForUser } from "@/features/ai/services/generate-quote-comparison";
import { normalizeAiWorkflowError } from "@/server/ai/errors";
import {
  isRateLimitExceededError,
  rateLimitAiByProject,
} from "@/server/rate-limit/limit";

type QuoteCompareRouteBody = {
  projectId?: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        workflow: "quote-compare",
        status: "unauthorized",
        message: "Sign in to compare project quotes.",
      },
      { status: 401 },
    );
  }

  const body = (await request.json()) as QuoteCompareRouteBody;

  if (!body.projectId) {
    return NextResponse.json(
      {
        workflow: "quote-compare",
        status: "invalid-request",
        message: "Provide a projectId.",
      },
      { status: 400 },
    );
  }

  try {
    await rateLimitAiByProject(body.projectId);
    const comparison = await generateQuoteComparisonForUser(body.projectId, user.id);

    return NextResponse.json({
      workflow: "quote-compare",
      status: "completed",
      comparison: {
        ...comparison.output,
        generationId: comparison.generationId,
        model: comparison.model,
        promptVersion: comparison.promptVersion,
      },
    });
  } catch (error) {
    if (isRateLimitExceededError(error)) {
      return NextResponse.json(
        {
          workflow: "quote-compare",
          status: "rate-limited",
          message: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds),
          },
        },
      );
    }

    const normalizedError = normalizeAiWorkflowError(
      error,
      "AI quote comparison",
    );

    return NextResponse.json(
      {
        workflow: "quote-compare",
        status: "failed",
        message: normalizedError.message,
        error: normalizedError,
      },
      { status: normalizedError.httpStatus },
    );
  }
}
