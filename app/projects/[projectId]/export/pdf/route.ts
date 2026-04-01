import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { ProjectSummaryPdfDocument } from "@/features/export/components/project-summary-pdf-document";
import { getProjectExportSummaryForUser } from "@/features/export/queries/get-project-export-summary";
import { getCurrentUser } from "@/server/auth/session";

type ProjectExportPdfRouteProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function toSafeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  _request: Request,
  { params }: ProjectExportPdfRouteProps,
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        status: "unauthorized",
        message: "Sign in to download the PDF summary.",
      },
      { status: 401 },
    );
  }

  const { projectId } = await params;
  const summary = await getProjectExportSummaryForUser(projectId, user.id);

  if (!summary) {
    return NextResponse.json(
      {
        status: "not-found",
        message: "Project summary not found.",
      },
      { status: 404 },
    );
  }

  const pdfDocument = ProjectSummaryPdfDocument({ summary });
  const pdfBuffer = await renderToBuffer(pdfDocument);

  const filename = `${toSafeFilename(summary.project.title)}-summary.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
