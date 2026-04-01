import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { GuidedIntakeForm } from "@/features/intake/components/guided-intake-form";
import {
  toProjectIntakeFormValues,
} from "@/features/intake/schemas/project-intake";
import { getProjectIntakeForUser } from "@/features/intake/queries/get-project-intake";
import { requireCurrentUser } from "@/server/auth/session";

type ProjectIntakePageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function getInitialStep(values: ReturnType<typeof toProjectIntakeFormValues>) {
  if (!values.renovationType || !values.roomsRaw.trim() || !values.goals.trim()) {
    return 0;
  }

  if (
    !values.prioritiesRaw.trim() ||
    !values.budgetRange ||
    !values.timingExpectation.trim()
  ) {
    return 1;
  }

  return 2;
}

export default async function ProjectIntakePage({
  params,
}: ProjectIntakePageProps) {
  const user = await requireCurrentUser();
  const { projectId } = await params;
  const intakeRecord = await getProjectIntakeForUser(projectId, user.id);

  if (!intakeRecord) {
    notFound();
  }

  const initialValues = toProjectIntakeFormValues({
    renovationType:
      intakeRecord.intake?.renovationType ?? intakeRecord.fallbackProjectType,
    rooms: intakeRecord.intake?.rooms ?? [],
    goals: intakeRecord.intake?.goals ?? intakeRecord.fallbackGoals,
    priorities: intakeRecord.intake?.priorities ?? [],
    timingExpectation: intakeRecord.intake?.timingExpectation ?? null,
    budgetRange: intakeRecord.intake?.budgetRange ?? null,
    constraints: intakeRecord.intake?.constraints ?? [],
    contractorInvolvement: intakeRecord.intake?.contractorInvolvement ?? null,
    notes: intakeRecord.intake?.notes ?? null,
  });

  return (
    <PageContainer>
      <GuidedIntakeForm
        projectId={projectId}
        initialValues={initialValues}
        initialStep={getInitialStep(initialValues)}
        isCompleted={Boolean(intakeRecord.intake?.completedAt)}
        lastSavedLabel={intakeRecord.intake?.updatedAt.toLocaleDateString() ?? null}
      />
    </PageContainer>
  );
}
