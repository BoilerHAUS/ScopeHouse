import { Badge, Card, CardBody, CardHeader } from "@/components/ui/boilerhaus";
import { AppShell } from "@/components/layout/app-shell";
import { CreateProjectForm } from "@/features/projects/components/create-project-form";

export default function NewProjectPage() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <Card className="border-rule bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-paper)_94%,white)_0%,color-mix(in_srgb,var(--color-paper)_90%,var(--color-signal))_52%,color-mix(in_srgb,var(--color-paper)_92%,white)_100%)] shadow-[var(--shadow-xl)]">
          <CardHeader className="flex-col items-start gap-4 border-b border-rule px-6 py-6 lg:px-8 lg:py-8">
            <Badge variant="active">Project setup</Badge>
            <div className="space-y-3">
              <p className="font-mono text-xs tracking-[0.28em] text-smoke uppercase">
                Projects
              </p>
              <h2 className="font-display text-4xl leading-none tracking-[0.08em] uppercase text-void lg:text-5xl">
                Create a new renovation project
              </h2>
              <p className="max-w-2xl text-sm leading-8 text-smoke lg:text-base">
                Start with the project shell. Capture the title, renovation
                type, location label, and a short success definition before
                moving into intake and scope planning.
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-6 lg:px-8">
            <CreateProjectForm />
          </CardBody>
        </Card>

        <aside className="space-y-4">
          <Card className="border-rule bg-white/90 shadow-[var(--shadow-lg)]">
            <CardHeader className="flex-col items-start gap-3 border-b border-rule px-5 py-5">
              <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
                Build order
              </p>
            </CardHeader>
            <CardBody className="px-5 py-5">
              <ol className="space-y-3 text-sm leading-6 text-smoke">
                <li>1. Create the project shell.</li>
                <li>2. Complete guided intake.</li>
                <li>3. Generate a draft scope.</li>
                <li>4. Review and refine the plan.</li>
              </ol>
            </CardBody>
          </Card>
          <Card className="border-rule bg-white/90 shadow-[var(--shadow-lg)]">
            <CardHeader className="flex-col items-start gap-3 border-b border-rule px-5 py-5">
              <p className="font-mono text-xs tracking-[0.24em] text-smoke uppercase">
                What to keep tight
              </p>
            </CardHeader>
            <CardBody className="px-5 py-5">
              <ul className="space-y-3 text-sm leading-6 text-smoke">
                <li>Use a title people will recognize later.</li>
                <li>Keep goals practical instead of exhaustive.</li>
                <li>Leave detailed rooms and priorities for intake.</li>
              </ul>
            </CardBody>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
