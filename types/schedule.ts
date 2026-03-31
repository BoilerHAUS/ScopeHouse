import type { EntityId, IsoDateString } from "@/types/common";

export type Milestone = {
  id: EntityId;
  projectId: EntityId;
  label: string;
  targetDate?: IsoDateString;
};
