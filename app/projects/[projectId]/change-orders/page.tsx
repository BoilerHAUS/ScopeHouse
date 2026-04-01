import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { ChangeOrderManager } from "@/features/change-orders/components/change-order-manager";
import { listProjectChangeOrdersForUser } from "@/features/change-orders/queries/list-project-change-orders";
import { requireCurrentUser } from "@/server/auth/session";

type ProjectChangeOrdersPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectChangeOrdersPage({
  params,
}: ProjectChangeOrdersPageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const changeOrders = await listProjectChangeOrdersForUser(projectId, user.id);

  if (changeOrders === null) {
    notFound();
  }

  return (
    <PageContainer>
      <ChangeOrderManager projectId={projectId} changeOrders={changeOrders} />
    </PageContainer>
  );
}
