import type { ProjectScopeGroup, ProjectScopeItem } from "@/types/scope";

export function buildScopeTree(items: ProjectScopeItem[]): ProjectScopeGroup[] {
  const phaseMap = new Map<string, ProjectScopeGroup>();

  for (const item of items) {
    const phaseKey = `${item.phaseOrder}:${item.phaseName}`;
    const existingPhase = phaseMap.get(phaseKey);

    if (!existingPhase) {
      phaseMap.set(phaseKey, {
        phaseName: item.phaseName,
        phaseOrder: item.phaseOrder,
        areas: [
          {
            areaName: item.areaName,
            areaOrder: item.areaOrder,
            items: [item],
          },
        ],
      });
      continue;
    }

    const areaKey = `${item.areaOrder}:${item.areaName}`;
    const area = existingPhase.areas.find(
      (entry) => `${entry.areaOrder}:${entry.areaName}` === areaKey,
    );

    if (area) {
      area.items.push(item);
      continue;
    }

    existingPhase.areas.push({
      areaName: item.areaName,
      areaOrder: item.areaOrder,
      items: [item],
    });
  }

  return [...phaseMap.values()]
    .sort((left, right) => left.phaseOrder - right.phaseOrder)
    .map((phase) => ({
      ...phase,
      areas: phase.areas
        .sort((left, right) => left.areaOrder - right.areaOrder)
        .map((area) => ({
          ...area,
          items: area.items.sort((left, right) => left.itemOrder - right.itemOrder),
        })),
    }));
}
