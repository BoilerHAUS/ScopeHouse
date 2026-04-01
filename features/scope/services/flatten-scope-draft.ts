import type { ScopeDraftOutput } from "@/features/ai/schemas/scope-draft";

function mapDraftItemStatus(
  status: ScopeDraftOutput["phases"][number]["areas"][number]["items"][number]["status"],
): "active" | "needs_info" | "draft" {
  if (status === "included") {
    return "active";
  }

  if (status === "needs_info") {
    return "needs_info";
  }

  return "draft";
}

export function flattenScopeDraftForPersistence(
  projectId: string,
  draftId: string,
  draft: ScopeDraftOutput,
) {
  return draft.phases.flatMap((phase, phaseIndex) =>
    phase.areas.flatMap((area, areaIndex) =>
      area.items.map((item, itemIndex) => ({
        projectId,
        appliedFromDraftId: draftId,
        phaseName: phase.name,
        phaseOrder: phaseIndex,
        areaName: area.name,
        areaOrder: areaIndex,
        itemOrder: itemIndex,
        label: item.label,
        notes: item.notes,
        status: mapDraftItemStatus(item.status),
        source: "ai_draft" as const,
      })),
    ),
  );
}
