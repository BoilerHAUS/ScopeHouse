import type { EntityId } from "@/types/common";

export type SchedulePhase = {
  id: EntityId;
  projectId: EntityId;
  name: string;
  notes: string | null;
  targetStartDate: string | null;
  targetEndDate: string | null;
  itemOrder: number;
};

export type Milestone = {
  id: EntityId;
  projectId: EntityId;
  phaseId: EntityId;
  label: string;
  notes: string | null;
  targetDate: string | null;
  itemOrder: number;
};
