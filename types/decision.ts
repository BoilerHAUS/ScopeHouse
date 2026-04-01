import type { EntityId, IsoDateString } from "@/types/common";

export type DecisionStatus = "open" | "approved" | "rejected" | "deferred";

export type DecisionLogEntry = {
  id: EntityId;
  projectId: EntityId;
  summary: string;
  owner: string;
  status: DecisionStatus;
  recordedAt: IsoDateString;
  notes: string | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};
