import { AppShell } from "@/components/layout/app-shell";
import { CreateProjectForm } from "@/features/projects/components/create-project-form";

export default function NewProjectPage() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <section className="border-border bg-surface rounded-[2rem] border px-6 py-6 shadow-[0_18px_60px_rgba(54,42,20,0.08)]">
          <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
            Projects
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            Create a new renovation project
          </h2>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-7">
            Start with the project shell. Capture the title, renovation type,
            location label, and a short success definition before moving into
            intake and scope planning.
          </p>
          <div className="mt-8">
            <CreateProjectForm />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
            <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
              Build order
            </p>
            <ol className="mt-4 space-y-3 text-sm leading-6">
              <li>1. Create the project shell.</li>
              <li>2. Complete guided intake.</li>
              <li>3. Generate a draft scope.</li>
              <li>4. Review and refine the plan.</li>
            </ol>
          </div>
          <div className="border-border bg-surface rounded-[1.75rem] border px-5 py-5 shadow-[0_16px_40px_rgba(54,42,20,0.05)]">
            <p className="text-muted font-mono text-xs tracking-[0.24em] uppercase">
              What to keep tight
            </p>
            <ul className="text-muted mt-4 space-y-3 text-sm leading-6">
              <li>Use a title people will recognize later.</li>
              <li>Keep goals practical instead of exhaustive.</li>
              <li>Leave detailed rooms and priorities for intake.</li>
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
