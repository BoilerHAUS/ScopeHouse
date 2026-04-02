import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { generateScopeDraftForUser } from "@/features/ai/services/generate-scope-draft";
import {
  isRateLimitExceededError,
  rateLimitAiByProject,
} from "@/server/rate-limit/limit";

type ScopeDraftRouteBody = {
  projectId?: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        workflow: "scope-draft",
        status: "unauthorized",
        message: "Sign in to generate a scope draft.",
      },
      { status: 401 },
    );
  }

  const body = (await request.json()) as ScopeDraftRouteBody;

  if (!body.projectId) {
    return NextResponse.json(
      {
        workflow: "scope-draft",
        status: "invalid-request",
        message: "Provide a projectId.",
      },
      { status: 400 },
    );
  }

  try {
    await rateLimitAiByProject(body.projectId);
    const draft = await generateScopeDraftForUser(body.projectId, user.id);

    return NextResponse.json({
      workflow: "scope-draft",
      status: "completed",
      draft: {
        ...draft,
        createdAt: draft.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (isRateLimitExceededError(error)) {
      return NextResponse.json(
        {
          workflow: "scope-draft",
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

    return NextResponse.json(
      {
        workflow: "scope-draft",
        status: "failed",
        message:
          error instanceof Error ? error.message : "Unable to generate scope draft.",
      },
      { status: 400 },
    );
  }
}
