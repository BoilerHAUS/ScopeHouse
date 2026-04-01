import type { EntityId, IsoDateString } from "@/types/common";

export type ChangeOrderStatus =
  | "proposed"
  | "approved"
  | "rejected"
  | "implemented";

export type ChangeOrder = {
  id: EntityId;
  projectId: EntityId;
  title: string;
  description: string;
  status: ChangeOrderStatus;
  requestedAt: IsoDateString;
  impactSummary: string;
  budgetReference: string | null;
  scheduleReference: string | null;
  notes: string | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};
