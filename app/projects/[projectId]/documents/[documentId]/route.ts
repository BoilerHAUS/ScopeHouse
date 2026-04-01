import { db } from "@/server/db/client";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { readProjectFileBuffer } from "@/server/storage/project-files";

function toContentDispositionFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

type RouteContext = {
  params: Promise<{
    projectId: string;
    documentId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { projectId, documentId } = await context.params;
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const document = await db.projectDocument.findFirst({
    where: {
      id: documentId,
      projectId,
    },
    select: {
      originalName: true,
      storageKey: true,
      contentType: true,
    },
  });

  if (!document) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const fileBuffer = await readProjectFileBuffer(document.storageKey);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": document.contentType,
        "Content-Disposition": `inline; filename="${toContentDispositionFilename(document.originalName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("File unavailable", { status: 404 });
  }
}
