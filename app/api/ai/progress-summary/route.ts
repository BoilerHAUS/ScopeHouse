import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { generateProjectProgressSummaryForUser } from "@/features/ai/services/generate-project-progress-summary";
import { normalizeAiWorkflowError } from "@/server/ai/errors";

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
