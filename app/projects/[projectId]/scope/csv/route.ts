import { getCurrentUser } from "@/server/auth/session";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";
import { buildScopeCsv } from "@/features/export/services/build-scope-csv";

function sanitizeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { projectId } = await context.params;
  const [project, scope] = await Promise.all([
    getProjectForUser(projectId, user.id),
    getProjectScopeForUser(projectId, user.id),
  ]);

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const filename = `${sanitizeFilename(project.title)}-scope.csv`;
  const csv = buildScopeCsv(scope);

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
