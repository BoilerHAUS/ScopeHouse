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
  const { project, intake, scope, decisions, changeOrders, aiSummary, readiness } =
    summary;

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
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Changes logged</Text>
            <Text style={styles.metaValue}>{String(changeOrders.length)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI project summary</Text>
          {aiSummary ? (
            <>
              <Text style={styles.body}>{aiSummary.output.summary}</Text>
              <View style={styles.block}>
                <Text style={styles.smallLabel}>Progress</Text>
                {aiSummary.output.progress.length > 0 ? (
                  aiSummary.output.progress.map((item) => (
                    <Text key={`progress-${item}`} style={styles.listItem}>
                      • {item}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.body}>No progress items recorded.</Text>
                )}
              </View>
              <View style={styles.block}>
                <Text style={styles.smallLabel}>Blockers</Text>
                {aiSummary.output.blockers.length > 0 ? (
                  aiSummary.output.blockers.map((item) => (
                    <Text key={`blocker-${item}`} style={styles.listItem}>
                      • {item}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.body}>No blockers recorded.</Text>
                )}
              </View>
              <View style={styles.block}>
                <Text style={styles.smallLabel}>Next actions</Text>
                {aiSummary.output.nextActions.length > 0 ? (
                  aiSummary.output.nextActions.map((item) => (
                    <Text key={`next-${item}`} style={styles.listItem}>
                      • {item}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.body}>No next actions recorded.</Text>
                )}
              </View>
            </>
          ) : (
            <Text style={styles.body}>No AI summary has been generated yet.</Text>
          )}
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
          <Text style={styles.sectionTitle}>Budget summary</Text>
          {summary.budget && summary.budget.categories.length > 0 ? (
            summary.budget.categories.map((category) => (
              <View key={category.id} style={styles.block}>
                <Text style={{ ...styles.body, fontWeight: 700 }}>{category.label}</Text>
                {category.lines.map((line) => (
                  <Text key={line.id} style={styles.listItem}>
                    • {line.label}
                    {line.scopeItem
                      ? ` (${line.scopeItem.phaseName} / ${line.scopeItem.areaName} / ${line.scopeItem.label})`
                      : ""}
                  </Text>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.body}>No budget categories have been added yet.</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change orders</Text>
          {changeOrders.length > 0 ? (
            changeOrders.map((changeOrder) => (
              <View key={changeOrder.id} style={styles.block}>
                <Text style={styles.body}>
                  {changeOrder.requestedAt.toLocaleDateString()} ·{" "}
                  {formatLabel(changeOrder.status)} · {changeOrder.title}
                </Text>
                <Text style={styles.body}>{changeOrder.description}</Text>
                <Text style={styles.body}>
                  Impact: {changeOrder.impactSummary}
                </Text>
                {changeOrder.budgetReference ? (
                  <Text style={styles.body}>
                    Budget ref: {changeOrder.budgetReference}
                  </Text>
                ) : null}
                {changeOrder.scheduleReference ? (
                  <Text style={styles.body}>
                    Schedule ref: {changeOrder.scheduleReference}
                  </Text>
                ) : null}
                {changeOrder.scopeItem ? (
                  <Text style={styles.body}>
                    Scope: {changeOrder.scopeItem.phaseName} / {changeOrder.scopeItem.areaName} / {changeOrder.scopeItem.label}
                  </Text>
                ) : null}
                {changeOrder.budgetLine ? (
                  <Text style={styles.body}>
                    Budget line: {changeOrder.budgetLine.category.label} / {changeOrder.budgetLine.label}
                  </Text>
                ) : null}
                {changeOrder.scheduleMilestone ? (
                  <Text style={styles.body}>
                    Milestone: {changeOrder.scheduleMilestone.phase.name} / {changeOrder.scheduleMilestone.label}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.body}>No change orders have been logged yet.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
