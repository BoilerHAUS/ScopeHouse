import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { getProjectExportSummaryForUser } from "@/features/export/queries/get-project-export-summary";

type ProjectExportSummary = NonNullable<
  Awaited<ReturnType<typeof getProjectExportSummaryForUser>>
>;

const styles = StyleSheet.create({
  page: {
    padding: 34,
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1c1917",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 10,
    color: "#57534e",
  },
  section: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e7e5e4",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  metaGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  metaCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#e7e5e4",
    borderRadius: 10,
    padding: 10,
  },
  metaLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#78716c",
    letterSpacing: 0.5,
  },
  metaValue: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  block: {
    marginTop: 8,
  },
  smallLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#78716c",
    letterSpacing: 0.5,
  },
  body: {
    marginTop: 4,
  },
  listItem: {
    marginTop: 3,
  },
  phaseTitle: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: 700,
  },
  areaTitle: {
    marginTop: 6,
    fontSize: 9,
    textTransform: "uppercase",
    color: "#78716c",
  },
});

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function ProjectSummaryPdfDocument({
  summary,
}: {
  summary: ProjectExportSummary;
}) {
  const { project, intake, scope, decisions, readiness } = summary;

  return (
    <Document title={`${project.title} Summary`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.subtitle}>
          Shareable project summary for review and planning.
        </Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Project status</Text>
            <Text style={styles.metaValue}>{formatLabel(project.status)}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Renovation type</Text>
            <Text style={styles.metaValue}>
              {formatLabel(intake.renovationType)}
            </Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Scope items</Text>
            <Text style={styles.metaValue}>{String(scope.itemCount)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project details</Text>
          <View style={styles.block}>
            <Text style={styles.smallLabel}>Location</Text>
            <Text style={styles.body}>
              {project.locationLabel ?? "Location not captured yet."}
            </Text>
          </View>
          <View style={styles.block}>
            <Text style={styles.smallLabel}>Goals</Text>
            <Text style={styles.body}>
              {project.goals ?? "Goals have not been captured yet."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intake summary</Text>
          {readiness.intakeReady ? (
            <>
              <View style={styles.block}>
                <Text style={styles.smallLabel}>Rooms and areas</Text>
                <Text style={styles.body}>{intake.rooms.join(", ")}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.smallLabel}>Priorities</Text>
                {intake.priorities.map((item) => (
                  <Text key={item} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </View>
              <View style={styles.block}>
                <Text style={styles.smallLabel}>Budget and timing</Text>
                <Text style={styles.body}>
                  {intake.budgetRange ?? "Budget not set"} ·{" "}
                  {intake.timingExpectation ?? "Timing not set"}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.body}>
              Intake is incomplete. The export remains usable, but the planning
              summary is not yet complete.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope summary</Text>
          {readiness.scopeReady ? (
            scope.groups.map((phase) => (
              <View key={`${phase.phaseOrder}-${phase.phaseName}`}>
                <Text style={styles.phaseTitle}>{phase.phaseName}</Text>
                {phase.areas.map((area) => (
                  <View key={`${area.areaOrder}-${area.areaName}`}>
                    <Text style={styles.areaTitle}>{area.areaName}</Text>
                    {area.items.map((item) => (
                      <Text key={item.id} style={styles.listItem}>
                        • {item.label}
                        {item.notes ? ` — ${item.notes}` : ""}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.body}>
              No applied scope baseline exists yet.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Decision log</Text>
          {decisions.length > 0 ? (
            decisions.map((decision) => (
              <View key={decision.id} style={styles.block}>
                <Text style={styles.body}>
                  {decision.recordedAt.toLocaleDateString()} ·{" "}
                  {formatLabel(decision.status)} · {decision.summary}
                </Text>
                <Text style={styles.body}>Owner: {decision.owner}</Text>
                {decision.notes ? (
                  <Text style={styles.body}>{decision.notes}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.body}>No decisions have been logged yet.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
