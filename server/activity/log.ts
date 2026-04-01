import type { ActivityEventType, Prisma } from "@prisma/client";
import { db } from "@/server/db/client";

type LogProjectActivityInput = {
  projectId: string;
  workspaceId: string;
  actorId?: string | null;
  eventType: ActivityEventType;
  summary: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logProjectActivity({
  projectId,
  workspaceId,
  actorId,
  eventType,
  summary,
  metadata,
}: LogProjectActivityInput) {
  return db.activityLog.create({
    data: {
      projectId,
      workspaceId,
      actorId: actorId ?? null,
      eventType,
      summary,
      metadata,
    },
  });
}
