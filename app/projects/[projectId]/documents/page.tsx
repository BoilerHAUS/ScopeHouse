import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { requireCurrentUser } from "@/server/auth/session";
import { DocumentVault } from "@/features/documents/components/document-vault";
import { listProjectDocumentsForUser } from "@/features/documents/queries/list-project-documents";

type ProjectDocumentsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDocumentsPage({
  params,
}: ProjectDocumentsPageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const documents = await listProjectDocumentsForUser(projectId, user.id);

  if (!documents) {
    notFound();
  }

  return (
    <PageContainer>
      <DocumentVault projectId={projectId} documents={documents} />
    </PageContainer>
  );
}
