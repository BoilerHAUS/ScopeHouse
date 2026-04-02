import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { generateProjectProgressSummaryForUser } from "@/features/ai/services/generate-project-progress-summary";
import { normalizeAiWorkflowError } from "@/server/ai/errors";
import {
  isRateLimitExceededError,
  rateLimitAiByProject,
} from "@/server/rate-limit/limit";

type ProgressSummaryRouteBody = {
  projectId?: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        workflow: "progress-summary",
        status: "unauthorized",
        message: "Sign in to generate a project summary.",
      },
      { status: 401 },
    );
  }

  const body = (await request.json()) as ProgressSummaryRouteBody;

  if (!body.projectId) {
    return NextResponse.json(
      {
        workflow: "progress-summary",
        status: "invalid-request",
        message: "Provide a projectId.",
      },
      { status: 400 },
    );
  }

  try {
    await rateLimitAiByProject(body.projectId);
    const summary = await generateProjectProgressSummaryForUser(body.projectId, user.id);

    return NextResponse.json({
      workflow: "progress-summary",
      status: "completed",
      summary: {
        ...summary.output,
        generationId: summary.generationId,
        model: summary.model,
        promptVersion: summary.promptVersion,
      },
    });
  } catch (error) {
    if (isRateLimitExceededError(error)) {
      return NextResponse.json(
        {
          workflow: "progress-summary",
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
      "AI project summary generation",
    );

    return NextResponse.json(
      {
        workflow: "progress-summary",
        status: "failed",
        message: normalizedError.message,
        error: normalizedError,
      },
      { status: normalizedError.httpStatus },
    );
  }
}
