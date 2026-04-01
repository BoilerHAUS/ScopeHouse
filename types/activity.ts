import type { EntityId } from "@/types/common";

export type ActivityEventType =
  | "project_created"
  | "project_updated"
  | "intake_started"
  | "intake_saved"
  | "intake_completed";

export type ProjectActivityEntry = {
  id: EntityId;
  eventType: ActivityEventType;
  summary: string;
  actorName: string | null;
  createdAt: Date;
};
