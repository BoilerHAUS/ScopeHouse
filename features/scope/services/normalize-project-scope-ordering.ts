import type { PrismaClient } from "@prisma/client";
import { db } from "@/server/db/client";

type ScopeClient = PrismaClient | Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">;

export async function normalizeProjectScopeOrdering(
  projectId: string,
  client: ScopeClient = db,
) {
  const items = await client.scopeItem.findMany({
    where: {
      projectId,
    },
    orderBy: [
      { phaseOrder: "asc" },
      { areaOrder: "asc" },
      { itemOrder: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      phaseName: true,
      areaName: true,
    },
  });

  const phaseOrderMap = new Map<string, number>();
  const areaOrderMaps = new Map<string, Map<string, number>>();
  const itemCounters = new Map<string, number>();

  for (const item of items) {
    if (!phaseOrderMap.has(item.phaseName)) {
      phaseOrderMap.set(item.phaseName, phaseOrderMap.size);
    }

    const phaseAreas =
      areaOrderMaps.get(item.phaseName) ?? new Map<string, number>();
    areaOrderMaps.set(item.phaseName, phaseAreas);

    if (!phaseAreas.has(item.areaName)) {
      phaseAreas.set(item.areaName, phaseAreas.size);
    }

    const itemKey = `${item.phaseName}::${item.areaName}`;
    const nextItemOrder = itemCounters.get(itemKey) ?? 0;
    itemCounters.set(itemKey, nextItemOrder + 1);

    await client.scopeItem.update({
      where: {
        id: item.id,
      },
      data: {
        phaseOrder: phaseOrderMap.get(item.phaseName) ?? 0,
        areaOrder: phaseAreas.get(item.areaName) ?? 0,
        itemOrder: nextItemOrder,
      },
    });
  }
}
