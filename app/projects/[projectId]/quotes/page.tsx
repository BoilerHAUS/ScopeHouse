import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { QuoteManager } from "@/features/quotes/components/quote-manager";
import { listProjectQuotesForUser } from "@/features/quotes/queries/list-project-quotes";
import { getLatestQuoteComparisonForUser } from "@/features/ai/queries/get-latest-quote-comparison";
import { getProjectForUser } from "@/features/projects/queries/get-project";
import { serverEnv } from "@/lib/env/server";
import { requireCurrentUser } from "@/server/auth/session";

type ProjectQuotesPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectQuotesPage({
  params,
}: ProjectQuotesPageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;

  const [project, quotes, latestComparison] = await Promise.all([
    getProjectForUser(projectId, user.id),
    listProjectQuotesForUser(projectId, user.id),
    getLatestQuoteComparisonForUser(projectId, user.id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <PageContainer>
      <QuoteManager
        projectId={projectId}
        quotes={quotes}
        latestComparison={latestComparison}
        aiAvailability={{
          isConfigured: serverEnv.isOpenAiConfigured,
          model: serverEnv.openAiModel,
        }}
      />
    </PageContainer>
  );
}
