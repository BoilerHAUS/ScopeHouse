import { toCsv } from "@/features/export/services/csv";
import type { getProjectScopeForUser } from "@/features/scope/queries/get-project-scope";

type ProjectScopeTree = Awaited<ReturnType<typeof getProjectScopeForUser>>;

export function buildScopeCsv(scope: ProjectScopeTree) {
  const rows: Array<Array<string | number>> = [
    [
      "Phase",
      "Phase Order",
      "Area",
      "Area Order",
      "Item",
      "Item Order",
      "Status",
      "Source",
      "Notes",
    ],
  ];

  for (const phase of scope) {
    for (const area of phase.areas) {
      for (const item of area.items) {
        rows.push([
          phase.phaseName,
          phase.phaseOrder,
          area.areaName,
          area.areaOrder,
          item.label,
          item.itemOrder,
          item.status,
          item.source,
          item.notes ?? "",
        ]);
      }
    }
  }

  return toCsv(rows);
}
