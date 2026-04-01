import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { requireCurrentUser } from "@/server/auth/session";
import { SchedulePlanner } from "@/features/schedule/components/schedule-planner";
import { getProjectScheduleForUser } from "@/features/schedule/queries/get-project-schedule";

type ProjectSchedulePageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectSchedulePage({
  params,
}: ProjectSchedulePageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const schedule = await getProjectScheduleForUser(projectId, user.id);

  if (!schedule) {
    notFound();
  }

  return (
    <PageContainer>
      <SchedulePlanner projectId={projectId} schedule={schedule} />
    </PageContainer>
  );
}
