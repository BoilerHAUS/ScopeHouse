import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { generateScopeDraftForUser } from "@/features/ai/services/generate-scope-draft";

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
