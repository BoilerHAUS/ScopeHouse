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
    photoId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { projectId, photoId } = await context.params;
  const project = await getProjectForUser(projectId, user.id);

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const photo = await db.projectPhoto.findFirst({
    where: {
      id: photoId,
      projectId,
    },
    select: {
      originalName: true,
      storageKey: true,
      contentType: true,
    },
  });

  if (!photo) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const fileBuffer = await readProjectFileBuffer(photo.storageKey);

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": photo.contentType,
        "Content-Disposition": `inline; filename="${toContentDispositionFilename(photo.originalName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("File unavailable", { status: 404 });
  }
}
