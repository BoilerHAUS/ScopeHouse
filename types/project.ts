import type { EntityId, IsoDateString, RecordStatus } from "@/types/common";

export type ProjectType =
  | "kitchen"
  | "bathroom"
  | "addition"
  | "whole-home"
  | "basement"
  | "outdoor"
  | "other";

export type ProjectStatus =
  | RecordStatus
  | "intake"
  | "scope-review"
  | "planning"
  | "in-progress"
  | "closeout";

export type ProjectSummary = {
  id: EntityId;
  title: string;
  locationLabel: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: IsoDateString;
};
