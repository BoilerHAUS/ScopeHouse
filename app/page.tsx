import Link from "next/link";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Stat,
} from "@/components/ui/boilerhaus";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { AIWorkflowsOverview } from "@/features/ai/components/ai-workflows-overview";
import { DecisionsOverview } from "@/features/decisions/components/decisions-overview";
import { ExportReadiness } from "@/features/export/components/export-readiness";
import { IntakeOverview } from "@/features/intake/components/intake-overview";
import { ProjectLaunchpad } from "@/features/projects/components/project-launchpad";
import { ScopeOverview } from "@/features/scope/components/scope-overview";

const metrics = [
  {
    label: "Core Workflow",
    value: "12",
    caption:
      "project, intake, scope, budget, schedule, docs, photos, decisions, changes, quotes, export, AI",
  },
  {
    label: "Primary Wedge",
    value: "Homeowners",
    caption: "complex renovations without enterprise overhead",
  },
  {
    label: "AI Posture",
    value: "Reviewable",
    caption: "assistive drafting, comparison, and summaries",
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <Card className="border-rule bg-[linear-gradient(130deg,color-mix(in_srgb,var(--color-paper)_90%,white)_0%,color-mix(in_srgb,var(--color-paper)_88%,var(--color-signal))_52%,color-mix(in_srgb,var(--color-paper)_90%,var(--color-signal-alt))_100%)] shadow-[var(--shadow-xl)]">
          <CardHeader className="flex-col items-start gap-5 border-b border-rule px-6 py-6 lg:px-8 lg:py-8">
            <Badge variant="active">Renovation Operating System</Badge>
            <div className="max-w-4xl space-y-4">
              <p className="font-mono text-xs tracking-[0.3em] text-smoke uppercase">
                ScopeHouse
              </p>
              <h2 className="font-display text-4xl leading-[0.92] tracking-[0.08em] uppercase text-void lg:text-6xl">
                Structure the job before the job starts structuring you.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-smoke lg:text-lg">
                ScopeHouse is built for homeowners and small renovation
                operators who need one calm system for intake, scope, budget,
                schedule, evidence, and closeout.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/projects/new">Start a project</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/projects">Open the workspace</Link>
              </Button>
            </div>
          </CardHeader>
          <CardBody className="grid gap-4 px-6 py-6 md:grid-cols-3 lg:px-8">
            {metrics.map((metric) => (
              <Stat
                key={metric.label}
                label={metric.label}
                value={metric.value}
                caption={metric.caption}
                className="border border-rule bg-white/70"
              />
            ))}
          </CardBody>
        </Card>

        <Card className="border-rule bg-white/90 shadow-[var(--shadow-lg)]">
          <CardHeader className="flex-col items-start gap-4 border-b border-rule px-5 py-5">
            <p className="font-mono text-xs tracking-[0.28em] text-smoke uppercase">
              Product stance
            </p>
            <h3 className="font-display text-2xl tracking-[0.08em] uppercase text-void">
              Calm, credible, pro-grade
            </h3>
          </CardHeader>
          <CardBody className="space-y-4 px-5 py-5 text-sm leading-7 text-smoke">
            <p>
              Not generic construction ERP. Not AI theater. Not enterprise
              permission sprawl.
            </p>
            <p>
              The product should help serious users define scope, compare risk,
              control change, and produce outputs they can actually share.
            </p>
            <div className="space-y-2 border-t border-rule pt-4">
              <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
                First proof
              </p>
              <p>Create project.</p>
              <p>Complete intake.</p>
              <p>Draft scope.</p>
              <p>Export something credible.</p>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <ProjectLaunchpad />
        <div className="grid gap-6 sm:grid-cols-2">
          <IntakeOverview />
          <ScopeOverview />
          <DecisionsOverview />
          <AIWorkflowsOverview />
        </div>
      </section>

      <ExportReadiness />
    </AppShell>
  );
}
