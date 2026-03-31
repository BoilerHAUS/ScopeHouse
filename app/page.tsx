import { AppShell } from "@/components/layout/app-shell";
import { AIWorkflowsOverview } from "@/features/ai/components/ai-workflows-overview";
import { ExportReadiness } from "@/features/export/components/export-readiness";
import { IntakeOverview } from "@/features/intake/components/intake-overview";
import { ProjectLaunchpad } from "@/features/projects/components/project-launchpad";
import { DecisionsOverview } from "@/features/decisions/components/decisions-overview";
import { ScopeOverview } from "@/features/scope/components/scope-overview";

export default function HomePage() {
  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <ProjectLaunchpad />
        <div className="grid gap-6 sm:grid-cols-2">
          <IntakeOverview />
          <ScopeOverview />
          <DecisionsOverview />
          <AIWorkflowsOverview />
        </div>
      </div>
      <ExportReadiness />
    </AppShell>
  );
}
