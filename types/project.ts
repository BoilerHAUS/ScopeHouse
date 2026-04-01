import type { EntityId, IsoDateString } from "@/types/common";

export type ProjectType =
  | "kitchen"
  | "bathroom"
  | "addition"
  | "whole_home"
  | "basement"
  | "outdoor"
  | "other";

export type ProjectStatus =
  | "draft"
  | "intake"
  | "scope_review"
  | "planning"
  | "in_progress"
  | "closeout";

export type ProjectSummary = {
  id: EntityId;
  workspaceId: EntityId;
  createdById: EntityId;
  title: string;
  locationLabel: string | null;
  goals: string | null;
  projectType: ProjectType;
  status: ProjectStatus;
  archivedAt: IsoDateString | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};
