import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { requireCurrentUser } from "@/server/auth/session";
import { PhotoLog } from "@/features/photos/components/photo-log";
import { listProjectPhotosForUser } from "@/features/photos/queries/list-project-photos";

type ProjectPhotosPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectPhotosPage({
  params,
}: ProjectPhotosPageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const photos = await listProjectPhotosForUser(projectId, user.id);

  if (!photos) {
    notFound();
  }

  return (
    <PageContainer>
      <PhotoLog projectId={projectId} photos={photos} />
    </PageContainer>
  );
}
