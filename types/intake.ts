import type { EntityId } from "@/types/common";
import type { ProjectType } from "@/types/project";

export type ContractorInvolvement =
  | "undecided"
  | "self_managed"
  | "hiring_gc"
  | "selected_gc"
  | "design_build";

export type ProjectIntakeRecord = {
  id: EntityId;
  projectId: EntityId;
  renovationType: ProjectType | null;
  rooms: string[];
  goals: string | null;
  priorities: string[];
  timingExpectation: string | null;
  budgetRange: string | null;
  constraints: string[];
  contractorInvolvement: ContractorInvolvement | null;
  notes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
